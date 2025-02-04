import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message, contactPreference, preferredDays } = body;

    const response = await prisma.contactFormResponse.create({
      data: {
        name,
        email,
        phone,
        message,
        contactPreference,
        preferredDays: JSON.stringify(preferredDays),
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error saving contact form:', error);
    return NextResponse.json(
      { error: 'Failed to save contact form' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const responses = await prisma.contactFormResponse.findMany({
      orderBy: {
        timestamp: 'desc',
      },
    });

    return NextResponse.json(responses);
  } catch (error) {
    console.error('Error fetching contact forms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact forms' },
      { status: 500 }
    );
  }
} 