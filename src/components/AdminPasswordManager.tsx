import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Key, Mail, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { updateAdminPassword, updateAdminPasscode, updateAdminEmail } from '../services/adminAuthService';

interface AdminPasswordManagerProps {
  adminId: string;
  currentEmail: string;
  onClose?: () => void;
}

type TabType = 'password' | 'passcode' | 'email';

export default function AdminPasswordManager({ adminId, currentEmail, onClose }: AdminPasswordManagerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('password');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
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
    newEmail: '',
    confirmEmail: ''
  });

  const toggleShowPassword = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

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
      const result = await updateAdminPassword(adminId, passwordForm.newPassword);
      if (result.success) {
        setSuccessMessage(result.message);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(result.message);
      }
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
      const result = await updateAdminPasscode(adminId, passcodeForm.newPasscode);
      if (result.success) {
        setSuccessMessage(result.message);
        setPasscodeForm({ newPasscode: '', confirmPasscode: '' });
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(result.message);
      }
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.newEmail)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (emailForm.newEmail !== emailForm.confirmEmail) {
      setErrorMessage('Emails do not match');
      return;
    }

    if (emailForm.newEmail === currentEmail) {
      setErrorMessage('New email must be different from current email');
      return;
    }

    setLoading(true);

    try {
      const result = await updateAdminEmail(adminId, emailForm.newEmail);
      if (result.success) {
        setSuccessMessage(result.message);
        setEmailForm({ newEmail: '', confirmEmail: '' });
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error: any) {
      setErrorMessage('Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Lock className="w-6 h-6 text-[#fd761a]" />
          Security Settings
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('password')}
          className={`px-6 py-3 font-medium border-b-2 transition-all ${
            activeTab === 'password'
              ? 'border-[#fd761a] text-[#fd761a]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Lock className="w-4 h-4 inline mr-2" />
          Password
        </button>
        <button
          onClick={() => setActiveTab('passcode')}
          className={`px-6 py-3 font-medium border-b-2 transition-all ${
            activeTab === 'passcode'
              ? 'border-[#fd761a] text-[#fd761a]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Key className="w-4 h-4 inline mr-2" />
          3-Digit Code
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`px-6 py-3 font-medium border-b-2 transition-all ${
            activeTab === 'email'
              ? 'border-[#fd761a] text-[#fd761a]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Mail className="w-4 h-4 inline mr-2" />
          Email
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {errorMessage}
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords['current'] ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fd761a]"
                required
              />
              <button
                type="button"
                onClick={() => toggleShowPassword('current')}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPasswords['current'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPasswords['new'] ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Minimum 8 characters"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fd761a]"
                required
              />
              <button
                type="button"
                onClick={() => toggleShowPassword('new')}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPasswords['new'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">At least 8 characters, mix of uppercase, lowercase, numbers, and symbols recommended</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showPasswords['confirm'] ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fd761a]"
                required
              />
              <button
                type="button"
                onClick={() => toggleShowPassword('confirm')}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPasswords['confirm'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#fd761a] hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader className="w-5 h-5 animate-spin" />}
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}

      {/* Passcode Tab */}
      {activeTab === 'passcode' && (
        <form onSubmit={handlePasscodeChange} className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            Enter a 3-digit security code. Example: 123, 456, 789 (numbers only)
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New 3-Digit Code</label>
            <input
              type="text"
              value={passcodeForm.newPasscode}
              onChange={(e) => setPasscodeForm({ ...passcodeForm, newPasscode: e.target.value.slice(0, 3).replace(/\D/g, '') })}
              placeholder="000"
              maxLength={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-4xl font-bold focus:outline-none focus:ring-2 focus:ring-[#fd761a] tracking-widest"
              required
            />
            <p className="text-xs text-gray-500 mt-2">Only numbers 0-9, exactly 3 digits</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm 3-Digit Code</label>
            <input
              type="text"
              value={passcodeForm.confirmPasscode}
              onChange={(e) => setPasscodeForm({ ...passcodeForm, confirmPasscode: e.target.value.slice(0, 3).replace(/\D/g, '') })}
              placeholder="000"
              maxLength={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-4xl font-bold focus:outline-none focus:ring-2 focus:ring-[#fd761a] tracking-widest"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || passcodeForm.newPasscode.length !== 3}
            className="w-full bg-[#fd761a] hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader className="w-5 h-5 animate-spin" />}
            {loading ? 'Updating...' : 'Update Passcode'}
          </button>
        </form>
      )}

      {/* Email Tab */}
      {activeTab === 'email' && (
        <form onSubmit={handleEmailChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Email</label>
            <input
              type="email"
              value={currentEmail}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Email Address</label>
            <input
              type="email"
              value={emailForm.newEmail}
              onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
              placeholder="newemail@sutralounge.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fd761a]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Email</label>
            <input
              type="email"
              value={emailForm.confirmEmail}
              onChange={(e) => setEmailForm({ ...emailForm, confirmEmail: e.target.value })}
              placeholder="newemail@sutralounge.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fd761a]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#fd761a] hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader className="w-5 h-5 animate-spin" />}
            {loading ? 'Updating...' : 'Update Email'}
          </button>
        </form>
      )}

      {/* Security Info */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 space-y-2">
        <p className="font-medium text-gray-900">Security Information:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>All changes are logged for audit purposes</li>
          <li>Passwords are encrypted using bcrypt (12 rounds)</li>
          <li>Sessions expire automatically after 30 minutes</li>
          <li>5 failed login attempts will lock your account for 15 minutes</li>
          <li>Keep your credentials confidential and secure</li>
        </ul>
      </div>
    </div>
  );
}
