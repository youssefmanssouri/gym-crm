import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { chatWithAIFitnessAssistant, isGeminiConfigured } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    await requireAuth();

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Malformed JSON payload' },
        { status: 400 }
      );
    }

    const { message } = body;
    if (typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Field "message" must be a non-empty string' },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Field "message" exceeds maximum limit of 1000 characters' },
        { status: 400 }
      );
    }

    const response = await chatWithAIFitnessAssistant(message.trim());
    return NextResponse.json({
      success: true,
      response,
      isLiveAI: isGeminiConfigured(),
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process AI chat request' },
      { status: 500 }
    );
  }
}
