'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  contactPreference: string;
  preferredDays: string[];
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    contactPreference: 'morning',
    preferredDays: [],
  });
  const [successMessage, setSuccessMessage] = useState('');

  const timePreferences = [
    { id: 'morning', label: 'Morning (9am - 12pm)' },
    { id: 'workday', label: 'Work Day (12pm - 5pm)' },
    { id: 'evening', label: 'Evening (5pm - 8pm)' },
  ];

  const daysOfWeek = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' },
  ];

  // Load form responses from localStorage on mount
  useEffect(() => {
    const savedResponses = localStorage.getItem('contactFormResponses');
    if (!savedResponses) {
      localStorage.setItem('contactFormResponses', JSON.stringify([]));
    }
  }, []);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Format the number
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create new contact form response
    const newResponse = {
      id: new Date().getTime().toString(),
      ...formData,
      timestamp: new Date().toISOString(),
    };

    // Get existing responses or initialize empty array
    const existingResponses = JSON.parse(localStorage.getItem('contactFormResponses') || '[]');
    
    // Add new response
    const updatedResponses = [...existingResponses, newResponse];
    
    // Save to localStorage
    localStorage.setItem('contactFormResponses', JSON.stringify(updatedResponses));

    // Clear form and show success message
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
      contactPreference: 'morning',
      preferredDays: [],
    });
    setSuccessMessage('Thank you for your message! We will get back to you soon.');

    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Format phone number as it's typed
      setFormData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => {
      const currentDays = prev.preferredDays;
      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day];
      return { ...prev, preferredDays: newDays };
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <div className="flex space-x-4">
          <Link
            href="/"
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Back to Home
          </Link>
          <Link
            href="/schedule/admin"
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
          >
            Admin Login
          </Link>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
            Phone Number
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Contact Time
          </label>
          <div className="space-y-2">
            {timePreferences.map((time) => (
              <div key={time.id} className="flex items-center">
                <input
                  type="radio"
                  id={time.id}
                  name="contactPreference"
                  value={time.id}
                  checked={formData.contactPreference === time.id}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor={time.id} className="ml-2 block text-sm text-gray-700">
                  {time.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Days (select all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {daysOfWeek.map((day) => (
              <div key={day.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={day.id}
                  checked={formData.preferredDays.includes(day.id)}
                  onChange={() => handleDayToggle(day.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={day.id} className="ml-2 block text-sm text-gray-700">
                  {day.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            value={formData.message}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Send Message
        </button>
      </form>
    </div>
  );
} 