
import type { JSX } from 'react';
import { Link } from 'react-router-dom';

export default function Home(): JSX.Element {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-blue-600 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Find Your Perfect Ride
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          Rent luxury and affordable cars at the best prices.
        </p>
        <Link to="/register" className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition">
          Get Started
        </Link>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto py-16 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-xl font-bold mb-2">Easy Booking</h3>
          <p className="text-gray-600">Book your car in just 3 clicks.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-4xl mb-4">🛡️</div>
          <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
          <p className="text-gray-600">100% secure and transparent pricing.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-4xl mb-4">🏎️</div>
          <h3 className="text-xl font-bold mb-2">Premium Cars</h3>
          <p className="text-gray-600">Choose from a wide range of luxury vehicles.</p>
        </div>
      </div>
    </div>
  );
}