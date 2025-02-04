'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

interface BookedSlot {
  id: string;
  startTime: string;
  endTime: string;
  bookedBy: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<BookedSlot[]>([]);

  useEffect(() => {
    const savedBookings = localStorage.getItem('bookedConsultations');
    if (savedBookings) {
      const parsedBookings = JSON.parse(savedBookings);
      // Sort bookings by date
      parsedBookings.sort((a: BookedSlot, b: BookedSlot) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
      setBookings(parsedBookings);
    }
  }, []);

  const handleCancelBooking = (bookingId: string) => {
    const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
    setBookings(updatedBookings);
    localStorage.setItem('bookedConsultations', JSON.stringify(updatedBookings));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link 
          href="/"
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to Home
        </Link>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Upcoming Consultations</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-500">No bookings scheduled.</p>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {format(parseISO(booking.startTime), 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <p className="text-gray-600">
                    {format(parseISO(booking.startTime), 'h:mm a')} - {format(parseISO(booking.endTime), 'h:mm a')}
                  </p>
                  <div className="mt-2">
                    <p><span className="font-medium">Name:</span> {booking.bookedBy.name}</p>
                    <p><span className="font-medium">Email:</span> {booking.bookedBy.email}</p>
                    <p><span className="font-medium">Phone:</span> {booking.bookedBy.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCancelBooking(booking.id)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 