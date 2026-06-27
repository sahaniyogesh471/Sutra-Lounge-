import React from 'react';
import { 
  ShoppingBag, 
  Clock, 
  DollarSign, 
  Calendar, 
  Download,
  CheckCircle,
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
  triggerToast?: (m: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  reservations,
  orders,
  metricTotalRevenue,
  metricTodayOrders,
  metricTotalOrders,
  metricPendingOrders,
  metricPendingReservations,
  triggerToast
}) => {
  // Real time and date filter states: 'all' | 'today' | '7days' | 'this_month'
  const [filterRange, setFilterRange] = React.useState<'all' | 'today' | '7days' | 'this_month'>('all');

  // Helper to get filtered items based on selected date range
  const getFilteredData = () => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().substring(0, 10);
    const thisMonthStr = new Date().toISOString().substring(0, 7);

    let filteredOrders = [...orders];
    let filteredReservations = [...reservations];

    if (filterRange === 'today') {
      filteredOrders = orders.filter(o => o.created_at && o.created_at.substring(0, 10) === todayStr);
      filteredReservations = reservations.filter(r => r.reservation_date === todayStr);
    } else if (filterRange === '7days') {
      filteredOrders = orders.filter(o => o.created_at && o.created_at.substring(0, 10) >= sevenDaysAgoStr);
      filteredReservations = reservations.filter(r => r.reservation_date && r.reservation_date >= sevenDaysAgoStr);
    } else if (filterRange === 'this_month') {
      filteredOrders = orders.filter(o => o.created_at && o.created_at.substring(0, 7) === thisMonthStr);
      filteredReservations = reservations.filter(r => r.reservation_date && r.reservation_date.substring(0, 7) === thisMonthStr);
    }

    return { filteredOrders, filteredReservations };
  };

  const { filteredOrders, filteredReservations } = getFilteredData();

  // Dynamic calculations of metrics for the chosen time block
  const dynamicTotalOrders = filteredOrders.length;
  
  const dynamicTodayOrders = orders.filter(o => {
    if (!o.created_at) return false;
    return o.created_at.substring(0, 10) === new Date().toISOString().substring(0, 10);
  }).length;

  const dynamicRevenue = filteredOrders
    .filter(o => o.payment_status === 'paid' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  const dynamicPendingOrders = filteredOrders.filter(o => o.status === 'new' || o.status === 'preparing').length;
  const dynamicPendingReservations = filteredReservations.filter(r => r.status === 'pending').length;

  // Fully functional CSV exporter
  const handleExportReport = () => {
    try {
      let csvContent = "\uFEFF"; // Unicode BOM signature to support special chars like currency or nepali symbols in Excel
      
      // Header Info
      csvContent += "SUTRA LOUNGE & RESTAURANT - OPERATIONAL TELEMETRY REPORT\n";
      csvContent += `Selected Date Filter: ${filterRange.toUpperCase()}\n`;
      csvContent += `Generated Timestamp: ${new Date().toLocaleString()}\n\n`;
      
      // Reservations Table Section
      csvContent += "--- RESERVATIONS SCHEDULES ---\n";
      csvContent += "ID,Guest Full Name,Email,Phone Contact,Reservation Date,Start Time,End Time,Party Size,Status,Special Requests,Created At\n";
      filteredReservations.forEach(r => {
        const row = [
          r.id || "N/A",
          `"${(r.full_name || "").replace(/"/g, '""')}"`,
          r.email || "N/A",
          `"${r.phone || ""}"`,
          r.reservation_date || "N/A",
          r.start_time || "N/A",
          r.end_time || "N/A",
          `${r.party_size || 2} Pax`,
          r.status || "pending",
          `"${(r.special_requests || "").replace(/"/g, '""')}"`,
          r.created_at || "N/A"
        ].join(",");
        csvContent += row + "\n";
      });
      
      csvContent += "\n--- ONLINE ORDERS DETAILS ---\n";
      csvContent += "ID,Customer Name,Email Contact,Phone Number,Total Cost (NPR),Cooking Status,Billing Status,Delivery/Service Address,Ordered Items,Placed At\n";
      filteredOrders.forEach(o => {
        const itemsList = (o.items || []).map((it: any) => `${it.quantity}x ${it.name}`).join(" | ");
        const row = [
          o.id || "N/A",
          `"${(o.customer_name || "").replace(/"/g, '""')}"`,
          o.customer_email || "N/A",
          `"${o.customer_phone || ""}"`,
          o.total_amount || 0,
          o.status || "new",
          o.payment_status || "pending",
          `"${(o.delivery_address || "").replace(/"/g, '""')}"`,
          `"${itemsList.replace(/"/g, '""')}"`,
          o.created_at || "N/A"
        ].join(",");
        csvContent += row + "\n";
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const tempLink = document.createElement("a");
      tempLink.setAttribute("href", url);
      tempLink.setAttribute("download", `SutraLounge_Report_${filterRange}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      URL.revokeObjectURL(url);

      if (triggerToast) {
        triggerToast(`Operational report for "${filterRange}" exported successfully!`);
      } else {
        alert(`Operational report for "${filterRange}" exported successfully!`);
      }
    } catch (err: any) {
      if (triggerToast) triggerToast(`Export failed: ${err.message}`);
    }
  };

  // Dynamically scale chart revenues relative to current filtered revenue
  const baseChartMultiplier = dynamicRevenue > 0 ? dynamicRevenue / Math.max(1, metricTotalRevenue) : 1;
  const areaChartData = [
    { day: 'Mon', revenue: Math.round(Math.max(1200, (metricTotalRevenue * 0.12) * baseChartMultiplier)), orders: 4 },
    { day: 'Tue', revenue: Math.round(Math.max(1800, (metricTotalRevenue * 0.14) * baseChartMultiplier)), orders: 6 },
    { day: 'Wed', revenue: Math.round(Math.max(1100, (metricTotalRevenue * 0.10) * baseChartMultiplier)), orders: 3 },
    { day: 'Thu', revenue: Math.round(Math.max(2200, (metricTotalRevenue * 0.16) * baseChartMultiplier)), orders: 8 },
    { day: 'Fri', revenue: Math.round(Math.max(3900, (metricTotalRevenue * 0.23) * baseChartMultiplier)), orders: 14 },
    { day: 'Sat', revenue: Math.round(Math.max(4900, (metricTotalRevenue * 0.28) * baseChartMultiplier)), orders: 19 },
    { day: 'Sun', revenue: Math.round(Math.max(3200, (metricTotalRevenue * 0.17) * baseChartMultiplier)), orders: 11 },
  ];

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 leading-tight">Morning, Admin</h2>
          <p className="text-sm text-gray-500">Here's what's happening at Sutra Lounge today.</p>
        </div>
        
        {/* Real Dynamic Date & Range Controls */}
        <div className="flex gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            <select
              value={filterRange}
              onChange={(e) => setFilterRange(e.target.value as any)}
              className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors appearance-none focus:outline-none focus:border-[#fd761a] cursor-pointer"
              title="Select Dashboard Filter Window"
            >
              <option value="all">All Time Logs</option>
              <option value="today">Today Only</option>
              <option value="7days">Last 7 Days</option>
              <option value="this_month">This Month</option>
            </select>
          </div>
          
          <button 
            type="button" 
            onClick={handleExportReport}
            className="px-4 py-2 bg-[#0a1422] text-white rounded-lg text-xs font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
          >
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
          <h3 className="text-2xl font-black text-gray-900">{dynamicTotalOrders}</h3>
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
          <h3 className="text-2xl font-black text-gray-900">{dynamicTodayOrders}</h3>
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
            रू {dynamicRevenue ? dynamicRevenue.toLocaleString('en-NP') : '0'}
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
          <h3 className="text-2xl font-black text-gray-900">{dynamicPendingOrders}</h3>
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
          <h3 className="text-2xl font-black text-gray-900">{filteredReservations.length}</h3>
        </div>
      </div>

      {/* Dashboard Body: Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trends Chart (Large Span) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-gray-150 p-6 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-sm font-bold text-[#0a1422] uppercase tracking-wider">Order Trends</h4>
              <p className="text-xs text-gray-400">Weekly performance overview (Scaled for {filterRange})</p>
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
                data={areaChartData}
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
              ...filteredReservations.map(r => ({
                id: r.id,
                type: 'booking',
                heading: `Reservation: ${r.full_name}`,
                meta: `${r.party_size} Pax · ${r.reservation_date} at ${r.start_time}`,
                tag: 'Booking',
                tagBg: 'bg-orange-50 text-[#fd761a]',
                time: r.created_at || new Date().toISOString()
              })),
              ...filteredOrders.map(o => ({
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

            {filteredReservations.length === 0 && filteredOrders.length === 0 && (
              <div className="py-12 text-center text-xs text-gray-400 italic">
                No active operational logs inside the selected date range.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
