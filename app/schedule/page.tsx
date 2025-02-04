'use client';

import { useState, useEffect } from 'react';
import { format, addDays, setHours, setMinutes, isBefore } from 'date-fns';
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
  bookedBy: {
    name: string;
    email: string;
    phone: string;
  };
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

  // Load booked slots from localStorage on component mount
  useEffect(() => {
    const savedBookings = localStorage.getItem('bookedConsultations');
    if (savedBookings) {
      setBookedSlots(JSON.parse(savedBookings));
    }
  }, []);

  // Check if a slot is already booked
  const isSlotBooked = (slotId: string): boolean => {
    return bookedSlots.some(booking => booking.id === slotId);
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
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.isAvailable) return;
    setSelectedSlot(slot);
    setShowForm(true);
    setFormData(prev => ({ ...prev, selectedSlot: slot }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.selectedSlot) return;

    // Create new booking
    const newBooking: BookedSlot = {
      id: formData.selectedSlot.id,
      startTime: formData.selectedSlot.startTime.toISOString(),
      endTime: formData.selectedSlot.endTime.toISOString(),
      bookedBy: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      },
    };

    // Update booked slots
    const updatedBookings = [...bookedSlots, newBooking];
    setBookedSlots(updatedBookings);

    // Save to localStorage
    localStorage.setItem('bookedConsultations', JSON.stringify(updatedBookings));
    
    // Clear form and show success message
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
      
      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => handleDateChange(-1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Previous Day
        </button>
        <h2 className="text-xl font-semibold">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h2>
        <button
          onClick={() => handleDateChange(1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Next Day
        </button>
      </div>

      {/* Time Slots Grid */}
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
            disabled={!slot.isAvailable}
          >
            <div>{format(slot.startTime, 'h:mm a')}</div>
            {!slot.isAvailable && <div className="text-xs text-red-500">Booked</div>}
          </button>
        ))}
      </div>

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
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Book Consultation
          </button>
        </form>
      )}
    </div>
  );
} 