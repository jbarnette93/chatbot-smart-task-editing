import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to proxy task enhancement requests to n8n webhook
 * Expects: { taskId: string, title: string, userEmail?: string }
 * Returns: { success: boolean, enhancedTitle?: string, error?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, title, userEmail } = body;

    // Validate required fields
    if (!taskId || !title) {
      return NextResponse.json(
        { success: false, error: 'taskId and title are required' },
        { status: 400 }
      );
    }

    const n8nWebhookUrl = process.env.N8N_ENHANCE_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      console.error('N8N_ENHANCE_WEBHOOK_URL is not configured');
      return NextResponse.json(
        { success: false, error: 'Enhancement service is not configured' },
        { status: 500 }
      );
    }

    // Forward request to n8n webhook
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskId,
        title,
        userEmail: userEmail || null,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to enhance task' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in enhance-task API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
