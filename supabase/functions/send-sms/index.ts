const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface SMSRequest {
  to: string;
  message: string;
  type: 'welcome' | 'bulk';
  parentName?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, message, type, parentName }: SMSRequest = await req.json();

    // In a real implementation, you would integrate with Twilio or another SMS provider
    // For now, we'll simulate the SMS sending
    console.log(`Sending ${type} SMS to ${to}: ${message}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = {
      success: true,
      message: `SMS sent successfully to ${to}`,
      type,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );
  }
});