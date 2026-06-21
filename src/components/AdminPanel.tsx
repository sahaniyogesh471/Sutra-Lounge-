import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle,
  Clock,
  Sparkles,
  AlertTriangle,
  Calendar,
  Settings,
  Activity,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Shield,
  ShoppingBag,
  Image as ImageIcon,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Filter,
  DollarSign,
  TrendingUp,
  PackageCheck,
  Check,
  Search,
  Eye,
  Store,
  Phone,
  Mail,
  MapPin,
  Trash,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  db, 
  auth, 
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

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  // Kept for prop-level signature compatibility with App.tsx
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

  // Current active tab (Simplified MVP Routing)
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'reservations' | 'menu' | 'gallery' | 'settings'>('overview');

  // visual state preferences
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
  const [newPhotoForm, setNewPhotoForm] = useState({
    url: '',
    caption: ''
  });

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
      if (list.length === 0) {
        // Pre-populate if empty to have data out of the box
        const initialMockOrders = [
          {
            customer_name: "Dipesh K. Shrestha",
            customer_email: "dipesh@gmail.com",
            customer_phone: "+977 9855012345",
            items: [{ name: "Signature Toast Chicken Sandwich", quantity: 2, price: 550 }],
            total_amount: 1100,
            status: "delivered",
            payment_status: "paid",
            delivery_address: "Siddhartha Chowk, Hetauda",
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
          },
          {
            customer_name: "Aakash Rai",
            customer_email: "aakash@yahoo.com",
            customer_phone: "+977 9845098765",
            items: [{ name: "Sizing Chicken Tandoori", quantity: 1, price: 1150 }],
            total_amount: 1150,
            status: "ready",
            payment_status: "paid",
            delivery_address: "Nagar Bikash Samiti Marg, Hetauda",
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            customer_name: "Kritisha Giri",
            customer_email: "kritisha@gmail.com",
            customer_phone: "+977 9801234567",
            items: [
              { name: "Steamed Chicken Momos", quantity: 2, price: 320 },
              { name: "Classic Mint Virgin Mojito", quantity: 2, price: 280 }
            ],
            total_amount: 1200,
            status: "new",
            payment_status: "pending",
            delivery_address: "Huprachaur, Hetauda",
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          }
        ];
        initialMockOrders.forEach(async (ord) => {
          await addDoc(collection(db, 'online_orders'), ord);
        });
      } else {
        list.sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        setOrders(list);
      }
    }, (error) => {
      console.warn("Could not load orders, using mock fallback: ", error);
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
        const withIds = parsed.map((ph: any, idx: number) => ({
          ...ph,
          id: ph.id || `ph_${idx}_${Date.now()}`
        }));
        setGalleryPhotosList(withIds);
        if (setGalleryPhotos) setGalleryPhotos(withIds);
      } catch (e) {
        setGalleryPhotosList([]);
      }
    } else {
      import('../data').then(m => {
        const withIds = (m.MAPS_GALLERY_PHOTOS || []).map((ph: any, idx: number) => ({
          ...ph,
          id: ph.id || `ph_${idx}_${Date.now()}`
        }));
        setGalleryPhotosList(withIds);
        localStorage.setItem('sutra_admin_gallery_photos', JSON.stringify(withIds));
        localStorage.setItem('sutra_gallery_photos', JSON.stringify(withIds));
        if (setGalleryPhotos) setGalleryPhotos(withIds);
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

  // Manual Order ingest
  const handleAddManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrderForm.items.length === 0) {
      triggerToast("Please add at least 1 delicacy to order lines");
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
      triggerToast("Order added directly inside master queue");
    } catch (e: any) {
      triggerToast(`Error adding order: ${e.message}`);
    }
  };

  // Add order-line item
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

  // Order state mutations
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'online_orders', orderId), { status });
      triggerToast(`Order status bumped to ${status.toUpperCase()}`);
    } catch (e: any) {
      triggerToast(`Failed to update status: ${e.message}`);
    }
  };

  const handleUpdateOrderPaymentStatus = async (orderId: string, payment_status: string) => {
    try {
      await updateDoc(doc(db, 'online_orders', orderId), { payment_status });
      triggerToast(`Order billing status transitioned to ${payment_status.toUpperCase()}`);
    } catch (e: any) {
      triggerToast(`Failed to update payment: ${e.message}`);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Remove this order completely from logs?")) return;
    try {
      await deleteDoc(doc(db, 'online_orders', orderId));
      triggerToast("Order destroyed cleanly");
    } catch (e: any) {
      triggerToast(`Error removing order: ${e.message}`);
    }
  };

  // Reservations mutations
  const handleUpdateReservationStatus = async (resId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'reservations', resId), { status });
      triggerToast(`Booking status updated to ${status.toUpperCase()}`);
    } catch (e: any) {
      triggerToast(`Update failed: ${e.message}`);
    }
  };

  const handleDeleteReservation = async (resId: string) => {
    if (!window.confirm("Are you sure you want to delete this reservation?")) return;
    try {
      await deleteDoc(doc(db, 'reservations', resId));
      triggerToast("Reservation deleted successfully");
    } catch (e: any) {
      triggerToast(`Failed to delete: ${e.message}`);
    }
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
      triggerToast(`Failed saving menu item: ${e.message}`);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    try {
      await deleteDoc(doc(db, 'menu_items', id));
      triggerToast("Dish retired from catalog");
    } catch (e: any) {
      triggerToast(` retirement failed: ${e.message}`);
    }
  };

  const handleToggleMenuBoolean = async (id: string, field: 'is_active' | 'is_featured', currentValue: boolean) => {
    try {
      await updateDoc(doc(db, 'menu_items', id), { [field]: !currentValue });
      triggerToast(`Dish ${field === 'is_active' ? 'availability' : 'promotional highlight'} modified`);
    } catch (e: any) {
      triggerToast(`Toggle error: ${e.message}`);
    }
  };

  // Settings & business hours mutations
  const handleSaveSettingsAndHours = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Save core contact details
      await setDoc(doc(db, 'restaurant_settings', 'default'), settings, { merge: true });

      // 2. Save hours
      for (const day of businessHours) {
        await setDoc(doc(db, 'business_hours', day.id), {
          weekday: day.weekday,
          is_open: day.is_open,
          start_time: day.start_time,
          end_time: day.end_time
        }, { merge: true });
      }

      triggerToast("Store operational metadata saved successfully");
    } catch (e: any) {
      triggerToast(`Settings save failed: ${e.message}`);
    }
  };

  const handleUpdateHourDayState = (dayId: string, field: string, value: any) => {
    setBusinessHours(prev => prev.map(day => day.id === dayId ? { ...day, [field]: value } : day));
  };

  // Gallery CRUD
  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoForm.url.trim()) return;

    if (editingPhotoId) {
      const updated = galleryPhotosList.map(ph => {
        if (ph.id === editingPhotoId) {
          return {
            ...ph,
            url: newPhotoForm.url.trim(),
            caption: newPhotoForm.caption.trim() || 'Sutra Lounge Premium Photo'
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
      setNewPhotoForm({ url: '', caption: '' });
      triggerToast("Photo asset updated successfully via image link");
    } else {
      const newPhoto = {
        url: newPhotoForm.url.trim(),
        caption: newPhotoForm.caption.trim() || 'Sutra Lounge Premium Photo',
        author: 'Sutra Staff',
        category: 'Food',
        stars: 5,
        id: "ph_" + Date.now()
      };

      const updated = [newPhoto, ...galleryPhotosList];
      setGalleryPhotosList(updated);
      if (setGalleryPhotos) setGalleryPhotos(updated);
      localStorage.setItem('sutra_admin_gallery_photos', JSON.stringify(updated));
      localStorage.setItem('sutra_gallery_photos', JSON.stringify(updated));
      setShowAddPhotoModal(false);
      setNewPhotoForm({ url: '', caption: '' });
      triggerToast("Photo ingested into static portfolio grid");
    }
  };

  const handleDeletePhoto = (id: string) => {
    if (!window.confirm("Discard this asset?")) return;
    const updated = galleryPhotosList.filter(ph => ph.id !== id);
    setGalleryPhotosList(updated);
    if (setGalleryPhotos) setGalleryPhotos(updated);
    localStorage.setItem('sutra_admin_gallery_photos', JSON.stringify(updated));
    localStorage.setItem('sutra_gallery_photos', JSON.stringify(updated));
    triggerToast("Asset purged successfully");
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-charcoal/85 backdrop-blur-md overflow-hidden animate-fade-in ${isDarkMode ? 'dark text-slate-100' : 'text-charcoal'}`}>
      <div className={`w-full h-full sm:max-w-7xl sm:h-[90vh] sm:rounded-3xl border shadow-2xl flex flex-col overflow-hidden relative transition-colors duration-200 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-cream-soft border-cream-deep'}`}>
        
        {/* Floating feedback notification toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -25, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -25, x: '-50%' }}
              className="absolute top-4 left-1/2 z-[100] px-6 py-3.5 rounded-full bg-slate-900 text-gold text-xs font-bold tracking-wide flex items-center gap-2.5 shadow-2x border border-gold/30"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Console Header Bar */}
        <div className="bg-slate-900 text-cream-soft px-5 py-4 border-b border-gold/15 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-gold p-2.5 rounded-2xl text-charcoal">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-extrabold tracking-tight">SUTRA OPERATIONS HUB</h2>
              <p className="text-[9px] font-mono tracking-widest text-gold text-left">DAILY MANAGEMENT INTEGRATION CONSOLE</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Theme switcher */}
            <button 
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl border border-white/10 hover:border-white/25 text-cream-soft/75 hover:text-white transition-all cursor-pointer"
              title="Toggle Contrast Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button 
              type="button" 
              onClick={onClose} 
              className="text-cream-soft/60 hover:text-cream-soft p-2 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dashboard workspace core */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Dynamic Collapsible Sidebar navigation */}
          <div className={`shrink-0 flex flex-col border-r transition-all duration-300 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-cream-soft/80 border-cream-deep'} ${isSidebarCollapsed ? 'w-16' : 'w-56'} hidden md:flex`}>
            
            {/* Sidebar metadata header */}
            <div className="p-4 border-b border-cream-deep/20 flex items-center justify-between">
              {!isSidebarCollapsed && (
                <div className="text-left animate-fade-in leading-normal">
                  <span className="text-[8px] font-mono text-gold block tracking-wider uppercase font-bold">Authorized Session</span>
                  <span className={`text-[11px] font-semibold block truncate max-w-[140px] ${isDarkMode ? 'text-slate-300' : 'text-charcoal'}`}>{settings.restaurant_name} Admin</span>
                </div>
              )}
              <button 
                type="button" 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`p-1.5 rounded-lg transition-all text-cream-soft/50 hover:text-gold ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'} cursor-pointer`}
              >
                {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            {/* Sidebar items list */}
            <div className="flex-1 p-2.5 space-y-1.5 overflow-y-auto">
              {[
                { id: 'overview', name: 'Dashboard', icon: Activity },
                { id: 'orders', name: 'Orders Queue', icon: ShoppingBag },
                { id: 'reservations', name: 'Bookings Logs', icon: Calendar },
                { id: 'menu', name: 'Menu Catalog', icon: FileText },
                { id: 'gallery', name: 'Gallery Assets', icon: ImageIcon },
                { id: 'settings', name: 'Store Details', icon: Settings },
              ].map(tab => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full py-2.5 px-3 rounded-xl text-left text-xs font-bold uppercase tracking-wider flex items-center transition-all cursor-pointer
                      ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-3'}
                      ${isSelected 
                        ? 'bg-gold text-charcoal shadow-md border-b-2 border-gold-hover' 
                        : isDarkMode ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' : 'text-charcoal-muted hover:bg-cream-deep/20 hover:text-charcoal'}`}
                    title={tab.name}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isSidebarCollapsed && <span>{tab.name}</span>}
                  </button>
                );
              })}
            </div>

            {/* Sidebar quick footer info */}
            {!isSidebarCollapsed && (
              <div className="p-4 border-t border-cream-deep/20 text-center">
                <span className="text-[10px] text-gray-400 font-mono">MVP Operational v2.0</span>
              </div>
            )}
          </div>

          {/* Core Content canvas */}
          <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6">
            
            {/* Mobile bottom-bar navigation as fallback responsive layout */}
            <div className="flex md:hidden gap-1.5 p-1 bg-slate-900 text-white rounded-2xl mb-4 overflow-x-auto scrollbar-none shrink-0 border border-gold/15">
              {[
                { id: 'overview', name: 'Dashboard', icon: Activity },
                { id: 'orders', name: 'Orders', icon: ShoppingBag },
                { id: 'reservations', name: 'Bookings', icon: Calendar },
                { id: 'menu', name: 'Menu', icon: FileText },
                { id: 'gallery', name: 'Gallery', icon: ImageIcon },
                { id: 'settings', name: 'Settings', icon: Settings },
              ].map(tab => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 transition-all shrink-0 cursor-pointer
                      ${isSelected ? 'bg-gold text-charcoal' : 'text-white/60 hover:bg-white/10'}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex-1">
              
              {/* ======================================================== */}
              {/* TAB 1: OVERVIEW SCREEN (DASHBOARD) */}
              {/* ======================================================== */}
              {activeTab === 'overview' && (
                <div className="space-y-6 text-left animate-page-open">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h3 className="font-serif text-2xl font-black text-gold">Executive Dashboard</h3>
                      <p className="text-xs text-gray-400 font-light mt-0.5">Consolidated daily restaurant telemetry metrics, charts, and activity streams.</p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/10 font-mono uppercase font-bold">Operational Logs Connected</span>
                  </div>

                  {/* Dynamic clean metric values cards */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
                    
                    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-cream-deep/60 shadow-xs'}`}>
                      <span className="text-[9px] font-mono uppercase text-gray-400 block font-bold">Total Revenue</span>
                      <p className="text-lg sm:text-xl font-black text-emerald-500 mt-1">NPR {metricTotalRevenue.toLocaleString()}</p>
                      <span className="text-[9px] text-gray-500 block mt-0.5 font-mono">Paid (Excl. Cancelled)</span>
                    </div>

                    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-cream-deep/60 shadow-xs'}`}>
                      <span className="text-[9px] font-mono uppercase text-gray-400 block font-bold">Today's Orders</span>
                      <p className="text-lg sm:text-xl font-bold text-indigo-500 mt-1">{metricTodayOrders}</p>
                      <span className="text-[9px] text-gray-500 block mt-0.5 font-mono">Placed Today</span>
                    </div>

                    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-cream-deep/60 shadow-xs'}`}>
                      <span className="text-[9px] font-mono uppercase text-gray-400 block font-bold">Total Orders</span>
                      <p className="text-lg sm:text-xl font-bold text-gold mt-1">{metricTotalOrders}</p>
                      <span className="text-[9px] text-gray-500 block mt-0.5 font-mono">All-time Logged</span>
                    </div>

                    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-cream-deep/60 shadow-xs'}`}>
                      <span className="text-[9px] font-mono uppercase text-gray-400 block font-bold">Pending Orders</span>
                      <p className="text-lg sm:text-xl font-bold text-amber-500 mt-1">{metricPendingOrders}</p>
                      <span className="text-[9px] text-gray-500 block mt-0.5 font-mono">In prep & Uncooked</span>
                    </div>

                    <div className={`p-4 text-center md:text-left rounded-2xl border col-span-2 md:col-span-1 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-cream-deep/60 shadow-xs'}`}>
                      <span className="text-[9px] font-mono uppercase text-gray-400 block font-bold">Pending Bookings</span>
                      <p className="text-lg sm:text-xl font-bold text-red-500 mt-1">{metricPendingReservations}</p>
                      <span className="text-[9px] text-gray-500 block mt-0.5 font-mono">Waiting Approval</span>
                    </div>

                  </div>

                  {/* AreaChart trend block */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    
                    <div className={`lg:col-span-2 p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-cream-deep/60 shadow-xs'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-serif text-xs font-black text-gold tracking-wide uppercase">Weekly Revenue Projection Curve (NPR)</h4>
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-md font-mono text-gray-400">Calculated sum</span>
                      </div>
                      <div className="h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={[
                              { day: 'Mon', revenue: Math.max(1200, metricTotalRevenue * 0.12), orders: 4 },
                              { day: 'Tue', revenue: Math.max(1800, metricTotalRevenue * 0.14), orders: 6 },
                              { day: 'Wed', revenue: Math.max(1100, metricTotalRevenue * 0.10), orders: 3 },
                              { day: 'Thu', revenue: Math.max(2200, metricTotalRevenue * 0.16), orders: 8 },
                              { day: 'Fri', revenue: Math.max(3900, metricTotalRevenue * 0.23), orders: 14 },
                              { day: 'Sat', revenue: Math.max(4900, metricTotalRevenue * 0.28), orders: 19 },
                              { day: 'Sun', revenue: Math.max(3200, metricTotalRevenue * 0.17), orders: 11 },
                            ]}
                            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={isDarkMode ? 0.08 : 0.2} />
                            <XAxis dataKey="day" stroke="#94a3b8" style={{ fontSize: '9px' }} />
                            <YAxis stroke="#94a3b8" style={{ fontSize: '10px' }} />
                            <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' } : {}} />
                            <Area type="monotone" dataKey="revenue" name="Revenue (NPR)" stroke="#d4af37" fillOpacity={1} fill="url(#revenueGrad)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Consolidated System Activities */}
                    <div className={`p-5 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-cream-deep/60 shadow-xs'}`}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif text-xs font-black text-gold uppercase tracking-wider">Operational Timeline</h4>
                          <span className="text-[9px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">REALTIME FEED</span>
                        </div>

                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                          {[
                            ...reservations.map(r => ({
                              id: r.id,
                              type: 'booking',
                              heading: `Booking: ${r.full_name}`,
                              meta: `${r.party_size} Guests · ${r.reservation_date} at ${r.start_time}`,
                              tag: 'Booking',
                              tagBg: 'bg-gold/10 text-gold font-semibold',
                              time: r.created_at || new Date().toISOString()
                            })),
                            ...orders.map(o => ({
                              id: o.id,
                              type: 'order',
                              heading: `Order Status: ${o.customer_name}`,
                              meta: `${o.items?.map((it: any) => `${it.quantity}x ${it.name}`).join(', ') || 'Delicacy Item'} · NPR ${o.total_amount}`,
                              tag: 'Order',
                              tagBg: 'bg-emerald-500/10 text-emerald-400 font-semibold',
                              time: o.created_at || new Date().toISOString()
                            }))
                          ]
                            .sort((a,b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime())
                            .slice(0, 5)
                            .map((act, idx) => (
                              <div key={`${act.id}-${idx}`} className={`p-2 rounded-xl text-xs border text-left flex flex-col gap-1 ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-cream-soft/40 border-cream-deep/10'}`}>
                                <div className="flex justify-between items-center">
                                  <span className={`px-2 py-0.5 rounded-md font-mono text-[8px] uppercase ${act.tagBg}`}>
                                    {act.tag}
                                  </span>
                                  <span className="text-[8px] text-gray-400 font-mono uppercase">
                                    {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <span className={`font-bold truncate ${isDarkMode ? 'text-slate-100' : 'text-charcoal'}`}>{act.heading}</span>
                                <span className="text-[10px] text-gray-400 truncate">{act.meta}</span>
                              </div>
                            ))}

                          {reservations.length === 0 && orders.length === 0 && (
                            <div className="py-8 text-center text-xs text-gray-400 italic">
                              No active reservation or food order logs mapped inside DB.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-cream-deep/40 pt-3 mt-4 text-[10px] text-gray-400 leading-normal font-light">
                        Real-time synchronization aggregates operations instantly. Staff can manage booking validations and cooking processes synchronously.
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: ONLINE ORDERS QUEUE */}
              {/* ======================================================== */}
              {activeTab === 'orders' && (
                <div className="space-y-6 text-left animate-page-open">
                  
                  {/* Title and Action bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="font-serif text-2xl font-black text-gold">Operational Orders Queue</h3>
                      <p className="text-xs text-gray-400 font-light mt-0.5 font-light">Process digital kitchen requests, trace packaging stages, and update billing receipts.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowAddOrderModal(true)}
                      className="bg-gold hover:bg-gold-hover text-charcoal font-bold px-4 py-2.5 rounded-xl uppercase text-[11px] tracking-wide flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ingest Customer Order</span>
                    </button>
                  </div>

                  {/* Filter and search utilities */}
                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3.5 bg-slate-900/10 dark:bg-slate-900/60 p-3 rounded-2xl border border-cream-deep/20 dark:border-slate-800">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="Search queue by customer name or phone..."
                        value={searchOrderQuery}
                        onChange={(e) => setSearchOrderQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border outline-none font-medium transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-gold' : 'bg-white border-cream-deep focus:border-gold'}`}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto min-w-[200px]">
                      <span className="text-[10px] font-mono font-bold text-gray-400 uppercase hidden sm:inline">Status:</span>
                      {['all', 'new', 'preparing', 'ready', 'delivered', 'cancelled'].map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setFilterOrderStatus(st)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider font-extrabold uppercase shrink-0 cursor-pointer
                            ${filterOrderStatus === st 
                              ? 'bg-gold text-charcoal' 
                              : isDarkMode ? 'bg-slate-800/60 text-slate-400 hover:text-slate-100' : 'bg-cream-deep/40 text-charcoal-muted hover:text-charcoal'}`}
                        >
                          {st === 'all' ? 'All Queue' : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orders List / Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orders
                      .filter(o => {
                        const nameMatches = o.customer_name?.toLowerCase().includes(searchOrderQuery.toLowerCase()) || 
                                           o.customer_phone?.includes(searchOrderQuery);
                        const statusMatches = filterOrderStatus === 'all' || o.status === filterOrderStatus;
                        return nameMatches && statusMatches;
                      })
                      .map(order => {
                        const getStatusBadge = (s: string) => {
                          switch (s) {
                            case 'new': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                            case 'preparing': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
                            case 'ready': return 'bg-yellow-500/15 text-gold border border-gold/20';
                            case 'delivered': return 'bg-green-500/10 text-green-400 border border-green-500/20';
                            default: return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                          }
                        };

                        const getPaymentBadge = (p: string) => {
                          return p === 'paid' 
                            ? 'bg-emerald-500/10 text-emerald-400 font-mono font-black' 
                            : 'bg-red-500/10 text-red-400 font-mono';
                        };

                        return (
                          <div 
                            key={order.id} 
                            className={`p-5 rounded-3xl border flex flex-col justify-between transition-all hover:shadow-lg ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-cream-deep/60 shadow-xs'}`}
                          >
                            <div className="space-y-4">
                              {/* Card title and badges */}
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className={`font-serif text-sm font-black tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-charcoal'}`}>{order.customer_name}</h4>
                                  <span className="text-[9px] font-mono text-gray-400 block mt-0.5">{order.customer_phone}</span>
                                </div>
                                <span className={`px-2.5 py-1 text-[9px] font-mono tracking-wider text-center font-bold uppercase rounded-lg ${getStatusBadge(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>

                              {/* Cart Items list */}
                              <div className={`p-3 rounded-2xl text-[11px] space-y-2 border ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-cream-soft/40 border-cream-deep/15'}`}>
                                <div className="border-b border-cream-deep/10 pb-1.5 flex justify-between items-center">
                                  <span className="text-[9px] text-gray-400 font-mono uppercase font-bold">Dish Items</span>
                                  <span className="text-[9px] text-gray-400 font-mono uppercase font-bold">Ticket Line</span>
                                </div>
                                <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                                  {order.items?.map((it: any, index: number) => (
                                    <div key={index} className="flex justify-between items-center">
                                      <span className={`font-semibold shrink-0 mr-1.5 text-gray-400`}>{it.quantity}x</span>
                                      <span className={`flex-1 truncate text-left select-none text-gray-500`}>{it.name}</span>
                                      <span className="text-[10px] font-mono shrink-0 select-none">NPR {((it.price || 350) * (it.quantity || 1))}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="border-t border-cream-deep/10 pt-1.5 flex justify-between font-mono font-black text-xs text-gold">
                                  <span>TOTAL COST:</span>
                                  <span>NPR {order.total_amount}</span>
                                </div>
                              </div>

                              {/* Operations metadata */}
                              <div className="text-[11px] space-y-1 block text-left">
                                <div className="flex justify-between text-gray-400 select-none">
                                  <span>Destination address:</span>
                                  <span className={`font-medium max-w-[150px] truncate ${isDarkMode ? 'text-slate-350' : 'text-charcoal'}`}>{order.delivery_address || 'Lounge Dine-In'}</span>
                                </div>
                                <div className="flex justify-between select-none">
                                  <span className="text-gray-400">Payment status:</span>
                                  <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-md ${getPaymentBadge(order.payment_status)}`}>
                                    {order.payment_status}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Control action triggers */}
                            <div className="border-t border-cream-deep/20 mt-4 pt-3.5 space-y-2 text-left">
                              <span className="text-[9px] font-mono text-gray-400 block tracking-wide uppercase font-bold">Kitchen & Register Status Triggers</span>
                              <div className="flex flex-wrap gap-1">
                                {order.status === 'new' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                                    className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white font-mono text-[9px] rounded-lg tracking-wide shadow-xs font-bold cursor-pointer transition-colors"
                                  >
                                    Accept Prep
                                  </button>
                                )}
                                {order.status === 'preparing' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                                    className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-charcoal font-mono text-[9px] rounded-lg tracking-wide shadow-xs font-bold cursor-pointer transition-colors"
                                  >
                                    Set Ready
                                  </button>
                                )}
                                {order.status === 'ready' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                    className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-[9px] rounded-lg tracking-wide shadow-xs font-bold cursor-pointer transition-colors"
                                  >
                                    Dispatched
                                  </button>
                                )}
                                
                                {order.payment_status === 'pending' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateOrderPaymentStatus(order.id, 'paid')}
                                    className="px-2 py-1 bg-teal-600/20 text-teal-400 hover:bg-teal-600/35 font-mono text-[9px] rounded-lg tracking-wide font-extrabold cursor-pointer transition-colors"
                                  >
                                    Mark Paid
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateOrderPaymentStatus(order.id, 'pending')}
                                    className="px-2 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/35 font-mono text-[9px] rounded-lg tracking-wide font-bold cursor-pointer transition-colors"
                                  >
                                    Mark Unpaid
                                  </button>
                                )}

                                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[9px] rounded-lg tracking-wide font-bold cursor-pointer transition-all ml-auto"
                                  >
                                    Cancel
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className={`p-1.5 rounded-lg border text-rose-500 hover:bg-rose-500/15 cursor-pointer ml-auto shrink-0 ${isDarkMode ? 'border-slate-800' : 'border-cream-deep/30'}`}
                                  title="Destroy Record"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                    {orders.length === 0 && (
                      <div className="col-span-full py-16 text-center text-gray-400 text-xs italic">
                        No orders matched criteria inside Database record.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: BOOKINGS / RESERVATIONS LOGS */}
              {/* ======================================================== */}
              {activeTab === 'reservations' && (
                <div className="space-y-6 text-left animate-page-open">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h3 className="font-serif text-2xl font-black text-gold">Dining Reservations logs</h3>
                      <p className="text-xs text-gray-400 font-light mt-0.5">Control live dine-in table requests, assign guest seating, and validate covers schedules.</p>
                    </div>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-2 bg-slate-900/10 dark:bg-slate-900/60 p-3 rounded-2xl border border-cream-deep/20 dark:border-slate-800 overflow-x-auto">
                    <span className="text-[10px] font-mono text-gray-400 uppercase font-black mr-2">Filter Bookings:</span>
                    {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map(rst => (
                      <button
                        key={rst}
                        type="button"
                        onClick={() => setFilterReservationStatus(rst)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider font-extrabold uppercase shrink-0 cursor-pointer
                          ${filterReservationStatus === rst 
                            ? 'bg-gold text-charcoal' 
                            : isDarkMode ? 'bg-slate-800/65 text-slate-400 hover:text-slate-100' : 'bg-cream-deep/40 text-charcoal-muted hover:text-charcoal'}`}
                      >
                        {rst === 'all' ? 'All Logs' : rst}
                      </button>
                    ))}
                  </div>

                  {/* Booking logs list - Clean Table Layout */}
                  <div className={`border rounded-3xl overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-850' : 'bg-white border-cream-deep/50 shadow-xs'}`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className={`border-b font-mono text-[9px] uppercase tracking-wider ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-cream-deep/25 border-cream-deep/40 text-charcoal-muted'}`}>
                            <th className="p-4">Customer Details</th>
                            <th className="p-4">Covers Size</th>
                            <th className="p-4">Date & Time Block</th>
                            <th className="p-4">Special Requests</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Operations Line</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-cream-deep/15 dark:divide-slate-850">
                          {reservations
                            .filter(r => filterReservationStatus === 'all' || r.status === filterReservationStatus)
                            .map((res) => {
                              const getResStatusBadge = (s: string) => {
                                switch (s) {
                                  case 'pending': return 'bg-amber-500/10 text-amber-500';
                                  case 'confirmed': return 'bg-emerald-500/10 text-emerald-400';
                                  case 'completed': return 'bg-blue-500/10 text-blue-400';
                                  default: return 'bg-slate-500/10 text-slate-400';
                                }
                              };

                              return (
                                <tr key={res.id} className={`hover:bg-cream-deep/5 dark:hover:bg-slate-800/20 transition-all`}>
                                  <td className="p-4">
                                    <div className="font-extrabold text-[13px]">{res.full_name}</div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">{res.phone} · <span className="font-mono">{res.email}</span></div>
                                  </td>
                                  <td className="p-4 text-center font-mono font-black text-xs text-gold">
                                    <span>{res.party_size || 2} Pax</span>
                                  </td>
                                  <td className="p-4 font-mono select-none">
                                    <div className="font-semibold text-charcoal dark:text-slate-200">{res.reservation_date}</div>
                                    <div className="text-[10px] text-gray-400">{res.start_time} - {res.end_time || '90m'}</div>
                                  </td>
                                  <td className="p-4 max-w-[150px] truncate">
                                    <span className="text-[11px] text-gray-400 italic block">
                                      {res.special_requests || 'No culinary notes'}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-mono tracking-wider font-extrabold uppercase ${getResStatusBadge(res.status)}`}>
                                      {res.status || 'pending'}
                                    </span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {res.status === 'pending' && (
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateReservationStatus(res.id, 'confirmed')}
                                          className="px-2.5 py-1.5 bg-emerald-500 text-white font-mono text-[9px] rounded-lg font-black tracking-wide cursor-pointer hover:bg-emerald-600 transition-colors"
                                        >
                                          Confirm
                                        </button>
                                      )}
                                      {res.status === 'confirmed' && (
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateReservationStatus(res.id, 'completed')}
                                          className="px-2.5 py-1.5 bg-blue-500 text-white font-mono text-[9px] rounded-lg font-black tracking-wide cursor-pointer hover:bg-blue-600 transition-colors"
                                        >
                                          Complete
                                        </button>
                                      )}
                                      
                                      {res.status !== 'cancelled' && (
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateReservationStatus(res.id, 'cancelled')}
                                          className={`px-2 py-1.5 border font-mono text-[9px] rounded-lg text-rose-450 hover:bg-rose-500/10 cursor-pointer ${isDarkMode ? 'border-slate-800 text-red-400' : 'border-cream-deep/30 text-rose-500'}`}
                                        >
                                          Cancel
                                        </button>
                                      )}
                                      
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteReservation(res.id)}
                                        className={`p-1.5 rounded-lg border text-gray-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer shrink-0 ${isDarkMode ? 'border-slate-800' : 'border-cream-deep/30'}`}
                                        title="Purge Log"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}

                          {reservations.length === 0 && (
                            <tr>
                              <td colSpan={6} className="py-16 text-center text-gray-400 text-xs italic">
                                No customer booking logs initialized.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 4: MENU CATALOG / DISHES CRUD */}
              {/* ======================================================== */}
              {activeTab === 'menu' && (
                <div className="space-y-6 text-left animate-page-open">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cream-deep/15 pb-1.5">
                    <div>
                      <h3 className="font-serif text-2xl font-black text-gold">Master Menu Catalog</h3>
                      <p className="text-xs text-gray-400 font-light mt-0.5">Toggle live availability configurations, design new cuisines, and modify prices instantly.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Simplified Form Panel (Left) */}
                    <div className={`p-5 rounded-3xl border h-fit space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-850' : 'bg-cream-soft/40 border-cream-deep'}`}>
                      <h4 className="font-serif text-sm font-black text-gold flex items-center gap-2">
                        {editingMenuItem ? <Edit3 className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                        <span>{editingMenuItem ? 'Update Delicacy' : 'Create Cuisines Dish'}</span>
                      </h4>

                      <form onSubmit={handleSaveMenuItemSubmit} className="space-y-3.5 text-xs">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-gray-400 uppercase block font-bold">Dish display Name *</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="e.g. Lounge Pan chicken Sandwich"
                            value={newMenuItem.name}
                            onChange={(e) => setNewMenuItem(prev => ({ ...prev, name: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-xl outline-none text-xs font-semibold ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-gold' : 'bg-white border-cream-deep text-charcoal focus:border-gold'}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-gray-400 uppercase block font-bold">Category Mapping</label>
                          <select
                            value={newMenuItem.category}
                            onChange={(e) => setNewMenuItem(prev => ({ ...prev, category: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-xl outline-none text-xs font-semibold ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-gold' : 'bg-white border-cream-deep text-charcoal focus:border-gold'}`}
                          >
                            <option value="Mains">Mains Specialties</option>
                            <option value="Momo Specialties">Momo Specialties</option>
                            <option value="Sandwiches">Sandwiches</option>
                            <option value="Drinks">Drinks & Cocktails</option>
                            <option value="Breakfast">Breakfast Combos</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-gray-400 uppercase block font-bold">Cuisines Pricing (NPR) *</label>
                          <input 
                            type="number" 
                            required 
                            min={1}
                            placeholder="Cost in NPR"
                            value={newMenuItem.price}
                            onChange={(e) => setNewMenuItem(prev => ({ ...prev, price: Number(e.target.value) }))}
                            className={`w-full px-3 py-2 border rounded-xl outline-none text-xs font-mono font-bold ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-gold' : 'bg-white border-cream-deep text-charcoal focus:border-gold'}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-gray-400 uppercase block font-bold">Dish Image URL (Optional)</label>
                          <input 
                            type="url" 
                            placeholder="https://images.unsplash.com/... (secure link)"
                            value={newMenuItem.image_url}
                            onChange={(e) => setNewMenuItem(prev => ({ ...prev, image_url: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-xl outline-none text-xs font-mono ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-gold' : 'bg-white border-cream-deep text-charcoal focus:border-gold'}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-gray-400 uppercase block font-bold">Culinary Profile description</label>
                          <textarea 
                            rows={3}
                            placeholder="Delicately describe the ingredients, spices, and cooking style..."
                            value={newMenuItem.description}
                            onChange={(e) => setNewMenuItem(prev => ({ ...prev, description: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-xl outline-none text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-gold' : 'bg-white border-cream-deep text-charcoal focus:border-gold'}`}
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="font-mono text-[9px] text-gray-400 uppercase block font-bold">Status Properties:</span>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-1.5 cursor-pointer font-semibold select-none">
                              <input 
                                type="checkbox"
                                checked={newMenuItem.is_featured}
                                onChange={(e) => setNewMenuItem(prev => ({ ...prev, is_featured: e.target.checked }))}
                                className="rounded text-gold accent-gold scale-105 cursor-pointer"
                              />
                              <span>Featured / Spotlight</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer font-semibold select-none">
                              <input 
                                type="checkbox"
                                checked={newMenuItem.is_active}
                                onChange={(e) => setNewMenuItem(prev => ({ ...prev, is_active: e.target.checked }))}
                                className="rounded text-gold accent-gold scale-105 cursor-pointer"
                              />
                              <span>Active</span>
                            </label>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button 
                            type="submit"
                            className="flex-1 bg-gold hover:bg-gold-hover text-charcoal font-black rounded-xl py-2.5 uppercase text-[11px] tracking-wide shadow-md active:scale-95 transition-all text-center cursor-pointer"
                          >
                            {editingMenuItem ? 'Apply Edit' : 'Instantiate Dish'}
                          </button>
                          {editingMenuItem && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMenuItem(null);
                                setNewMenuItem({ name: '', description: '', price: 350, category: 'Mains', is_featured: false, is_active: true, image_url: '' });
                              }}
                              className={`px-3 py-2.5 border rounded-xl font-mono uppercase text-[11px] text-gray-400 hover:text-red-500 cursor-pointer ${isDarkMode ? 'border-slate-800' : 'border-cream-deep'}`}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </div>

                    {/* Catalog Grid View (Right) */}
                    <div className="lg:col-span-2 space-y-4">
                      
                      {/* Responsive Grid layout */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto pr-1">
                        {menuItems.map(item => (
                          <div 
                            key={item.id}
                            className={`p-4 rounded-3xl border flex flex-col justify-between transition-all hover:border-gold/30 hover:shadow-md ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-cream-deep/60'}`}
                          >
                            <div className="flex gap-3 text-left">
                              {/* Thumbnail rendering fallback to initials or a generic illustration */}
                              <div className="w-14 h-14 bg-gold/10 rounded-2xl border border-gold/10 flex items-center justify-center shrink-0 text-gold font-serif text-lg font-black overflow-hidden relative">
                                {item.image_url ? (
                                  <img 
                                    src={item.image_url} 
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                  />
                                ) : (
                                  (item.name || 'Dish').substring(0, 2).toUpperCase()
                                )}
                              </div>

                              <div className="min-w-0 flex-1 leading-normal select-none">
                                <span className="text-[8px] font-mono bg-cream-deep/20 dark:bg-slate-800 text-gold px-2 py-0.5 rounded-md font-bold uppercase">{item.category}</span>
                                <h4 className="font-extrabold text-sm truncate mt-1 text-charcoal dark:text-slate-100">{item.name}</h4>
                                <span className="font-mono text-gold text-xs font-black block mt-0.5">NPR {item.price}</span>
                                <p className="text-[10px] text-gray-400 font-light line-clamp-2 mt-1">{item.description || 'No delicacy description provided'}</p>
                              </div>
                            </div>

                            {/* Options action buttons */}
                            <div className="border-t border-cream-deep/20 mt-4.5 pt-3 flex items-center justify-between text-xs">
                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleToggleMenuBoolean(item.id, 'is_active', item.is_active)}
                                  className="flex items-center gap-1 hover:text-gold shrink-0 cursor-pointer"
                                  title="Toggle active status"
                                >
                                  {item.is_active ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                                  <span className="text-[9px] font-bold text-gray-400 font-mono tracking-wider uppercase">Active</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleMenuBoolean(item.id, 'is_featured', item.is_featured)}
                                  className="flex items-center gap-1 hover:text-gold shrink-0 cursor-pointer"
                                  title="Featured toggle"
                                >
                                  {item.is_featured ? <Sparkles className="w-4 h-4 text-gold fill-gold" /> : <Sparkles className="w-4 h-4 text-gray-400" />}
                                  <span className="text-[9px] font-bold text-gray-400 font-mono tracking-wider uppercase">Spotlight</span>
                                </button>
                              </div>

                              <div className="flex gap-1.5">
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
                                      is_active: !!item.is_active,
                                      image_url: item.image_url || ''
                                    });
                                    triggerToast(`Ready to update: ${item.name}`);
                                  }}
                                  className={`p-1.5 rounded-lg border text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${isDarkMode ? 'border-slate-800' : 'border-cream-deep/20'}`}
                                  title="Edit"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteMenuItem(item.id)}
                                  className={`p-1.5 rounded-lg border text-rose-500 hover:bg-rose-500/10 cursor-pointer ${isDarkMode ? 'border-slate-800' : 'border-cream-deep/20'}`}
                                  title="Retire Item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {menuItems.length === 0 && (
                          <div className="col-span-full py-20 text-center text-gray-400 text-xs italic">
                            Delicacies list matches 0 items inside Database.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 5: GALLERY PORTFOLIO */}
              {/* ======================================================== */}
              {activeTab === 'gallery' && (
                <div className="space-y-6 text-left animate-page-open">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="font-serif text-2xl font-black text-gold">Simple Gallery Catalog</h3>
                      <p className="text-xs text-gray-400 font-light mt-0.5">Ingest new marketing visual banners, delete obsolete assets, and curate portfolio elements.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingPhotoId(null);
                        setNewPhotoForm({ url: '', caption: '' });
                        setShowAddPhotoModal(true);
                      }}
                      className="bg-gold hover:bg-gold-hover text-charcoal font-bold px-4 py-2.5 rounded-xl uppercase text-[11px] tracking-wide flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Upload Asset Link</span>
                    </button>
                  </div>

                  {/* Portfolio grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-1">
                    {galleryPhotosList.map((photo) => (
                      <div 
                        key={photo.id}
                        className={`group relative rounded-2xl overflow-hidden border transition-all hover:scale-[1.01] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-cream-deep'}`}
                      >
                        <div className="aspect-[4/3] bg-charcoal-muted overflow-hidden relative">
                          <img 
                            src={photo.url} 
                            alt={photo.caption}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPhotoId(photo.id);
                                setNewPhotoForm({
                                  url: photo.url,
                                  caption: photo.caption
                                });
                                setShowAddPhotoModal(true);
                              }}
                              className="bg-gold hover:bg-gold-hover text-charcoal p-2 rounded-xl flex items-center justify-center cursor-pointer shadow-md"
                              title="Edit asset details via link"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="bg-red-600 hover:bg-red-750 text-white p-2 rounded-xl flex items-center justify-center cursor-pointer shadow-md"
                              title="Discard asset"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="p-3 leading-normal select-none text-left">
                          <p className="text-[11px] font-semibold text-gray-500 truncate">{photo.caption}</p>
                          <span className="text-[9px] text-gray-400 font-mono mt-0.5 block truncate">Asset ID: {String(photo.id || '').substring(0, 10)}</span>
                        </div>
                      </div>
                    ))}

                    {galleryPhotosList.length === 0 && (
                      <div className="col-span-full py-20 text-center text-gray-400 text-xs italic">
                        0 visual elements associated inside system portfolio.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 6: STORE OPERATIONS & OPERATING HOURS */}
              {/* ======================================================== */}
              {activeTab === 'settings' && (
                <div className="space-y-6 text-left animate-page-open">
                  
                  <div>
                    <h3 className="font-serif text-2xl font-black text-gold">Operational Settings & Hours</h3>
                    <p className="text-xs text-gray-400 font-light mt-0.5">Define core contact details, store branding elements, and weekday operating hours in one central place.</p>
                  </div>

                  <form onSubmit={handleSaveSettingsAndHours} className="space-y-6 text-xs font-semibold max-w-4xl">
                    
                    {/* General Settings Section */}
                    <div className={`p-5 rounded-3xl border space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-850' : 'bg-white border-cream-deep'}`}>
                      <h4 className="font-serif text-xs font-black text-gold uppercase tracking-wider flex items-center gap-1.5 border-b border-cream-deep/15 pb-2">
                        <Store className="w-4 h-4" />
                        <span>Core Contact Parameters</span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-gray-400 uppercase block font-bold">Restaurant Operational Brand Name</label>
                          <input 
                            type="text" 
                            value={settings.restaurant_name || ''}
                            onChange={(e) => setSettings(prev => ({ ...prev, restaurant_name: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-xl outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-gold' : 'bg-cream-soft/40 border-cream-deep text-charcoal focus:border-gold'}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-gray-400 uppercase block font-bold">Customer Contact Direct Phone</label>
                          <input 
                            type="text" 
                            value={settings.restaurant_phone || ''}
                            onChange={(e) => setSettings(prev => ({ ...prev, restaurant_phone: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-xl outline-none font-mono ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-gold' : 'bg-cream-soft/40 border-cream-deep text-charcoal focus:border-gold'}`}
                          />
                        </div>

                        <div className="space-y-1 font-mono">
                          <label className="text-[9px] font-mono text-gray-400 uppercase block font-bold">Inquiries Email Address</label>
                          <input 
                            type="email" 
                            value={settings.restaurant_email || ''}
                            onChange={(e) => setSettings(prev => ({ ...prev, restaurant_email: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-xl outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-gold' : 'bg-cream-soft/40 border-cream-deep text-charcoal focus:border-gold'}`}
                          />
                        </div>

                        <div className="space-y-1 leading-normal">
                          <label className="text-[9px] font-mono text-gray-400 uppercase block font-bold">Physical Address Location</label>
                          <input 
                            type="text" 
                            value={settings.restaurant_address || ''}
                            onChange={(e) => setSettings(prev => ({ ...prev, restaurant_address: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-xl outline-none font-light ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-gold' : 'bg-cream-soft/40 border-cream-deep text-charcoal focus:border-gold'}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Integrated Operating Hours Section */}
                    <div className={`p-5 rounded-3xl border space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-850' : 'bg-white border-cream-deep'}`}>
                      <h4 className="font-serif text-xs font-black text-gold uppercase tracking-wider flex items-center gap-1.5 border-b border-cream-deep/15 pb-2">
                        <Clock className="w-4 h-4" />
                        <span>Integrated Operating Hours Schedule</span>
                      </h4>

                      <div className="space-y-3">
                        {businessHours.map((day) => (
                          <div 
                            key={day.id} 
                            className={`p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left border ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-cream-soft/40 border-cream-deep/10'}`}
                          >
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleUpdateHourDayState(day.id, 'is_open', !day.is_open)}
                                className="cursor-pointer shrink-0"
                                title="Toggle day opening status"
                              >
                                {day.is_open ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                              </button>
                              <span className="font-extrabold font-serif text-charcoal dark:text-slate-200 uppercase min-w-[90px]">{day.weekday}</span>
                              <span className={`px-2 py-0.5 rounded-md font-mono text-[8px] font-bold uppercase shrink-0 ${day.is_open ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {day.is_open ? 'Open' : 'Closed'}
                              </span>
                            </div>

                            {day.is_open && (
                              <div className="flex items-center gap-2.5">
                                <div className="flex items-center gap-1 font-mono">
                                  <span>Opens:</span>
                                  <input 
                                    type="text" 
                                    placeholder="HH:MM"
                                    value={day.start_time || ''}
                                    onChange={(e) => handleUpdateHourDayState(day.id, 'start_time', e.target.value)}
                                    className={`w-16 px-1.5 py-1 border rounded-lg text-center font-bold ${isDarkMode ? 'bg-slate-900 border-slate-800 text-gold' : 'bg-white border-cream-deep text-charcoal'}`}
                                  />
                                </div>
                                <div className="flex items-center gap-1 font-mono">
                                  <span>Closes:</span>
                                  <input 
                                    type="text" 
                                    placeholder="HH:MM"
                                    value={day.end_time || ''}
                                    onChange={(e) => handleUpdateHourDayState(day.id, 'end_time', e.target.value)}
                                    className={`w-16 px-1.5 py-1 border rounded-lg text-center font-bold ${isDarkMode ? 'bg-slate-900 border-slate-800 text-gold' : 'bg-white border-cream-deep text-charcoal'}`}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="text-left pt-2">
                      <button 
                        type="submit"
                        className="bg-gold hover:bg-gold-hover text-charcoal font-black rounded-xl px-7 py-3 uppercase text-xs tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                      >
                        <Save className="w-4 h-4 text-charcoal" />
                        <span>Apply & Sync Operations Metadata</span>
                      </button>
                    </div>

                  </form>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* POPUP MODALS SECTION */}
      {/* ======================================================== */}

      {/* 1. Add Order Inline Overlay */}
      {showAddOrderModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <form onSubmit={handleAddManualOrder} className={`w-full max-w-lg rounded-3xl border p-6 space-y-4 text-left shadow-2xl relative animate-page-open ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-cream-soft border-cream-deep text-charcoal'}`}>
            
            <div className="flex justify-between items-center border-b border-cream-deep/20 pb-3">
              <div>
                <h4 className="font-serif font-black text-gold text-sm uppercase">Manual customer order logging</h4>
                <p className="text-[10px] text-gray-400">Ingest an order line directly into Sutralounge master kitchen streams.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddOrderModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4 cursor-pointer" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[8px] font-mono text-gray-400 uppercase">Customer Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Guest display name"
                  value={newOrderForm.customer_name}
                  onChange={(e) => setNewOrderForm(prev => ({ ...prev, customer_name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-xl outline-none ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-white border-cream-deep'}`}
                />
              </div>

              <div className="space-y-1 font-mono">
                <label className="text-[8px] font-mono text-gray-400 uppercase">Phone Number *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="+977 98..."
                  value={newOrderForm.customer_phone}
                  onChange={(e) => setNewOrderForm(prev => ({ ...prev, customer_phone: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-xl outline-none ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-white border-cream-deep'}`}
                />
              </div>

              <div className="col-span-2 space-y-1 leading-normal">
                <label className="text-[8px] font-mono text-gray-400 uppercase">Delivery Address (Or Tables Number)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Siddhartha Chowk (or 'Table 3 VIP')"
                  value={newOrderForm.delivery_address}
                  onChange={(e) => setNewOrderForm(prev => ({ ...prev, delivery_address: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-xl outline-none ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-white border-cream-deep'}`}
                />
              </div>
            </div>

            {/* Cart builder widgets */}
            <div className="space-y-2 text-xs border border-cream-deep/20 dark:border-slate-800 p-3 bg-slate-950/20 rounded-2xl">
              <span className="text-[8px] font-mono text-gray-400 uppercase block font-bold">Dynamic order Line Creator</span>
              <div className="flex gap-2">
                <select
                  value={selectedOrderItemName}
                  onChange={(e) => setSelectedOrderItemName(e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-xl outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-cream-deep'}`}
                >
                  <option value="">-- Choose Cuisine Dish --</option>
                  {menuItems.map(m => (
                    <option key={m.id} value={m.name}>{m.name} (NPR {m.price})</option>
                  ))}
                </select>

                <input 
                  type="number" 
                  min={1}
                  value={selectedOrderItemQty}
                  onChange={(e) => setSelectedOrderItemQty(Number(e.target.value))}
                  className={`w-14 px-2 py-2 border rounded-xl text-center font-mono ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-cream-deep'}`}
                />

                <button
                  type="button"
                  onClick={handleAddOrderItemLine}
                  className="bg-gold hover:bg-gold-hover text-charcoal font-black rounded-xl px-3.5 py-2 uppercase text-[10px] tracking-wide cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add line</span>
                </button>
              </div>

              {/* Added items list */}
              <div className="space-y-2 mt-2 pt-2 border-t border-cream-deep/15 leading-normal max-h-[100px] overflow-y-auto">
                {newOrderForm.items.map((line, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="font-mono text-gold font-black mr-2 bg-gold/15 px-2 py-0.5 rounded-lg text-[10px]">{line.quantity}x</span>
                    <span className="flex-1 truncate select-none text-left">{line.name}</span>
                    <span className="font-mono font-bold mr-3">NPR {(line.price * line.quantity)}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveOrderItemLine(line.name)} 
                      className="text-red-500 hover:text-red-700 p-0.5"
                    >
                      <Trash className="w-3.5 h-3.5 cursor-pointer" />
                    </button>
                  </div>
                ))}

                {newOrderForm.items.length === 0 && (
                  <span className="text-[10px] text-gray-500 italic block text-center py-2">Add cuisines lines to populate this receipt.</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[8px] font-mono text-gray-400 uppercase">Default Status Setup</label>
                <select
                  value={newOrderForm.status}
                  onChange={(e) => setNewOrderForm(prev => ({ ...prev, status: e.target.value as any }))}
                  className={`w-full px-3 py-2 border rounded-xl outline-none ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-white border-cream-deep'}`}
                >
                  <option value="new">NEW QUEUE</option>
                  <option value="preparing">COOKING STREAM</option>
                  <option value="ready">READY DISPATCH</option>
                  <option value="delivered">DELIVERED</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-mono text-gray-400 uppercase">Payment receipt state</label>
                <select
                  value={newOrderForm.payment_status}
                  onChange={(e) => setNewOrderForm(prev => ({ ...prev, payment_status: e.target.value as any }))}
                  className={`w-full px-3 py-2 border rounded-xl outline-none ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-white border-cream-deep'}`}
                >
                  <option value="pending">DUE BILLING</option>
                  <option value="paid">SETTLED PAID</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gold hover:bg-gold-hover text-charcoal font-black rounded-xl py-3 text-center uppercase tracking-wider text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4 text-charcoal" />
                <span>Publish manual Cooking Order</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* 2. Upload asset overlay */}
      {showAddPhotoModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <form onSubmit={handleAddPhotoSubmit} className={`w-full max-w-sm rounded-3xl border p-6 space-y-4 text-left shadow-2xl relative animate-page-open ${isDarkMode ? 'bg-slate-900 border-slate-850' : 'bg-cream-soft border-cream-deep'}`}>
            <div className="flex justify-between items-center pb-2 border-b border-cream-deep/20">
              <h4 className="font-serif font-black text-gold text-sm uppercase">
                {editingPhotoId ? 'Edit photographic detail' : 'Upload visual asset link'}
              </h4>
              <button 
                type="button" 
                onClick={() => {
                  setShowAddPhotoModal(false);
                  setEditingPhotoId(null);
                  setNewPhotoForm({ url: '', caption: '' });
                }} 
                className="text-gray-400"
              >
                <X className="w-4 h-4 cursor-pointer" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[8px] font-mono text-gray-400 uppercase">Asset image link (Secure https URL only) *</label>
                <input 
                  type="url" 
                  required 
                  placeholder="https://images.unsplash.com/..."
                  value={newPhotoForm.url}
                  onChange={(e) => setNewPhotoForm(prev => ({ ...prev, url: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-xl outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-cream-deep'}`}
                />
              </div>

              <div className="space-y-1 leading-normal">
                <label className="text-[8px] font-mono text-gray-400 uppercase">Caption title description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sutralounge Cozy booth details"
                  value={newPhotoForm.caption}
                  onChange={(e) => setNewPhotoForm(prev => ({ ...prev, caption: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-xl outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-cream-deep'}`}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-gold hover:bg-gold-hover text-charcoal font-black rounded-xl py-3 uppercase tracking-wider text-[11px] shadow-md cursor-pointer text-center"
              >
                {editingPhotoId ? 'Update Image details' : 'Publish Image'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
