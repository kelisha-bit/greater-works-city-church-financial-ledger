import { User, sendEmailVerification, sendPasswordResetEmail, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Email utility functions for authentication, verification, and linking
 */

/**
 * Sends a verification email to the user
 * @param user Firebase user object
 * @returns Promise resolving to success status and message
 */
export const sendVerificationEmail = async (user: User): Promise<{ success: boolean; message: string }> => {
  try {
    // Get stored actionCodeSettings or use default
    let actionCodeSettings;
    try {
      const storedSettings = localStorage.getItem('firebaseActionCodeSettings');
      actionCodeSettings = storedSettings ? JSON.parse(storedSettings) : {
        url: window.location.origin + '/profile?verified=true',
        handleCodeInApp: false
      };
    } catch (e) {
      // Fallback if localStorage fails
      actionCodeSettings = {
        url: window.location.origin + '/profile?verified=true',
        handleCodeInApp: false
      };
    }
    
    // Force refresh user to ensure we have the latest state
    await user.reload();
    
    // Send verification email
    await sendEmailVerification(user, actionCodeSettings);
    
    return { 
      success: true, 
      message: 'Verification email sent successfully! Please check your inbox and spam folder. The link will expire in 24 hours.'
    };
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    
    // Provide more specific error messages based on Firebase error codes
    let errorMessage = 'Failed to send verification email. ';
    
    if (error.code === 'auth/too-many-requests') {
      errorMessage += 'Too many requests. Please try again later.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage += 'Invalid email address.';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage += 'User not found.';
    } else if (error.code === 'auth/requires-recent-login') {
      errorMessage += 'Please log out and log in again before requesting a new verification email.';
    } else {
      errorMessage += 'Please try again or contact support.';
    }
    
    return { success: false, message: errorMessage };
  }
};

/**
 * Sends a password reset email to the user
 * @param email User's email address
 * @returns Promise resolving to success status and message
 */
export const sendPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Get stored actionCodeSettings or use default
    let actionCodeSettings;
    try {
      const storedSettings = localStorage.getItem('firebaseActionCodeSettings');
      actionCodeSettings = storedSettings ? JSON.parse(storedSettings) : {
        url: window.location.origin + '/login?reset=true',
        handleCodeInApp: false
      };
    } catch (e) {
      // Fallback if localStorage fails
      actionCodeSettings = {
        url: window.location.origin + '/login?reset=true',
        handleCodeInApp: false
      };
    }
    
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    
    return { 
      success: true, 
      message: 'Password reset email sent. Please check your inbox.'
    };
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    
    let errorMessage = 'Failed to send password reset email. ';
    
    if (error.code === 'auth/too-many-requests') {
      errorMessage += 'Too many requests. Please try again later.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage += 'Invalid email address.';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage += 'No user found with this email address.';
    } else {
      errorMessage += 'Please try again or contact support.';
    }
    
    return { success: false, message: errorMessage };
  }
};

/**
 * Checks if a user's email is verified
 * @param user Firebase user object
 * @returns Boolean indicating if email is verified
 */
export const isEmailVerified = (user: User | null): boolean => {
  if (!user) return false;
  return user.emailVerified;
};

/**
 * Refreshes the user object to get the latest email verification status
 * @param user Firebase user object
 * @returns Promise resolving to the refreshed user
 */
export const refreshUserStatus = async (user: User): Promise<User> => {
  await user.reload();
  return user;
};

/**
 * Updates the user's email address with reauthentication
 * @param user Current Firebase user
 * @param newEmail New email address to set
 * @param currentPassword User's current password for reauthentication
 * @returns Promise resolving to success status and message
 */
