'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, addDays, setHours, setMinutes, differenceInHours } from 'date-fns';
import Link from 'next/link';

interface BookedSlot {
  id: string;
  startTime: string;
  endTime: string;
  name: string;
  email: string;
  phone: string;
}

interface ContactFormResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  contactPreference: string;
  preferredDays: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const bookingsResponse = await fetch('/api/bookings');
      if (!bookingsResponse.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const bookingsData = await bookingsResponse.json();

      const contactsResponse = await fetch('/api/contact');
      if (!contactsResponse.ok) {
        throw new Error('Failed to fetch contact responses');
      }
      const contactsData = await contactsResponse.json();

      setBookings(bookingsData);
      setContactResponses(contactsData);
      setLastFetchTime(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();

      const checkAndFetch = () => {
        if (lastFetchTime && differenceInHours(new Date(), lastFetchTime) >= 4) {
          fetchData();
        }
      };

      const interval = setInterval(checkAndFetch, 60 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Steelers7?') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel booking');
      }

      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
    } catch (error) {
      console.error('Error canceling booking:', error);
      setError(error instanceof Error ? error.message : 'Failed to cancel booking');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    } else {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    }
  };

  const handleAdminFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      setAdminBookingForm(prev => ({
        ...prev,
        [name]: formatPhoneNumber(value)
      }));
    } else {
      setAdminBookingForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAdminBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const { name, email, phone, date, time } = adminBookingForm;
      
      const [hours, minutes] = time.split(':');
      const startTime = setMinutes(setHours(new Date(date), parseInt(hours)), parseInt(minutes));
      const endTime = addDays(startTime, 0);
      endTime.setMinutes(startTime.getMinutes() + 30);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          name,
          email,
          phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const newBooking = await response.json();
      setBookings(prev => [...prev, newBooking]);
      setShowScheduler(false);
      setAdminBookingForm({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
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
          <button
            onClick={fetchData}
            disabled={isLoading}
            className={`px-4 py-2 ${
              isLoading 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white rounded`}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
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

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {lastFetchTime && (
        <p className="text-sm text-gray-600 mb-4">
          Last updated: {format(lastFetchTime, 'MMM d, yyyy h:mm a')}
        </p>
      )}

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
                name="name"
                required
                value={adminBookingForm.name}
                onChange={handleAdminFormChange}
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
                name="email"
                required
                value={adminBookingForm.email}
                onChange={handleAdminFormChange}
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
                name="phone"
                required
                value={adminBookingForm.phone}
                onChange={handleAdminFormChange}
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
                name="date"
                required
                value={adminBookingForm.date}
                onChange={handleAdminFormChange}
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
                name="time"
                required
                value={adminBookingForm.time}
                onChange={handleAdminFormChange}
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
                    <p><span className="font-medium">Name:</span> {booking.name}</p>
                    <p><span className="font-medium">Email:</span> {booking.email}</p>
                    <p><span className="font-medium">Phone:</span> {booking.phone}</p>
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
          contactResponses.map((response) => {
            // Parse the preferredDays JSON string
            let preferredDays: string[] = [];
            try {
              preferredDays = JSON.parse(response.preferredDays);
            } catch (e) {
              console.error('Error parsing preferredDays:', e);
            }

            return (
              <div
                key={response.id}
                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-lg">{response.name}</h3>
                    <p className="text-sm text-gray-500">
                      Submitted: {format(parseISO(response.timestamp), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p><span className="font-medium">Email:</span> {response.email}</p>
                      <p><span className="font-medium">Phone:</span> {response.phone}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Preferred Time:</span> {
                        {
                          'morning': 'Morning (9am - 12pm)',
                          'workday': 'Work Day (12pm - 5pm)',
                          'evening': 'Evening (5pm - 8pm)'
                        }[response.contactPreference] || response.contactPreference
                      }</p>
                      <p><span className="font-medium">Preferred Days:</span> {
                        preferredDays.map(day => 
                          day.charAt(0).toUpperCase() + day.slice(1)
                        ).join(', ') || 'None selected'
                      }</p>
                    </div>
                  </div>
                  <div className="mt-4 bg-gray-50 p-3 rounded">
                    <p className="font-medium mb-1">Message:</p>
                    <p className="text-gray-700">{response.message}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 