import React from 'react';
import Navbar from '../components/Navbar';

const Feed = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 pt-24">
        <h1 className="text-3xl font-bold text-blue-900 mb-8">Feed</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-700">Your feed content will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default Feed;
