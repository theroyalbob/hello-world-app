import { NextResponse } from 'next/server';
import { z } from 'zod';
import { contactsPrisma } from '@/lib/prisma';

// Validation schema
const contactSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  contactName: z.string().min(2, 'Contact name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  projectDetails: z.string().min(10, 'Please provide more details about your project'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = contactSchema.parse(body);

    // Create the contact submission
    const submission = await contactsPrisma.contactSubmission.create({
      data: validatedData,
    });

    // TODO: Send notification email to admin

    return NextResponse.json({
      message: 'Thank you for your submission. We will contact you shortly.',
      id: submission.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Contact submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all contact submissions (protected route for admin)
export async function GET(request: Request) {
  try {
    // TODO: Add authentication
    const submissions = await contactsPrisma.contactSubmission.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 