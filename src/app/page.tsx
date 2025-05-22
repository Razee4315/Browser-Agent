'use client';

import { useState, useEffect } from 'react';
import AutomationForm from '@/components/AutomationForm';
import AutomationStatus from '@/components/AutomationStatus';
import AutomationResults from '@/components/AutomationResults';
import ApiKeySetup from '@/components/ApiKeySetup';

interface AutomationSession {
  sessionId: string;
  status: 'running' | 'completed' | 'failed';
  plan: any;
  results: any;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export default function Home() {
  const [currentSession, setCurrentSession] = useState<AutomationSession | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored API key on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    setIsLoading(false);
  }, []);

  // Poll for session status
  useEffect(() => {
    if (!currentSession || currentSession.status !== 'running') {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/automation/status/${currentSession.sessionId}`);
        if (response.ok) {
          const updatedSession = await response.json();
          setCurrentSession(updatedSession);
          
          if (updatedSession.status !== 'running') {
            setIsPolling(false);
          }
        }
      } catch (error) {
        console.error('Error polling session status:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentSession?.sessionId, currentSession?.status]);

  const handleNewSession = (session: AutomationSession) => {
    setCurrentSession(session);
  };

  const handleClearSession = () => {
    setCurrentSession(null);
    setIsPolling(false);
  };

  const handleApiKeySubmit = (newApiKey: string) => {
    setApiKey(newApiKey);
  };

  const handleLogout = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey(null);
    setCurrentSession(null);
    setIsPolling(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border border-black/20 border-t-black"></div>
      </div>
    );
  }

  // Show API key setup if not authenticated
  if (!apiKey) {
    return <ApiKeySetup onApiKeySubmit={handleApiKeySubmit} />;
  }

  return (
    <div className="min-h-screen bg-white">
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

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header with logout */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleLogout}
            className="text-black/60 hover:text-black text-sm font-light border border-black/10 px-3 py-2 rounded hover:bg-black/[0.02] transition-all"
          >
            Change API Key
          </button>
        </div>

        {/* Minimalist Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-black/10 rounded-full mb-8">
            <div className="text-2xl">🧿</div>
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-black mb-4 tracking-tight">
            Browser Automation
          </h1>
          <div className="w-12 h-px bg-black mx-auto mb-6"></div>
          <div className="inline-flex items-center px-3 py-1 border border-black/20 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-black rounded-full mr-2"></span>
            <span className="text-black/70 text-xs font-medium tracking-wide">GEMINI 2.0 VISION AI</span>
          </div>
          <p className="text-lg text-black/60 max-w-2xl mx-auto leading-relaxed font-light">
            Transform natural language into intelligent browser automation with advanced AI vision capabilities.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column - Input Form */}
            <div className="lg:col-span-5">
              <div className="sticky top-8">
                <AutomationForm 
                  onSessionStart={handleNewSession}
                  disabled={isPolling}
                />
              </div>
            </div>

            {/* Right Column - Status and Results */}
            <div className="lg:col-span-7">
              {currentSession && (
                <div className="space-y-8">
                  <AutomationStatus 
                    session={currentSession}
                    isPolling={isPolling}
                    onClear={handleClearSession}
                  />
                  <AutomationResults 
                    session={currentSession}
                  />
                </div>
              )}
              
              {!currentSession && (
                <div className="border border-black/10 rounded-lg p-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border border-black/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <div className="text-lg">○</div>
                    </div>
                    <h3 className="text-xl font-light text-black mb-2">Ready</h3>
                    <p className="text-black/50 font-light">Enter your automation request to begin</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-light text-black tracking-tight mb-2">
              Capabilities
            </h2>
            <div className="w-8 h-px bg-black/20 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 border border-black/10">
            <div className="p-8 border-r border-b border-black/10 hover:bg-black/[0.02] transition-colors">
              <h3 className="font-medium mb-3 text-black">Navigation</h3>
              <p className="text-black/60 text-sm font-light leading-relaxed">
                Intelligent web navigation with smart element detection and fallback strategies
              </p>
            </div>
            
            <div className="p-8 border-b border-black/10 hover:bg-black/[0.02] transition-colors">
              <h3 className="font-medium mb-3 text-black">Vision AI</h3>
              <p className="text-black/60 text-sm font-light leading-relaxed">
                Advanced image recognition and visual page understanding capabilities
              </p>
            </div>

            <div className="p-8 border-r border-black/10 hover:bg-black/[0.02] transition-colors">
              <h3 className="font-medium mb-3 text-black">Screenshots</h3>
              <p className="text-black/60 text-sm font-light leading-relaxed">
                High-quality automated screenshots with metadata and visual analysis
              </p>
            </div>

            <div className="p-8 hover:bg-black/[0.02] transition-colors">
              <h3 className="font-medium mb-3 text-black">Planning</h3>
              <p className="text-black/60 text-sm font-light leading-relaxed">
                Natural language interpretation with contextual action planning
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
