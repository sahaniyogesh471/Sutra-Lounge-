import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Edit, AlertCircle, X } from 'lucide-react';
import * as supabaseService from '../../supabaseService';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image_url?: string;
  is_available: boolean;
}

export const AdminMenu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    category: 'mains',
    description: '',
    price: 0,
    image_url: '',
    is_available: true,
  });

  const categories = ['appetizers', 'mains', 'desserts', 'beverages'];

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const data = await supabaseService.getMenuItems();
      setMenuItems(data as MenuItem[]);
    } catch (error) {
      console.error('[v0] Error loading menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await supabaseService.updateMenuItem(editingId, formData);
      } else {
        await supabaseService.addMenuItem(formData);
      }

      resetForm();
      await loadMenuItems();
    } catch (error) {
      console.error('[v0] Error saving menu item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await supabaseService.deleteMenuItem(id);
        await loadMenuItems();
      } catch (error) {
        console.error('[v0] Error deleting menu item:', error);
      }
    }
  };

  const handleEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description,
      price: item.price,
      image_url: item.image_url || '',
      is_available: item.is_available,
    });
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleToggleAvailability = async (id: string, currentState: boolean) => {
    try {
      await supabaseService.updateMenuItem(id, { is_available: !currentState });
      await loadMenuItems();
    } catch (error) {
      console.error('[v0] Error updating availability:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'mains',
      description: '',
      price: 0,
      image_url: '',
      is_available: true,
    });
    setEditingId(null);
    setShowModal(false);
  };

  const filteredItems =
    filterCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Menu Management</h1>
          <p className="text-gray-600 mt-1">Manage menu items and pricing</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowModal(true)}
          className="bg-gold text-charcoal font-semibold px-6 py-3 rounded-lg hover:bg-gold/90 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </motion.button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Menu Items */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading menu items...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Image */}
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
              )}

              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-charcoal">{item.name}</h3>
                    <p className="text-xs text-gray-600 capitalize">{item.category}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.is_available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <p className="text-xl font-bold text-gold">RS {item.price}</p>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleEdit(item)}
                    className="flex-1 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleToggleAvailability(item.id, item.is_available)}
                    className="flex-1 p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium"
                  >
                    {item.is_available ? 'Disable' : 'Enable'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No menu items found</p>
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
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-charcoal">
                {editingId ? 'Edit Item' : 'Add Menu Item'}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                required
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                rows={3}
              />
              <input
                type="number"
                min="0"
                step="10"
                placeholder="Price (RS)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
                required
              />
              <input
                type="url"
                placeholder="Image URL"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none"
              />
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-sm text-charcoal">Available</span>
              </label>

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
