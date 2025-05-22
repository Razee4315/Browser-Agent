'use client';

interface AutomationSession {
  sessionId: string;
  status: 'running' | 'completed' | 'failed';
  plan: any;
  results: any;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

interface AutomationStatusProps {
  session: AutomationSession;
  isPolling: boolean;
  onClear: () => void;
}

export default function AutomationStatus({ session, isPolling, onClear }: AutomationStatusProps) {
  const getStatusIcon = () => {
    switch (session.status) {
      case 'running':
        return '🔄';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusColor = () => {
    switch (session.status) {
      case 'running':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const getDuration = () => {
    const start = new Date(session.startedAt);
    const end = session.completedAt ? new Date(session.completedAt) : new Date();
    const duration = Math.round((end.getTime() - start.getTime()) / 1000);
    
    if (duration < 60) {
      return `${duration}s`;
    } else {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return `${minutes}m ${seconds}s`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Automation Status
        </h2>
        <button
          onClick={onClear}
          className="text-gray-500 hover:text-gray-700 text-sm underline"
        >
          Clear
        </button>
      </div>

      {/* Status Badge */}
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mb-4 ${getStatusColor()}`}>
        <span className="mr-2">{getStatusIcon()}</span>
        {session.status.toUpperCase()}
        {isPolling && (
          <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
        )}
      </div>

      {/* Session Info */}
      <div className="space-y-3 text-sm">
        <div>
          <span className="font-medium text-gray-700">Session ID:</span>
          <span className="ml-2 text-gray-600 font-mono text-xs">
            {session.sessionId}
          </span>
        </div>

        <div>
          <span className="font-medium text-gray-700">Started:</span>
          <span className="ml-2 text-gray-600">
            {formatTime(session.startedAt)}
          </span>
        </div>

        {session.completedAt && (
          <div>
            <span className="font-medium text-gray-700">Completed:</span>
            <span className="ml-2 text-gray-600">
              {formatTime(session.completedAt)}
            </span>
          </div>
        )}

        <div>
          <span className="font-medium text-gray-700">Duration:</span>
          <span className="ml-2 text-gray-600">
            {getDuration()}
          </span>
        </div>

        {session.error && (
          <div>
            <span className="font-medium text-red-700">Error:</span>
            <div className="mt-1 text-red-600 bg-red-50 p-2 rounded border">
              {session.error}
            </div>
          </div>
        )}
      </div>

      {/* Plan Overview */}
      {session.plan && (
        <div className="mt-6">
          <h3 className="font-medium text-gray-700 mb-2">Automation Plan:</h3>
          <div className="bg-gray-50 p-3 rounded border">
            <p className="text-sm text-gray-600 mb-2">
              {session.plan.description}
            </p>
            <div className="text-xs text-gray-500">
              {session.plan.actions?.length || 0} actions planned
            </div>
          </div>
        </div>
      )}

      {/* Action Progress */}
      {session.plan?.actions && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-700 mb-2">Actions:</h4>
          <div className="space-y-2">
            {session.plan.actions.map((action: any, index: number) => {
              const isCompleted = session.results?.results && index < session.results.results.length;
              const isCurrent = session.status === 'running' && session.results?.results && index === session.results.results.length;
              
              return (
                <div
                  key={index}
                  className={`flex items-center text-sm p-2 rounded ${
                    isCompleted
                      ? 'bg-green-50 text-green-800'
                      : isCurrent
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="mr-2">
                    {isCompleted ? '✓' : isCurrent ? '▶' : '○'}
                  </span>
                  <span className="flex-1">
                    {action.description}
                  </span>
                  <span className="text-xs opacity-75">
                    {action.type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 