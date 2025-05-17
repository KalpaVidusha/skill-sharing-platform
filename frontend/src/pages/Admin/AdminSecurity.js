/**
 * Admin Security Utility Functions
 * Provides security-focused utilities for admin component protection
 */

/**
 * Log unauthorized admin access attempts to console and potentially to server
 * @param {Object} details - Information about the access attempt
 */
export const logSecurityEvent = (details) => {
  const eventData = {
    ...details,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    location: window.location.href
  };
  
  // Log to console for development
  console.warn('⚠️ SECURITY EVENT ⚠️', eventData);
  
  // In a production environment, this would send the security event to a server
  // Example: apiService.security.logEvent(eventData);
  
  // Could also store in local storage for analysis
  try {
    const existingLogs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
    existingLogs.push(eventData);
    
    // Keep only the latest 20 logs to prevent localStorage overflow
    if (existingLogs.length > 20) {
      existingLogs.shift();
    }
    
    localStorage.setItem('securityLogs', JSON.stringify(existingLogs));
  } catch (error) {
    console.error('Error storing security log:', error);
  }
};

/**
 * Verify admin privileges directly with additional security checks
 * @returns {Promise<boolean>} Whether the current user has admin privileges
 */
export const verifyAdminWithEnhancedSecurity = async () => {
  try {
    // Get user data from localStorage
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // Initial checks that can be done without an API call
    if (!userId || !token) {
      logSecurityEvent({ 
        type: 'admin_access_attempt',
        details: 'Missing authentication data',
        severity: 'medium'
      });
      return false;
    }
    
    // Check if role is stored and includes admin privilege
    if (role && typeof role === 'string') {
      const hasAdminRole = role.includes('ROLE_ADMIN') || role.includes('admin');
      
      if (!hasAdminRole) {
        logSecurityEvent({
          type: 'admin_access_attempt',
          details: 'User has role but not admin',
          userId,
          severity: 'high'
        });
      }
      
      return hasAdminRole;
    }
    
    // If no role stored or verification failed, we would verify with the server
    // This is where you would use apiService.isUserAdmin() in a real implementation
    
    return false;
  } catch (error) {
    logSecurityEvent({
      type: 'admin_verification_error',
      error: error.message,
      severity: 'high'
    });
    return false;
  }
};

/**
 * Checks if the current session is from a suspicious location or device
 * @returns {boolean} True if session appears suspicious
 */
export const detectSuspiciousSession = () => {
  try {
    // Check if this device has been used before
    const knownDevices = JSON.parse(localStorage.getItem('knownDevices') || '[]');
    const currentDevice = navigator.userAgent;
    
    const isKnownDevice = knownDevices.some(device => 
      device.userAgent === currentDevice
    );
    
    if (!isKnownDevice) {
      // In production, this would check IP location against known locations
      // and potentially trigger additional verification
      
      logSecurityEvent({
        type: 'new_device_admin_access',
        deviceInfo: currentDevice,
        severity: 'medium'
      });
      
      // Store this device for future reference
      knownDevices.push({
        userAgent: currentDevice,
        firstSeen: new Date().toISOString()
      });
      
      localStorage.setItem('knownDevices', JSON.stringify(knownDevices));
      
      return true; // New device is treated as suspicious
    }
    
    return false;
  } catch (error) {
    console.error('Error in detectSuspiciousSession:', error);
    return false;
  }
}; 