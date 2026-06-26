import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Eye, 
  EyeOff, 
  UtensilsCrossed, 
  Check, 
  DollarSign 
} from 'lucide-react';
import { ImageUploader } from './ImageUploader';

interface AdminMenuProps {
  menuItems: any[];
  newMenuItem: {
    name: string;
    description: string;
    price: number;
    category: string;
    is_featured: boolean;
    is_active: boolean;
    image_url: string;
  };
  setNewMenuItem: React.Dispatch<React.SetStateAction<any>>;
  editingMenuItem: any | null;
  setEditingMenuItem: React.Dispatch<React.SetStateAction<any | null>>;
  handleSaveMenuItemSubmit: (e: React.FormEvent) => void;
  handleDeleteMenuItem: (id: string) => void;
  handleToggleMenuBoolean: (id: string, field: 'is_active' | 'is_featured', currentValue: boolean) => void;
}

export const AdminMenu: React.FC<AdminMenuProps> = ({
  menuItems,
  newMenuItem,
  setNewMenuItem,
  editingMenuItem,
  setEditingMenuItem,
  handleSaveMenuItemSubmit,
  handleDeleteMenuItem,
  handleToggleMenuBoolean
}) => {
  const [selectedCategoryFilter, setSelectedCategoryCategoryFilter] = useState('All');
  const [menuUploadTab, setMenuUploadTab] = useState<'upload' | 'url'>('upload');

  // Auto-detect upload tab based on existing image URL type
  useEffect(() => {
    if (newMenuItem.image_url) {
      if (newMenuItem.image_url.startsWith('data:')) {
        setMenuUploadTab('upload');
      } else if (newMenuItem.image_url.startsWith('http')) {
        setMenuUploadTab('url');
      }
    }
  }, [newMenuItem.image_url]);

  // Map category filters from UI categories values
  const uiCategories = [
    { key: 'All', label: 'All Items' },
    { key: 'Mains', label: 'Main Course' },
    { key: 'Momo Specialties', label: 'Momo Specialties' },
    { key: 'Sandwiches', label: 'Sandwiches' },
    { key: 'Drinks', label: 'Cocktails & Drinks' },
    { key: 'Breakfast', label: 'Desserts & Breakfast' }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (selectedCategoryFilter === 'All') return true;
    return (item.category || '').toLowerCase().includes(selectedCategoryFilter.toLowerCase()) ||
           (selectedCategoryFilter === 'Breakfast' && (item.category || '').toLowerCase().includes('dessert'));
  });

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      
      {/* Title & Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">Menu Configuration</h2>
          <p className="text-sm text-gray-500 mt-1">Configure and organize your lounge's culinary offering list.</p>
        </div>
      </div>

      {/* Filter Bar mapping template 4 */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-150 flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filter Category:</span>
        <div className="flex flex-wrap gap-1.5">
          {uiCategories.map(cat => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategoryCategoryFilter(cat.key)}
              className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                selectedCategoryFilter === cat.key
                  ? 'bg-[#fd761a] text-white'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-120'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Two-Columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Form Panel (Left) */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-150 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
            <UtensilsCrossed className="w-5 h-5 text-[#fd761a]" />
            <span>{editingMenuItem ? 'Update Delicacy' : 'Create Menu Item'}</span>
          </h3>

          <form onSubmit={handleSaveMenuItemSubmit} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase block">Dish Name *</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Classic Chicken Momo"
                value={newMenuItem.name}
                onChange={(e) => setNewMenuItem(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-250 rounded-lg outline-none font-semibold text-xs focus:ring-1 focus:ring-[#fd761a] focus:border-[#fd761a]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase block">Category</label>
                <select
                  value={newMenuItem.category}
                  onChange={(e) => setNewMenuItem(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white border border-gray-250 rounded-lg outline-none text-xs font-semibold focus:ring-1 focus:ring-[#fd761a] focus:border-[#fd761a]"
                >
                  <option value="Mains">Mains</option>
                  <option value="Momo Specialties">Momo Specialties</option>
                  <option value="Sandwiches">Sandwiches</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Breakfast">Breakfast / Dessert</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase block">Price (NPR) *</label>
                <input 
                  type="number" 
                  required 
                  min={1}
                  value={newMenuItem.price}
                  onChange={(e) => setNewMenuItem(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-gray-250 rounded-lg outline-none text-xs font-mono font-bold focus:ring-1 focus:ring-[#fd761a] focus:border-[#fd761a]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase block">Dish Image Asset</label>
                <div className="flex rounded-md bg-gray-100 p-0.5 text-[9px] font-bold">
                  <button
                    type="button"
                    onClick={() => setMenuUploadTab('upload')}
                    className={`px-2 py-0.5 rounded-sm transition-all cursor-pointer ${
                      menuUploadTab === 'upload' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Upload Direct
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuUploadTab('url')}
                    className={`px-2 py-0.5 rounded-sm transition-all cursor-pointer ${
                      menuUploadTab === 'url' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Web Link
                  </button>
                </div>
              </div>

              {menuUploadTab === 'upload' ? (
                <ImageUploader
                  value={newMenuItem.image_url}
                  onChange={(base64Url) => setNewMenuItem(prev => ({ ...prev, image_url: base64Url }))}
                  onClear={() => setNewMenuItem(prev => ({ ...prev, image_url: '' }))}
                />
              ) : (
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/... (secure link)"
                  value={newMenuItem.image_url}
                  onChange={(e) => setNewMenuItem(prev => ({ ...prev, image_url: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-250 rounded-lg outline-none text-xs font-mono font-medium focus:ring-1 focus:ring-[#fd761a] focus:border-[#fd761a]"
                />
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase block">Culinary Description</label>
              <textarea 
                rows={3}
                placeholder="Delicately describe the ingredients, spices, and preparation..."
                value={newMenuItem.description}
                onChange={(e) => setNewMenuItem(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-250 rounded-lg outline-none text-xs focus:ring-1 focus:ring-[#fd761a] focus:border-[#fd761a]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase font-sans">Flags:</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold select-none text-[11px] text-gray-650">
                  <input 
                    type="checkbox"
                    checked={newMenuItem.is_featured}
                    onChange={(e) => setNewMenuItem(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="rounded text-[#fd761a] accent-[#fd761a] cursor-pointer"
                  />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-bold select-none text-[11px] text-gray-650">
                  <input 
                    type="checkbox"
                    checked={newMenuItem.is_active}
                    onChange={(e) => setNewMenuItem(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded text-[#fd761a] accent-[#fd761a] cursor-pointer"
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="submit"
                className="flex-1 bg-[#fd761a] hover:bg-[#9d4300] text-white font-bold rounded-xl py-3 uppercase text-xs tracking-wider shadow-sm transition-all text-center cursor-pointer"
              >
                {editingMenuItem ? 'Save Changes' : 'Add Item'}
              </button>
              {editingMenuItem && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingMenuItem(null);
                    setNewMenuItem({ name: '', description: '', price: 350, category: 'Mains', is_featured: false, is_active: true, image_url: '' });
                  }}
                  className="px-4 py-3 border border-gray-200 rounded-xl font-bold uppercase text-xs text-gray-400 hover:text-red-500 cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Catalog Table list (Right) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-gray-150 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Visibility</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredMenuItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-105 rounded-lg overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center text-gray-400">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                          ) : (
                            <UtensilsCrossed className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">{item.name}</p>
                          <span className="text-[10px] text-gray-400 italic line-clamp-1">{item.description || 'No description'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {item.category || 'Mains'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 font-mono">
                      रू {item.price || 0}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-600">
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => handleToggleMenuBoolean(item.id, 'is_active', item.is_active !== false)}
                          className="flex items-center gap-1 hover:text-[#fd761a] cursor-pointer text-left"
                          title="Toggle active"
                        >
                          {item.is_active !== false ? (
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-0.5"><Eye className="w-3.5 h-3.5" /> Active</span>
                          ) : (
                            <span className="text-xs font-bold text-gray-400 flex items-center gap-0.5"><EyeOff className="w-3.5 h-3.5" /> Hidden</span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleMenuBoolean(item.id, 'is_featured', !!item.is_featured)}
                          className="flex items-center gap-1 hover:text-[#fd761a] cursor-pointer text-left"
                          title="Toggle Featured"
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${item.is_featured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                          <span className={`text-[10px] uppercase font-mono ${item.is_featured ? 'text-yellow-700' : 'text-gray-400'}`}>Spotlight</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMenuItem(item);
                            setNewMenuItem({
                              name: item.name,
                              description: item.description || '',
                              price: item.price,
                              category: item.category || 'Mains',
                              is_featured: !!item.is_featured,
                              is_active: item.is_active !== false,
                              image_url: item.image_url || ''
                            });
                          }}
                          className="p-1 px-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className="p-1 px-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Delete food entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredMenuItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-400 italic">
                      Zero matching items configured inside live database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
