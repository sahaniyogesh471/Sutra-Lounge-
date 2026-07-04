import React, { useState } from 'react';
import { Mail, Lock, Smartphone, Eye, EyeOff, Loader } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { loginWithEmailPassword, loginWithPasscode, loginWithGoogle } from '../services/adminAuthService';

interface AdminAuthModalProps {
  onAuthSuccess: (user: any, token: string) => void;
}

type AuthMethod = 'email' | 'passcode' | 'google';

export default function AdminAuthModal({ onAuthSuccess }: AdminAuthModalProps) {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginWithEmailPassword(email, password);
      if (result.success && result.user && result.token) {
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => {
          onAuthSuccess(result.user, result.token!);
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasscodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginWithPasscode(email, passcode);
      if (result.success && result.user && result.token) {
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => {
          onAuthSuccess(result.user, result.token!);
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setLoading(true);

    try {
      // Decode the JWT token to get user info
      const token = credentialResponse.credential;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);

      const result = await loginWithGoogle(token, decoded.sub, decoded.email, decoded.name);
      if (result.success && result.user && result.token) {
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => {
          onAuthSuccess(result.user, result.token!);
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#fd761a] to-orange-600 px-6 py-8">
          <h1 className="text-2xl font-bold text-white text-center">Sutra Lounge Admin</h1>
          <p className="text-orange-100 text-center text-sm mt-2">Secure Access Required</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Auth Method Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => {
                setAuthMethod('email');
                setError('');
              }}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                authMethod === 'email'
                  ? 'bg-[#fd761a] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </button>
            <button
              onClick={() => {
                setAuthMethod('passcode');
                setError('');
              }}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                authMethod === 'passcode'
                  ? 'bg-[#fd761a] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Smartphone className="w-4 h-4 inline mr-2" />
              Code
            </button>
            <button
              onClick={() => {
                setAuthMethod('google');
                setError('');
              }}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                authMethod === 'google'
                  ? 'bg-[#fd761a] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" viewBox="0 0 24 24">
                <text x="8" y="17" fontSize="12" fontWeight="bold" fill="currentColor">
                  G
                </text>
              </svg>
              Google
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          {/* Email/Password Form */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sutralounge.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fd761a]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fd761a]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#fd761a] hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader className="w-5 h-5 animate-spin" />}
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}

          {/* Passcode Form */}
          {authMethod === 'passcode' && (
            <form onSubmit={handlePasscodeLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sutralounge.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fd761a]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">3-Digit Passcode</label>
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value.slice(0, 3).replace(/\D/g, ''))}
                  placeholder="000"
                  maxLength={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-[#fd761a] tracking-widest"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">Enter 3 digits (0-9)</p>
              </div>
              <button
                type="submit"
                disabled={loading || passcode.length !== 3}
                className="w-full bg-[#fd761a] hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader className="w-5 h-5 animate-spin" />}
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}

          {/* Google OAuth */}
          {authMethod === 'google' && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-gray-600 text-center">Sign in with your Google account</p>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google login failed')}
              />
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              Encrypted connection • Session expires in 30 minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
