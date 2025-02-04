'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, addDays, setHours, setMinutes } from 'date-fns';
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

interface ContactFormResponse {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [bookings, setBookings] = useState<BookedSlot[]>([]);
  const [contactResponses, setContactResponses] = useState<ContactFormResponse[]>([]);
  const [showScheduler, setShowScheduler] = useState(false);
  const [adminBookingForm, setAdminBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const savedBookings = localStorage.getItem('bookedConsultations');
    const savedContacts = localStorage.getItem('contactFormResponses');
    
    if (savedBookings) {
      const parsedBookings = JSON.parse(savedBookings);
      parsedBookings.sort((a: BookedSlot, b: BookedSlot) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
      setBookings(parsedBookings);
    }

    if (savedContacts) {
      const parsedContacts = JSON.parse(savedContacts);
      setContactResponses(parsedContacts);
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Steelers7?') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
    setBookings(updatedBookings);
    localStorage.setItem('bookedConsultations', JSON.stringify(updatedBookings));
  };

  const handleAdminBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, phone, date, time } = adminBookingForm;
    
    const [hours, minutes] = time.split(':');
    const startTime = setMinutes(setHours(new Date(date), parseInt(hours)), parseInt(minutes));
    const endTime = addDays(startTime, 0);
    endTime.setMinutes(startTime.getMinutes() + 30);

    const newBooking: BookedSlot = {
      id: format(startTime, 'yyyy-MM-dd-HH-mm'),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      bookedBy: {
        name,
        email,
        phone,
      },
    };

    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    localStorage.setItem('bookedConsultations', JSON.stringify(updatedBookings));
    setShowScheduler(false);
    setAdminBookingForm({
      name: '',
      email: '',
      phone: '',
      date: '',
      time: '',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <Link
            href="/schedule"
            className="px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
          >
            Back to Schedule
          </Link>
          <Link 
            href="/"
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Back to Home
          </Link>
        </div>
      </div>

      {/* Admin Scheduler */}
      <div className="mb-8">
        <button
          onClick={() => setShowScheduler(!showScheduler)}
          className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {showScheduler ? 'Hide Scheduler' : 'Schedule New Appointment'}
        </button>

        {showScheduler && (
          <form onSubmit={handleAdminBooking} className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Client Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={adminBookingForm.name}
                onChange={(e) => setAdminBookingForm(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Client Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={adminBookingForm.email}
                onChange={(e) => setAdminBookingForm(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Client Phone
              </label>
              <input
                type="tel"
                id="phone"
                required
                value={adminBookingForm.phone}
                onChange={(e) => setAdminBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                id="date"
                required
                value={adminBookingForm.date}
                onChange={(e) => setAdminBookingForm(prev => ({ ...prev, date: e.target.value }))}
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                Time
              </label>
              <input
                type="time"
                id="time"
                required
                value={adminBookingForm.time}
                onChange={(e) => setAdminBookingForm(prev => ({ ...prev, time: e.target.value }))}
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Schedule Appointment
            </button>
          </form>
        )}
      </div>

      {/* Bookings Section */}
      <div className="space-y-6 mb-12">
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

      {/* Contact Form Responses Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Contact Form Responses</h2>
        {contactResponses.length === 0 ? (
          <p className="text-gray-500">No contact form submissions yet.</p>
        ) : (
          contactResponses.map((response) => (
            <div
              key={response.id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="font-semibold text-lg">{response.name}</h3>
                <p className="text-gray-600">{response.email}</p>
                <p className="mt-2">{response.message}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Submitted: {format(parseISO(response.timestamp), 'MMMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 