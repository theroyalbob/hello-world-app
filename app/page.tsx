'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navigation */}
      <header className="w-full bg-white shadow-md p-4 fixed top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-blue-800">Coley Data Services</h1>
            <span className="text-sm text-gray-500">by Andrew Stewart</span>
          </div>
          <nav className="flex space-x-6">
            <Link href="/#services" className="text-gray-600 hover:text-blue-600">Services</Link>
            <Link href="/#case-studies" className="text-gray-600 hover:text-blue-600">Case Studies</Link>
            <Link href="/#testimonials" className="text-gray-600 hover:text-blue-600">Testimonials</Link>
            <Link href="/about" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-20">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Data Solutions for Modern Business</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Transform your business with expert data consulting, analytics, and implementation services.
            </p>
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Schedule a Consultation
            </button>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">Our Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Service Cards - To be populated later */}
              {['Data Analytics', 'Business Intelligence', 'Data Infrastructure'].map((service) => (
                <div key={service} className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-xl font-semibold mb-4">{service}</h4>
                  <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Case Studies Section */}
        <section id="case-studies" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">Case Studies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Case Study Cards - To be populated later */}
              {[1, 2].map((study) => (
                <div key={study} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-xl font-semibold mb-4">Case Study {study}</h4>
                  <p className="text-gray-600">Coming soon...</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">Client Testimonials</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial Cards - To be populated later */}
              {[1, 2, 3].map((testimonial) => (
                <div key={testimonial} className="p-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 italic mb-4">"Testimonial coming soon..."</p>
                  <p className="font-semibold">- Client Name</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold mb-4">Coley Data Services</h4>
            <p className="text-gray-400">Transforming data into business value</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Data Analytics</li>
              <li>Business Intelligence</li>
              <li>Data Infrastructure</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: contact@coleydata.com</li>
              <li>Phone: (555) 123-4567</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
              <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
