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
  try {
    const { prompt, headless = true, apiKey } = await request.json();

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
    const plan = await generateAutomationPlan(prompt);
    
    // Create session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    automationSessions.set(sessionId, {
      id: sessionId,
      status: 'running',
      plan,
      results: null,
      startedAt: new Date().toISOString()
    });

    // Start browser automation in background
    executeBrowserPlan(sessionId, plan, headless).catch(error => {
      console.error('Background automation failed:', error);
      const session = automationSessions.get(sessionId);
      if (session) {
        session.status = 'failed';
        session.error = error.message;
        session.completedAt = new Date().toISOString();
      }
    });

    return NextResponse.json({
      sessionId,
      plan,
      status: 'running',
      message: 'Automation started successfully'
    });

  } catch (error) {
    console.error('Error starting automation:', error);
    return NextResponse.json(
      { error: 'Failed to start automation' },
      { status: 500 }
    );
  }
}

async function executeBrowserPlan(sessionId: string, plan: any, headless: boolean) {
  const browser = getBrowserInstance();
  
  try {
    await browser.initialize(headless);
    const results = await browser.executePlan(plan.actions);
    
    const session = automationSessions.get(sessionId);
    if (session) {
      session.status = results.success ? 'completed' : 'failed';
      session.results = results;
      session.completedAt = new Date().toISOString();
      if (!results.success) {
        session.error = results.error;
      }
    }
  } catch (error) {
    console.error('Browser execution failed:', error);
    const session = automationSessions.get(sessionId);
    if (session) {
      session.status = 'failed';
      session.error = error instanceof Error ? error.message : 'Unknown error';
      session.completedAt = new Date().toISOString();
    }
  } finally {
    await browser.close();
  }
}

// Export session storage for other routes
export { automationSessions }; 