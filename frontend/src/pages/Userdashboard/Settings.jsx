import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import apiService from '../../services/api';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { FaUser, FaLock, FaSave, FaExclamationTriangle, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import Footer from '../../components/Footer';

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [userId, setUserId] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  
  // User profile state
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    occupation: '',
    interests: '',
    skillLevel: 'beginner',
    website: '',
    profilePicture: '',
    username: '', // Read-only
    email: '',    // Read-only
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Form validation state
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Password strength checker
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');

  // Check authentication and fetch user details
  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (!isLoggedIn) {
        toast.error('Please login to access settings');
        navigate('/login');
        return;
      }

      const id = localStorage.getItem('userId');
      if (!id) {
        toast.error('Authentication error');
        navigate('/login');
        return;
      }
      
      setUserId(id);
      try {
        setLoading(true);
        const userData = await apiService.getUserProfile(id);
        if (userData) {
          setProfile({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            bio: userData.bio || '',
            location: userData.location || '',
            occupation: userData.occupation || '',
            interests: userData.interests || '',
            skillLevel: userData.skillLevel || 'beginner',
            website: userData.website || '',
            profilePicture: userData.profilePicture || '',
            username: userData.username || '',
            email: userData.email || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data. Please refresh the page.');
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
    
    // Check password strength when new password changes
    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }
    
    // Validate confirm password
    if (name === 'confirmPassword') {
      setPasswordErrors({
        ...passwordErrors,
        confirmPassword: 
          value !== passwordData.newPassword 
            ? 'Passwords do not match' 
            : '',
      });
    }
  };

  // Check password strength
  const checkPasswordStrength = (password) => {
    // Reset strength and feedback
    let strength = 0;
    let feedback = '';
    
    if (password.length === 0) {
      setPasswordStrength(0);
      setPasswordFeedback('');
      return;
    }
    
    // Check length
    if (password.length < 8) {
      feedback = 'Password is too short';
    } else {
      strength += 1;
    }
    
    // Check for mixed case
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) {
      strength += 1;
    } else {
      feedback += feedback ? ' • Missing upper/lowercase letters' : 'Missing upper/lowercase letters';
    }
    
    // Check for numbers
    if (password.match(/\d/)) {
      strength += 1;
    } else {
      feedback += feedback ? ' • Missing numbers' : 'Missing numbers';
    }
    
    // Check for special characters
    if (password.match(/[^a-zA-Z\d]/)) {
      strength += 1;
    } else {
      feedback += feedback ? ' • Missing special characters' : 'Missing special characters';
    }
    
    // Set strength message
    if (strength === 0) {
      feedback = 'Very weak password';
    } else if (strength === 1) {
      feedback = feedback || 'Weak password';
    } else if (strength === 2) {
      feedback = feedback || 'Medium strength password';
    } else if (strength === 3) {
      feedback = feedback || 'Strong password';
    } else if (strength === 4) {
      feedback = 'Very strong password';
    }
    
    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  };

  // Get color based on password strength
  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-red-500';
    if (passwordStrength === 1) return 'bg-red-400';
    if (passwordStrength === 2) return 'bg-yellow-500';
    if (passwordStrength === 3) return 'bg-green-400';
    if (passwordStrength === 4) return 'bg-green-600';
    return 'bg-gray-200';
  };

  // Handle profile update submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      
      // Create a copy of the profile without username and email
      const profileToUpdate = { ...profile };
      delete profileToUpdate.username;
      delete profileToUpdate.email;
      
      await apiService.updateUserProfile(userId, profileToUpdate);
      
      toast.success('Profile updated successfully');
      
      // Update profile in localStorage if needed
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...userData,
        firstName: profile.firstName,
        lastName: profile.lastName,
      }));
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Validate password form before submission
  const validatePasswordForm = () => {
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    
    let isValid = true;
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
      isValid = false;
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
      isValid = false;
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
      isValid = false;
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setPasswordErrors(errors);
    return isValid;
  };

  // Handle password change submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      setChangingPassword(true);
      
      // Double check if passwords match
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      
      // First verify current password
      const verifyResponse = await apiService.verifyPassword(userId, passwordData.currentPassword);
      
      if (!verifyResponse || !verifyResponse.success) {
        setPasswordErrors({
          ...passwordErrors,
          currentPassword: 'Current password is incorrect',
        });
        toast.error('Current password is incorrect');
        return;
      }
      
      // If verification succeeded, change password
      await apiService.changePassword(userId, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      // Reset password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Show success message
      Swal.fire({
        title: 'Password Changed!',
        text: 'Your password has been updated successfully.',
        icon: 'success',
        confirmButtonColor: '#3085d6',
      });
      
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.response?.status === 401) {
        setPasswordErrors({
          ...passwordErrors,
          currentPassword: 'Current password is incorrect',
        });
        toast.error('Current password is incorrect');
      } else {
        toast.error('Failed to change password. Please try again later.');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex min-h-screen pt-20 font-sans bg-gradient-to-r from-blue-50 to-white">
          <div className="sticky top-20 h-[calc(100vh-5rem)] self-start">
            <Sidebar defaultActiveTab="settings" userId={userId} />
          </div>
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen pt-20 font-sans bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
        <div className="sticky top-20 h-[calc(100vh-5rem)] self-start">
          <Sidebar defaultActiveTab="settings" userId={userId} />
        </div>
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* Page Header */}
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Account Settings
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Manage your profile information and security settings
              </p>
            </header>
            
            {error && (
              <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded shadow">
                <div className="flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Navigation */}
              <div className="lg:col-span-1">
                <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-md border border-white/70 p-4 sticky top-28">
                  <nav className="space-y-1">
                    <a 
                      href="#profile-section" 
                      className="flex items-center px-3 py-3 text-gray-700 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <FaUser className="w-5 h-5 text-blue-500 mr-3" />
                      <span className="font-medium">Profile Information</span>
                    </a>
                    <a 
                      href="#security-section" 
                      className="flex items-center px-3 py-3 text-gray-700 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <FaLock className="w-5 h-5 text-blue-500 mr-3" />
                      <span className="font-medium">Password & Security</span>
                    </a>
                  </nav>
                  
                  <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start">
                      <FaShieldAlt className="text-blue-500 mt-1 mr-2" />
                      <div>
                        <h4 className="font-medium text-blue-700">Security Tip</h4>
                        <p className="text-sm text-blue-600 mt-1">
                          Use a strong, unique password and update it regularly to keep your account secure.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Profile Information Section */}
                <section id="profile-section" className="bg-white/90 backdrop-blur-lg rounded-xl shadow-md border border-white/70 overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-white/30">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <FaUser className="mr-2 text-blue-500" />
                      Profile Information
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Update your personal information and how it appears on your profile
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <form onSubmit={handleProfileSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Username (disabled) */}
                        <div className="col-span-1">
                          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            Username (cannot be changed)
                          </label>
                          <input
                            type="text"
                            id="username"
                            name="username"
                            value={profile.username}
                            disabled
                            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-500 cursor-not-allowed"
                          />
                        </div>
                        
                        {/* Email (disabled) */}
                        <div className="col-span-1">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email (cannot be changed)
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={profile.email}
                            disabled
                            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-500 cursor-not-allowed"
                          />
                        </div>
                        
                        {/* First Name */}
                        <div className="col-span-1">
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={profile.firstName}
                            onChange={handleProfileChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        
                        {/* Last Name */}
                        <div className="col-span-1">
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={profile.lastName}
                            onChange={handleProfileChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        
                        {/* Location */}
                        <div className="col-span-1">
                          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                          </label>
                          <input
                            type="text"
                            id="location"
                            name="location"
                            value={profile.location}
                            onChange={handleProfileChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        {/* Occupation */}
                        <div className="col-span-1">
                          <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
                            Occupation
                          </label>
                          <input
                            type="text"
                            id="occupation"
                            name="occupation"
                            value={profile.occupation}
                            onChange={handleProfileChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        {/* Website */}
                        <div className="col-span-1">
                          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                            Website
                          </label>
                          <input
                            type="url"
                            id="website"
                            name="website"
                            value={profile.website}
                            onChange={handleProfileChange}
                            placeholder="https://example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        {/* Skill Level */}
                        <div className="col-span-1">
                          <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-700 mb-1">
                            Skill Level
                          </label>
                          <select
                            id="skillLevel"
                            name="skillLevel"
                            value={profile.skillLevel}
                            onChange={handleProfileChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                          </select>
                        </div>
                        
                        {/* Interests */}
                        <div className="col-span-2">
                          <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
                            Interests
                          </label>
                          <input
                            type="text"
                            id="interests"
                            name="interests"
                            value={profile.interests}
                            onChange={handleProfileChange}
                            placeholder="Web Development, Machine Learning, Design..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Separate your interests with commas
                          </p>
                        </div>
                        
                        {/* Bio */}
                        <div className="col-span-2">
                          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                            Bio
                          </label>
                          <textarea
                            id="bio"
                            name="bio"
                            value={profile.bio}
                            onChange={handleProfileChange}
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Tell others about yourself..."
                          ></textarea>
                          <p className="mt-1 text-xs text-gray-500">
                            Brief description for your profile
                          </p>
                        </div>
                        
                        {/* Profile Picture URL */}
                        <div className="col-span-2">
                          <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">
                            Profile Picture URL
                          </label>
                          <input
                            type="url"
                            id="profilePicture"
                            name="profilePicture"
                            value={profile.profilePicture}
                            onChange={handleProfileChange}
                            placeholder="https://example.com/your-image.jpg"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Enter a public URL for your profile picture
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70"
                          disabled={savingProfile}
                        >
                          {savingProfile ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-blue-300 rounded-full animate-spin mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaSave className="mr-2" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </section>
                
                {/* Password Section */}
                <section id="security-section" className="bg-white/90 backdrop-blur-lg rounded-xl shadow-md border border-white/70 overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-white/30">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <FaLock className="mr-2 text-blue-500" />
                      Password & Security
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Update your password and manage security settings
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <form onSubmit={handlePasswordSubmit}>
                      <div className="space-y-4">
                        {/* Current Password */}
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              id="currentPassword"
                              name="currentPassword"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              className={`w-full px-3 py-2 border ${
                                passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                              } rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                                passwordErrors.currentPassword ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'
                              } pr-10`}
                              required
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                          {passwordErrors.currentPassword && (
                            <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                          )}
                        </div>
                        
                        {/* New Password */}
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              id="newPassword"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              className={`w-full px-3 py-2 border ${
                                passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                              } rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                                passwordErrors.newPassword ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'
                              } pr-10`}
                              required
                              minLength="8"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                          {passwordErrors.newPassword && (
                            <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                          )}
                          
                          {/* Password Strength Meter */}
                          {passwordData.newPassword && (
                            <div className="mt-2">
                              <div className="flex h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`} 
                                  style={{ width: `${(passwordStrength / 4) * 100}%` }}
                                ></div>
                              </div>
                              <p className={`mt-1 text-xs ${
                                passwordStrength >= 3 ? 'text-green-600' : 
                                passwordStrength >= 2 ? 'text-yellow-600' : 
                                'text-red-600'
                              }`}>
                                {passwordFeedback}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Confirm Password */}
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              id="confirmPassword"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              className={`w-full px-3 py-2 border ${
                                passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                              } rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                                passwordErrors.confirmPassword ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'
                              } pr-10`}
                              required
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                          {passwordErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 w-full justify-center"
                          disabled={changingPassword}
                        >
                          {changingPassword ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-blue-300 rounded-full animate-spin mr-2"></div>
                              Updating Password...
                            </>
                          ) : (
                            <>
                              <FaLock className="mr-2" />
                              Change Password
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer/>
    </div>
  );
};

export default Settings; 