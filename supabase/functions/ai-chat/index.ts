
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an AI credit card advisor for India. Your role is to help users find the perfect credit cards based on their financial profile.

CONVERSATION FLOW:
1. Ask about monthly income (in rupees)
2. Ask about spending habits (fuel, travel, groceries, dining, shopping)
3. Ask about preferred benefits
4. Ask about credit score range

GUIDELINES:
- Be conversational and helpful
- Ask one question at a time
- Keep responses concise (2-3 sentences max)
- Use Indian context (rupees, Indian banks)
- After collecting all info, say "Perfect! I'm analyzing your profile..."

RESPONSE FORMAT:
Always respond with JSON in this format:
{
  "message": "Your response text",
  "nextStep": "income|spending|benefits|creditScore|analysis|complete",
  "options": ["option1", "option2"] // Only for benefits and credit score
}

For benefits, offer these options:
["Cashback on all purchases", "Travel rewards & airline miles", "Fuel rewards", "Shopping rewards", "Airport lounge access", "Dining rewards"]

For credit score, offer these options:
["Excellent (750+)", "Good (700-749)", "Fair (650-699)", "Building credit (<650)", "Not sure"]`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();

    console.log('Received message:', message);
    console.log('Gemini API Key present:', !!geminiApiKey);

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Format conversation history for Gemini
    const contents = [];
    
    // Add system prompt as the first message
    contents.push({
      parts: [{ text: SYSTEM_PROMPT }]
    });

    // Add conversation history
    conversationHistory.forEach((msg: any) => {
      contents.push({
        parts: [{ text: msg.content }]
      });
    });

    // Add current user message
    contents.push({
      parts: [{ text: message }]
    });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 300,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error:', errorData);
      throw new Error(`Gemini API Error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;

    console.log('AI Response:', aiResponse);

    // Try to parse as JSON, fallback to simple response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch {
      parsedResponse = {
        message: aiResponse,
        nextStep: "income",
        options: null
      };
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      message: "I'm sorry, I'm having trouble right now. Let's start with your monthly income in rupees.",
      nextStep: "income"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
