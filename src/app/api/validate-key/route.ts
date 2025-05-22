import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Test the API key with a simple request
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Make a simple test request
    const result = await model.generateContent('Test');
    
    if (result.response) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('API key validation error:', error);
    
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('401')) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your key and try again.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to validate API key. Please try again.' },
      { status: 500 }
    );
  }
} 