import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Create a single PrismaClient instance and reuse it
const prisma = new PrismaClient();

export async function POST(request: Request) {
  console.log('POST /api/bookings: Starting request');
  try {
    const body = await request.json();
    console.log('Request body:', body);
    const { startTime, endTime, name, email, phone } = body;

    // Validate all required fields
    if (!startTime || !endTime || !name || !email || !phone) {
      console.log('Missing required fields:', { startTime, endTime, name, email, phone });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Creating booking with data:', {
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      name,
      email,
      phone
    });

    const booking = await prisma.booking.create({
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        name,
        email,
        phone,
      },
    });

    console.log('Successfully created booking:', booking);
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Detailed error creating booking:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Failed to create booking', 
        details: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown'
      },
      { status: 500 }
    );
  } finally {
    console.log('POST /api/bookings: Request completed');
  }
}

export async function GET() {
  console.log('GET /api/bookings: Starting request');
  try {
    console.log('Attempting to connect to database...');
    // Only fetch future bookings
    const bookings = await prisma.booking.findMany({
      where: {
        startTime: {
          gte: new Date(), // Only get bookings from now onwards
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
    console.log(`Successfully fetched ${bookings.length} bookings`);
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Database error in /api/bookings:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    // Instead of returning a 500 error, return an empty array
    return NextResponse.json([]);
  } finally {
    console.log('GET /api/bookings: Request completed');
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    await prisma.booking.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 