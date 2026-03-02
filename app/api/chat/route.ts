import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.NEXT_AI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

interface ContentRequest {
    contents: ChatMessage[];
    system_instruction?: {
        parts: { text: string }[];
    };
}

export async function POST(request: NextRequest) {
    try {
        if (!GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'AI API key not configured' },
                { status: 500 }
            );
        }

        const { messages, context } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Invalid messages format' },
                { status: 400 }
            );
        }

        // Build system instruction with context
        let systemInstruction = `You are a helpful AI assistant for a CRM sales system. You help users analyze sales data, opportunities, clients, and other business metrics.

Current Timestamp: ${new Date().toISOString()}

Guidelines:
- Be concise and professional
- Provide actionable insights
- Format responses clearly
- If asked about data, provide analysis with context
- When providing numbers or metrics, be specific and cite the data provided`;

        if (context && typeof context === 'object') {
            systemInstruction += `\n\nCurrent Data Context:\n${JSON.stringify(context, null, 2)}`;
        }

        // Format messages for Gemini API
        const formattedMessages: ChatMessage[] = messages.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content || msg.text || '' }],
        }));

        // Call Gemini API
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: systemInstruction }],
                },
                contents: formattedMessages,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
            } as ContentRequest),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API error:', errorData);
            return NextResponse.json(
                { error: 'Failed to generate response' },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Extract text from response
        const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (!aiMessage) {
            return NextResponse.json(
                { error: 'No response generated' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: aiMessage,
            success: true,
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
