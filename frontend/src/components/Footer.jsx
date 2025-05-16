import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaYoutube, 
  FaHeart, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt 
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">SkillSphere</span>
            </div>
            <p className="text-blue-100 mb-6">
              Empowering creators to share knowledge, track progress, and connect with a global community of like-minded individuals.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors">
                <FaLinkedin size={20} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-blue-200 hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/posts" className="text-blue-200 hover:text-white transition-colors">Community Posts</Link>
              </li>
              <li>
                <Link to="/learning-plans" className="text-blue-200 hover:text-white transition-colors">Learning Plans</Link>
              </li>
              <li>
                <Link to="/courses" className="text-blue-200 hover:text-white transition-colors">Courses</Link>
              </li>
              <li>
                <Link to="/faq" className="text-blue-200 hover:text-white transition-colors">FAQs</Link>
              </li>
              <li>
                <Link to="/contact" className="text-blue-200 hover:text-white transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Resources */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/blog" className="text-blue-200 hover:text-white transition-colors">Blog</Link>
              </li>
              <li>
                <Link to="/tutorials" className="text-blue-200 hover:text-white transition-colors">Tutorials</Link>
              </li>
              <li>
                <Link to="/help-center" className="text-blue-200 hover:text-white transition-colors">Help Center</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-blue-200 hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-blue-200 hover:text-white transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/careers" className="text-blue-200 hover:text-white transition-colors">Careers</Link>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Contact */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-blue-300" />
                <span className="text-blue-100">Malabe,<br />Sri Lanka</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-3 text-blue-300" />
                <span className="text-blue-100">+94 (076) 920-7370</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-3 text-blue-300" />
                <span className="text-blue-100">support@skillsphere.com</span>
              </li>
              <li className="pt-4">
                <button className="bg-white text-blue-700 hover:bg-blue-100 font-medium py-2 px-4 rounded-lg transition-colors">
                  Subscribe to Newsletter
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="bg-blue-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-blue-200 text-sm mb-4 md:mb-0">
            &copy; {currentYear} SkillSphere. All rights reserved.
          </p>
          <p className="text-blue-200 text-sm flex items-center">
            Made with <FaHeart className="text-red-400 mx-1" /> for creators worldwide
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 