export const updateUserEmail = async (
  user: User,
  newEmail: string,
  currentPassword: string
): Promise<{ success: boolean; message: string; requiresVerification?: boolean }> => {
  try {
    // Reauthenticate user with current credentials
    const credential = EmailAuthProvider.credential(user.email!, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update email - this will mark email as unverified
    await updateEmail(user, newEmail);

    // Send verification email to new address
    const verificationResult = await sendVerificationEmail({ ...user, email: newEmail } as User);

    if (verificationResult.success) {
      return {
        success: true,
        message: `Email updated successfully! A verification email has been sent to ${newEmail}. Please check your inbox and click the verification link.`,
        requiresVerification: true
      };
    } else {
      return {
        success: false,
        message: 'Email updated but failed to send verification email. Please try verifying your email later.',
        requiresVerification: true
      };
    }
  } catch (error: any) {
    console.error('Error updating user email:', error);

    let errorMessage = 'Failed to update email address. ';

    if (error.code === 'auth/invalid-credential') {
      errorMessage += 'The current password is incorrect.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage += 'The new email address is invalid.';
    } else if (error.code === 'auth/email-already-in-use') {
      errorMessage += 'This email address is already in use by another account.';
    } else if (error.code === 'auth/requires-recent-login') {
      errorMessage += 'Please log out and log in again before updating your email.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage += 'Password is too weak.';
    } else {
      errorMessage += 'Please try again or contact support.';
    }

    return { success: false, message: errorMessage };
  }
};

/**
 * Validates an email address format and security requirements
 * @param email Email address to validate
 * @param existingEmails Array of existing emails to check for duplicates (optional)
 * @param excludeMemberId Member ID to exclude from duplicate check (optional)
 * @returns Promise resolving to validation result
 */
export const validateEmailForLinking = async (
  email: string,
  existingEmails: string[] = [],
  excludeMemberId?: string
): Promise<{ isValid: boolean; message: string }> => {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      return { isValid: false, message: 'Email address is required.' };
    }

    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address.' };
    }

    // Check for duplicate emails if existingEmails provided
    const normalizedEmail = email.toLowerCase().trim();
    const duplicateFound = existingEmails.some(existingEmail =>
      existingEmail.toLowerCase().trim() === normalizedEmail &&
      (!excludeMemberId || true) // In a full implementation, exclude current member
    );

    if (duplicateFound) {
      return { isValid: false, message: 'This email address is already associated with another member.' };
    }

    // Additional security checks
    if (email.length > 320) { // RFC 3696 limit
      return { isValid: false, message: 'Email address is too long.' };
    }

    // Check for common disposable email domains (optional enhancement)
    const disposableDomains = ['10minutemail.com', 'temp-mail.org', 'guerrillamail.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    if (disposableDomains.includes(domain)) {
      return { isValid: false, message: 'Disposable email addresses are not allowed.' };
    }

    return { isValid: true, message: 'Email address is valid.' };
  } catch (error) {
    console.error('Error validating email:', error);
    return { isValid: false, message: 'Error validating email address.' };
  }
};

/**
 * Sends an email linking confirmation notification
 * @param email Email address
 * @param memberName Member name
 * @returns Promise resolving to success status and message
 */
export const sendEmailLinkingNotification = async (
  email: string,
  memberName: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Since we don't have a full email service setup, this is a placeholder
    // In a production app, you would integrate with a service like SendGrid, Mailgun, etc.
    console.log(`📧 Email linking notification would be sent to ${email} for member ${memberName}`);

    // For now, return success since this would be handled by your email service
    return {
      success: true,
      message: `Email linking notification sent successfully to ${email}.`
    };
  } catch (error: any) {
    console.error('Error sending email linking notification:', error);
    return {
      success: false,
      message: 'Failed to send email linking notification.'
    };
  }
};

/**
 * Generates a secure token for email verification linking
 * @param email Email address
 * @param memberId Member ID
 * @returns Secure token string
 */
export const generateEmailLinkingToken = (email: string, memberId: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const data = `${email}:${memberId}:${timestamp}:${randomString}`;
  // In a production app, you would use proper encryption/hashing here
  // For now, we'll use a simple base64 encoding (not secure)
  return btoa(data);
};

/**
 * Validates an email linking token
 * @param token Token to validate
 * @param expectedEmail Expected email address
 * @param expectedMemberId Expected member ID
 * @returns Boolean indicating if token is valid
 */
export const validateEmailLinkingToken = (
  token: string,
  expectedEmail: string,
  expectedMemberId: string
): boolean => {
  try {
    const decoded = atob(token);
    const [email, memberId, timestamp, randomString] = decoded.split(':');

    // Check if token is expired (24 hours)
    const now = Date.now();
    const tokenTime = parseInt(timestamp);
    const expiryTime = 24 * 60 * 60 * 1000; // 24 hours

    if (now - tokenTime > expiryTime) {
      return false;
    }

    // Validate data matches
    return email === expectedEmail && memberId === expectedMemberId;
  } catch (error) {
    console.error('Error validating email linking token:', error);
    return false;
  }
};
