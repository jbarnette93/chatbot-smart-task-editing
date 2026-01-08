import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to proxy chatbot requests to n8n webhook
 * Expects: { message: string, userEmail?: string }
 * Returns: { success: boolean, message?: string, taskId?: string, error?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userEmail } = body;

    // Validate required fields
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'message is required' },
        { status: 400 }
      );
    }

    const n8nWebhookUrl = process.env.N8N_CHAT_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      console.error('N8N_CHAT_WEBHOOK_URL is not configured');
      return NextResponse.json(
        { success: false, error: 'Chatbot service is not configured' },
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
        message: message.trim(),
        userEmail: userEmail || null,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to process chat message' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
