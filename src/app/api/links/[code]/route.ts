import { NextResponse } from 'next/server';
// import { prisma } from '../../lib/prisma';
import { prisma } from '@/app/lib/prisma';

// In Next.js 15, params is a Promise that must be awaited
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    const link = await prisma.link.findUnique({
      where: { code },
    });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json(link, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    await prisma.link.delete({
      where: { code },
    });

    // Return 204 No Content on successful deletion
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Prisma error code P2025 indicates record not found
    // We can generic catch or check specifically, but 404 is the safe fallback
    return NextResponse.json({ error: 'Link not found' }, { status: 404 });
  }
}
