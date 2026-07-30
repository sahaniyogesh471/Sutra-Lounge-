// Session management utilities for admin authentication

import { AdminAuthSettings } from '../types/env';

interface SessionData {
  userId: string;
  token: string;
  createdAt: number;
  lastActivityAt: number;
  expiresAt: number;
}

const SESSION_STORAGE_KEY = 'admin_session_data';
const SESSION_TIMEOUT_MS = AdminAuthSettings.sessionTimeoutMinutes * 60 * 1000;

/**
 * Create a new session for admin user
 */
export const createSession = (userId: string, token: string): SessionData => {
  const now = Date.now();
  const session: SessionData = {
    userId,
    token,
    createdAt: now,
    lastActivityAt: now,
    expiresAt: now + SESSION_TIMEOUT_MS,
  };
  
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn('[SessionManagement] Could not store session:', e);
  }
  
  return session;
};

/**
 * Get current session from storage
 */
export const getSession = (): SessionData | null => {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.warn('[SessionManagement] Could not retrieve session:', e);
    return null;
  }
};

/**
 * Update session last activity timestamp (idle timeout tracker)
 */
export const updateSessionActivity = (): void => {
  try {
    const session = getSession();
    if (session) {
      session.lastActivityAt = Date.now();
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  } catch (e) {
    console.warn('[SessionManagement] Could not update session activity:', e);
  }
};

/**
 * Check if session is valid and not expired
 */
export const isSessionValid = (): boolean => {
  const session = getSession();
  
  if (!session) {
    return false;
  }
  
  const now = Date.now();
  
  // Check if session has expired
  if (now > session.expiresAt) {
    clearSession();
    return false;
  }
  
  // Check if idle timeout exceeded
  const idleMs = now - session.lastActivityAt;
  if (idleMs > SESSION_TIMEOUT_MS) {
    clearSession();
    return false;
  }
  
  return true;
};

/**
 * Get time until session expires (in milliseconds)
 */
export const getSessionTimeRemaining = (): number => {
  const session = getSession();
  if (!session) return 0;
  
  const now = Date.now();
  const timeRemaining = session.expiresAt - now;
  
  return Math.max(0, timeRemaining);
};

/**
 * Get session info for display (remaining time, status, etc.)
 */
export const getSessionInfo = (): { isValid: boolean; timeRemainingMinutes: number; timeRemainingSeconds: number } => {
  const timeRemaining = getSessionTimeRemaining();
  const isValid = isSessionValid();
  
  return {
    isValid,
    timeRemainingMinutes: Math.floor(timeRemaining / (60 * 1000)),
    timeRemainingSeconds: Math.floor((timeRemaining % (60 * 1000)) / 1000),
  };
};

/**
 * Clear session from storage
 */
export const clearSession = (): void => {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.warn('[SessionManagement] Could not clear session:', e);
  }
};

/**
 * Set up session timeout listener
 */
export const setupSessionTimeoutListener = (onSessionExpired: () => void): (() => void) => {
  const checkInterval = setInterval(() => {
    if (!isSessionValid()) {
      clearInterval(checkInterval);
      onSessionExpired();
    }
  }, 30000); // Check every 30 seconds
  
  return () => clearInterval(checkInterval);
};

/**
 * Track user activity to prevent idle timeout
 */
export const setupActivityTracking = (): (() => void) => {
  const trackActivity = () => {
    updateSessionActivity();
  };
  
  // Track mouse and keyboard events
  document.addEventListener('mousemove', trackActivity);
  document.addEventListener('keydown', trackActivity);
  document.addEventListener('click', trackActivity);
  document.addEventListener('touchstart', trackActivity);
  
  return () => {
    document.removeEventListener('mousemove', trackActivity);
    document.removeEventListener('keydown', trackActivity);
    document.removeEventListener('click', trackActivity);
    document.removeEventListener('touchstart', trackActivity);
  };
};
