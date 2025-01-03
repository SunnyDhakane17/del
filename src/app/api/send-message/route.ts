import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { message, waId, phoneNumberId, businessPhoneNumber, mediaType, mediaUrl, caption } = body;

    // Input validation
    if (!waId || !phoneNumberId || !businessPhoneNumber) {
      return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
    }

    if (!message && (!mediaType || !mediaUrl)) {
      return NextResponse.json(
        { message: 'Either message or media (mediaType and mediaUrl) must be provided' },
        { status: 400 }
      );
    }

    // Define the local Express server endpoint
    const expressEndpoint = `http://localhost:3008/send-message`;

    // Payload to send to the Express server
    const payload = {
      waId,
      phoneNumberId,
      businessPhoneNumber,
      manualResponse: message, // Text message content
      mediaType, // Optional media type (e.g., image, video)
      mediaUrl,  // Optional media URL
      caption,   // Optional caption for media
    };

    // Send data to the Express server
    const response = await fetch(expressEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Handle the response from the Express server
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from Express server:', errorData);
      return NextResponse.json({ message: 'Failed to send message', error: errorData }, { status: 500 });
    }

    const responseData = await response.json();

    // Return a success response
    return NextResponse.json({ message: 'Message sent successfully', data: responseData }, { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error }, { status: 500 });
  }
}
