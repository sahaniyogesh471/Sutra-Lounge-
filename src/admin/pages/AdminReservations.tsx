import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Filter, Trash2, Edit, Eye, CheckCircle, X, AlertCircle, Send } from 'lucide-react';
import * as supabaseService from '../../supabaseService';

interface Reservation {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  reservation_date: string;
  start_time: string;
  party_size: number;
  table_id?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export const AdminReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Reservation>>({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    reservation_date: '',
    start_time: '',
    party_size: 2,
    status: 'pending',
    notes: '',
  });

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [reservations, searchQuery, filterStatus]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await supabaseService.getReservations();
      setReservations(data as Reservation[]);
    } catch (error) {
      console.error('[v0] Error loading reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = reservations;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.guest_phone.includes(searchQuery) ||
          r.guest_email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReservations(filtered);
  };

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Update reservation
        await supabaseService.updateReservation(editingId, formData);
      } else {
        // Add new reservation
        await supabaseService.addReservation(formData);
      }

      resetForm();
      await loadReservations();
    } catch (error) {
      console.error('[v0] Error saving reservation:', error);
    }
  };

  const handleEdit = (reservation: Reservation) => {
    setFormData(reservation);
    setEditingId(reservation.id);
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      try {
        await supabaseService.deleteReservation(id);
        await loadReservations();
      } catch (error) {
        console.error('[v0] Error deleting reservation:', error);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await supabaseService.updateReservation(id, { status: newStatus });
      await loadReservations();
    } catch (error) {
      console.error('[v0] Error updating status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      guest_name: '',
      guest_email: '',
      guest_phone: '',
      reservation_date: '',
      start_time: '',
      party_size: 2,
      status: 'pending',
      notes: '',
    });
    setEditingId(null);
    setShowAddModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Reservations</h1>
          <p className="text-gray-600 mt-1">Manage all restaurant reservations</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowAddModal(true)}
          className="bg-gold text-charcoal font-semibold px-6 py-3 rounded-lg hover:bg-gold/90 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Reservation
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 flex gap-4 items-center flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Loading reservations...</p>
          </div>
        ) : filteredReservations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Guest</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Date & Time</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Party Size</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Phone</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-charcoal">{reservation.guest_name}</p>
                        <p className="text-xs text-gray-600">{reservation.guest_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(reservation.reservation_date).toLocaleDateString()} at{' '}
                      {reservation.start_time}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{reservation.party_size} guests</td>
                    <td className="px-6 py-4 text-gray-700">{reservation.guest_phone}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleEdit(reservation)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleDelete(reservation.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                        {reservation.status === 'pending' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Confirm"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No reservations found</p>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => resetForm()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-charcoal">
                {editingId ? 'Edit Reservation' : 'New Reservation'}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddOrUpdate} className="space-y-4">
              <input
                type="text"
                placeholder="Guest Name"
                value={formData.guest_name || ''}
                onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.guest_email || ''}
                onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.guest_phone || ''}
                onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                required
              />
              <input
                type="date"
                value={formData.reservation_date || ''}
                onChange={(e) => setFormData({ ...formData, reservation_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                required
              />
              <input
                type="time"
                value={formData.start_time || ''}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                required
              />
              <input
                type="number"
                min="1"
                max="20"
                placeholder="Party Size"
                value={formData.party_size || 2}
                onChange={(e) => setFormData({ ...formData, party_size: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                required
              />
              <select
                value={formData.status || 'pending'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <textarea
                placeholder="Notes (optional)"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                rows={3}
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-charcoal rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gold text-charcoal font-semibold rounded-lg hover:bg-gold/90 transition-colors"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
