import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus, FaChartLine, FaLaptopCode, FaUsers, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
    
    // Add scroll reveal animations
    const handleScroll = () => {
      const reveals = document.querySelectorAll('.reveal-element');
      reveals.forEach((element) => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        if (elementTop < windowHeight - elementVisible) {
          element.classList.add('active');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial load
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation variants for staggered children
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 50
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-[10%] left-[5%] w-[40rem] h-[40rem] bg-blue-600 rounded-full blur-[10rem]"></div>
          <div className="absolute top-[40%] right-[5%] w-[30rem] h-[30rem] bg-indigo-600 rounded-full blur-[10rem]"></div>
          <div className="absolute bottom-[5%] left-[35%] w-[30rem] h-[30rem] bg-blue-400 rounded-full blur-[10rem]"></div>
        </div>
      </div>
  
      {/* Navbar - with highest z-index to stay on top */}
      <div className="relative z-50">
        <Navbar />
      </div>
  
      {/* Content - lower z-index than navbar */}
      <div className="flex-grow relative z-10">
        {/* Hero Section */}
        <section className={`relative z-10 px-6 py-32 md:py-40 transition-all duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="lg:w-1/2 mb-12 lg:mb-0 text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
                    Unleash Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Creative Potential</span>
                  </h1>
                </motion.div>
                
                <motion.p 
                  className="text-xl text-gray-700 mb-8 leading-relaxed max-w-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                >
                  A modern platform to share knowledge, track your growth journey, and connect with like-minded creators worldwide.
                </motion.p>
                
                <motion.div 
                  className="flex flex-col sm:flex-row gap-5 mt-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                >
                  <Link 
                    to="/posts" 
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center"
                  >
                    <span>Explore Community</span>
                    <FaArrowRight className="ml-2 animate-pulse" />
                  </Link>
                  <Link 
                    to="/signup" 
                    className="px-8 py-4 bg-white/90 backdrop-blur-sm text-indigo-600 border-2 border-indigo-600/30 hover:border-indigo-600/80 hover:bg-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Join Now - It's Free
                  </Link>
                </motion.div>
              </div>
              
              {/* Hero image/illustration */}
              <motion.div 
                className="lg:w-1/2 flex justify-center lg:justify-end"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <div className="relative w-full max-w-lg">
                  <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                  <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                  <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
                  <div className="relative">
                    <div className="p-8 bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                      <div className="relative">
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl rotate-12"></div>
                        <img 
                          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80" 
                          alt="Learning together"
                          className="rounded-2xl relative z-10 shadow-lg transform hover:scale-[1.02] transition-transform duration-300"
                        />
                      </div>
                      <div className="mt-6 flex justify-between items-end">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">Collaborative Learning</h3>
                          <p className="text-gray-600 mt-1">Join our vibrant community today</p>
                        </div>
                        <div className="flex -space-x-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-${i*100} to-indigo-${i*100} ring-2 ring-white flex items-center justify-center text-white text-xs font-bold`}>
                              {['A', 'B', 'C', '+'][i-1]}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
  
        {/* Stats Section */}
        <section className="relative z-10 py-20 bg-gradient-to-b from-white/40 to-white/80 reveal-element opacity-0 transition-all duration-1000">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50 hover:transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl font-extrabold text-blue-600 mb-2">10K+</div>
                <div className="text-gray-700">Active Users</div>
              </div>
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50 hover:transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl font-extrabold text-blue-600 mb-2">5K+</div>
                <div className="text-gray-700">Resources</div>
              </div>
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50 hover:transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl font-extrabold text-blue-600 mb-2">500+</div>
                <div className="text-gray-700">Courses</div>
              </div>
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50 hover:transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl font-extrabold text-blue-600 mb-2">95%</div>
                <div className="text-gray-700">Satisfaction</div>
              </div>
            </div>
          </div>
        </section>
  
        {/* Features Section */}
        <section className="relative z-10 py-24 px-6 reveal-element opacity-0 transition-all duration-1000">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Why Choose <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">SkillSphere</span>?
              </h2>
              <p className="text-xl text-gray-600">Designed for creators who want to learn, share, and grow together in a supportive community environment.</p>
            </div>
  
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-10"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              {/* Feature Card 1 */}
              <motion.div 
                className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 flex flex-col h-full"
                variants={item}
              >
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transform -rotate-6">
                  <FaLaptopCode className="w-7 h-7 text-blue-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Share Skills</h3>
                <p className="text-gray-600 mb-6 flex-grow">
                  Create beautiful posts with images, videos, and structured content to showcase your expertise and help others learn from your journey.
                </p>
                <Link to="/posts" className="text-blue-600 font-medium flex items-center group">
                  Explore Posts <FaArrowRight className="ml-2 group-hover:ml-3 transition-all" />
                </Link>
              </motion.div>
  
              {/* Feature Card 2 */}
              <motion.div 
                className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 flex flex-col h-full"
                variants={item}
              >
                <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transform -rotate-6">
                  <FaChartLine className="w-7 h-7 text-indigo-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Track Progress</h3>
                <p className="text-gray-600 mb-6 flex-grow">
                  Visualize your learning journey with milestones, achievements, and personalized analytics that help you stay motivated and focused.
                </p>
                <Link to="/progress" className="text-indigo-600 font-medium flex items-center group">
                  View Progress Tools <FaArrowRight className="ml-2 group-hover:ml-3 transition-all" />
                </Link>
              </motion.div>
  
              {/* Feature Card 3 */}
              <motion.div 
                className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 flex flex-col h-full"
                variants={item}
              >
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transform -rotate-6">
                  <FaUsers className="w-7 h-7 text-purple-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Connect & Grow</h3>
                <p className="text-gray-600 mb-6 flex-grow">
                  Join a vibrant community of learners and mentors to collaborate on projects, exchange knowledge, and accelerate your growth.
                </p>
                <Link to="/signup" className="text-purple-600 font-medium flex items-center group">
                  Join Community <FaArrowRight className="ml-2 group-hover:ml-3 transition-all" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
  
        {/* Testimonials Section */}
        <section className="relative z-10 py-24 px-6 bg-white/30 reveal-element opacity-0 transition-all duration-1000">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Community Says</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Join thousands of satisfied users who are transforming their learning journey.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/50">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white font-bold text-xl mr-4">S</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Shanilka Srimal</h4>
                    <p className="text-gray-600 text-sm">UX Designer</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"The learning plans feature has transformed how I approach my design education. I can easily track my progress and connect with other designers."</p>
                <div className="flex text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              
              {/* Testimonial 2 */}
              <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/50">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-700 flex items-center justify-center text-white font-bold text-xl mr-4">K</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Kalpa Vidusha</h4>
                    <p className="text-gray-600 text-sm">Web Developer</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"I've completed three courses on SkillSphere and the community support has been incredible. The progress tracking keeps me accountable."</p>
                <div className="flex text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              
              {/* Testimonial 3 */}
              <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/50">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-700 flex items-center justify-center text-white font-bold text-xl mr-4">B</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Buwaneka Wijesinghe</h4>
                    <p className="text-gray-600 text-sm">Product Manager</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"The quality of content shared by experts on this platform is outstanding. It's helped me level up my product management skills in just months."</p>
                <div className="flex text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill={i < 4 ? "currentColor" : "none"} stroke={i >= 4 ? "currentColor" : "none"} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="relative z-10 py-24 px-6 reveal-element opacity-0 transition-all duration-1000">
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl overflow-hidden shadow-2xl">
            <div className="relative p-12 md:p-16">
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
                <div className="absolute -top-[40%] -left-[10%] w-[70%] aspect-square rounded-full border-[30px] border-white"></div>
                <div className="absolute -bottom-[30%] -right-[10%] w-[60%] aspect-square rounded-full border-[30px] border-white"></div>
              </div>
              
              <div className="relative z-10 text-white text-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Ready to Start Your Learning Journey?</h2>
                <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                  Join our community today and unlock unlimited access to courses, learning plans, and expert connections.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link 
                    to="/signup" 
                    className="px-8 py-4 bg-white text-indigo-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Create Your Free Account
                  </Link>
                  <Link 
                    to="/posts" 
                    className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/10"
                  >
                    Browse Courses
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      {/* Footer - with proper z-index */}
      <div className="relative z-20">
        <Footer />
      </div>
      
      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: scale(1) translate(0px, 0px); }
          33% { transform: scale(1.1) translate(20px, -20px); }
          66% { transform: scale(0.9) translate(-20px, 20px); }
          100% { transform: scale(1) translate(0px, 0px); }
        }
        
        .animate-blob {
          animation: blob 7s infinite ease-in-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .reveal-element {
          transform: translateY(50px);
        }
        
        .reveal-element.active {
          transform: translateY(0);
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default Home;
