import React from 'react';
import { 
  Store, 
  Clock, 
  ToggleRight, 
  ToggleLeft, 
  Save,
  Image as ImageIcon
} from 'lucide-react';
import { ImageUploader } from './ImageUploader';

interface AdminSettingsProps {
  settings: {
    restaurant_name: string;
    restaurant_phone: string;
    restaurant_email: string;
    restaurant_address: string;
    slot_interval_minutes: number;
    booking_notice_hours: number;
    default_reservation_duration_minutes: number;
    max_party_size: number;
    hero_image_url?: string;
    dish_image_url?: string;
  };
  setSettings: React.Dispatch<React.SetStateAction<any>>;
  businessHours: any[];
  handleUpdateHourDayState: (id: string, field: string, value: any) => void;
  handleSaveSettingsAndHours: (e: React.FormEvent) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  setSettings,
  businessHours,
  handleUpdateHourDayState,
  handleSaveSettingsAndHours
}) => {
  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">Operational Settings & Hours</h2>
        <p className="text-sm text-gray-400 mt-1">Define core contact details, store branding elements, and operating hours schedule.</p>
      </div>

      <form onSubmit={handleSaveSettingsAndHours} className="space-y-6 text-xs font-semibold max-w-4xl">
        
        {/* Contact info card panel */}
        <div className="p-5 bg-white rounded-xl border border-gray-150 shadow-xs space-y-4">
          <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <Store className="w-4 h-4 text-[#fd761a]" />
            <span>Core Brand Parameters</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-gray-400 uppercase block font-bold">Restaurant Display Brand Name</label>
              <input 
                type="text" 
                value={settings.restaurant_name || ''}
                onChange={(e) => setSettings((prev: any) => ({ ...prev, restaurant_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none font-semibold text-xs focus:ring-1 focus:ring-[#fd761a] focus:border-[#fd761a]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-mono text-gray-400 uppercase block font-bold">Customer Contact Direct Phone</label>
              <input 
                type="text" 
                value={settings.restaurant_phone || ''}
                onChange={(e) => setSettings((prev: any) => ({ ...prev, restaurant_phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none font-mono font-medium text-xs focus:ring-1 focus:ring-[#fd761a] focus:border-[#fd761a]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-mono text-gray-400 uppercase block font-bold">Inquiries Official Email Address</label>
              <input 
                type="email" 
                value={settings.restaurant_email || ''}
                onChange={(e) => setSettings((prev: any) => ({ ...prev, restaurant_email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none font-mono text-xs focus:ring-1 focus:ring-[#fd761a] focus:border-[#fd761a]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-mono text-gray-400 uppercase block font-bold">Physical Address Location</label>
              <input 
                type="text" 
                value={settings.restaurant_address || ''}
                onChange={(e) => setSettings((prev: any) => ({ ...prev, restaurant_address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none text-xs focus:ring-1 focus:ring-[#fd761a] focus:border-[#fd761a]"
              />
            </div>
          </div>
        </div>

        {/* Core Visual Branding Images */}
        <div className="p-5 bg-white rounded-xl border border-gray-150 shadow-xs space-y-4 text-left">
          <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <ImageIcon className="w-4 h-4 text-[#fd761a]" />
            <span>Core Visual Branding Images</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase block">Main Website Hero Image</label>
              </div>
              <ImageUploader
                value={settings.hero_image_url || ''}
                onChange={(base64Url) => setSettings((prev: any) => ({ ...prev, hero_image_url: base64Url }))}
                onClear={() => setSettings((prev: any) => ({ ...prev, hero_image_url: '' }))}
              />
              <p className="text-[10px] text-gray-400 leading-normal font-medium">
                This image is featured as the main visual presentation in the landing banner of the website.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase block">Special Event / Highlight Image</label>
              </div>
              <ImageUploader
                value={settings.dish_image_url || ''}
                onChange={(base64Url) => setSettings((prev: any) => ({ ...prev, dish_image_url: base64Url }))}
                onClear={() => setSettings((prev: any) => ({ ...prev, dish_image_url: '' }))}
              />
              <p className="text-[10px] text-gray-400 leading-normal font-medium">
                This image is shown as the featured promo/signature dish or specialty presentation.
              </p>
            </div>
          </div>
        </div>

        {/* Integrated hours block list */}
        <div className="p-5 bg-white rounded-xl border border-gray-150 shadow-xs space-y-4">
          <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <Clock className="w-4 h-4 text-[#fd761a]" />
            <span>Integrated Operating Hours Schedule</span>
          </h3>

          <div className="space-y-3">
            {businessHours.map((day) => (
              <div 
                key={day.id} 
                className="p-3.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left border border-gray-150 bg-gray-50/40"
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateHourDayState(day.id, 'is_open', !day.is_open)}
                    className="cursor-pointer shrink-0"
                    title="Toggle day status"
                  >
                    {day.is_open ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                  <span className="font-extrabold uppercase min-w-[90px] text-gray-900">{day.weekday || day.id}</span>
                  <span className={`px-2 py-0.5 rounded-md font-mono text-[8px] font-bold uppercase shrink-0 ${day.is_open ? 'bg-emerald-50 text-emerald-800' : 'bg-red-55 text-red-900'}`}>
                    {day.is_open ? 'Open' : 'Closed'}
                  </span>
                </div>

                {day.is_open && (
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1 font-mono">
                      <span>Opens:</span>
                      <input 
                        type="text" 
                        placeholder="HH:MM"
                        value={day.start_time || ''}
                        onChange={(e) => handleUpdateHourDayState(day.id, 'start_time', e.target.value)}
                        className="w-16 px-1.5 py-1 border border-gray-250 rounded-lg text-center font-bold text-gray-900"
                      />
                    </div>
                    <div className="flex items-center gap-1 font-mono">
                      <span>Closes:</span>
                      <input 
                        type="text" 
                        placeholder="HH:MM"
                        value={day.end_time || ''}
                        onChange={(e) => handleUpdateHourDayState(day.id, 'end_time', e.target.value)}
                        className="w-16 px-1.5 py-1 border border-gray-250 rounded-lg text-center font-bold text-gray-900"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="text-left pt-2">
          <button 
            type="submit"
            className="bg-[#fd761a] hover:bg-[#9d4300] text-white font-bold rounded-xl px-7 py-3 uppercase text-xs tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-white" />
            <span>Apply & Sync Operations Metadata</span>
          </button>
        </div>

      </form>
    </div>
  );
};
