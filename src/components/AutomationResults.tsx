'use client';

import { useState } from 'react';

interface AutomationSession {
  sessionId: string;
  status: 'running' | 'completed' | 'failed';
  plan: any;
  results: any;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

interface AutomationResultsProps {
  session: AutomationSession;
}

export default function AutomationResults({ session }: AutomationResultsProps) {
  const [activeTab, setActiveTab] = useState<'results' | 'screenshots' | 'data' | 'ai-insights'>('results');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  if (!session.results) {
    return (
      <div className="border border-black/10 rounded-lg p-8 bg-white">
        <h2 className="text-xl font-light text-black mb-6 tracking-tight">
          Results
        </h2>
        <div className="text-center text-black/50 py-12">
          {session.status === 'running' ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-6 w-6 border border-black/20 border-t-black mb-6"></div>
              <p className="font-light">Automation in progress...</p>
            </div>
          ) : (
            <p className="font-light">No results yet</p>
          )}
        </div>
      </div>
    );
  }

  const { results, screenshots } = session.results;

  return (
    <div className="border border-black/10 rounded-lg p-8 bg-white">
      <h2 className="text-xl font-light text-black mb-6 tracking-tight">
        Results
      </h2>

      {/* Tab Navigation */}
      <div className="flex border-b border-black/10 mb-8">
        <button
          onClick={() => setActiveTab('results')}
          className={`py-3 px-4 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'results'
              ? 'border-black text-black'
              : 'border-transparent text-black/50 hover:text-black/70'
          }`}
        >
          Actions ({results?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('screenshots')}
          className={`py-3 px-4 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'screenshots'
              ? 'border-black text-black'
              : 'border-transparent text-black/50 hover:text-black/70'
          }`}
        >
          Screenshots ({screenshots?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`py-3 px-4 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'data'
              ? 'border-black text-black'
              : 'border-transparent text-black/50 hover:text-black/70'
          }`}
        >
          Data
        </button>
        <button
          onClick={() => setActiveTab('ai-insights')}
          className={`py-3 px-4 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'ai-insights'
              ? 'border-black text-black'
              : 'border-transparent text-black/50 hover:text-black/70'
          }`}
        >
          AI
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'results' && (
          <div className="space-y-1">
            {results && results.length > 0 ? (
              results.map((result: any, index: number) => (
                <div key={index} className="border-b border-black/5 py-6 first:pt-0 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-black text-sm">
                      {index + 1}. {result.action}
                    </h3>
                    <span className="text-xs text-black/40 px-2 py-1 border border-black/10 rounded font-light">
                      {result.type}
                    </span>
                  </div>
                  
                  {result.result && (
                    <div className="bg-black/[0.02] p-4 rounded-lg border border-black/5 text-sm">
                      <pre className="text-black/70 whitespace-pre-wrap overflow-x-auto font-mono text-xs leading-relaxed">
                        {typeof result.result === 'object' 
                          ? JSON.stringify(result.result, null, 2)
                          : result.result
                        }
                      </pre>
                    </div>
                  )}
                  
                  <div className="text-xs text-black/30 mt-3 font-light">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-black/50 py-12 font-light">
                No action results available
              </div>
            )}
          </div>
        )}

        {activeTab === 'screenshots' && (
          <div className="space-y-6">
            {screenshots && screenshots.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {screenshots.map((screenshotData: any, index: number) => {
                    // Handle both old string format and new object format
                    const screenshot = typeof screenshotData === 'string' ? screenshotData : screenshotData.fullPage;
                    const viewport = typeof screenshotData === 'string' ? screenshotData : screenshotData.viewport;
                    const description = typeof screenshotData === 'string' ? `Screenshot ${index + 1}` : screenshotData.description;
                    const url = typeof screenshotData === 'string' ? '' : screenshotData.url;
                    const title = typeof screenshotData === 'string' ? '' : screenshotData.title;
                    const timestamp = typeof screenshotData === 'string' ? Date.now() : screenshotData.timestamp;
                    
                    return (
                      <div key={index} className="border border-black/10 rounded-lg overflow-hidden hover:border-black/20 transition-all duration-200">
                        <div className="relative group">
                          <img
                            src={`data:image/png;base64,${viewport}`}
                            alt={description}
                            className="w-full h-48 object-cover cursor-pointer transition-opacity duration-200 group-hover:opacity-90"
                            onClick={() => setSelectedScreenshot(screenshot)}
                          />
                          <div className="absolute top-3 right-3 bg-white/90 rounded px-2 py-1">
                            <span className="text-xs text-black/60 font-light">{index + 1}</span>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-medium text-black text-sm mb-2 line-clamp-2">
                            {description}
                          </h3>
                          
                          {title && (
                            <p className="text-sm text-black/60 mb-2 line-clamp-1 font-light">
                              {title}
                            </p>
                          )}
                          
                          {url && (
                            <p className="text-xs text-black/40 mb-3 line-clamp-1 font-light">
                              {url}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-black/30 font-light">{new Date(timestamp).toLocaleTimeString()}</span>
                            <button
                              onClick={() => setSelectedScreenshot(screenshot)}
                              className="text-black/60 hover:text-black font-light border border-black/10 px-2 py-1 rounded hover:bg-black/[0.02] transition-all"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Minimalist Screenshot Modal */}
                {selectedScreenshot && (
                  <div 
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedScreenshot(null)}
                  >
                    <div className="relative max-w-full max-h-full">
                      <img
                        src={`data:image/png;base64,${selectedScreenshot}`}
                        alt="Enlarged screenshot"
                        className="max-w-full max-h-full object-contain rounded"
                      />
                      <button
                        onClick={() => setSelectedScreenshot(null)}
                        className="absolute top-4 right-4 text-white bg-black/50 rounded w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-all duration-200"
                      >
                        <span className="text-lg">×</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-black/50 py-12 font-light">
                No screenshots available
              </div>
            )}
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            {results && results.length > 0 ? (
              <>
                {results
                  .filter((result: any) => result.type === 'extract' && result.result?.extracted)
                  .map((result: any, index: number) => (
                    <div key={index} className="border-b border-black/5 py-6 first:pt-0 last:border-b-0">
                      <h3 className="font-medium text-black mb-3 text-sm">
                        Extracted Data from Step {results.indexOf(result) + 1}
                      </h3>
                      <div className="bg-black/[0.02] p-4 rounded-lg border border-black/5">
                        <pre className="text-sm text-black/70 whitespace-pre-wrap overflow-x-auto font-mono text-xs leading-relaxed">
                          {JSON.stringify(result.result.extracted, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                
                {results.filter((result: any) => result.type === 'extract').length === 0 && (
                  <div className="text-center text-black/50 py-12 font-light">
                    No data extraction results available
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-black/50 py-12 font-light">
                No extracted data available
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai-insights' && (
          <div className="space-y-6">
            <div className="border border-black/10 rounded-lg p-6">
              <h3 className="text-lg font-light text-black mb-4 tracking-tight">
                AI Vision Analysis
              </h3>
              <p className="text-black/60 mb-4 font-light leading-relaxed">
                Your browser automation agent leverages <strong>Gemini 2.0 Vision AI</strong> 
                with advanced visual understanding capabilities.
              </p>
              <div className="space-y-3 text-sm text-black/60 font-light">
                <div>• Real-time screenshot analysis</div>
                <div>• Visual context understanding</div>
                <div>• Smart element identification</div>
                <div>• Adaptive decision making</div>
              </div>
            </div>

            {screenshots && screenshots.length > 0 && (
              <div className="border border-black/10 rounded-lg p-6">
                <h4 className="font-medium text-black mb-3 text-sm">
                  Visual Intelligence
                </h4>
                <p className="text-sm text-black/60 mb-4 font-light leading-relaxed">
                  Each screenshot is analyzed by AI to understand page context and optimize automation decisions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black/[0.02] border border-black/5 rounded p-3">
                    <h5 className="font-medium text-black text-xs mb-1">Screenshots</h5>
                    <p className="text-black/60 text-xs font-light">{screenshots.length} captured</p>
                  </div>
                  <div className="bg-black/[0.02] border border-black/5 rounded p-3">
                    <h5 className="font-medium text-black text-xs mb-1">Analysis</h5>
                    <p className="text-black/60 text-xs font-light">Visual processing</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Minimalist Summary */}
      {session.status === 'completed' && (
        <div className="mt-8 pt-6 border-t border-black/10">
          <div className="flex items-center justify-between">
            <span className="text-sm text-black/60 font-light">Completed successfully</span>
            <span className="text-xs text-black/40 font-light">
              {results?.length || 0} actions • {screenshots?.length || 0} screenshots
            </span>
          </div>
        </div>
      )}

      {session.status === 'failed' && (
        <div className="mt-8 pt-6 border-t border-black/10">
          <div className="text-sm text-black/60 font-light">
            <span className="text-black">Failed:</span> {session.error || 'Unknown error occurred'}
          </div>
        </div>
      )}
    </div>
  );
} 