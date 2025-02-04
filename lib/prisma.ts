import { PrismaClient as BookingsPrismaClient } from '@prisma/client';
import { PrismaClient as ContactsPrismaClient } from '@prisma/client';

if (!process.env.BOOKINGS_PRISMA_URL) {
  throw new Error('BOOKINGS_PRISMA_URL environment variable is not set');
}

if (!process.env.CONTACTS_PRISMA_URL) {
  throw new Error('CONTACTS_PRISMA_URL environment variable is not set');
}

// Booking database client
const globalForBookings = globalThis as unknown as {
  bookingsPrisma: BookingsPrismaClient | undefined;
};

export const bookingsPrisma =
  globalForBookings.bookingsPrisma ??
  new BookingsPrismaClient({
    datasources: {
      db: {
        url: process.env.BOOKINGS_PRISMA_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForBookings.bookingsPrisma = bookingsPrisma;

// Contact form database client
const globalForContacts = globalThis as unknown as {
  contactsPrisma: ContactsPrismaClient | undefined;
};

export const contactsPrisma =
  globalForContacts.contactsPrisma ??
  new ContactsPrismaClient({
    datasources: {
      db: {
        url: process.env.CONTACTS_PRISMA_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForContacts.contactsPrisma = contactsPrisma; 