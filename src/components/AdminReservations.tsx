import React from 'react';
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

interface AdminReservationsProps {
  reservations: any[];
  filterReservationStatus: string;
  setFilterReservationStatus: (s: string) => void;
  handleUpdateReservationStatus: (id: string, s: string) => void;
  handleDeleteReservation: (id: string) => void;
}

export const AdminReservations: React.FC<AdminReservationsProps> = ({
  reservations,
  filterReservationStatus,
  setFilterReservationStatus,
  handleUpdateReservationStatus,
  handleDeleteReservation
}) => {
  const filteredReservations = reservations.filter(r => 
    filterReservationStatus === 'all' || r.status === filterReservationStatus
  );

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      {/* Title & Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">Reservations Manager</h2>
          <p className="text-sm text-gray-500">Manage incoming booking allocations and table mapping schedules.</p>
        </div>
        <div className="flex gap-2 text-xs font-semibold">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>June 14, 2026</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700">
            <Filter className="w-4 h-4 text-gray-400" />
            <span>Smart Filters</span>
          </button>
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
                    <p className="text-gray-500 font-mono">{res.start_time || 'HH:MM'} - {res.end_time || '90m'}</p>
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
            <button className="flex items-center gap-3 w-full p-3 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-bold transition-all">
              <Plus className="w-4 h-4 text-white" />
              <span>Add Manual Walk-In Seating</span>
            </button>
            <button className="flex items-center gap-3 w-full p-3 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-bold transition-all">
              <Mail className="w-4 h-4 text-white" />
              <span>Send SMS Table Approvals</span>
            </button>
            <button className="flex items-center gap-3 w-full p-3 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-bold transition-all">
              <Printer className="w-4 h-4 text-white" />
              <span>Print Day Covers Checklist</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
