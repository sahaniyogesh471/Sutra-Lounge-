import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';
import * as adminAuthService from '../../services/adminAuthService';

interface AdminLoginProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usePasscode, setUsePasscode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;

      if (usePasscode) {
        // Validate passcode format (3 digits)
        if (!/^\d{3}$/.test(password)) {
          setError('Passcode must be 3 digits');
          setLoading(false);
          return;
        }
        result = await adminAuthService.loginWithPasscode(email, password);
      } else {
        // Email/Password login
        if (!email || !password) {
          setError('Please enter email and password');
          setLoading(false);
          return;
        }
        result = await adminAuthService.loginWithEmailPassword(email, password);
      }

      if (result.success && result.user && result.token) {
        // Store session
        sessionStorage.setItem('adminUser', JSON.stringify(result.user));
        sessionStorage.setItem('adminToken', result.token);
        onLoginSuccess(result.user, result.token);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal to-charcoal/90 flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-charcoal mb-2">Sutra Lounge</h1>
            <p className="text-gray-600 text-sm">Admin Panel</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sutradining.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password/Passcode Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-charcoal">
                  {usePasscode ? 'Passcode (3 digits)' : 'Password'}
                </label>
                <button
                  type="button"
                  onClick={() => setUsePasscode(!usePasscode)}
                  className="text-xs text-gold hover:text-gold/80 transition-colors"
                >
                  {usePasscode ? 'Use Password' : 'Use Passcode'}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={usePasscode ? '000' : 'Enter your password'}
                  maxLength={usePasscode ? 3 : undefined}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold/90 disabled:bg-gold/50 text-charcoal font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login to Admin Panel'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500">
              For support, contact: sutraloungehtd@gmail.com
            </p>
          </div>
        </div>

        {/* Demo Credentials Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-gold/10 border border-gold/30 rounded-lg"
        >
          <p className="text-xs text-gold">
            📝 Demo: Use any registered admin email to login
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
