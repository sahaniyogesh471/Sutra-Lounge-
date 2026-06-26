import React from 'react';
import { 
  ShoppingBag, 
  Clock, 
  DollarSign, 
  Star, 
  TrendingUp, 
  Bell, 
  Settings, 
  Calendar, 
  Download,
  CheckCircle,
  Clock as TimerIcon,
  XCircle,
  User,
  Coffee,
  Sparkles,
  Inbox
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface AdminOverviewProps {
  reservations: any[];
  orders: any[];
  metricTotalRevenue: number;
  metricTodayOrders: number;
  metricTotalOrders: number;
  metricPendingOrders: number;
  metricPendingReservations: number;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  reservations,
  orders,
  metricTotalRevenue,
  metricTodayOrders,
  metricTotalOrders,
  metricPendingOrders,
  metricPendingReservations
}) => {
  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 leading-tight">Morning, Admin</h2>
          <p className="text-sm text-gray-500">Here's what's happening at Sutra Lounge today.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" className="px-4 py-2 bg-white border border-gray-250 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            Last 7 Days
          </button>
          <button type="button" className="px-4 py-2 bg-[#0a1422] text-white rounded-lg text-xs font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Download className="w-3.5 h-3.5 text-white" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Orders */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-150 hover:shadow-sm transition-shadow group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-gray-50 rounded-lg text-[#0a1422] group-hover:bg-[#0a1422] group-hover:text-white transition-colors">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-green-600 text-xs font-bold font-mono flex items-center">+12%</span>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Orders</p>
          <h3 className="text-2xl font-black text-gray-900">{metricTotalOrders}</h3>
        </div>

        {/* Today's Orders */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-150 hover:shadow-sm transition-shadow group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-orange-50 rounded-lg text-[#fd761a] group-hover:bg-[#fd761a] group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-green-600 text-xs font-bold font-mono flex items-center">+5%</span>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Today's Orders</p>
          <h3 className="text-2xl font-black text-gray-900">{metricTodayOrders}</h3>
        </div>

        {/* Revenue */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-150 hover:shadow-sm transition-shadow group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-green-50 rounded-lg text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-green-600 text-xs font-bold font-mono flex items-center">+18%</span>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Revenue (NPR)</p>
          <h3 className="text-2xl font-black text-gray-900">
            रू {metricTotalRevenue ? metricTotalRevenue.toLocaleString('en-NP') : '0'}
          </h3>
        </div>

        {/* Pending */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-150 hover:shadow-sm transition-shadow group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-amber-600 text-xs font-bold font-mono flex items-center">Active</span>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Pending Orders</p>
          <h3 className="text-2xl font-black text-gray-900">{metricPendingOrders}</h3>
        </div>

        {/* Reservations */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-150 hover:shadow-sm transition-shadow group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-gray-400 text-xs font-bold font-mono flex items-center">Bookages</span>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Reservations</p>
          <h3 className="text-2xl font-black text-gray-900">{reservations.length}</h3>
        </div>
      </div>

      {/* Dashboard Body: Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trends Chart (Large Span) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-gray-150 p-6 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-sm font-bold text-[#0a1422] uppercase tracking-wider">Order Trends</h4>
              <p className="text-xs text-gray-400">Weekly performance overview</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#fd761a]"></span>
                <span>Dine-in</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#0a1422]"></span>
                <span>Delivery</span>
              </div>
            </div>
          </div>
          {/* Simple Area Chart */}
          <div className="flex-1 w-full h-64 relative mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { day: 'Mon', revenue: Math.max(1200, metricTotalRevenue * 0.12), orders: 4 },
                  { day: 'Tue', revenue: Math.max(1800, metricTotalRevenue * 0.14), orders: 6 },
                  { day: 'Wed', revenue: Math.max(1100, metricTotalRevenue * 0.10), orders: 3 },
                  { day: 'Thu', revenue: Math.max(2200, metricTotalRevenue * 0.16), orders: 8 },
                  { day: 'Fri', revenue: Math.max(3900, metricTotalRevenue * 0.23), orders: 14 },
                  { day: 'Sat', revenue: Math.max(4900, metricTotalRevenue * 0.28), orders: 19 },
                  { day: 'Sun', revenue: Math.max(3200, metricTotalRevenue * 0.17), orders: 11 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fd761a" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#fd761a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="revenue" name="Estimated Revenue (रू)" stroke="#fd761a" fillOpacity={1} fill="url(#revenueGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-150 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h4 className="text-sm font-bold text-[#0a1422] uppercase tracking-wider">Recent Activity</h4>
            <span className="text-[10px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-full font-mono">REALTIME</span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[300px] divide-y divide-gray-100">
            {[
              ...reservations.map(r => ({
                id: r.id,
                type: 'booking',
                heading: `Reservation: ${r.full_name}`,
                meta: `${r.party_size} Pax · ${r.reservation_date} at ${r.start_time}`,
                tag: 'Booking',
                tagBg: 'bg-orange-50 text-[#fd761a]',
                time: r.created_at || new Date().toISOString()
              })),
              ...orders.map(o => ({
                id: o.id,
                type: 'order',
                heading: `Placed: ${o.customer_name}`,
                meta: `${o.items?.map((it: any) => `${it.quantity}x ${it.name}`).join(', ') || 'Delicacy Item'} · NPR ${o.total_amount}`,
                tag: 'Order',
                tagBg: 'bg-green-50 text-green-700',
                time: o.created_at || new Date().toISOString()
              }))
            ]
              .sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime())
              .slice(0, 6)
              .map((act, idx) => (
                <div key={`${act.id}-${idx}`} className="p-4 hover:bg-gray-50 transition-colors flex gap-4 text-xs">
                  <div className="shrink-0">
                    <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-bold uppercase ${act.tagBg}`}>
                      {act.tag}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <p className="font-semibold text-gray-900 truncate">{act.heading}</p>
                      <span className="shrink-0 text-[10px] text-gray-400 font-mono">
                        {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-500 font-light truncate mt-0.5">{act.meta}</p>
                  </div>
                </div>
              ))}

            {reservations.length === 0 && orders.length === 0 && (
              <div className="py-12 text-center text-xs text-gray-400 italic">
                No active operational telemetry logs in database yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
