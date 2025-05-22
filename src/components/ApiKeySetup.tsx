'use client';

import { useState } from 'react';

interface ApiKeySetupProps {
  onApiKeySubmit: (apiKey: string) => void;
}

export default function ApiKeySetup({ onApiKeySubmit }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('Please enter your Gemini API key');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      // Validate API key by making a test request
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      if (response.ok) {
        // Store API key and proceed
        localStorage.setItem('gemini_api_key', apiKey.trim());
        onApiKeySubmit(apiKey.trim());
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid API key. Please check your key and try again.');
      }
    } catch (err) {
      setError('Failed to validate API key. Please check your connection and try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Subtle grid pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-black/10 rounded-full mb-8">
            <div className="text-2xl">🔑</div>
          </div>
          <h1 className="text-3xl font-light text-black mb-4 tracking-tight">
            API Key Required
          </h1>
          <div className="w-12 h-px bg-black mx-auto mb-6"></div>
          <p className="text-black/60 font-light leading-relaxed">
            Enter your Gemini API key to start using the browser automation agent
          </p>
        </div>

        {/* API Key Form */}
        <div className="border border-black/10 rounded-lg p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-black/70 mb-3 tracking-wide">
                GEMINI API KEY
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key..."
                className="w-full px-4 py-4 border border-black/10 rounded-lg focus:outline-none focus:border-black/30 bg-white transition-all duration-200 font-light text-black placeholder:text-black/40"
                disabled={isValidating}
              />
            </div>

            {error && (
              <div className="border border-black/20 rounded-lg p-4 bg-black/[0.02]">
                <p className="text-sm text-black font-light">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isValidating || !apiKey.trim()}
              className="w-full bg-black text-white py-4 px-6 rounded-lg hover:bg-black/90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-light tracking-wide"
            >
              {isValidating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border border-white/30 border-t-white mr-3"></div>
                  <span>VALIDATING...</span>
                </div>
              ) : (
                <span>VALIDATE & CONTINUE</span>
              )}
            </button>
          </form>

          {/* Instructions */}
          <div className="mt-8 pt-6 border-t border-black/10">
            <h3 className="text-sm font-medium text-black/70 mb-4 tracking-wide">HOW TO GET API KEY</h3>
            <div className="space-y-3 text-sm text-black/60 font-light">
              <div>1. Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-black underline hover:no-underline">Google AI Studio</a></div>
              <div>2. Sign in with your Google account</div>
              <div>3. Create a new API key</div>
              <div>4. Copy and paste it above</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-black/30 font-light">
            Your API key is stored locally and never shared
          </p>
        </div>
      </div>
    </div>
  );
} 