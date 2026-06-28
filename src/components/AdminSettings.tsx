import React from 'react';
import { 
  Store, 
  Clock, 
  ToggleRight, 
  ToggleLeft, 
  Save,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { formatTimeTo12Hour } from '../utils';

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
  const [localApiKey, setLocalApiKey] = React.useState(() => localStorage.getItem('vite_imgbb_api_key') || '');
  const [localAlbumId, setLocalAlbumId] = React.useState(() => localStorage.getItem('vite_imgbb_album_id') || '');
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [testStatus, setTestStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = React.useState('');

  const testImgBBConnection = async () => {
    const key = localApiKey.trim();
    if (!key) {
      setTestStatus('error');
      setTestMessage('Enter an API key first.');
      return;
    }
    setTestStatus('loading');
    setTestMessage('');
    try {
      // Upload a tiny 1x1 transparent PNG as a connection test
      const tinyPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const blob = await (await fetch(tinyPng)).blob();
      const fd = new FormData();
      fd.append('image', blob);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, { method: 'POST', body: fd });
      const json = await res.json();
      if (json.success) {
        setTestStatus('success');
        setTestMessage('API key is valid — ImgBB connected successfully!');
      } else {
        setTestStatus('error');
        setTestMessage(json.error?.message || 'API key rejected by ImgBB.');
      }
    } catch {
      setTestStatus('error');
      setTestMessage('Network error — check your connection.');
    }
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">Operational Settings & Hours</h2>
        <p className="text-sm text-gray-400 mt-1">Define core contact details, store branding elements, and operating hours schedule.</p>
      </div>

      <form 
        onSubmit={(e) => {
          localStorage.setItem('vite_imgbb_api_key', localApiKey.trim());
          localStorage.setItem('vite_imgbb_album_id', localAlbumId.trim());
          handleSaveSettingsAndHours(e);
        }} 
        className="space-y-6 text-xs font-semibold max-w-4xl"
      >
        
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

        {/* ImgBB Cloud Hosting Integration */}
        <div className="p-5 bg-white rounded-xl border border-gray-150 shadow-xs space-y-4 text-left">
          <div className="flex items-start justify-between border-b border-gray-100 pb-2">
            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#fd761a]" />
              <span>ImgBB Cloud Hosting Integration</span>
            </h3>
            {/* Live status badge */}
            {localApiKey.trim() !== '' ? (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Key configured
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                No API key — using base64
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* API Key input */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-gray-400 uppercase block font-bold">
                ImgBB API Key <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={localApiKey}
                  onChange={(e) => { setLocalApiKey(e.target.value); setTestStatus('idle'); }}
                  placeholder="Paste your ImgBB API key here"
                  className="w-full px-3 py-2 pr-8 border border-gray-200 rounded-lg outline-none font-mono text-xs focus:ring-1 focus:ring-[#fd761a] focus:border-[#fd761a]"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                  title={showApiKey ? 'Hide key' : 'Show key'}
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 leading-normal font-medium">
                Get a free key at{' '}
                <a href="https://api.imgbb.com/" target="_blank" rel="noreferrer" className="text-[#fd761a] underline font-bold">
                  api.imgbb.com
                </a>
                . Without this, images are stored as base64 in Firestore (larger & slower).
              </p>

              {/* Test connection button */}
              <button
                type="button"
                onClick={testImgBBConnection}
                disabled={testStatus === 'loading' || localApiKey.trim() === ''}
                className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                {testStatus === 'loading'
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : testStatus === 'success'
                  ? <CheckCircle className="w-3 h-3 text-emerald-500" />
                  : testStatus === 'error'
                  ? <XCircle className="w-3 h-3 text-red-500" />
                  : <CheckCircle className="w-3 h-3 text-gray-400" />}
                Test ImgBB Connection
              </button>
              {testMessage && (
                <p className={`text-[10px] font-semibold leading-snug mt-0.5 ${testStatus === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {testMessage}
                </p>
              )}
            </div>

            {/* Album ID input */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-gray-400 uppercase block font-bold">ImgBB Album ID (Optional)</label>
              <input
                type="text"
                value={localAlbumId}
                onChange={(e) => setLocalAlbumId(e.target.value)}
                placeholder="e.g. Sutra Lounge or album hash"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none font-mono text-xs focus:ring-1 focus:ring-[#fd761a] focus:border-[#fd761a]"
              />
              <p className="text-[10px] text-gray-400 leading-normal font-medium mt-1">
                All uploads (dishes, menus, banners) will be organized inside this ImgBB album. Leave blank to upload to your default account root.
              </p>
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-[10px] text-blue-700 font-medium leading-snug">
                <strong>How it works:</strong> When an API key is set, every image uploaded through the admin panel is sent to ImgBB and a permanent CDN URL is stored — no base64 blobs in your database.
              </div>
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
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="text-gray-500">Opens:</span>
                      <input
                        type="time"
                        value={day.start_time || ''}
                        onChange={(e) => handleUpdateHourDayState(day.id, 'start_time', e.target.value)}
                        className="px-1.5 py-1 border border-gray-250 rounded-lg font-bold text-gray-900 focus:outline-none focus:border-[#fd761a]"
                      />
                      {day.start_time && (
                        <span className="text-[10px] text-[#fd761a] font-bold font-mono">
                          {formatTimeTo12Hour(day.start_time)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="text-gray-500">Closes:</span>
                      <input
                        type="time"
                        value={day.end_time || ''}
                        onChange={(e) => handleUpdateHourDayState(day.id, 'end_time', e.target.value)}
                        className="px-1.5 py-1 border border-gray-250 rounded-lg font-bold text-gray-900 focus:outline-none focus:border-[#fd761a]"
                      />
                      {day.end_time && (
                        <span className="text-[10px] text-[#fd761a] font-bold font-mono">
                          {formatTimeTo12Hour(day.end_time)}
                        </span>
                      )}
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
