import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Download, Calendar } from 'lucide-react';
import * as supabaseService from '../../supabaseService';

interface AnalyticsData {
  date: string;
  reservations: number;
  revenue: number;
  avgPartySize: number;
}

export const AdminAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Generate mock analytics data for the last 30/7 days
      const days = parseInt(dateRange);
      const data: AnalyticsData[] = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        data.push({
          date: date.toISOString().split('T')[0],
          reservations: Math.floor(Math.random() * 20) + 5,
          revenue: Math.floor(Math.random() * 100000) + 20000,
          avgPartySize: Math.floor(Math.random() * 4) + 2,
        });
      }

      setAnalyticsData(data);
    } catch (error) {
      console.error('[v0] Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalReservations = analyticsData.reduce((sum, d) => sum + d.reservations, 0);
  const totalRevenue = analyticsData.reduce((sum, d) => sum + d.revenue, 0);
  const avgPartySize = Math.round(
    analyticsData.reduce((sum, d) => sum + d.avgPartySize, 0) / analyticsData.length
  );
  const peakDay = analyticsData.reduce((max, d) => 
    d.reservations > max.reservations ? d : max
  );

  const handleExport = () => {
    const csv = [
      ['Date', 'Reservations', 'Revenue', 'Avg Party Size'],
      ...analyticsData.map((d) => [d.date, d.reservations, d.revenue, d.avgPartySize]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const StatCard = ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ translateY: -5 }}
      className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-charcoal">{value}</p>
        </div>
        <div className="p-3 bg-gray-100 rounded-lg">{icon}</div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Analytics</h1>
          <p className="text-gray-600 mt-1">Track restaurant performance</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleExport}
          className="bg-charcoal text-white font-semibold px-6 py-3 rounded-lg hover:bg-charcoal/90 transition-all flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export Data
        </motion.button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
        <Calendar className="w-5 h-5 text-gray-600" />
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Reservations"
          value={totalReservations}
          icon={<TrendingUp className="w-6 h-6 text-gold" />}
        />
        <StatCard
          title="Total Revenue"
          value={`RS ${totalRevenue.toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        />
        <StatCard
          title="Average Party Size"
          value={avgPartySize}
          icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
        />
        <StatCard
          title="Peak Day"
          value={peakDay.reservations}
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
        />
      </div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-charcoal">Daily Breakdown</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Loading analytics...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Date</th>
                  <th className="text-right px-6 py-4 font-semibold text-gray-700">
                    Reservations
                  </th>
                  <th className="text-right px-6 py-4 font-semibold text-gray-700">Revenue</th>
                  <th className="text-right px-6 py-4 font-semibold text-gray-700">
                    Avg Party Size
                  </th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.map((data) => (
                  <tr key={data.date} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-charcoal">
                      {new Date(data.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">{data.reservations}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gold">
                      RS {data.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">{data.avgPartySize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 rounded-xl p-6"
      >
        <h3 className="text-lg font-bold text-charcoal mb-4">Period Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Reservations</p>
            <p className="text-3xl font-bold text-charcoal">{totalReservations}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Average Daily Revenue</p>
            <p className="text-3xl font-bold text-gold">
              RS {Math.round(totalRevenue / analyticsData.length).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Busiest Day</p>
            <p className="text-3xl font-bold text-charcoal">
              {new Date(peakDay.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
