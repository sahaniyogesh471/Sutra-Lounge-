import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, AlertCircle } from 'lucide-react';
import * as supabaseService from '../../supabaseService';

interface BusinessHours {
  id: string;
  day_of_week: string;
  opening_time: string;
  closing_time: string;
  is_closed: boolean;
}

interface RestaurantSettings {
  restaurant_name: string;
  address: string;
  phone: string;
  email: string;
  cuisine_type: string;
  about?: string;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const AdminSettings: React.FC = () => {
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings>({
    restaurant_name: 'Sutra Lounge',
    address: '',
    phone: '',
    email: '',
    cuisine_type: '',
    about: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [hours, restSettings] = await Promise.all([
        supabaseService.getBusinessHours(),
        supabaseService.getRestaurantSettings(),
      ]);

      const hoursArray = Object.values(hours) as BusinessHours[];
      setBusinessHours(hoursArray);

      if (restSettings) {
        setSettings(restSettings);
      }
    } catch (error) {
      console.error('[v0] Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessHoursChange = (index: number, field: string, value: any) => {
    const updatedHours = [...businessHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setBusinessHours(updatedHours);
  };

  const handleSettingsChange = (field: string, value: string) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Save business hours
      for (const hour of businessHours) {
        await supabaseService.updateBusinessHoursForDay(hour.id, {
          opening_time: hour.opening_time,
          closing_time: hour.closing_time,
          is_closed: hour.is_closed,
        });
      }

      // Save restaurant settings
      await supabaseService.updateRestaurantSettings(settings);

      // Show success message (you might want to add a toast here)
      console.log('[v0] Settings saved successfully');
    } catch (error) {
      console.error('[v0] Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal">Settings</h1>
        <p className="text-gray-600 mt-1">Manage restaurant settings and hours</p>
      </div>

      <div className="space-y-6">
        {/* Restaurant Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-charcoal mb-6">Restaurant Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Restaurant Name
              </label>
              <input
                type="text"
                value={settings.restaurant_name}
                onChange={(e) => handleSettingsChange('restaurant_name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Cuisine Type
              </label>
              <input
                type="text"
                value={settings.cuisine_type}
                onChange={(e) => handleSettingsChange('cuisine_type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleSettingsChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => handleSettingsChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-charcoal mb-2">
                Address
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleSettingsChange('address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-charcoal mb-2">
                About Restaurant
              </label>
              <textarea
                value={settings.about}
                onChange={(e) => handleSettingsChange('about', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                rows={4}
              />
            </div>
          </div>
        </motion.div>

        {/* Business Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-charcoal mb-6">Business Hours</h2>

          <div className="space-y-4">
            {businessHours.map((hour, index) => (
              <div key={hour.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-charcoal">{days[index] || 'Day'}</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hour.is_closed}
                      onChange={(e) =>
                        handleBusinessHoursChange(index, 'is_closed', e.target.checked)
                      }
                      className="w-5 h-5"
                    />
                    <span className="text-sm text-gray-600">Closed</span>
                  </label>
                </div>

                {!hour.is_closed && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Opening Time
                      </label>
                      <input
                        type="time"
                        value={hour.opening_time}
                        onChange={(e) =>
                          handleBusinessHoursChange(index, 'opening_time', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Closing Time
                      </label>
                      <input
                        type="time"
                        value={hour.closing_time}
                        onChange={(e) =>
                          handleBusinessHoursChange(index, 'closing_time', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gold text-charcoal font-semibold py-3 rounded-lg hover:bg-gold/90 disabled:bg-gold/50 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Settings'}
        </motion.button>
      </div>
    </div>
  );
};
