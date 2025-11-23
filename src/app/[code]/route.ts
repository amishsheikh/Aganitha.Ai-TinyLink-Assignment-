import { NextResponse } from 'next/server';
import { prisma } from '../lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    // Attempt to update the link stats and fetch the URL in one go.
    // This is atomic and handles concurrency better for the click counter.
    const link = await prisma.link.update({
      where: { code },
      data: {
        clicks: { increment: 1 },
        lastClickedAt: new Date(),
      },
    });

    // Perform the redirect (HTTP 302 Found)
    return NextResponse.redirect(link.originalUrl);

  } catch (error: any) {
    // Prisma error P2025 means "Record to update not found."
    if (error.code === 'P2025') {
      return new NextResponse('Link not found', { status: 404 });
    }

    // Handle other server errors
    console.error('Redirection error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
