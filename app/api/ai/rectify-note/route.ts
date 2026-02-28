import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.NEXT_AI_API_KEY;
const GEMINI_API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface GeminiMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

interface GeminiRequestBody {
    system_instruction: {
        parts: { text: string }[];
    };
    contents: GeminiMessage[];
    generationConfig: {
        temperature: number;
        topK: number;
        topP: number;
        maxOutputTokens: number;
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

        const body = await request.json();
        const text = body?.text;

        if (typeof text !== 'string' || !text.trim()) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        const systemInstruction = `You are an expert business writing assistant.
Rectify and improve the user-provided CRM note.

Rules:
- Preserve original meaning and factual details.
- Correct grammar, spelling, and punctuation.
- Improve clarity and professionalism.
- Keep it concise and practical.
- Return only the improved note text.
- Do not add explanations, labels, markdown, or quotation marks.`;

        const requestBody: GeminiRequestBody = {
            system_instruction: {
                parts: [{ text: systemInstruction }],
            },
            contents: [
                {
                    role: 'user',
                    parts: [{ text }],
                },
            ],
            generationConfig: {
                temperature: 0.3,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 512,
            },
        };

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini rectify-note error:', errorData);

            return NextResponse.json(
                { error: 'Failed to rectify note' },
                { status: response.status }
            );
        }

        const data = await response.json();
        const improvedText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!improvedText) {
            return NextResponse.json(
                { error: 'No improved text generated' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            improvedText,
        });
    } catch (error) {
        console.error('Rectify note API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
