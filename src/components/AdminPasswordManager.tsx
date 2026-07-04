import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Key, Mail, Loader, CheckCircle, AlertCircle, X } from 'lucide-react';

interface AdminPasswordManagerProps {
  adminId: string;
  currentEmail: string;
  onClose?: () => void;
}

type TabType = 'password' | 'passcode' | 'email';

export default function AdminPasswordManager({ adminId, currentEmail, onClose }: AdminPasswordManagerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Passcode Change State
  const [passcodeForm, setPasscodeForm] = useState({
    newPasscode: '',
    confirmPasscode: ''
  });

  // Email Change State
  const [emailForm, setEmailForm] = useState({
    newEmail: currentEmail,
    confirmEmail: currentEmail
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (passwordForm.newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call actual updateAdminPassword function
      setSuccessMessage('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handlePasscodeChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (!/^\d{3}$/.test(passcodeForm.newPasscode)) {
      setErrorMessage('Passcode must be exactly 3 digits');
      return;
    }

    if (passcodeForm.newPasscode !== passcodeForm.confirmPasscode) {
      setErrorMessage('Passcodes do not match');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call actual updateAdminPasscode function
      setSuccessMessage('Passcode updated successfully');
      setPasscodeForm({ newPasscode: '', confirmPasscode: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage('Failed to update passcode');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.newEmail)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (emailForm.newEmail !== emailForm.confirmEmail) {
      setErrorMessage('Emails do not match');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call actual updateAdminEmail function
      setSuccessMessage('Email updated successfully');
      setEmailForm({ newEmail: '', confirmEmail: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage('Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
            <p className="text-sm text-gray-600">Change your password, passcode, or email</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm text-green-700">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{errorMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex gap-4 border-b border-gray-200">
        {(['password', 'passcode', 'email'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'password' && 'Password'}
            {tab === 'passcode' && '3-Digit Passcode'}
            {tab === 'email' && 'Email Address'}
          </button>
        ))}
      </div>

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="Enter your current password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="Enter new password (min. 8 characters)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            Update Password
          </button>
        </form>
      )}

      {/* Passcode Tab */}
      {activeTab === 'passcode' && (
        <form onSubmit={handlePasscodeChange} className="mt-6 space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">3-digit passcode is a quick login method for the admin panel</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Passcode (3 digits)
            </label>
            <div className="relative">
              <input
                type={showPasscode ? 'text' : 'password'}
                value={passcodeForm.newPasscode}
                onChange={(e) => setPasscodeForm({ ...passcodeForm, newPasscode: e.target.value })}
                placeholder="e.g., 123"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                maxLength={3}
                required
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Passcode
            </label>
            <input
              type="password"
              value={passcodeForm.confirmPasscode}
              onChange={(e) => setPasscodeForm({ ...passcodeForm, confirmPasscode: e.target.value })}
              placeholder="Confirm 3 digits"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              maxLength={3}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            Update Passcode
          </button>
        </form>
      )}

      {/* Email Tab */}
      {activeTab === 'email' && (
        <form onSubmit={handleEmailChange} className="mt-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">Current email: <strong>{currentEmail}</strong></p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Email Address
            </label>
            <input
              type="email"
              value={emailForm.newEmail}
              onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
              placeholder="Enter new email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Email Address
            </label>
            <input
              type="email"
              value={emailForm.confirmEmail}
              onChange={(e) => setEmailForm({ ...emailForm, confirmEmail: e.target.value })}
              placeholder="Confirm new email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            Update Email
          </button>
        </form>
      )}
    </div>
  );
}
