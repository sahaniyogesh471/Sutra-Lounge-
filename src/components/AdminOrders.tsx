import React from 'react';
import { 
  Search, 
  Trash, 
  Check, 
  X, 
  Plus, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  Package,
  PlusCircle, 
  CornerDownRight, 
  DollarSign, 
  Star, 
  Timer, 
  ArrowUpRight, 
  Eye,
  LogOut,
  Sliders,
  Sparkles,
  Utensils
} from 'lucide-react';

interface AdminOrdersProps {
  orders: any[];
  searchOrderQuery: string;
  setSearchOrderQuery: (q: string) => void;
  filterOrderStatus: string;
  setFilterOrderStatus: (s: string) => void;
  handleUpdateOrderStatus: (id: string, s: string) => void;
  handleUpdateOrderPaymentStatus: (id: string, p: string) => void;
  handleDeleteOrder: (id: string) => void;
  setShowAddOrderModal: (show: boolean) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  searchOrderQuery,
  setSearchOrderQuery,
  filterOrderStatus,
  setFilterOrderStatus,
  handleUpdateOrderStatus,
  handleUpdateOrderPaymentStatus,
  handleDeleteOrder,
  setShowAddOrderModal
}) => {
  // Filters orders based on search query and status filter
  const filteredOrders = orders.filter(o => {
    const nameMatches = o.customer_name?.toLowerCase().includes(searchOrderQuery.toLowerCase()) || 
                       o.customer_phone?.includes(searchOrderQuery);
    const statusMatches = filterOrderStatus === 'all' || o.status === filterOrderStatus;
    return nameMatches && statusMatches;
  });

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      {/* Search and Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">Orders Management</h2>
          <p className="text-sm text-gray-500">Manage digital kitchen requests, trace preparation queue and billing.</p>
        </div>
        <button 
          onClick={() => setShowAddOrderModal(true)}
          className="bg-[#fd761a] hover:bg-[#9d4300] text-white px-5 py-3 rounded-xl flex items-center gap-2 font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Order Record</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-150 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Orders</p>
            <h3 className="text-2xl font-black text-gray-950 mt-1">
              {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length}
            </h3>
          </div>
          <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-[#fd761a]">
            <Utensils className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-150 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Avg. Prep Time</p>
            <h3 className="text-2xl font-black text-gray-950 mt-1">18m</h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-700">
            <Timer className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-150 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Revenue Today</p>
            <h3 className="text-2xl font-black text-gray-950 mt-1">
              रू {orders
                .filter(o => o.payment_status === 'paid' && o.status !== 'cancelled')
                .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
                .toLocaleString('en-NP')}
            </h3>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-700">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-150 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Customer Rating</p>
            <h3 className="text-2xl font-black text-gray-950 mt-1">4.8</h3>
          </div>
          <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-700">
            <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Main Table card */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-150 overflow-hidden">
        {/* Status Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
            {[
              { status: 'all', label: 'All Orders', count: orders.length },
              { status: 'new', label: 'New', count: orders.filter(o => o.status === 'new').length },
              { status: 'preparing', label: 'Preparing', count: orders.filter(o => o.status === 'preparing').length },
              { status: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'ready').length },
              { status: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
              { status: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }
            ].map(tab => (
              <button
                key={tab.status}
                type="button"
                onClick={() => setFilterOrderStatus(tab.status)}
                className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                  filterOrderStatus === tab.status
                    ? 'bg-[#fd761a] text-white'
                    : 'text-gray-500 hover:bg-gray-120'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchOrderQuery}
                onChange={(e) => setSearchOrderQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-full font-semibold text-xs focus:ring-2 focus:ring-[#fd761a]/20 w-48 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Dense Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-150">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer / Source</th>
                <th className="px-6 py-4">Quantity & Items</th>
                <th className="px-6 py-4">Total Cost</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4 text-right">Operations Interface</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 border-none select-all font-mono">
                        #{order.id ? order.id.slice(-6).toUpperCase() : 'LINE'}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString('en-US', {
                              month: 'short', day: 'numeric',
                              hour: 'numeric', minute: '2-digit', hour12: true
                            })
                          : 'Just now'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#fd761a] text-[11px] font-bold">
                        {order.customer_name ? order.customer_name.slice(0, 2).toUpperCase() : 'G'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{order.customer_name || 'Guest'}</span>
                        <span className="text-[10px] text-gray-500">{order.delivery_address || 'Lounge Seat'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col max-w-[200px] text-left">
                      <span className="truncate font-medium text-gray-800">
                        {order.items?.map((it: any) => `${it.quantity}x ${it.name}`).join(', ') || 'No items'}
                      </span>
                      {order.items && order.items.length > 1 && (
                        <span className="text-[10px] text-[#fd761a] font-bold mt-0.5">
                          +{order.items.length - 1} more types
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 font-mono">
                    रू {Number(order.total_amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold leading-normal uppercase border ${
                      order.status === 'new' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      order.status === 'preparing' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                      order.status === 'ready' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                      order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-100' :
                      'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold font-mono ${
                      order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      <CheckCircle className="w-3.5 h-3.5" />
                      {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {order.status === 'new' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                          className="px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 font-bold font-mono text-[9px] rounded-lg tracking-wider transition-colors cursor-pointer"
                        >
                          PREP
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                          className="px-2.5 py-1 bg-orange-600/10 hover:bg-orange-600/20 text-orange-700 font-bold font-mono text-[9px] rounded-lg tracking-wider transition-colors cursor-pointer"
                        >
                          READY
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                          className="px-2.5 py-1 bg-green-600/10 hover:bg-green-600/20 text-green-700 font-bold font-mono text-[9px] rounded-lg tracking-wider transition-colors cursor-pointer"
                        >
                          DONE
                        </button>
                      )}

                      {order.payment_status === 'pending' ? (
                        <button
                          onClick={() => handleUpdateOrderPaymentStatus(order.id, 'paid')}
                          className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 font-bold font-mono text-[9px] rounded-lg cursor-pointer"
                        >
                          CASH
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateOrderPaymentStatus(order.id, 'pending')}
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold font-mono text-[9px] rounded-lg cursor-pointer"
                        >
                          UNPAY
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-1 px-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete log"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 italic">
                    No orders matched criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
