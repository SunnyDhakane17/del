// app/api/get-signed-url/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// You should store your AWS credentials securely using environment variables
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;

// Simple in-memory cache: key = `${bucketName}/${region}/${objectKey}`
// Value = { url: string, expiresAt: number }
const signedUrlCache: Record<string, { url: string; expiresAt: number }> = {};

export async function POST(request: NextRequest) {
  try {
    const { bucketName, region, key } = await request.json();
    const cacheKey = `${bucketName}/${region}/${key}`;

    // Check the cache first
    const now = Date.now();
    const cachedEntry = signedUrlCache[cacheKey];
    if (cachedEntry && cachedEntry.expiresAt > now) {
      console.log(`Cache hit for: ${cacheKey}`);
      return NextResponse.json({ url: cachedEntry.url });
    }

    // Initialize the S3 client
    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });

    const params = {
      Bucket: bucketName,
      Key: key,
    };

    // Specify an expiration time (in seconds). For example, 900 seconds = 15 minutes.
    const expiresIn = 900; // Adjust as needed
    const command = new GetObjectCommand(params);
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });

    // Cache the signed URL with expiration
    // expiresIn is in seconds, convert it to milliseconds for Date arithmetic
    const expiresAt = now + expiresIn * 1000;
    signedUrlCache[cacheKey] = { url: signedUrl, expiresAt };
    console.log(`Cache miss for: ${cacheKey}. Fetched new URL and cached it.`);

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
  }
}
