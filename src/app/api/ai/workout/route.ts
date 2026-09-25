import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { generateAIWorkoutPlan, isGeminiConfigured } from '@/lib/gemini';

const ALLOWED_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

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

    const { prompt = '', level = 'INTERMEDIATE', goal = 'Hypertrophy' } = body;

    if (typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: 'Field "prompt" must be a non-empty string' },
        { status: 400 }
      );
    }

    if (prompt.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Field "prompt" exceeds maximum limit of 500 characters' },
        { status: 400 }
      );
    }

    const normalizedLevel = String(level).toUpperCase();
    if (!ALLOWED_LEVELS.includes(normalizedLevel)) {
      return NextResponse.json(
        { success: false, error: `Field "level" must be one of: ${ALLOWED_LEVELS.join(', ')}` },
        { status: 400 }
      );
    }

    if (typeof goal !== 'string' || !goal.trim() || goal.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Field "goal" must be a string up to 100 characters' },
        { status: 400 }
      );
    }

    const plan = await generateAIWorkoutPlan(prompt.trim(), normalizedLevel, goal.trim());
    return NextResponse.json({
      success: true,
      plan,
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
      { success: false, error: 'Failed to process AI workout generation request' },
      { status: 500 }
    );
  }
}
