import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  return (
    <div className="relative min-h-screen bg-cover bg-center flex flex-col" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1500&q=80)' }}>
      {/* Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-white/90 to-white/95"></div>
  
      {/* Navbar */}
      <div className="relative z-10">
        <Navbar />
      </div>
  
      <div className="flex-grow">
        {/* Hero Section */}
        <section className={`relative z-1 px-6 py-32 md:py-40 text-center transition-all duration-700 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6 leading-tight">
              Unleash Your <span className="text-blue-600">Creative Potential</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
              A modern platform to share knowledge, track your growth journey, and connect with like-minded creators worldwide.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/posts" 
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Explore Community Posts
              </Link>
              <Link 
                to="/signup" 
                className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Join Now - It's Free
              </Link>
            </div>
          </div>
        </section>
  
        {/* Features Section */}
        <section className={`relative z-1 py-20 px-6 bg-gradient-to-b from-blue-50 to-white transition-all duration-700 delay-100 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Why Choose SkillSphere?</h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">Designed for creators who want to learn, share, and grow together</p>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-center text-blue-900 mb-3">Share Skills</h4>
                <p className="text-gray-600 text-center">
                  Create beautiful posts with images, videos, and structured content to showcase your expertise.
                </p>
              </div>
  
              {/* Feature Card 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-center text-blue-900 mb-3">Track Progress</h4>
                <p className="text-gray-600 text-center">
                  Visualize your learning journey with milestones, achievements, and personalized analytics.
                </p>
              </div>
  
              {/* Feature Card 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-center text-blue-900 mb-3">Connect & Grow</h4>
                <p className="text-gray-600 text-center">
                  Join a vibrant community of learners and mentors to collaborate on projects and exchange knowledge.
                </p>
              </div>
            </div>
          </div>
        </section>
  
        {/* Testimonials Section (Optional) */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center text-blue-900 mb-16">What Our Community Says</h3>
            {/* Testimonial cards would go here */}
          </div>
        </section>
      </div>
      
      {/* Footer */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Home;
