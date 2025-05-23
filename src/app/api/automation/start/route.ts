import { NextRequest, NextResponse } from 'next/server';
import { generateAutomationPlan } from '@/lib/gemini';
import { getBrowserInstance } from '@/lib/browser';

// Store automation sessions (in production, use a database)
const automationSessions = new Map<string, {
  id: string;
  status: 'running' | 'completed' | 'failed';
  plan: any;
  results: any;
  startedAt: string;
  completedAt?: string;
  error?: string;
}>();

export async function POST(request: NextRequest) {
  console.log('[API /start] Received POST request');
  try {
    const { prompt, headless = true, apiKey } = await request.json();
    console.log(`[API /start] Prompt: "${prompt}", Headless: ${headless}, API Key (present): ${!!apiKey}`);

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Set the API key temporarily for this request
    process.env.GEMINI_API_KEY = apiKey;

    // Generate automation plan using Gemini
    console.log('[API /start] Generating automation plan...');
    const plan = await generateAutomationPlan(prompt);
    console.log('[API /start] Automation plan generated:', JSON.stringify(plan, null, 2));
    
    // Create session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[API /start] Created session ID: ${sessionId}`);
    automationSessions.set(sessionId, {
      id: sessionId,
      status: 'running',
      plan,
      results: null,
      startedAt: new Date().toISOString()
    });

    // Start browser automation in background (DO NOT await this call)
    console.log(`[API /start] Starting executeBrowserPlan for session ${sessionId} in the background.`);
    executeBrowserPlan(sessionId, plan, headless).catch(error => {
      console.error(`[API /start] Background executeBrowserPlan for session ${sessionId} threw an unhandled error:`, error);
      const session = automationSessions.get(sessionId);
      if (session) {
        session.status = 'failed';
        session.error = error.message || 'Unknown background error';
        session.completedAt = new Date().toISOString();
      }
    });

    console.log(`[API /start] Responding to client for session ${sessionId}.`);
    return NextResponse.json({
      sessionId,
      plan,
      status: 'running',
      message: 'Automation started successfully'
    });

  } catch (error) {
    console.error('[API /start] Error in POST handler:', error);
    return NextResponse.json(
      { error: 'Failed to start automation' },
      { status: 500 }
    );
  }
}

async function executeBrowserPlan(sessionId: string, plan: any, headless: boolean) {
  console.log(`[executeBrowserPlan ${sessionId}] Starting for session.`);
  const browser = getBrowserInstance();
  let overallSuccess = false;
  
  try {
    console.log(`[executeBrowserPlan ${sessionId}] Initializing browser (headless: ${headless})...`);
    await browser.initialize(headless);
    console.log(`[executeBrowserPlan ${sessionId}] Browser initialized. Executing plan...`);
    const results = await browser.executePlan(plan.actions);
    console.log(`[executeBrowserPlan ${sessionId}] Plan execution completed. Success: ${results.success}`);
    
    const session = automationSessions.get(sessionId);
    if (session) {
      session.status = results.success ? 'completed' : 'failed';
      session.results = results;
      session.completedAt = new Date().toISOString();
      if (!results.success) {
        session.error = results.error;
        console.error(`[executeBrowserPlan ${sessionId}] Plan failed with error: ${results.error}`);
      } else {
        console.log(`[executeBrowserPlan ${sessionId}] Plan completed successfully for session.`);
      }
      overallSuccess = results.success;
    }
  } catch (error) {
    console.error(`[executeBrowserPlan ${sessionId}] Critical error during browser execution:`, error);
    const session = automationSessions.get(sessionId);
    if (session) {
      session.status = 'failed';
      session.error = error instanceof Error ? error.message : 'Unknown critical error';
      session.completedAt = new Date().toISOString();
    }
  } finally {
    console.log(`[executeBrowserPlan ${sessionId}] Entering finally block. Overall success: ${overallSuccess}. Closing browser...`);
    await browser.close(); // This is the key call to watch
    console.log(`[executeBrowserPlan ${sessionId}] Browser closed in finally block. Execution finished for session.`);
  }
}

// Export session storage for other routes
export { automationSessions }; 