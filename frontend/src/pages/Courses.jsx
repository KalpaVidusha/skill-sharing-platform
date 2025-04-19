import React from 'react';
import Navbar from '../components/Navbar';

const Courses = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-8">Courses</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-700">Available courses will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default Courses;
