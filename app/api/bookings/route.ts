import { NextResponse } from 'next/server';
import { z } from 'zod';
import { bookingsPrisma } from '@/lib/prisma';

// Validation schema
const bookingSchema = z.object({
  date: z.string().datetime(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().min(1),
  purpose: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = bookingSchema.parse(body);

    // Check if the slot is available
    const existingBooking = await bookingsPrisma.booking.findFirst({
      where: {
        date: new Date(validatedData.date),
        time: validatedData.time,
        status: 'CONFIRMED',
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      );
    }

    // Create the booking
    const booking = await bookingsPrisma.booking.create({
      data: {
        date: new Date(validatedData.date),
        time: validatedData.time,
        name: validatedData.name,
        email: validatedData.email,
        company: validatedData.company,
        purpose: validatedData.purpose,
      },
    });

    // TODO: Send confirmation email

    return NextResponse.json(booking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get available slots for a specific date
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const bookings = await bookingsPrisma.booking.findMany({
      where: {
        date: new Date(date),
        status: 'CONFIRMED',
      },
      select: {
        time: true,
      },
    });

    const bookedTimes = new Set(bookings.map(b => b.time));
    
    // Generate all possible time slots
    const allTimeSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      allTimeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      allTimeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    // Mark slots as available or not
    const availableSlots = allTimeSlots.map(time => ({
      time,
      available: !bookedTimes.has(time),
    }));

    return NextResponse.json(availableSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 