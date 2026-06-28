import React from 'react';
import { formatTimeTo12Hour } from '../utils';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Check, 
  X, 
  Trash2, 
  Plus, 
  Mail, 
  Printer, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { db, collection, addDoc } from '../firebase';

interface AdminReservationsProps {
  reservations: any[];
  filterReservationStatus: string;
  setFilterReservationStatus: (s: string) => void;
  handleUpdateReservationStatus: (id: string, s: string) => void;
  handleDeleteReservation: (id: string) => void;
  triggerToast?: (m: string) => void;
}

export const AdminReservations: React.FC<AdminReservationsProps> = ({
  reservations,
  filterReservationStatus,
  setFilterReservationStatus,
  handleUpdateReservationStatus,
  handleDeleteReservation,
  triggerToast
}) => {
  // Real time and dates filter states
  const [filterDate, setFilterDate] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  // Walk-In modal states
  const [isWalkInModalOpen, setIsWalkInModalOpen] = React.useState(false);
  const [walkInName, setWalkInName] = React.useState('');
  const [walkInPhone, setWalkInPhone] = React.useState('');
  const [walkInParty, setWalkInParty] = React.useState('2');
  const [walkInTime, setWalkInTime] = React.useState('18:00');
  const [walkInRequests, setWalkInRequests] = React.useState('');

  // SMS approval list state
  const [isSmsApprovalsOpen, setIsSmsApprovalsOpen] = React.useState(false);

  // Compute filtered list dynamically based on Status, Date, and Search Query
  const filteredReservations = reservations.filter(r => {
    const matchesStatus = filterReservationStatus === 'all' || r.status === filterReservationStatus;
    const matchesDate = !filterDate || r.reservation_date === filterDate;
    const matchesSearch = !searchQuery || 
      (r.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesDate && matchesSearch;
  });

  const handleAddWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim() || !walkInPhone.trim()) {
      if (triggerToast) triggerToast("Please enter Name and Phone!");
      return;
    }
    try {
      const today = new Date().toISOString().substring(0, 10);
      const startH = parseInt(walkInTime.split(':')[0]) || 18;
      const startM = parseInt(walkInTime.split(':')[1]) || 0;
      const endH = startH + 1;
      const endM = startM + 30;
      const formatH = String(endH >= 24 ? endH - 24 : endH).padStart(2, '0');
      const formatM = String(endM >= 60 ? endM - 60 : endM).padStart(2, '0');
      const calculatedEndTime = `${formatH}:${formatM}`;

      const payload = {
        full_name: walkInName.trim(),
        email: "walkin@sutralounge.com.np",
        phone: walkInPhone.trim(),
        party_size: Number(walkInParty),
        table_id: "T01",
        reservation_date: today,
        start_time: walkInTime,
        end_time: calculatedEndTime,
        status: 'confirmed',
        special_requests: walkInRequests.trim() || 'Manual Walk-In Entry',
        created_at: new Date().toISOString()
      };

      await addDoc(collection(db, 'reservations'), payload);
      setIsWalkInModalOpen(false);
      setWalkInName('');
      setWalkInPhone('');
      setWalkInRequests('');
      if (triggerToast) {
        triggerToast(`Successfully checked-in ${payload.full_name} to Table T01!`);
      }
    } catch (err: any) {
      if (triggerToast) triggerToast(`Walk-in check-in failed: ${err.message}`);
    }
  };

  const handleSendSmsApproval = (resId: string, guestName: string, phone: string) => {
    handleUpdateReservationStatus(resId, 'confirmed');
    setIsSmsApprovalsOpen(false);
    
    // Find the specific reservation to extract booking details
    const res = reservations.find(r => r.id === resId);
    const date = res?.reservation_date || new Date().toISOString().split('T')[0];
    const time = formatTimeTo12Hour(res?.start_time || '12:00');
    const party = res?.party_size || '2';
    
    // Construct an elegant, formatted confirmation text
    const message = `Namaste ${guestName},\nYour table reservation at Sutra Lounge & Restaurant has been CONFIRMED!\n\n📅 Date: ${date}\n⏰ Time: ${time}\n👥 Guests: ${party} Pax\n\nWe look forward to hosting you. Thank you for choosing Sutra Lounge!`;
    const encodedMsg = encodeURIComponent(message);
    
    // Clean and standardise the mobile number for WhatsApp link
    let cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (!cleanPhone.startsWith('+') && !cleanPhone.startsWith('977')) {
      if (cleanPhone.startsWith('9') && cleanPhone.length === 10) {
        cleanPhone = '977' + cleanPhone;
      }
    } else if (cleanPhone.startsWith('+')) {
      cleanPhone = cleanPhone.substring(1);
    }
    
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
    window.open(whatsappUrl, '_blank');

    if (triggerToast) {
      triggerToast(`WhatsApp invitation link prepared for ${guestName}!`);
    }
  };

  const handlePrintDayCovers = () => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const todaysRes = reservations.filter(r => r.reservation_date === todayStr);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Popup blocker prevented printing. Please allow popups for this site.");
      return;
    }
    
    const html = `
      <html>
        <head>
          <title>Sutra Lounge - Day Covers Checklist (${todayStr})</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #0f172a; }
            h1 { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 5px; }
            .meta { color: #64748b; font-size: 14px; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
            th { background-color: #f8fafc; font-weight: bold; }
            .status { font-weight: bold; text-transform: uppercase; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>SUTRA LOUNGE</h1>
          <div class="meta">Day Covers Reservation Checklist &bull; Date: ${todayStr} &bull; Generated: ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Guest Name</th>
                <th>Party Size</th>
                <th>Contact</th>
                <th>Special Requests</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${todaysRes.map(r => `
                <tr>
                  <td><strong>${formatTimeTo12Hour(r.start_time)} - ${r.end_time ? formatTimeTo12Hour(r.end_time) : '90m'}</strong></td>
                  <td>${r.full_name}</td>
                  <td>${r.party_size} Pax</td>
                  <td>${r.phone}</td>
                  <td><span style="font-style: italic; color: #64748b;">${r.special_requests || 'None'}</span></td>
                  <td class="status">${r.status}</td>
                </tr>
              `).join('')}
              ${todaysRes.length === 0 ? '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #64748b;">No reservations scheduled for today.</td></tr>' : ''}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      {/* Title & Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">Reservations Manager</h2>
          <p className="text-sm text-gray-500">Manage incoming booking allocations and table mapping schedules.</p>
        </div>
        
        {/* Real Dynamic Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Date Filter Input */}
          <div className="relative flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:border-[#fd761a] transition-all">
            <Calendar className="w-3.5 h-3.5 text-gray-400 mr-2" />
            <input 
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent text-gray-700 font-bold font-mono focus:outline-none cursor-pointer"
              title="Filter by Reservation Date"
            />
            {filterDate && (
              <button 
                onClick={() => setFilterDate('')}
                className="ml-2 text-gray-400 hover:text-gray-600 font-bold text-sm"
                title="Clear date filter"
              >
                &times;
              </button>
            )}
          </div>

          {/* Search Guest Filter Input */}
          <div className="relative flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:border-[#fd761a] transition-all w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
            <input 
              type="text"
              placeholder="Search guest name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-gray-700 font-semibold focus:outline-none w-full"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="ml-1 text-gray-400 hover:text-gray-600 font-bold text-sm"
                title="Clear search"
              >
                &times;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metric Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-150 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-[#fd761a] rounded-full flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-black text-gray-900">
              {reservations.filter(r => r.status === 'pending').length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-150 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-700 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Confirmed</p>
            <p className="text-2xl font-black text-gray-900">
              {reservations.filter(r => r.status === 'confirmed').length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-150 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Guests</p>
            <p className="text-2xl font-black text-gray-900">
              {reservations
                .filter(r => r.status === 'confirmed')
                .reduce((sum, r) => sum + (Number(r.party_size) || 0), 0)} Pax
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-150 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-full flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tables Occupied</p>
            <p className="text-2xl font-black text-gray-900">
              {reservations.filter(r => r.status === 'confirmed').length > 5 ? '88%' : '35%'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-150 overflow-hidden">
        {/* Status Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
            {[
              { status: 'all', label: 'All Entries', count: reservations.length },
              { status: 'pending', label: 'Pending', count: reservations.filter(r => r.status === 'pending').length },
              { status: 'confirmed', label: 'Confirmed', count: reservations.filter(r => r.status === 'confirmed').length },
              { status: 'cancelled', label: 'Cancelled', count: reservations.filter(r => r.status === 'cancelled').length }
            ].map(tab => (
              <button
                key={tab.status}
                type="button"
                onClick={() => setFilterReservationStatus(tab.status)}
                className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                  filterReservationStatus === tab.status
                    ? 'bg-[#fd761a] text-white'
                    : 'text-gray-500 hover:bg-gray-120'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-150">
                <th className="px-6 py-4">Guest</th>
                <th className="px-6 py-4">Date & Time Block</th>
                <th className="px-6 py-4 text-center">Party Size</th>
                <th className="px-6 py-4">Contact Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredReservations.map(res => (
                <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 font-bold">
                        {res.full_name ? res.full_name.slice(0, 2).toUpperCase() : 'G'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{res.full_name}</p>
                        <p className="text-[10px] text-gray-400 italic">{res.special_requests || 'No culinary notes'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{res.reservation_date || 'YYYY-MM-DD'}</p>
                    <p className="text-gray-500 font-mono">{res.start_time ? formatTimeTo12Hour(res.start_time) : '--:--'} - {res.end_time ? formatTimeTo12Hour(res.end_time) : '90m'}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 text-[11px] font-bold font-mono">
                      {res.party_size || 2} Pax
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900 font-mono font-medium">{res.phone}</p>
                    <p className="text-gray-400 font-mono">{res.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block border ${
                      res.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' :
                      res.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                      'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {res.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      {res.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateReservationStatus(res.id, 'confirmed')}
                          className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-[10px] cursor-pointer"
                          title="Accept"
                        >
                          Confirm
                        </button>
                      )}
                      {res.status !== 'cancelled' && (
                        <button
                          onClick={() => handleUpdateReservationStatus(res.id, 'cancelled')}
                          className="px-2 py-1.5 border border-red-100 hover:bg-red-50 text-red-600 rounded-lg font-bold text-[10px] cursor-pointer"
                          title="Reject"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteReservation(res.id)}
                        className="p-1 px-1.5 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredReservations.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 italic">
                    No reservations logged inside this section.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floor availability & Quick Actions Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-150 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Floor Availability Map</h3>
            <span className="text-[#fd761a] text-xs font-bold font-mono">6 Tables Total</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
            {[
              { id: 'T01', name: 'Free', bg: 'bg-green-50 border-green-200 text-green-700' },
              { id: 'T02', name: 'Occ', bg: 'bg-red-50 border-red-250 text-red-800' },
              { id: 'T03', name: 'Occ', bg: 'bg-red-50 border-red-250 text-red-800' },
              { id: 'T04', name: 'Free', bg: 'bg-green-50 border-green-200 text-green-700' },
              { id: 'T05', name: 'Res', bg: 'bg-orange-50 border-orange-200 text-orange-850' },
              { id: 'T06', name: 'Occ', bg: 'bg-red-50 border-red-250 text-red-800' },
            ].map(table => (
              <div key={table.id} className={`aspect-square border rounded-xl flex flex-col items-center justify-center p-2 ${table.bg}`}>
                <span className="text-[10px] font-bold font-mono block">{table.id}</span>
                <span className="text-xs font-black uppercase mt-1 select-none">{table.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0a1422] text-white p-6 rounded-xl shadow-xs relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#fd761a]/20 rounded-full blur-2xl -mr-16 -mt-16"></div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 relative z-10 text-white select-none">Operational Speed Dial</h3>
          <div className="flex flex-col gap-2 relative z-10 text-left">
            <button 
              onClick={() => setIsWalkInModalOpen(true)}
              className="flex items-center gap-3 w-full p-3 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Add Manual Walk-In Seating</span>
            </button>
            <button 
              onClick={() => setIsSmsApprovalsOpen(true)}
              className="flex items-center gap-3 w-full p-3 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4 text-white" />
              <span>Send WhatsApp / SMS Approvals</span>
            </button>
            <button 
              onClick={handlePrintDayCovers}
              className="flex items-center gap-3 w-full p-3 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>Print Day Covers Checklist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Walk-In Modal */}
      {isWalkInModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-left">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 text-left animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#fd761a]" />
                Manual Walk-In Check-In
              </h3>
              <button 
                onClick={() => setIsWalkInModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddWalkInSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Guest Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="e.g. Samir Thapa"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#fd761a]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Phone Number *</label>
                <input 
                  type="tel" 
                  required
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  placeholder="e.g. +977 9855012345"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#fd761a]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Party Size</label>
                  <select
                    value={walkInParty}
                    onChange={(e) => setWalkInParty(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#fd761a] cursor-pointer"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <option key={n} value={n}>{n} Pax</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Time Slot</label>
                  <input 
                    type="time" 
                    value={walkInTime}
                    onChange={(e) => setWalkInTime(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#fd761a]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Culinary Requests</label>
                <textarea 
                  value={walkInRequests}
                  onChange={(e) => setWalkInRequests(e.target.value)}
                  placeholder="e.g. Window side, anniversary setup..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#fd761a] h-16 resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(false)}
                  className="flex-1 py-2 border border-gray-200 text-gray-700 font-bold rounded-lg text-[10px] hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#fd761a] hover:opacity-90 text-white font-bold rounded-lg text-[10px] transition-opacity cursor-pointer"
                >
                  Allocate & Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMS Table Approvals Modal */}
      {isSmsApprovalsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-left">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 text-left animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#fd761a]" />
                WhatsApp Desk Approvals
              </h3>
              <button 
                onClick={() => setIsSmsApprovalsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mb-4">Select a pending reservation to automatically launch a free pre-filled WhatsApp confirmation message link.</p>

            <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-gray-100 pr-1">
              {reservations.filter(r => r.status === 'pending').map(res => (
                <div key={res.id} className="pt-2 pb-2 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-gray-900">{res.full_name}</p>
                    <p className="text-gray-500 font-mono text-[10px]">{res.phone} &bull; {res.party_size} Pax</p>
                  </div>
                  <button
                    onClick={() => handleSendSmsApproval(res.id, res.full_name, res.phone)}
                    className="px-2.5 py-1.5 bg-[#0a1422] text-white hover:opacity-90 font-bold rounded-lg text-[10px] cursor-pointer"
                  >
                    Send WhatsApp
                  </button>
                </div>
              ))}

              {reservations.filter(r => r.status === 'pending').length === 0 && (
                <div className="py-8 text-center text-xs text-gray-400 italic">
                  No active pending bookings require WhatsApp confirmation triggers.
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsSmsApprovalsOpen(false)}
                className="w-full py-2 border border-gray-200 text-gray-700 font-bold rounded-lg text-[10px] hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close Desk Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
