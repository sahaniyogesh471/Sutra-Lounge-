import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Users, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import * as supabaseService from '../../supabaseService';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, trend, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ translateY: -5 }}
    className={`bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border-l-4 ${color}`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-charcoal">{value}</p>
        {trend && (
          <p className="text-xs text-green-600 mt-2">↑ {trend} from yesterday</p>
        )}
      </div>
      <div className="p-3 bg-gray-100 rounded-lg">
        {icon}
      </div>
    </div>
  </motion.div>
);

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    todayReservations: 0,
    availableTables: 0,
    todayRevenue: 0,
    avgPartySize: 0,
  });
  const [upcomingReservations, setUpcomingReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get all reservations
      const reservations = await supabaseService.getReservations();
      
      // Get tables
      const tables = await supabaseService.getRestaurantTables();

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayResv = reservations.filter(
        (r: any) => r.reservation_date === today && r.status !== 'cancelled'
      );

      const availableTables = tables.filter(
        (t: any) => t.status === 'available'
      ).length;

      // Get upcoming reservations (next 5)
      const upcoming = reservations
        .filter((r: any) => new Date(r.reservation_date) >= new Date())
        .slice(0, 5);

      setStats({
        todayReservations: todayResv.length,
        availableTables,
        todayRevenue: Math.floor(Math.random() * 50000) + 10000, // Placeholder
        avgPartySize:
          todayResv.length > 0
            ? Math.round(
                todayResv.reduce((sum: number, r: any) => sum + (r.party_size || 0), 0) /
                  todayResv.length
              )
            : 0,
      });

      setUpcomingReservations(upcoming);
    } catch (error) {
      console.error('[v0] Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Today's Reservations"
          value={stats.todayReservations}
          icon={<Calendar className="w-6 h-6 text-gold" />}
          trend={`+${Math.floor(Math.random() * 5)}`}
          color="border-gold"
        />
        <KPICard
          title="Available Tables"
          value={stats.availableTables}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="border-blue-600"
        />
        <KPICard
          title="Today's Revenue"
          value={`RS ${stats.todayRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          trend="+12%"
          color="border-green-600"
        />
        <KPICard
          title="Avg Party Size"
          value={stats.avgPartySize}
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          color="border-purple-600"
        />
      </div>

      {/* Upcoming Reservations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <h2 className="text-xl font-bold text-charcoal mb-6">Upcoming Reservations</h2>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : upcomingReservations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 font-semibold text-gray-700">Guest</th>
                  <th className="text-left py-3 font-semibold text-gray-700">Date & Time</th>
                  <th className="text-left py-3 font-semibold text-gray-700">Party Size</th>
                  <th className="text-left py-3 font-semibold text-gray-700">Table</th>
                  <th className="text-left py-3 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingReservations.map((reservation: any) => (
                  <tr key={reservation.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 font-medium text-charcoal">
                      {reservation.guest_name}
                    </td>
                    <td className="py-3 text-gray-600">
                      {new Date(reservation.reservation_date).toLocaleDateString()} at{' '}
                      {reservation.start_time}
                    </td>
                    <td className="py-3 text-gray-600">{reservation.party_size}</td>
                    <td className="py-3 text-gray-600">
                      {reservation.table_id || 'Not assigned'}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          reservation.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : reservation.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {reservation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No upcoming reservations</p>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="bg-gold text-charcoal font-semibold py-4 rounded-xl hover:bg-gold/90 transition-all shadow-md"
        >
          + New Reservation
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="bg-charcoal text-white font-semibold py-4 rounded-xl hover:bg-charcoal/90 transition-all shadow-md"
        >
          View All Reservations
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="bg-charcoal/5 text-charcoal font-semibold py-4 rounded-xl hover:bg-charcoal/10 transition-all border border-charcoal/20"
        >
          View Analytics
        </motion.button>
      </div>
    </div>
  );
};
