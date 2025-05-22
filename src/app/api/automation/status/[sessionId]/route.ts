import { NextRequest, NextResponse } from 'next/server';
import { automationSessions } from '../../start/route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = automationSessions.get(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Return session data
    return NextResponse.json({
      sessionId: session.id,
      status: session.status,
      plan: session.plan,
      results: session.results,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      error: session.error
    });

  } catch (error) {
    console.error('Error getting automation status:', error);
    return NextResponse.json(
      { error: 'Failed to get automation status' },
      { status: 500 }
    );
  }
} 