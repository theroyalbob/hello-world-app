'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Contact() {
  const [activeTab, setActiveTab] = useState('inquire');

  const tabs = [
    { id: 'inquire', label: 'Get Started' },
    { id: 'phone', label: 'Schedule Call' },
    { id: 'email', label: 'Email Us' }
  ];

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <Link 
        href="/"
        className="absolute top-8 left-8 text-blue-500 hover:text-blue-600"
      >
        ← Back to Home
      </Link>
      
      <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
      
      <div className="w-full max-w-2xl">
        <div className="flex space-x-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 bg-white rounded-lg shadow-lg">
          {activeTab === 'inquire' && (
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Details</label>
                <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" rows={4}></textarea>
              </div>
              <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Submit Inquiry
              </button>
            </form>
          )}
          {activeTab === 'phone' && (
            <div className="space-y-4">
              <p className="text-gray-600">Schedule a call with our team:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">Business Hours:</p>
                <p className="text-gray-600">Monday - Friday: 9:00 AM - 5:00 PM PST</p>
              </div>
              <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Schedule Call (Calendar Coming Soon)
              </button>
            </div>
          )}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">Email Us At:</p>
                <p className="text-blue-600">contact@coleydata.com</p>
              </div>
              <p className="text-gray-600">We typically respond within 24 business hours.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 