import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
import { prisma } from '../../lib/prisma';

// Helper to generate a random 6-character alphanumeric string
function generateRandomCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET() {
  try {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(links, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { originalUrl } = body;
    let { code } = body;

    if (!originalUrl) {
      return NextResponse.json({ error: 'originalUrl is required' }, { status: 400 });
    }

    // Custom code provided: Check for conflict
    if (code) {
      const existing = await prisma.link.findUnique({
        where: { code },
      });

      if (existing) {
        return NextResponse.json({ error: 'Code already exists' }, { status: 409 });
      }
    } else {
      // No code provided: Generate unique random code
      let isUnique = false;
      while (!isUnique) {
        code = generateRandomCode();
        const existing = await prisma.link.findUnique({ where: { code } });
        if (!existing) isUnique = true;
      }
    }

    // Create the link
    const newLink = await prisma.link.create({
      data: {
        originalUrl,
        code,
      },
    });

    return NextResponse.json(newLink, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
