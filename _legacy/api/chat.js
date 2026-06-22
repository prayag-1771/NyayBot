export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const body = await req.json();

        // Forward the request to Groq API
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Securely inject the API key from Vercel Environment Variables
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify(body)
        });

        // If Groq returns an error, forward it
        if (!response.ok) {
            const errorText = await response.text();
            return new Response(errorText, { 
                status: response.status,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Return the streaming response directly to the frontend
        return new Response(response.body, {
            status: 200,
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive"
            }
        });
    } catch (error) {
        console.error("API Route Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
