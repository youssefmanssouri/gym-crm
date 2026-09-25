import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { generateAINutritionPlan, isGeminiConfigured } from '@/lib/gemini';

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

    const { calories = 2800, dietType = 'High Protein', goal = 'Muscle Recomp' } = body;

    const calNum = Number(calories);
    if (isNaN(calNum) || calNum < 1000 || calNum > 8000) {
      return NextResponse.json(
        { success: false, error: 'Field "calories" must be a number between 1,000 and 8,000' },
        { status: 400 }
      );
    }

    if (typeof dietType !== 'string' || !dietType.trim() || dietType.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Field "dietType" must be a string up to 100 characters' },
        { status: 400 }
      );
    }

    if (typeof goal !== 'string' || !goal.trim() || goal.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Field "goal" must be a string up to 100 characters' },
        { status: 400 }
      );
    }

    const plan = await generateAINutritionPlan(goal.trim(), Math.round(calNum), dietType.trim());
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
      { success: false, error: 'Failed to process AI nutrition generation request' },
      { status: 500 }
    );
  }
}
