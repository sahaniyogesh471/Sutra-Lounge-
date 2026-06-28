import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  CheckCircle,
  Clock,
  Sparkles,
  Calendar,
  Settings,
  Activity,
  ShoppingBag,
  Image as ImageIcon,
  FileText,
  Copy,
  Link,
  Sliders,
  LogOut,
  Store,
  ChevronLeft,
  ChevronRight,
  Menu as MenuIcon
} from 'lucide-react';
import { 
  db, 
  handleFirestoreError, 
  OperationType,
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  getDoc
} from '../firebase';

// Webpack/Vite Sub-components
import { AdminOverview } from './AdminOverview';
import { AdminOrders } from './AdminOrders';
import { AdminReservations } from './AdminReservations';
import { AdminMenu } from './AdminMenu';
import { AdminGallery } from './AdminGallery';
import { AdminSettings } from './AdminSettings';
import { ImageUploader } from './ImageUploader';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  businessDetails: any;
  setBusinessDetails: any;
  menuHighlights: any;
  setMenuHighlights: any;
  servicesList: any;
  setServicesList: any;
  ownerUpdate: any;
  setOwnerUpdate: any;
  galleryPhotos: any;
  setGalleryPhotos: any;
  faqs: any;
  setFaqs: any;
  reassurancePoints: any;
  setReassurancePoints: any;
  authenticReviews: any;
  setAuthenticReviews: any;
  promoAnnouncements: any;
  setPromoAnnouncements: any;
  heroImageUrl: string;
  setHeroImageUrl: (url: string) => void;
  dishImageUrl: string;
  setDishImageUrl: (url: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, galleryPhotos, setGalleryPhotos }) => {
  // Authentication - Forced to authenticated for immediate fluid interaction as established
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(true);

  // Core Data States
  const [reservations, setReservations] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [galleryPhotosList, setGalleryPhotosList] = useState<any[]>([]);
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    restaurant_name: "Sutra Lounge",
    restaurant_email: "info@sutralounge.com.np",
    restaurant_phone: "+977 1500000",
    restaurant_address: "Nagar Bikash Samiti Marg, Hetauda 44107, Nepal",
  });

  // Current active tab
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'reservations' | 'menu' | 'gallery' | 'settings'>('overview');

  // sidebar togglers
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filters and queries
  const [searchOrderQuery, setSearchOrderQuery] = useState('');
  const [filterOrderStatus, setFilterOrderStatus] = useState<string>('all');
  const [filterReservationStatus, setFilterReservationStatus] = useState<string>('all');

  // Modals & form state
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [selectedOrderItemName, setSelectedOrderItemName] = useState('');
  const [selectedOrderItemQty, setSelectedOrderItemQty] = useState(1);
  const [newOrderForm, setNewOrderForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    items: [] as any[],
    total_amount: 0,
    status: 'new' as 'new' | 'preparing' | 'ready' | 'delivered' | 'cancelled',
    payment_status: 'pending' as 'pending' | 'paid' | 'refunded',
    delivery_address: ''
  });

  const [editingMenuItem, setEditingMenuItem] = useState<any | null>(null);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: 350,
    category: 'Mains',
    is_featured: false,
    is_active: true,
    image_url: ''
  });

  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [uploadTab, setUploadTab] = useState<'upload' | 'url'>('upload');
  const [newPhotoForm, setNewPhotoForm] = useState({
    url: '',
    caption: '',
    category: 'Food'
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  const [galleryFilter, setGalleryFilter] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Subscription streams directly from Firestore proxy layer
  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. Reservations
    const unsubReservations = onSnapshot(collection(db, 'reservations'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      list.sort((a, b) => new Date(b.created_at || b.reservation_date || 0).getTime() - new Date(a.created_at || a.reservation_date || 0).getTime());
      setReservations(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reservations');
    });

    // 2. Menu Items
    const unsubMenu = onSnapshot(collection(db, 'menu_items'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setMenuItems(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'menu_items');
    });

    // 3. Online Orders
    const unsubOrders = onSnapshot(collection(db, 'online_orders'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      const mockNames = ["Dipesh K. Shrestha", "Aakash Rai", "Kritisha Giri"];
      const realOrders = list.filter(ord => !mockNames.includes(ord.customer_name));
      
      realOrders.sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      setOrders(realOrders);

      // Clean up existing dummy orders in database background
      const dummyDocs = list.filter(ord => mockNames.includes(ord.customer_name));
      if (dummyDocs.length > 0) {
        dummyDocs.forEach(async (docObj) => {
          try {
            await deleteDoc(doc(db, 'online_orders', docObj.id));
          } catch (e) {
            console.warn("Error purging mock doc:", e);
          }
        });
      }
    }, (error) => {
      console.warn("Could not load orders: ", error);
    });

    // 4. Restaurant Settings
    const unsubSettings = onSnapshot(collection(db, 'restaurant_settings'), (snapshot) => {
      const defaultDoc = snapshot.docs.find(doc => doc.id === 'default');
      if (defaultDoc) {
        setSettings(defaultDoc.data());
      }
    });

    // 5. Business Hours
    const unsubHours = onSnapshot(collection(db, 'business_hours'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      const sorted = list.sort((a, b) => {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days.indexOf(a.id) - days.indexOf(b.id);
      });
      setBusinessHours(sorted);
    });

    // 6. Gallery Catalog
    const savedPhotos = localStorage.getItem('sutra_gallery_photos') || localStorage.getItem('sutra_admin_gallery_photos');
    if (savedPhotos) {
      try {
        const parsed = JSON.parse(savedPhotos);
        import('../data').then(m => {
          const baselineUrls = new Set(parsed.map((ph: any) => ph.url));
          const venuePhotos = (m.MAPS_GALLERY_PHOTOS || []).map((ph: any, idx: number) => ({
            ...ph,
            id: ph.id || `ph_${idx}_${Date.now()}`
          }));
          const mappedDishes = (m.MENU_HIGHLIGHTS || []).map((dish: any, dishIdx: number) => ({
            url: dish.image,
            caption: dish.title,
            category: dish.category?.toLowerCase().includes('drink') || dish.category?.toLowerCase().includes('beverage') ? 'Drinks' : 'Food',
            author: 'Sutra Kitchen',
            stars: 5,
            id: `dish_ph_${dishIdx}_${Date.now()}`
          }));
          const combinedBaseline = [...venuePhotos, ...mappedDishes];
          const newToAppend = combinedBaseline.filter(item => !baselineUrls.has(item.url));
          if (newToAppend.length > 0) {
            const merged = [...parsed, ...newToAppend];
            const withIds = merged.map((ph: any, idx: number) => ({
              ...ph,
              id: ph.id || `ph_${idx}_${Date.now()}`
            }));
            setGalleryPhotosList(withIds);
            localStorage.setItem('sutra_admin_gallery_photos', JSON.stringify(withIds));
            localStorage.setItem('sutra_gallery_photos', JSON.stringify(withIds));
            if (setGalleryPhotos) setGalleryPhotos(withIds);
          } else {
            const withIds = parsed.map((ph: any, idx: number) => ({
              ...ph,
              id: ph.id || `ph_${idx}_${Date.now()}`
            }));
            setGalleryPhotosList(withIds);
            if (setGalleryPhotos) setGalleryPhotos(withIds);
          }
        });
      } catch (e) {
        setGalleryPhotosList([]);
      }
    } else {
      import('../data').then(m => {
        const venuePhotos = (m.MAPS_GALLERY_PHOTOS || []).map((ph: any, idx: number) => ({
          ...ph,
          id: ph.id || `ph_${idx}_${Date.now()}`
        }));
        const mappedDishes = (m.MENU_HIGHLIGHTS || []).map((dish: any, dishIdx: number) => ({
          url: dish.image,
          caption: dish.title,
          category: dish.category?.toLowerCase().includes('drink') || dish.category?.toLowerCase().includes('beverage') ? 'Drinks' : 'Food',
          author: 'Sutra Kitchen',
          stars: 5,
          id: `dish_ph_${dishIdx}_${Date.now()}`
        }));
        const combined = [...venuePhotos, ...mappedDishes];
        setGalleryPhotosList(combined);
        localStorage.setItem('sutra_admin_gallery_photos', JSON.stringify(combined));
        localStorage.setItem('sutra_gallery_photos', JSON.stringify(combined));
        if (setGalleryPhotos) setGalleryPhotos(combined);
      });
    }

    return () => {
      unsubReservations();
      unsubMenu();
      unsubOrders();
      unsubSettings();
      unsubHours();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (galleryPhotos && Array.isArray(galleryPhotos)) {
      setGalleryPhotosList(galleryPhotos);
    }
  }, [galleryPhotos]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Metrics calculators
  const metricTotalOrders = orders.length;
  const metricTodayOrders = orders.filter(o => {
    if (!o.created_at || typeof o.created_at !== 'string') return false;
    const dateStr = o.created_at.substring(0, 10);
    const todayStr = new Date().toISOString().substring(0, 10);
    return dateStr === todayStr;
  }).length;

  const metricTotalRevenue = orders
    .filter(o => o.payment_status === 'paid' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  const metricPendingOrders = orders.filter(o => o.status === 'new' || o.status === 'preparing').length;
  const metricPendingReservations = reservations.filter(r => r.status === 'pending').length;

  // Manual Order dynamic callbacks setup
  const handleAddManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrderForm.items.length === 0) {
      triggerToast("Please add at least 1 delicacy item line");
      return;
    }
    try {
      const total = newOrderForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const payload = {
        customer_name: newOrderForm.customer_name,
        customer_email: newOrderForm.customer_email || 'manual@sutralounge.com.np',
        customer_phone: newOrderForm.customer_phone,
        items: newOrderForm.items,
        total_amount: total,
        status: newOrderForm.status,
        payment_status: newOrderForm.payment_status,
        delivery_address: newOrderForm.delivery_address || 'Lounge Dine-In Service',
        created_at: new Date().toISOString()
      };

      await addDoc(collection(db, 'online_orders'), payload);
      setShowAddOrderModal(false);
      setNewOrderForm({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        items: [],
        total_amount: 0,
        status: 'new',
        payment_status: 'pending',
        delivery_address: ''
      });
      triggerToast("Order placed directly into kitchen telemetry feed!");
    } catch (e: any) {
      triggerToast(`Error: ${e.message}`);
    }
  };

  const handleAddOrderItemLine = () => {
    if (!selectedOrderItemName) return;
    const itemObj = menuItems.find(m => m.name === selectedOrderItemName);
    const price = itemObj ? itemObj.price : 350;
    
    setNewOrderForm(prev => {
      const existing = prev.items.find(i => i.name === selectedOrderItemName);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map(i => i.name === selectedOrderItemName ? { ...i, quantity: i.quantity + selectedOrderItemQty } : i)
        };
      } else {
        return {
          ...prev,
          items: [...prev.items, { name: selectedOrderItemName, quantity: selectedOrderItemQty, price }]
        };
      }
    });

    setSelectedOrderItemQty(1);
    triggerToast(`Added ${selectedOrderItemQty}x ${selectedOrderItemName}`);
  };

  const handleRemoveOrderItemLine = (name: string) => {
    setNewOrderForm(prev => ({
      ...prev,
      items: prev.items.filter(i => i.name !== name)
    }));
  };

  // Order state status mutations
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'online_orders', orderId), { status });
      triggerToast(`Order status bumped to ${status.toUpperCase()}`);
    } catch (e: any) {
      triggerToast(`Failed: ${e.message}`);
    }
  };

  const handleUpdateOrderPaymentStatus = async (orderId: string, payment_status: string) => {
    try {
      await updateDoc(doc(db, 'online_orders', orderId), { payment_status });
      triggerToast(`Billing updated to ${payment_status.toUpperCase()}`);
    } catch (e: any) {
      triggerToast(`Error: ${e.message}`);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Confirm Deletion",
      message: "Are you sure you want to remove this order completely from logs?",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'online_orders', orderId));
          triggerToast("Order removed cleanly");
        } catch (e: any) {
          triggerToast(`Error: ${e.message}`);
        }
      }
    });
  };

  // Reservation functions
  const handleUpdateReservationStatus = async (resId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'reservations', resId), { status });
      triggerToast(`Booking status updated to ${status.toUpperCase()}`);
    } catch (e: any) {
      triggerToast(`Update failed: ${e.message}`);
    }
  };

  const handleDeleteReservation = async (resId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Confirm Deletion",
      message: "Are you sure you want to delete this reservation?",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'reservations', resId));
          triggerToast("Reservation deleted successfully");
        } catch (e: any) {
          triggerToast(`Failed: ${e.message}`);
        }
      }
    });
  };

  // Menu item mutations
  const handleSaveMenuItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuItem.name.trim()) return;

    try {
      const payload = {
        name: newMenuItem.name.trim(),
        description: newMenuItem.description.trim(),
        price: Number(newMenuItem.price),
        category: newMenuItem.category,
        is_featured: newMenuItem.is_featured,
        is_active: newMenuItem.is_active,
        image_url: newMenuItem.image_url.trim()
      };

      if (editingMenuItem) {
        await updateDoc(doc(db, 'menu_items', editingMenuItem.id), payload);
        setEditingMenuItem(null);
        triggerToast("Dish details updated");
      } else {
        const id = "m_" + Date.now();
        await setDoc(doc(db, 'menu_items', id), {
          ...payload,
          created_at: new Date().toISOString()
        });
        triggerToast("New delicacy ingested to live catalog");
      }

      setNewMenuItem({
        name: '',
        description: '',
        price: 350,
        category: 'Mains',
        is_featured: false,
        is_active: true,
        image_url: ''
      });
    } catch (e: any) {
      triggerToast(`Error saving product: ${e.message}`);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Confirm Deletion",
      message: "Are you sure you want to remove this menu item from Sutralounge streams?",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'menu_items', id));
          triggerToast("Dish retired from active offering");
        } catch (e: any) {
          triggerToast(`Error deleting: ${e.message}`);
        }
      }
    });
  };

  const handleToggleMenuBoolean = async (id: string, field: 'is_active' | 'is_featured', currentValue: boolean) => {
    try {
      await updateDoc(doc(db, 'menu_items', id), { [field]: !currentValue });
      triggerToast(`Dish ${field === 'is_active' ? 'status' : ' spotlight'} modified`);
    } catch (e: any) {
      triggerToast(`Modification error: ${e.message}`);
    }
  };

  // Settings & business operations hours savings
  const handleSaveSettingsAndHours = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'restaurant_settings', 'default'), settings, { merge: true });

      for (const day of businessHours) {
        await setDoc(doc(db, 'business_hours', day.id), {
          weekday: day.weekday,
          is_open: day.is_open,
          start_time: day.start_time,
          end_time: day.end_time
        }, { merge: true });
      }

      triggerToast("Operational metrics & hours saved");
    } catch (e: any) {
      triggerToast(`Failed: ${e.message}`);
    }
  };

  const handleUpdateHourDayState = (dayId: string, field: string, value: any) => {
    setBusinessHours(prev => prev.map(day => day.id === dayId ? { ...day, [field]: value } : day));
  };

  // Gallery Portfolio CRUD
  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoForm.url.trim()) return;

    if (editingPhotoId) {
      const updated = galleryPhotosList.map(ph => {
        if (ph.id === editingPhotoId) {
          return {
            ...ph,
            url: newPhotoForm.url.trim(),
            caption: newPhotoForm.caption.trim() || 'Sutra Lounge Premium Photo',
            category: newPhotoForm.category || 'Food'
          };
        }
        return ph;
      });
      setGalleryPhotosList(updated);
      if (setGalleryPhotos) setGalleryPhotos(updated);
      localStorage.setItem('sutra_admin_gallery_photos', JSON.stringify(updated));
      localStorage.setItem('sutra_gallery_photos', JSON.stringify(updated));
      setShowAddPhotoModal(false);
      setEditingPhotoId(null);
      setNewPhotoForm({ url: '', caption: '', category: 'Food' });
      triggerToast("Photo asset modified successfully");
    } else {
      const newPhoto = {
        url: newPhotoForm.url.trim(),
        caption: newPhotoForm.caption.trim() || 'Sutra Lounge Premium Photo',
        author: 'Sutra Staff',
        category: newPhotoForm.category || 'Food',
        stars: 5,
        id: "ph_" + Date.now()
      };

      const updated = [newPhoto, ...galleryPhotosList];
      setGalleryPhotosList(updated);
      if (setGalleryPhotos) setGalleryPhotos(updated);
      localStorage.setItem('sutra_admin_gallery_photos', JSON.stringify(updated));
      localStorage.setItem('sutra_gallery_photos', JSON.stringify(updated));
      setShowAddPhotoModal(false);
      setNewPhotoForm({ url: '', caption: '', category: 'Food' });
      triggerToast("Visual asset uploaded successfully");
    }
  };

  const handleDeletePhoto = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Confirm Deletion",
      message: "Are you sure you want to purge this photographic memory asset from website frontpages?",
      onConfirm: () => {
        const updated = galleryPhotosList.filter(ph => ph.id !== id);
        setGalleryPhotosList(updated);
        if (setGalleryPhotos) setGalleryPhotos(updated);
        localStorage.setItem('sutra_admin_gallery_photos', JSON.stringify(updated));
        localStorage.setItem('sutra_gallery_photos', JSON.stringify(updated));
        triggerToast("Visual asset purged successfully");
      }
    });
  };

  const handleApplyPhotoToDish = async (dishId: string, imageUrl: string) => {
    try {
      const dish = menuItems.find(m => m.id === dishId);
      if (!dish) return;
      await updateDoc(doc(db, 'menu_items', dishId), { image_url: imageUrl });
      triggerToast(`Photo thumbnail assigned to ${dish.name}!`);
    } catch (e: any) {
      triggerToast(`Assignment error: ${e.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-0 md:p-4 overflow-hidden">
      
      {/* Dynamic Toast Feedback Overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[120] px-5 py-3 rounded-lg bg-[#0a1422] text-white text-xs font-bold font-sans tracking-wide flex items-center gap-2 border border-[#fd761a]/30 shadow-2xl"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full h-full lg:rounded-2xl border border-gray-200 bg-[#f8f9fa] overflow-hidden flex relative shadow-2xl text-[#191c1d]">
        
        {/* ======================================================= */}
        {/* SIDE BAR LAYOUT FOR GRAPHICAL DESIGN SAME-TO-SAME */}
        {/* ======================================================= */}
        <aside className="w-64 bg-[#0a1422] flex flex-col py-6 shrink-0 hidden md:flex text-white z-20">
          
          {/* Sutralounge decorative branding box */}
          <div className="px-6 mb-8 text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#fd761a] flex items-center justify-center shadow-lg shrink-0">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-white font-extrabold text-lg tracking-tight truncate leading-tight">Sutra Lounge</h1>
                <p className="text-[#8690a1] text-[10px] uppercase font-bold tracking-widest mt-0.5 leading-none">Console Desk</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-1 text-left">
            {[
              { id: 'overview', name: 'Dashboard', icon: Activity },
              { id: 'menu', name: 'Menu Cuisines', icon: FileText },
              { id: 'orders', name: 'Active Orders', icon: ShoppingBag },
              { id: 'reservations', name: 'Reservations', icon: Calendar },
              { id: 'gallery', name: 'Photographs', icon: ImageIcon },
              { id: 'settings', name: 'Operations Set', icon: Settings },
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full py-3 px-4 rounded-xl text-left text-xs font-bold tracking-wider flex items-center gap-3 transition-colors duration-150 cursor-pointer select-none
                    ${isSelected 
                      ? 'bg-[#fd761a] text-white border-l-4 border-white font-black shadow-md' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Sidebar exit action */}
          <div className="px-3 mt-auto">
            <button 
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-gray-400 hover:bg-red-500/10 hover:text-red-500 flex items-center gap-3 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-500 shrink-0" />
              <span>Back to Site</span>
            </button>
          </div>
        </aside>

        {/* Mobile menu panel overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden animate-fade-in" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-64 h-full bg-[#0a1422] p-5 flex flex-col text-white" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-8">
                <span className="font-serif font-black text-white uppercase text-sm tracking-widest">Navigation</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5 cursor-pointer" />
                </button>
              </div>

              <div className="flex-1 space-y-1.5 text-left">
                {[
                  { id: 'overview', name: 'Dashboard', icon: Activity },
                  { id: 'menu', name: 'Menu Cuisines', icon: FileText },
                  { id: 'orders', name: 'Active Orders', icon: ShoppingBag },
                  { id: 'reservations', name: 'Reservations', icon: Calendar },
                  { id: 'gallery', name: 'Photographs', icon: ImageIcon },
                  { id: 'settings', name: 'Operations Set', icon: Settings },
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full py-3 px-4 rounded-xl text-left text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === tab.id ? 'bg-[#fd761a] text-white shadow-md' : 'text-gray-400 hover:bg-gray-800'}`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={onClose}
                className="py-3 px-4 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50/10 flex items-center gap-3 transition-all cursor-pointer mt-auto"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Back to Site</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* MASTER RIGHT CONTENT REGION */}
        {/* ======================================================= */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* Header Bar */}
          <header className="h-16 border-b border-gray-200 bg-white px-6 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-1 text-gray-500 hover:text-gray-900 md:hidden"
              >
                <MenuIcon className="w-5 h-5 cursor-pointer" />
              </button>
              <h1 className="text-sm font-bold text-[#0a1422] uppercase tracking-widest block font-sans select-none">
                Sutralounge Admin Dashboard Desk
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>
              
              <button 
                onClick={onClose}
                className="p-1 px-3 border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-bold tracking-wide flex items-center gap-1 cursor-pointer transition-colors"
                title="Exit dashboard back to site mapping"
              >
                <X className="w-3.5 h-3.5" />
                <span>Exit Desk</span>
              </button>
            </div>
          </header>

          {/* Dynamically Rendered Content Container Frame */}
          <main className="flex-1 overflow-y-auto p-6 bg-[#f8f9fa] relative scrollbar-thin">
            
            {activeTab === 'overview' && (
              <AdminOverview 
                reservations={reservations}
                orders={orders}
                metricTotalRevenue={metricTotalRevenue}
                metricTodayOrders={metricTodayOrders}
                metricTotalOrders={metricTotalOrders}
                metricPendingOrders={metricPendingOrders}
                metricPendingReservations={metricPendingReservations}
                triggerToast={triggerToast}
                businessHours={businessHours}
                onToggleDayOpen={(dayId, currentVal) => handleUpdateHourDayState(dayId, 'is_open', !currentVal)}
                onSaveHours={async () => {
                  try {
                    for (const day of businessHours) {
                      await setDoc(doc(db, 'business_hours', day.id), {
                        weekday: day.weekday,
                        is_open: day.is_open,
                        start_time: day.start_time,
                        end_time: day.end_time
                      }, { merge: true });
                    }
                  } catch (e: any) {
                    triggerToast(`Save error: ${e.message}`);
                  }
                }}
              />
            )}

            {activeTab === 'orders' && (
              <AdminOrders 
                orders={orders}
                searchOrderQuery={searchOrderQuery}
                setSearchOrderQuery={setSearchOrderQuery}
                filterOrderStatus={filterOrderStatus}
                setFilterOrderStatus={setFilterOrderStatus}
                handleUpdateOrderStatus={handleUpdateOrderStatus}
                handleUpdateOrderPaymentStatus={handleUpdateOrderPaymentStatus}
                handleDeleteOrder={handleDeleteOrder}
                setShowAddOrderModal={setShowAddOrderModal}
              />
            )}

            {activeTab === 'reservations' && (
              <AdminReservations 
                reservations={reservations}
                filterReservationStatus={filterReservationStatus}
                setFilterReservationStatus={setFilterReservationStatus}
                handleUpdateReservationStatus={handleUpdateReservationStatus}
                handleDeleteReservation={handleDeleteReservation}
                triggerToast={triggerToast}
              />
            )}

            {activeTab === 'menu' && (
              <AdminMenu 
                menuItems={menuItems}
                newMenuItem={newMenuItem}
                setNewMenuItem={setNewMenuItem}
                editingMenuItem={editingMenuItem}
                setEditingMenuItem={setEditingMenuItem}
                handleSaveMenuItemSubmit={handleSaveMenuItemSubmit}
                handleDeleteMenuItem={handleDeleteMenuItem}
                handleToggleMenuBoolean={handleToggleMenuBoolean}
              />
            )}

            {activeTab === 'gallery' && (
              <AdminGallery 
                galleryPhotosList={galleryPhotosList}
                galleryFilter={galleryFilter}
                setGalleryFilter={setGalleryFilter}
                setShowAddPhotoModal={setShowAddPhotoModal}
                setEditingPhotoId={setEditingPhotoId}
                setNewPhotoForm={setNewPhotoForm}
                handleDeletePhoto={handleDeletePhoto}
                handleApplyPhotoToDish={handleApplyPhotoToDish}
                menuItems={menuItems}
                triggerToast={triggerToast}
              />
            )}

            {activeTab === 'settings' && (
              <AdminSettings 
                settings={settings}
                setSettings={setSettings}
                businessHours={businessHours}
                handleUpdateHourDayState={handleUpdateHourDayState}
                handleSaveSettingsAndHours={handleSaveSettingsAndHours}
              />
            )}

          </main>

        </div>

      </div>

      {/* ======================================================== */}
      {/* OVERLAY POPUP MODALS FRAME */}
      {/* ======================================================== */}

      {/* 1. Add Order Inline Overlay */}
      {showAddOrderModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[110] flex items-center justify-center p-4">
          <form onSubmit={handleAddManualOrder} className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 p-6 space-y-4 text-left shadow-2xl relative animate-in fade-in duration-200">
            
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h4 className="font-bold text-gray-900 text-sm uppercase">Manual customer order logging</h4>
                <p className="text-[10px] text-gray-400">Ingest an order line directly into Sutralounge master kitchen streams.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddOrderModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4 cursor-pointer" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[8px] font-mono text-gray-400 uppercase font-bold">Customer Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Guest display name"
                  value={newOrderForm.customer_name}
                  onChange={(e) => setNewOrderForm(prev => ({ ...prev, customer_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-mono text-gray-400 uppercase font-bold">Phone Number *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="+977 98..."
                  value={newOrderForm.customer_phone}
                  onChange={(e) => setNewOrderForm(prev => ({ ...prev, customer_phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-mono"
                />
              </div>

              <div className="col-span-2 space-y-1 leading-normal">
                <label className="text-[8px] font-mono text-gray-400 uppercase font-bold">Delivery Address (Or Table Number)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Siddhartha Chowk (or 'Table 3 VIP')"
                  value={newOrderForm.delivery_address}
                  onChange={(e) => setNewOrderForm(prev => ({ ...prev, delivery_address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Cart builder widgets */}
            <div className="space-y-2 text-xs border border-gray-150 p-3 bg-gray-50/50 rounded-xl">
              <span className="text-[8px] font-mono text-gray-400 uppercase block font-bold">Dynamic order Line Creator</span>
              <div className="flex gap-2">
                <select
                  value={selectedOrderItemName}
                  onChange={(e) => setSelectedOrderItemName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none text-xs text-gray-700 font-bold"
                >
                  <option value="">-- Choose Cuisine Dish --</option>
                  {menuItems.map(m => (
                    <option key={m.id} value={m.name}>{m.name} (रू {m.price})</option>
                  ))}
                </select>

                <input 
                  type="number" 
                  min={1}
                  value={selectedOrderItemQty}
                  onChange={(e) => setSelectedOrderItemQty(Number(e.target.value))}
                  className="w-14 px-2 py-2 border border-gray-200 rounded-xl text-center font-mono font-bold"
                />

                <button
                  type="button"
                  onClick={handleAddOrderItemLine}
                  className="bg-[#fd761a] hover:bg-[#9d4300] text-white font-bold rounded-xl px-3.5 py-2 uppercase text-[10px] tracking-wide cursor-pointer shrink-0"
                >
                  Add line
                </button>
              </div>

              {/* Added items list */}
              <div className="space-y-2 mt-2 pt-2 border-t border-gray-100 leading-normal max-h-[100px] overflow-y-auto">
                {newOrderForm.items.map((line, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="font-mono text-[#fd761a] font-bold mr-2 bg-orange-50 px-2 py-0.5 rounded-lg text-[10px]">{line.quantity}x</span>
                    <span className="flex-1 truncate select-none text-left">{line.name}</span>
                    <span className="font-mono font-bold mr-3">रू {(line.price * line.quantity)}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveOrderItemLine(line.name)} 
                      className="text-red-500 hover:text-red-700 p-0.5"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {newOrderForm.items.length === 0 && (
                  <span className="text-[10px] text-gray-400 italic block text-center py-2">Add cuisines lines to populate receipt.</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[8px] font-mono text-gray-400 uppercase font-bold">Default Status Setup</label>
                <select
                  value={newOrderForm.status}
                  onChange={(e) => setNewOrderForm(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                >
                  <option value="new">NEW QUEUE</option>
                  <option value="preparing">COOKING STREAM</option>
                  <option value="ready">READY DISPATCH</option>
                  <option value="delivered">DELIVERED</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-mono text-gray-400 uppercase font-bold">Payment receipt state</label>
                <select
                  value={newOrderForm.payment_status}
                  onChange={(e) => setNewOrderForm(prev => ({ ...prev, payment_status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                >
                  <option value="pending">DUE BILLING</option>
                  <option value="paid">SETTLED PAID</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-[#fd761a] hover:bg-[#9d4300] text-white font-bold rounded-xl py-3 text-center uppercase tracking-wider text-xs shadow-md cursor-pointer"
              >
                Publish manual kitchen Order
              </button>
            </div>

          </form>
        </div>
      )}

      {/* 2. Upload asset overlay */}
      {showAddPhotoModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs z-[110] flex items-center justify-center p-4">
          <form onSubmit={handleAddPhotoSubmit} className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-6 space-y-4 text-left shadow-2xl relative animate-in fade-in duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h4 className="font-bold text-gray-900 text-sm uppercase">
                {editingPhotoId ? 'Edit photo description' : 'Add Gallery Visual Asset'}
              </h4>
              <button 
                type="button" 
                onClick={() => {
                  setShowAddPhotoModal(false);
                  setEditingPhotoId(null);
                  setNewPhotoForm({ url: '', caption: '', category: 'Food' });
                }} 
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4 cursor-pointer" />
              </button>
            </div>

            {/* Input Method Tabs */}
            {!editingPhotoId && (
              <div className="flex rounded-lg bg-gray-100 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setUploadTab('upload')}
                  className={`flex-1 py-1.5 rounded-md font-bold transition-all text-center ${
                    uploadTab === 'upload'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Files & Phone Camera
                </button>
                <button
                  type="button"
                  onClick={() => setUploadTab('url')}
                  className={`flex-1 py-1.5 rounded-md font-bold transition-all text-center ${
                    uploadTab === 'url'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Pasted Web Link
                </button>
              </div>
            )}

            <div className="space-y-3 text-xs font-semibold">
              {editingPhotoId || uploadTab === 'upload' ? (
                <div className="space-y-1">
                  <ImageUploader
                    label="Select or take a photo"
                    value={newPhotoForm.url}
                    onChange={(base64Url) => setNewPhotoForm(prev => ({ ...prev, url: base64Url }))}
                    onClear={() => setNewPhotoForm(prev => ({ ...prev, url: '' }))}
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-gray-400 uppercase font-bold">Asset image link (Secure https URL only) *</label>
                  <input 
                    type="url" 
                    required 
                    placeholder="https://images.unsplash.com/..."
                    value={newPhotoForm.url}
                    onChange={(e) => setNewPhotoForm(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              )}

              <div className="space-y-1 leading-normal">
                <label className="text-[8px] font-mono text-gray-400 uppercase font-bold">Gallery Category Class</label>
                <select
                  value={newPhotoForm.category || 'Food'}
                  onChange={(e) => setNewPhotoForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none"
                >
                  <option value="Interior">Interior / Venue</option>
                  <option value="Food">Food / Cuisines</option>
                  <option value="Drinks">Drinks & Cocktails</option>
                  <option value="Exterior">Exterior / Rooftop Patio</option>
                </select>
              </div>

              <div className="space-y-1 leading-normal">
                <label className="text-[8px] font-mono text-gray-400 uppercase font-bold">Caption title description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sutralounge Cozy booth details"
                  value={newPhotoForm.caption}
                  onChange={(e) => setNewPhotoForm(prev => ({ ...prev, caption: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!newPhotoForm.url}
                className="w-full bg-[#fd761a] hover:bg-[#9d4300] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3 uppercase tracking-wider text-[11px] shadow-md cursor-pointer text-center"
              >
                {editingPhotoId ? 'Update Image details' : 'Publish Image'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-left animate-in zoom-in-95 duration-150">
            <h4 className="font-bold text-gray-950 text-sm uppercase tracking-wider">
              {confirmDialog.title}
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed font-semibold">
              {confirmDialog.message}
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl py-2.5 text-xs uppercase tracking-wider cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await confirmDialog.onConfirm();
                  } finally {
                    setConfirmDialog(null);
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl py-2.5 text-xs uppercase tracking-wider cursor-pointer text-center"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
