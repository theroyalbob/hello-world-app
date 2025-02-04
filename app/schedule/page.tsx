'use client';

import { useState, useEffect } from 'react';
import { format, addDays, setHours, setMinutes, isBefore, parseISO } from 'date-fns';
import Link from 'next/link';

interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
}

interface ConsultationFormData {
  name: string;
  email: string;
  phone: string;
  notes: string;
  selectedSlot: TimeSlot | null;
}

interface BookedSlot {
  id: string;
  startTime: string;
  endTime: string;
  name: string;
  email: string;
  phone: string;
}

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [formData, setFormData] = useState<ConsultationFormData>({
    name: '',
    email: '',
    phone: '',
    notes: '',
    selectedSlot: null,
  });
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Load booked slots from database on component mount and date change
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoadingSlots(true);
      setErrorMessage('');
      
      try {
        console.log('Fetching bookings...');
        const response = await fetch('/api/bookings');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          // If the response is not OK but we got an empty array, don't show an error
          if (Array.isArray(errorData) && errorData.length === 0) {
            setBookedSlots([]);
            return;
          }
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const bookings = await response.json();
        console.log(`Successfully fetched ${bookings.length} bookings`);
        setBookedSlots(bookings || []);
      } catch (error) {
        console.error('Detailed error fetching bookings:', {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        // Don't show error message if we have an empty array
        if (!Array.isArray(error) || error.length > 0) {
          setErrorMessage(
            `Unable to load available time slots. ${error instanceof Error ? error.message : 'Please try again later.'}`
          );
        }
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchBookings();
  }, [selectedDate]); // Refetch when date changes

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  // Check if a slot is already booked
  const isSlotBooked = (slotId: string): boolean => {
    return bookedSlots.some(booking => 
      format(new Date(booking.startTime), 'yyyy-MM-dd-HH-mm') === slotId
    );
  };

  // Generate time slots for the selected date
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    const intervalMinutes = 30;
    const now = new Date();

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const startTime = setMinutes(setHours(new Date(date), hour), minute);
        const endTime = setMinutes(setHours(new Date(date), hour), minute + intervalMinutes);
        const slotId = format(startTime, 'yyyy-MM-dd-HH-mm');
        
        // A slot is available if:
        // 1. It's not already booked
        // 2. It's not in the past
        const isAvailable = !isSlotBooked(slotId) && !isBefore(startTime, now);
        
        slots.push({
          id: slotId,
          startTime,
          endTime,
          isAvailable,
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots(selectedDate);

  const handleDateChange = (offset: number) => {
    setSelectedDate(addDays(selectedDate, offset));
    setSelectedSlot(null);
    setShowForm(false);
    setErrorMessage('');
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.isAvailable) return;
    setSelectedSlot(slot);
    setShowForm(true);
    setFormData(prev => ({ ...prev, selectedSlot: slot }));
    setErrorMessage('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.selectedSlot) return;

    setIsLoading(true);
    setErrorMessage('');
    
    try {
      console.log('Submitting booking:', {
        startTime: formData.selectedSlot.startTime,
        endTime: formData.selectedSlot.endTime,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: formData.selectedSlot.startTime,
          endTime: formData.selectedSlot.endTime,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Booking error response:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to book appointment');
      }

      const booking = await response.json();
      console.log('Booking success:', booking);
      setBookedSlots(prev => [...prev, booking]);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        notes: '',
        selectedSlot: null,
      });
      setSelectedSlot(null);
      setShowForm(false);
      setSuccessMessage('Your consultation has been scheduled! We will contact you shortly to confirm.');
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error booking appointment:', error);
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'Failed to book appointment. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      // Optionally, update the bookedSlots state to remove the canceled booking
      setBookedSlots(prev => prev.filter(booking => booking.id !== bookingId));
    } catch (error) {
      console.error('Error canceling booking:', error);
      setErrorMessage('Failed to cancel booking. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Schedule a Consultation</h1>
        <div className="flex space-x-4">
          <Link
            href="/"
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Back to Home
          </Link>
          <Link
            href="/schedule/admin"
            className="px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
          >
            Admin View
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          <p>{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Click here to refresh the page
          </button>
        </div>
      )}
      
      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => handleDateChange(-1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          disabled={isLoadingSlots}
        >
          Previous Day
        </button>
        <h2 className="text-xl font-semibold">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h2>
        <button
          onClick={() => handleDateChange(1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          disabled={isLoadingSlots}
        >
          Next Day
        </button>
      </div>

      {/* Time Slots Grid */}
      {isLoadingSlots ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading available time slots...</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {timeSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => handleSlotSelect(slot)}
              className={`p-4 rounded text-center transition-colors ${
                selectedSlot?.id === slot.id
                  ? 'bg-blue-500 text-white'
                  : slot.isAvailable
                  ? 'bg-white border border-gray-200 hover:border-blue-500'
                  : 'bg-gray-100 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!slot.isAvailable || isLoadingSlots}
            >
              <div>{format(slot.startTime, 'h:mm a')}</div>
              {!slot.isAvailable && <div className="text-xs text-red-500">Booked</div>}
            </button>
          ))}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Consultation Form */}
      {showForm && selectedSlot && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white ${
              isLoading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isLoading ? 'Booking...' : 'Book Consultation'}
          </button>
        </form>
      )}

      {/* Bookings Section */}
      <div className="space-y-6 mb-12">
        <h2 className="text-2xl font-semibold mb-4">Upcoming Consultations</h2>
        {bookedSlots.length === 0 ? (
          <p className="text-gray-500">No bookings scheduled.</p>
        ) : (
          bookedSlots.map((booking) => (
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
    </div>
  );
} 