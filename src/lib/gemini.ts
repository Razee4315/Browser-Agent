import { GoogleGenerativeAI } from '@google/generative-ai';

function getApiKey(): string {
  // For client-side usage
  if (typeof window !== 'undefined') {
    return localStorage.getItem('gemini_api_key') || '';
  }
  // For server-side usage (fallback)
  return process.env.GEMINI_API_KEY || '';
}

const getGenAI = () => new GoogleGenerativeAI(getApiKey());

// Get the Gemini 2.0 Flash Experimental model (supports vision and images)
const getModel = () => getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

// Define types for browser automation instructions
export interface BrowserAction {
  type: 'click' | 'type' | 'navigate' | 'wait' | 'scroll' | 'screenshot' | 'extract';
  target?: string;
  value?: string;
  timeout?: number;
  description: string;
}

export interface AutomationPlan {
  actions: BrowserAction[];
  description: string;
  expectedOutcome: string;
}

// Function to generate automation plan from user prompt
export async function generateAutomationPlan(userPrompt: string): Promise<AutomationPlan> {
  const prompt = `
    You are a browser automation expert. Given a user's request, create a detailed plan to automate browser actions.
    
    User Request: "${userPrompt}"
    
    Please respond with a JSON object that follows this exact structure:
    {
      "description": "Brief description of what will be automated",
      "expectedOutcome": "What the user should expect to see",
      "actions": [
        {
          "type": "navigate" | "click" | "type" | "wait" | "scroll" | "screenshot" | "extract",
          "target": "CSS selector or URL (for navigate)",
          "value": "text to type (for type action)",
          "timeout": 5000,
          "description": "Human readable description of this step"
        }
      ]
    }
    
    Important guidelines:
    - Use robust CSS selectors with fallbacks (e.g., for search engines: 'input[name="q"], input[title="Search"], textarea[name="q"], [role="combobox"]')
    - Include reasonable timeouts (in milliseconds, use 3000-5000ms for most elements, 8000ms only for navigation)
    - Break complex tasks into efficient steps - avoid unnecessary wait actions
    - Always start with a "navigate" action if a URL is needed
    - Use "wait" actions sparingly - only when absolutely necessary (like after navigation)
    - Include a "screenshot" action at the end to capture results
    - For "extract" actions, specify what data to extract in the description
    - PREFER DuckDuckGo (https://duckduckgo.com) or Brave Search (https://search.brave.com) over Google to avoid reCAPTCHA issues
    - For DuckDuckGo searches, use selectors like: input[name="q"], input#searchbox_input, input[placeholder*="Search" i]
    - For Brave Search, use selectors like: input[name="q"], input#searchbox, input[placeholder*="search" i]
    - For Google searches (only if specifically requested), use selectors like: input[name="q"], textarea[name="q"], or [role="combobox"]
    - For search buttons, try: button[type="submit"], input[type="submit"], button[aria-label="Search"], input[name="btnK"]
    - For clicking search results, be SPECIFIC about which result to click:
      * If user wants Wikipedia, use: "Click the search result linking to Wikipedia"
      * If user wants GitHub, use: "Click the search result linking to GitHub"
      * If user wants official docs, use: "Click the search result linking to the official documentation"
      * If user wants a specific domain, mention it: "Click the search result linking to example.com"
      * Only use generic "Click the first search result" if no specific preference is mentioned
    - Use faster timeouts (3000-5000ms) for most actions, 8000ms only for navigation
    - Minimize wait actions - modern browsers load fast, don't wait unnecessarily
    - ADD a small wait (1-2 seconds) after search operations before trying to click results
    - For non-search automations, consider direct navigation to specific websites instead of searching
    - If search fails, suggest alternative approaches like direct website navigation
    
    Respond ONLY with valid JSON, no additional text.
  `;

  try {
    const result = await getModel().generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response and parse JSON
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const plan: AutomationPlan = JSON.parse(cleanedText);
    
    return plan;
  } catch (error) {
    console.error('Error generating automation plan:', error);
    throw new Error('Failed to generate automation plan');
  }
}

// Function to analyze page content and suggest next actions with optional image
export async function analyzePageContent(
  pageContent: string, 
  currentGoal: string, 
  screenshotBase64?: string
): Promise<BrowserAction[]> {
  const textPrompt = `
    You are analyzing a web page to help continue browser automation.
    
    Current Goal: "${currentGoal}"
    Page Content: "${pageContent.slice(0, 2000)}..." // Truncated for API limits
    
    Based on the page content and current goal, suggest the next 1-3 browser actions.
    
    Respond with a JSON array of actions following this format:
    [
      {
        "type": "click" | "type" | "navigate" | "wait" | "scroll" | "screenshot" | "extract",
        "target": "CSS selector",
        "value": "text value if needed",
        "timeout": 5000,
        "description": "What this action does"
      }
    ]
    
    Respond ONLY with valid JSON array, no additional text.
  `;

  try {
    let result;
    
    if (screenshotBase64) {
      // Use vision capabilities when screenshot is provided
      result = await getModel().generateContent([
        textPrompt,
        {
          inlineData: {
            data: screenshotBase64,
            mimeType: 'image/png'
          }
        }
      ]);
    } else {
      // Text-only analysis
      result = await getModel().generateContent(textPrompt);
    }
    
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const actions: BrowserAction[] = JSON.parse(cleanedText);
    
    return actions;
  } catch (error) {
    console.error('Error analyzing page content:', error);
    return [];
  }
}

// Function to analyze screenshot and provide insights
export async function analyzeScreenshot(
  screenshotBase64: string, 
  context: string
): Promise<string> {
  const prompt = `
    Analyze this screenshot of a web page and provide insights about what you see.
    
    Context: "${context}"
    
    Please describe:
    1. What elements are visible
    2. Any potential actions that could be taken
    3. Important information that stands out
    
    Keep your response concise and actionable.
  `;

  try {
    const result = await getModel().generateContent([
      prompt,
      {
        inlineData: {
          data: screenshotBase64,
          mimeType: 'image/png'
        }
      }
    ]);
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing screenshot:', error);
    return 'Unable to analyze screenshot';
  }
}