import React from 'react';
import { 
  Plus, 
  Trash2, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Copy, 
  Edit2 
} from 'lucide-react';

interface AdminGalleryProps {
  galleryPhotosList: any[];
  galleryFilter: string;
  setGalleryFilter: (cat: string) => void;
  setShowAddPhotoModal: (show: boolean) => void;
  setEditingPhotoId: (id: string | null) => void;
  setNewPhotoForm: React.Dispatch<React.SetStateAction<any>>;
  handleDeletePhoto: (id: string) => void;
  handleApplyPhotoToDish: (dishId: string, url: string) => void;
  menuItems: any[];
  triggerToast?: (m: string) => void;
}

export const AdminGallery: React.FC<AdminGalleryProps> = ({
  galleryPhotosList,
  galleryFilter,
  setGalleryFilter,
  setShowAddPhotoModal,
  setEditingPhotoId,
  setNewPhotoForm,
  handleDeletePhoto,
  handleApplyPhotoToDish,
  menuItems,
  triggerToast = (m: string) => {}
}) => {
  const categories = ['All', 'Food', 'Drinks', 'Interior', 'Exterior'];

  const filteredPhotos = galleryPhotosList
    .filter(photo => photo.is_active !== false)
    .filter(photo => galleryFilter === 'All' || (photo.category || '').toLowerCase() === galleryFilter.toLowerCase());

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">Gallery Portfolio</h2>
          <p className="text-sm text-gray-500">Manage photographic gallery resources and direct culinary image mapping.</p>
        </div>
        <button
          onClick={() => {
            setEditingPhotoId(null);
            setNewPhotoForm({ url: '', caption: '', category: 'Food' });
            setShowAddPhotoModal(true);
          }}
          className="bg-[#fd761a] hover:bg-[#9d4300] text-white px-5 py-3 rounded-xl flex items-center gap-2 font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload visual asset Link</span>
        </button>
      </div>

      {/* Category selector */}
      <div className="bg-white p-4 rounded-xl border border-gray-150 flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Asset Filter:</span>
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setGalleryFilter(cat)}
              className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                galleryFilter === cat
                  ? 'bg-[#fd761a] text-white'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-120'
              }`}
            >
              {cat === 'All' ? 'All Portfolio' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Masonry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredPhotos.map(photo => (
          <div key={photo.id} className="bg-white p-3 rounded-xl border border-gray-150 shadow-xs hover:shadow-sm transition-shadow flex flex-col group">
            {/* Image Aspect ratio container with hover effects */}
            <div className="aspect-video w-full bg-gray-50 rounded-lg overflow-hidden shrink-0 relative border border-gray-100 mb-3">
              <img 
                src={photo.url} 
                alt={photo.caption || 'Lounge Scene'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold font-mono rounded-md uppercase tracking-wide">
                {photo.category || 'Food'}
              </span>
            </div>

            {/* Footer metadata description */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div className="text-left mb-3">
                <p className="font-bold text-gray-900 text-xs truncate">{photo.caption || 'No Caption Provided'}</p>
                <p className="text-[10px] text-gray-450 truncate font-mono mt-0.5">{photo.url}</p>
              </div>

              {/* Action Rows */}
              <div className="space-y-2 mt-auto">
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(photo.url);
                      triggerToast('Copied link directly to system clipboard.');
                    }}
                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold font-mono py-1.5 rounded-lg text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 border border-gray-200"
                    title="Copy direct CDN Link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </button>
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="px-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-100 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                    title="Delete visual resource"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Direct dish assign selector */}
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-150 flex flex-col gap-1 text-[10px] font-bold">
                  <span className="text-[8px] text-gray-400 uppercase tracking-widest block font-sans">Assign Cuisine Photo:</span>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleApplyPhotoToDish(e.target.value, photo.url);
                        e.target.value = ""; // Reset dropdown
                      }
                    }}
                    className="w-full bg-white border border-gray-200 rounded-md py-1 px-1.5 text-[9px] font-bold outline-none cursor-pointer"
                  >
                    <option value="">-- Click to choose menu dish --</option>
                    {menuItems.map(dish => (
                      <option key={dish.id} value={dish.id}>
                        {dish.name} (रू {dish.price})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredPhotos.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400 italic text-xs">
            No portfolio entries matched filters.
          </div>
        )}
      </div>

    </div>
  );
};
