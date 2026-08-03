import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Edit, AlertCircle } from 'lucide-react';
import * as supabaseService from '../../supabaseService';

interface Table {
  id: string;
  table_number: number;
  capacity: number;
  location: string;
  status: 'available' | 'occupied' | 'reserved';
}

export const AdminTables: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    table_number: 0,
    capacity: 2,
    location: '',
    status: 'available',
  });

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await supabaseService.getRestaurantTables();
      setTables(data as Table[]);
    } catch (error) {
      console.error('[v0] Error loading tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await supabaseService.updateRestaurantTable(editingId, formData);
      } else {
        // Add new table logic would go here
      }

      resetForm();
      await loadTables();
    } catch (error) {
      console.error('[v0] Error saving table:', error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await supabaseService.updateRestaurantTable(id, { status: newStatus });
      await loadTables();
    } catch (error) {
      console.error('[v0] Error updating table status:', error);
    }
  };

  const handleEdit = (table: Table) => {
    setFormData({
      table_number: table.table_number,
      capacity: table.capacity,
      location: table.location,
      status: table.status,
    });
    setEditingId(table.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ table_number: 0, capacity: 2, location: '', status: 'available' });
    setEditingId(null);
    setShowModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Tables</h1>
          <p className="text-gray-600 mt-1">Manage restaurant tables</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowModal(true)}
          className="bg-gold text-charcoal font-semibold px-6 py-3 rounded-lg hover:bg-gold/90 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Table
        </motion.button>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading tables...</p>
        </div>
      ) : tables.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {tables.map((table) => (
            <motion.div
              key={table.id}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-charcoal">Table {table.table_number}</p>
                  <p className="text-sm text-gray-600">{table.location}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(table.status)}`}>
                  {table.status}
                </span>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Capacity</p>
                <p className="text-lg font-semibold text-charcoal">{table.capacity} guests</p>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleEdit(table)}
                  className="flex-1 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </motion.button>
                <select
                  value={table.status}
                  onChange={(e) => handleStatusChange(table.id, e.target.value)}
                  className="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No tables found</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => resetForm()}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-charcoal mb-6">
              {editingId ? 'Edit Table' : 'Add Table'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="number"
                placeholder="Table Number"
                value={formData.table_number}
                onChange={(e) => setFormData({ ...formData, table_number: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                required
              />
              <input
                type="number"
                min="1"
                max="20"
                placeholder="Capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                required
              />
              <input
                type="text"
                placeholder="Location (e.g., Near Window)"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
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
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
