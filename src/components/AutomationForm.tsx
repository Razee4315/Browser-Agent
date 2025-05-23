'use client';

import { useState } from 'react';

interface AutomationFormProps {
  onSessionStart: (session: any) => void;
  disabled: boolean;
}

export default function AutomationForm({ onSessionStart, disabled }: AutomationFormProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const apiKey = localStorage.getItem('gemini_api_key');
      const response = await fetch('/api/automation/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          headless: false,
          apiKey
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start automation');
      }

      const sessionData = await response.json();
      onSessionStart(sessionData);
      
      // Clear form after successful submission
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const examplePrompts = [
    // Search & Navigation Examples
    "Go to DuckDuckGo and search for 'AI browser automation wikipedia' and click the Wikipedia result",
    "Visit duckduckgo.com, search for 'Next.js documentation', and click the official docs",
    "Search for 'Skardu Pakistan tourism' on Brave Search and click the first travel guide result",
    
    // Form Filling Examples with Personal Details
    "Go to https://demoqa.com/text-box and fill out the form with: Name: Saqlain Abbas, Email: saqlain.abbas.dev@gmail.com, Current Address: Skardu, Gilgit-Baltistan, Pakistan, Permanent Address: Skardu City, Pakistan",
    "Navigate to https://www.selenium.dev/selenium/web/web-form.html and fill the form with: text input 'Saqlain Abbas', password 'skardu2024!', select dropdown option 2, check the checkbox",
    "Visit https://demoqa.com/automation-practice-form and complete the student registration with: First Name: Saqlain, Last Name: Abbas, Email: saqlain.abbas.dev@gmail.com, Mobile: +923001234567, select Male gender, and submit",
    
    // E-commerce & Shopping Examples
    "Go to https://demo.opencart.com, search for 'laptop', click on the first product, and add it to cart",
    "Navigate to https://automationexercise.com, search for 'winter jackets', and view the first product details",
    
    // Data Extraction Examples
    "Visit https://quotes.toscrape.com and extract all quotes from the first page along with their authors",
    "Go to https://books.toscrape.com, navigate to the Catalogue, and extract the titles and prices of the first 5 books",
    
    // Multi-step Workflow Examples
    "Navigate to https://demoqa.com/webtables, add a new record with: First Name: Saqlain, Last Name: Abbas, Age: 25, Email: saqlain.abbas.dev@gmail.com, Salary: 75000, Department: Software Engineering, then edit the department to Full Stack Development",
    "Go to https://the-internet.herokuapp.com/login, login with username 'tomsmith' and password 'SuperSecretPassword!', then navigate to Secure Area and take a screenshot",
    
    // File Upload & Dynamic Content Examples  
    "Visit https://the-internet.herokuapp.com/upload, upload any small file from the system, and verify the upload was successful",
    "Navigate to https://the-internet.herokuapp.com/dynamic_content, take a screenshot, refresh the page, and take another screenshot to compare the dynamic content changes"
  ];

  return (
    <div className="border border-black/10 rounded-lg p-8 bg-white">
      <div className="flex items-center mb-8">
        <div className="w-8 h-8 border border-black/20 rounded-full flex items-center justify-center mr-4">
          <span className="text-sm">▶</span>
        </div>
        <h2 className="text-xl font-light text-black tracking-tight">
          Automation
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-black/70 mb-3 tracking-wide">
            PROMPT
          </label>
          <div className="relative">
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want the browser to do..."
              className="w-full px-4 py-4 border border-black/10 rounded-lg focus:outline-none focus:border-black/30 resize-none bg-white transition-all duration-200 font-light text-black placeholder:text-black/40"
              rows={5}
              disabled={disabled || isLoading}
            />
            <div className="absolute bottom-3 right-3 text-xs text-black/30 font-light">
              {prompt.length}/500
            </div>
          </div>
        </div>

        {error && (
          <div className="border border-black/20 rounded-lg p-4 bg-black/[0.02]">
            <p className="text-sm text-black font-light">{error}</p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={disabled || isLoading || !prompt.trim()}
          className="w-full bg-black text-white py-4 px-6 rounded-lg hover:bg-black/90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-light tracking-wide"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border border-white/30 border-t-white mr-3"></div>
              <span>STARTING...</span>
            </div>
          ) : disabled ? (
            <div className="flex items-center justify-center">
              <div className="animate-pulse w-2 h-2 bg-white rounded-full mr-3"></div>
              <span>RUNNING...</span>
            </div>
          ) : (
            <span>START AUTOMATION</span>
          )}
        </button>
      </form>

      {/* Example Prompts */}
      <div className="mt-8 pt-6 border-t border-black/10">
        <h3 className="text-sm font-medium text-black/70 mb-4 tracking-wide">EXAMPLES</h3>
        <div className="space-y-1">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPrompt(example)}
              disabled={disabled || isLoading}
              className="w-full text-left text-sm text-black/60 hover:text-black hover:bg-black/[0.02] p-3 rounded-lg border border-transparent hover:border-black/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-light"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 