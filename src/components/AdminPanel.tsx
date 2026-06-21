import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  ShieldAlert, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Home, 
  FileText, 
  Info, 
  CheckCircle,
  LogOut,
  Clock,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Calendar,
  Users,
  Settings,
  Activity,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Eye,
  Star,
  Shield
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  getDoc
} from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

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

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'pin' | 'credentials'>('pin');
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | React.ReactNode | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Firestore Core States
  const [reservations, setReservations] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    restaurant_name: "Sutra Lounge",
    restaurant_email: "sutraloungehtd@gmail.com",
    restaurant_phone: "057-522111",
    restaurant_address: "Nagar Bikash Samiti Marg, Hetauda 44107, Nepal",
    slot_interval_minutes: 30,
    booking_notice_hours: 2,
    default_reservation_duration_minutes: 90,
    max_party_size: 20,
    hero_image_url: "",
    dish_image_url: ""
  });
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [newAdmin, setNewAdmin] = useState({ user_id: '', email: '' });

  // Current selected tab
  const [activeTab, setActiveTab] = useState<'overview' | 'reservations' | 'tables' | 'menu' | 'hours' | 'blocked' | 'settings' | 'admins'>('overview');

  // Filters for reservations
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal / Inline forms states
  const [editingTable, setEditingTable] = useState<any | null>(null);
  const [newTable, setNewTable] = useState({ table_name: '', capacity: 2, area: 'Main Hall', is_active: true });

  const [editingMenuItem, setEditingMenuItem] = useState<any | null>(null);
  const [newMenuItem, setNewMenuItem] = useState({ name: '', description: '', price: 300, category: 'Mains', is_featured: false, is_active: true });

  const [newBlockedDate, setNewBlockedDate] = useState({ blocked_date: '', reason: '' });

  // Listen for real Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const allowedAdmins = ["admin@sutralounge.com.np", "j7259022@gmail.com"];
        const userEmail = user.email ? user.email.toLowerCase() : "";
        let hasAccess = false;
        const isSuper = !!(userEmail && allowedAdmins.includes(userEmail));
        setIsSuperAdmin(isSuper);
        
        if (isSuper) {
          hasAccess = true;
          // Auto-seed the hardcoded administrator into the 'admin_users' Firestore collection
          try {
            const adminDocRef = doc(db, 'admin_users', user.uid);
            const adminDoc = await getDoc(adminDocRef);
            if (!adminDoc.exists()) {
              await setDoc(adminDocRef, {
                user_id: user.uid,
                email: userEmail,
                created_at: new Date().toISOString()
              });
              console.log(`Auto-seeded hardcoded admin: ${userEmail} (${user.uid}) in admin_users`);
            }
          } catch (e) {
            console.error("Error auto-seeding admin to db:", e);
          }
        } else {
          try {
            const adminDocRef = doc(db, 'admin_users', user.uid);
            const adminDoc = await getDoc(adminDocRef);
            if (adminDoc.exists()) {
              hasAccess = true;
            }
          } catch (e) {
            console.error("Error checking admin table:", e);
          }
        }

        if (hasAccess) {
          setIsAuthenticated(true);
          setLoginError(null);
        } else {
          setIsAuthenticated(false);
          setIsSuperAdmin(false);
          setLoginError(`Unauthorized Access: Account '${user.email || 'unknown'}' is not listed in Sutralounge security registry.`);
          signOut(auth);
        }
      } else {
        setIsAuthenticated(false);
        setIsSuperAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore updates
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubReservations = onSnapshot(collection(db, 'reservations'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      // Sort by creation date descending
      list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      setReservations(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reservations');
    });

    const unsubTables = onSnapshot(collection(db, 'restaurant_tables'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setTables(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'restaurant_tables');
    });

    const unsubMenu = onSnapshot(collection(db, 'menu_items'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setMenuItems(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'menu_items');
    });

    const unsubHours = onSnapshot(collection(db, 'business_hours'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, day: doc.id, ...doc.data() } as any));
      // Standard order
      const order = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      list.sort((a, b) => order.indexOf(a.id.toLowerCase()) - order.indexOf(b.id.toLowerCase()));
      setBusinessHours(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'business_hours');
    });

    const unsubBlocked = onSnapshot(collection(db, 'blocked_dates'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setBlockedDates(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'blocked_dates');
    });

    const unsubSettings = onSnapshot(collection(db, 'restaurant_settings'), (snapshot) => {
      const defaultDoc = snapshot.docs.find(doc => doc.id === 'default');
      if (defaultDoc) {
        const data = defaultDoc.data() || {};
        setSettings({
          restaurant_name: data.restaurant_name || "Sutra Lounge",
          restaurant_email: data.restaurant_email || "sutraloungehtd@gmail.com",
          restaurant_phone: data.restaurant_phone || "057-522111",
          restaurant_address: data.restaurant_address || "Nagar Bikash Samiti Marg, Hetauda 44107, Nepal",
          slot_interval_minutes: Number(data.slot_interval_minutes || 30),
          booking_notice_hours: Number(data.booking_notice_hours || 2),
          default_reservation_duration_minutes: Number(data.default_reservation_duration_minutes || 90),
          max_party_size: Number(data.max_party_size || 20),
          hero_image_url: data.hero_image_url || "",
          dish_image_url: data.dish_image_url || ""
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'restaurant_settings');
    });

    const unsubAdmins = onSnapshot(collection(db, 'admin_users'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setAdminUsers(list);
    }, (error) => {
      console.warn("Could not load admin_users list:", error);
    });

    return () => {
      unsubReservations();
      unsubTables();
      unsubMenu();
      unsubHours();
      unsubBlocked();
      unsubSettings();
      unsubAdmins();
    };
  }, [isAuthenticated]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Securely authenticate via actual Firebase auth
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    const verifiedPINs = ['2026', '8503'];
    const adminEmail = 'admin@sutralounge.com.np';
    const adminPassword = 'SutraLounge@2026!';

    try {
      if (loginMethod === 'pin') {
        if (verifiedPINs.includes(pin.trim())) {
          await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
          setPin('');
        } else {
          throw new Error("Invalid Security PIN combination");
        }
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setLoginError(
          <div className="space-y-1 text-left">
            <span className="font-bold block text-red-800">Email/Password Sign-In Method is Disabled:</span>
            <span className="block leading-relaxed">
              The Firebase Email/Password provider is not yet turned on in your project console. We highly recommend using the 
              <strong> Sign in with Google</strong> option below—it works instantly without configuration!
            </span>
            <span className="block text-[10px] text-charcoal-muted leading-relaxed pt-1">
              To use PIN or Credentials log-in, please enable <strong>Email/Password</strong> provider under Authentication &gt; Sign-in method in your Firebase console:
              <br />
              <a 
                href="https://console.firebase.google.com/project/concise-anvil-kn56p/authentication/providers" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gold font-bold underline hover:text-gold-hover inline-block mt-0.5"
              >
                Enable in Firebase Console &rarr;
              </a>
            </span>
          </div>
        );
      } else {
        setLoginError(err.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-blocked') {
        setLoginError("Google sign-in popup blocked. Please allow popups for this site, or open this application in a new tab to complete sign-in.");
      } else {
        setLoginError(err.message || 'Google Sign-In failed.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  // Real Calculated Metrics helper
  const todayStr = new Date().toISOString().split('T')[0];
  const metricToday = reservations.filter(r => r.reservation_date === todayStr && r.status !== 'cancelled').length;
  const metricPending = reservations.filter(r => r.status === 'pending').length;
  const metricConfirmed = reservations.filter(r => r.status === 'confirmed' && r.reservation_date >= todayStr).length;
  const metricCompleted = reservations.filter(r => r.status === 'completed').length;

  // RESERVATION CONTROLS
  const handleUpdateStatus = async (resId: string, newStatus: string) => {
    if (!isSuperAdmin) {
      triggerToast("Permission Denied: Only primary administrators can modify reservations.");
      return;
    }
    try {
      await updateDoc(doc(db, 'reservations', resId), { status: newStatus });
      triggerToast(`Reservation status updated to ${newStatus}`);
    } catch (e: any) {
      triggerToast(`Failed to update status: ${e.message}`);
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if (!isSuperAdmin) {
      triggerToast("Permission Denied: Only primary administrators can delete reservations.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this reservation record?")) return;
    try {
      await deleteDoc(doc(db, 'reservations', id));
      triggerToast("Reservation deleted successfully");
    } catch (e: any) {
      triggerToast(`Failed to delete: ${e.message}`);
    }
  };

  // TABLE CONTROLS
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      triggerToast("Permission Denied: Only primary administrators can modify tables.");
      return;
    }
    if (!newTable.table_name.trim()) return;
    try {
      if (editingTable) {
        await updateDoc(doc(db, 'restaurant_tables', editingTable.id), {
          table_name: newTable.table_name,
          capacity: Number(newTable.capacity),
          area: newTable.area,
          is_active: newTable.is_active
        });
        setEditingTable(null);
        setNewTable({ table_name: '', capacity: 2, area: 'Main Hall', is_active: true });
        triggerToast("Table updated successfully");
      } else {
        const id = "t_" + Date.now();
        await setDoc(doc(db, 'restaurant_tables', id), {
          table_name: newTable.table_name,
          capacity: Number(newTable.capacity),
          area: newTable.area,
          is_active: newTable.is_active,
          created_at: new Date().toISOString()
        });
        setNewTable({ table_name: '', capacity: 2, area: 'Main Hall', is_active: true });
        triggerToast("New table added successfully");
      }
    } catch (e: any) {
      triggerToast(`Error saving table: ${e.message}`);
    }
  };

  const handleToggleTableActive = async (tableId: string, current: boolean) => {
    if (!isSuperAdmin) {
      triggerToast("Permission Denied: Only primary administrators can modify tables.");
      return;
    }
    try {
      await updateDoc(doc(db, 'restaurant_tables', tableId), { is_active: !current });
      triggerToast(`Table ${!current ? 'activated' : 'deactivated'}`);
    } catch (e: any) {
      triggerToast(`Error: ${e.message}`);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!isSuperAdmin) {
      triggerToast("Permission Denied: Only primary administrators can modify tables.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this table?")) return;
    try {
      await deleteDoc(doc(db, 'restaurant_tables', tableId));
      triggerToast("Table deleted");
    } catch (e: any) {
      triggerToast(`Error: ${e.message}`);
    }
  };

  // ADMIN USERS CONTROLS
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      triggerToast("Permission Denied: Only primary administrators can authorize new credentials.");
      return;
    }
    if (!newAdmin.user_id.trim()) {
      triggerToast("User ID (UID) is required to map admin authorization");
      return;
    }
    try {
      const uidNormalized = newAdmin.user_id.trim();
      await setDoc(doc(db, 'admin_users', uidNormalized), {
        user_id: uidNormalized,
        email: newAdmin.email.trim() || 'No Email Label Provided',
        created_at: new Date().toISOString()
      });
      setNewAdmin({ user_id: '', email: '' });
      triggerToast("Admin registered successfully");
    } catch (err: any) {
      triggerToast(`Failed to register admin: ${err.message}`);
    }
  };

  const handleDeleteAdmin = async (uidToDelete: string) => {
    if (!isSuperAdmin) {
      triggerToast("Permission Denied: Only primary administrators can revoke credentials.");
      return;
    }
    if (!window.confirm("Are you sure you want to revoke administrative permissions for this UID?")) return;
    try {
      await deleteDoc(doc(db, 'admin_users', uidToDelete));
      triggerToast("Admin revoked successfully");
    } catch (err: any) {
      triggerToast(`Failed to revoke: ${err.message}`);
    }
  };

  // MENU CONTROLS
  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      triggerToast("Permission Denied: Only primary administrators can modify delicacies catalog.");
      return;
    }
    if (!newMenuItem.name.trim()) return;
    try {
      if (editingMenuItem) {
        await updateDoc(doc(db, 'menu_items', editingMenuItem.id), {
          name: newMenuItem.name,
          description: newMenuItem.description,
          price: Number(newMenuItem.price),
          category: newMenuItem.category,
          is_featured: newMenuItem.is_featured,
          is_active: newMenuItem.is_active
        });
        setEditingMenuItem(null);
        setNewMenuItem({ name: '', description: '', price: 300, category: 'Mains', is_featured: false, is_active: true });
        triggerToast("Menu item updated successfully");
      } else {
        const id = "m_" + Date.now();
        await setDoc(doc(db, 'menu_items', id), {
          name: newMenuItem.name,
          description: newMenuItem.description,
          price: Number(newMenuItem.price),
          category: newMenuItem.category,
          is_featured: newMenuItem.is_featured,
          is_active: newMenuItem.is_active,
          created_at: new Date().toISOString()
        });
        setNewMenuItem({ name: '', description: '', price: 300, category: 'Mains', is_featured: false, is_active: true });
        triggerToast("Menu item created");
      }
    } catch (e: any) {
      triggerToast(`Error: ${e.message}`);
    }
  };

  const handleToggleMenuBoolean = async (id: string, field: 'is_active' | 'is_featured', current: boolean) => {
    if (!isSuperAdmin) {
      triggerToast("Permission Denied: Only primary administrators can toggle item statuses.");
      return;
    }
    try {
      await updateDoc(doc(db, 'menu_items', id), { [field]: !current });
      triggerToast(`Menu item ${field} updated`);
    } catch (e: any) {
      triggerToast(`Error: ${e.message}`);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!isSuperAdmin) {
      triggerToast("Permission Denied: Only primary administrators can delete catalog delicacies.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    try {
      await deleteDoc(doc(db, 'menu_items', id));
      triggerToast("Menu item deleted");
    } catch (e: any) {
      triggerToast(`Error: ${e.message}`);
    }
  };

  // HOURS CONTROLS
  const handleUpdateHourRow = async (dayKey: string, field: string, value: any) => {
    if (!isSuperAdmin) {
      triggerToast("Permission Denied: Only primary administrators can update operating hours.");
      return;
    }
    try {
      await updateDoc(doc(db, 'business_hours', dayKey), { [field]: value });
      triggerToast("Business hours updated");
    } catch (e: any) {
      triggerToast(`Error: ${e.message}`);
    }
  };

  // BLOCKED DATES CONTROLS
  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      triggerToast("Permission Denied: Only primary administrators can add block holidays.");
      return;
    }
    if (!newBlockedDate.blocked_date) return;
    try {
      const id = "b_" + Date.now();
      await setDoc(doc(db, 'blocked_dates', id), {
        blocked_date: newBlockedDate.blocked_date,
        reason: newBlockedDate.reason
      });
      setNewBlockedDate({ blocked_date: '', reason: '' });
      triggerToast("Date blocked successfully");
    } catch (e: any) {
      triggerToast(`Error: ${e.message}`);
    }
  };

  const handleDeleteBlockedDate = async (id: string) => {
    if (!isSuperAdmin) {
      triggerToast("Permission Denied: Only primary administrators can remove block holidays.");
      return;
    }
    try {
      await deleteDoc(doc(db, 'blocked_dates', id));
      triggerToast("Blocked date removed");
    } catch (e: any) {
      triggerToast(`Error: ${e.message}`);
    }
  };

  // SETTINGS CONTROLS
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      triggerToast("Permission Denied: Only primary administrators can update global settings.");
      return;
    }

    const isValidSecureUrl = (url: string): boolean => {
      if (!url) return true;
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:';
      } catch (_) {
        return false;
      }
    };

    if (settings.hero_image_url && !isValidSecureUrl(settings.hero_image_url)) {
      triggerToast("Error: Hero Image must be a valid secure URL starting with https://");
      return;
    }

    if (settings.dish_image_url && !isValidSecureUrl(settings.dish_image_url)) {
      triggerToast("Error: Special Dish Image must be a valid secure URL starting with https://");
      return;
    }

    try {
      await setDoc(doc(db, 'restaurant_settings', 'default'), {
        restaurant_name: settings.restaurant_name,
        restaurant_email: settings.restaurant_email,
        restaurant_phone: settings.restaurant_phone,
        restaurant_address: settings.restaurant_address,
        slot_interval_minutes: Number(settings.slot_interval_minutes),
        booking_notice_hours: Number(settings.booking_notice_hours),
        default_reservation_duration_minutes: Number(settings.default_reservation_duration_minutes),
        max_party_size: Number(settings.max_party_size),
        hero_image_url: settings.hero_image_url || "",
        dish_image_url: settings.dish_image_url || ""
      });
      triggerToast("Global restaurant settings updated successfully");
    } catch (e: any) {
      triggerToast(`Error saving settings: ${e.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-charcoal/90 backdrop-blur-md overflow-hidden animate-fade-in">
      <div className="bg-cream-soft w-full h-full sm:max-w-7xl sm:h-[90vh] sm:rounded-3xl border border-cream-deep shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Toast Toast Alert */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-full bg-charcoal text-gold text-xs font-bold font-mono tracking-wide flex items-center gap-2 shadow-xl border border-gold/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header bar */}
        <div className="bg-charcoal text-cream-soft px-4 sm:px-5 py-4 border-b border-gold/15 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-gold p-2 rounded-xl text-charcoal">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-extrabold tracking-tight">SUTRA ADMIN CONSOLE</h2>
              <p className="text-[9px] sm:text-[10px] font-mono tracking-widest text-gold text-left">SECURE FIRMWARE INTERACTION PORTAL</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-cream-soft/60 hover:text-cream-soft p-2 sm:p-1.5 rounded-lg border border-cream-deep/10 hover:border-cream-deep/20 transition-all cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Close admin panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Interface Router */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-cream-soft">
               <form onSubmit={handleLoginSubmit} className="bg-white border border-cream-deep/60 rounded-3xl p-5 sm:p-10 w-full max-w-md shadow-xl text-left space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mx-auto">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-extrabold text-charcoal">Restricted Access</h3>
                  <p className="text-xs text-charcoal-muted leading-relaxed">System logs show unauthorized attempt. Verify your credentials or administrator security PIN code to grant clearance.</p>
                </div>

                {loginError && (
                  <div className="p-3.5 bg-red-50 border border-red-200/60 rounded-xl text-xs text-red-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">{loginError}</div>
                  </div>
                )}

                {/* Login Method Tab selectors */}
                <div className="grid grid-cols-2 gap-1 bg-cream-deep/40 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('pin'); setLoginError(null); }}
                    className={`py-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${loginMethod === 'pin' ? 'bg-charcoal text-gold' : 'text-charcoal-muted hover:text-charcoal'}`}
                  >
                    Clearance PIN
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('credentials'); setLoginError(null); }}
                    className={`py-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${loginMethod === 'credentials' ? 'bg-charcoal text-gold' : 'text-charcoal-muted hover:text-charcoal'}`}
                  >
                    Credentials
                  </button>
                </div>

                {loginMethod === 'pin' ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase font-bold block">SECURITY PIN CODE</label>
                    <input 
                      type="password" 
                      maxLength={6}
                      placeholder="Enter admin PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full bg-cream-soft px-4 py-4 rounded-xl border border-cream-deep focus:outline-none focus:border-gold text-center text-lg font-mono tracking-widest text-charcoal font-bold min-h-[48px]"
                    />
                    <p className="text-[10px] text-charcoal-muted/70 text-center">Hint: standard system PIN '2026' or '8503' is accepted.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase font-bold block">EMAIL ADDRESS</label>
                      <input 
                        type="email" 
                        placeholder="admin@sutralounge.com.np"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-cream-soft px-4 py-3.5 rounded-xl border border-cream-deep focus:outline-none focus:border-gold text-xs font-light text-charcoal min-h-[48px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase font-bold block">PASSWORD</label>
                      <input 
                        type="password" 
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-cream-soft px-4 py-3.5 rounded-xl border border-cream-deep focus:outline-none focus:border-gold text-xs font-mono text-charcoal min-h-[48px]"
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-gold hover:bg-gold-hover text-cream-soft font-bold rounded-xl py-4 uppercase text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
                >
                  {isLoggingIn ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-charcoal" />
                      <span>Processing Clearance...</span>
                    </>
                  ) : (
                    <span>Verify Credentials</span>
                  )}
                </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-cream-deep/60"></div>
                <span className="flex-shrink mx-4 text-charcoal-muted/50 font-mono text-[9px] tracking-widest uppercase">Or Recommended</span>
                <div className="flex-grow border-t border-cream-deep/60"></div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoggingIn}
                className="w-full bg-white hover:bg-cream-soft border border-cream-deep/80 text-charcoal font-bold rounded-xl py-4 text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-xs min-h-[48px]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.2662 9.7655C6.199 7.0275 8.7915 5.0649 11.885 5.0649C13.5104 5.0649 14.9723 5.626 16.1249 6.5627L19.7825 2.9051C17.6111 1.0886 14.8876 0 11.885 0C7.29 0 3.366 2.6588 1.4812 6.5165L5.2662 9.7655Z" />
                  <path fill="#4285F4" d="M23.49 10.1013C23.7101 10.8715 23.8182 11.6706 23.8182 12.4935C23.8182 13.4144 23.689 14.3217 23.4419 15.191H11.885V10.1013H23.49Z" />
                  <path fill="#34A853" d="M11.8852 19.9286C8.8415 19.9286 6.2872 18.0256 5.3129 15.352L1.5103 18.2778C3.3916 22.0833 7.3023 24.7143 11.8852 24.7143C14.7723 24.7143 17.391 23.7088 19.3879 22.0494l-3.7915-2.9298c-1.0454.5513-2.3168.809-3.7112.809z" />
                  <path fill="#FBBC05" d="M5.3129 15.3522C5.0601 14.6543 4.9182 13.9042 4.9182 13.1234C4.9182 12.3426 5.0601 11.5925 5.3129 10.8946L1.5103 7.9688C0.5401 9.5162 0 11.2721 0 13.1234C0 14.9747 0.5401 16.7306 1.5103 18.278L5.3129 15.3522Z" />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-charcoal p-4 space-y-1 border-r border-gold/10 shrink-0 flex overflow-x-auto md:flex-col gap-1 md:gap-1.5 scrollbar-none">
              
              <div className="hidden md:block pb-4 mb-4 border-b border-cream-deep/10">
                <span className="text-[10px] font-mono text-gold block tracking-widest uppercase">Logged in as</span>
                <span className="text-xs font-bold text-cream-soft block truncate">{auth.currentUser?.email || 'Administrator Session'}</span>
              </div>

              {[
                { id: 'overview', name: 'Dashboard Overview', icon: Activity },
                { id: 'reservations', name: 'Reservations', icon: Calendar },
                { id: 'tables', name: 'Restaurant Tables', icon: Users },
                { id: 'menu', name: 'Menu Items', icon: FileText },
                { id: 'hours', name: 'Business Hours', icon: Clock },
                { id: 'blocked', name: 'Blocked Dates', icon: AlertTriangle },
                { id: 'settings', name: 'Restaurant Settings', icon: Settings },
                { id: 'admins', name: 'Admin Users', icon: Shield },
              ].map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full py-3 px-3.5 min-h-[44px] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all shrink-0 cursor-pointer text-left
                      ${activeTab === tab.id ? 'bg-gold text-charcoal shadow-sm' : 'text-cream-soft/60 hover:bg-cream-deep/10 hover:text-cream-soft'}`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-3.5 mt-auto rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all shrink-0 cursor-pointer text-left text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Term Session</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white flex flex-col space-y-6">
              
              {!isSuperAdmin && (
                <div id="read-only-notice-banner" className="bg-amber-50/80 border border-amber-200 p-3 sm:p-4 rounded-2xl text-left shadow-xs">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 font-bold text-amber-700 text-xs font-mono">i</div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-amber-800">Read-Only Session Enabled</h4>
                      <p className="text-[11px] text-amber-700 leading-relaxed font-light">
                        You are logged in with dynamic staff privileges. You can view all restaurant stats, tables, hours, and menus, but you do not have permission to modify parameters, approve/reject bookings, or manage orders.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6 text-left">
                  <div>
                    <h3 className="font-serif text-xl font-extrabold text-charcoal border-b pb-2 mb-1">Clearance Overview Metrics</h3>
                    <p className="text-xs text-charcoal-muted leading-relaxed font-light">Calculated statistics computed directly from Firestore databases representing real-time patron bookings and venue capabilities.</p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-cream-soft border border-cream-deep/60 p-4 rounded-2xl">
                      <span className="text-[10px] font-mono uppercase text-charcoal-muted tracking-wide font-extrabold block">Today's Active Bookings</span>
                      <p className="text-3xl font-extrabold text-charcoal mt-1">{metricToday}</p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                      <span className="text-[10px] font-mono uppercase text-amber-700 tracking-wide font-extrabold block">Pending Review</span>
                      <p className="text-3xl font-extrabold text-amber-800 mt-1">{metricPending}</p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                      <span className="text-[10px] font-mono uppercase text-emerald-800 tracking-wide font-extrabold block">Upcoming Confirmed</span>
                      <p className="text-3xl font-extrabold text-emerald-900 mt-1">{metricConfirmed}</p>
                    </div>

                    <div className="bg-cream-deep/20 border border-cream-deep p-4 rounded-2xl">
                      <span className="text-[10px] font-mono uppercase text-charcoal-muted tracking-wide font-extrabold block">All-time Completed</span>
                      <p className="text-3xl font-extrabold text-charcoal-muted mt-1">{metricCompleted}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                    
                    {/* Live system state block */}
                    <div className="bg-cream-soft/40 border border-cream-deep rounded-2xl p-5 space-y-4">
                      <h4 className="font-serif text-sm font-bold text-charcoal">Hygienic Venue Resources</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1.5 border-b border-cream-deep/50 text-charcoal-muted">
                          <span>Total Seating Resources</span>
                          <strong className="text-charcoal font-semibold">{tables.length} tables registered</strong>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-cream-deep/50 text-charcoal-muted">
                          <span>Active Tables</span>
                          <strong className="text-charcoal font-semibold">{tables.filter(t => t.is_active).length} tables online</strong>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-cream-deep/50 text-charcoal-muted">
                          <span>Catalog Offerings</span>
                          <strong className="text-charcoal font-semibold">{menuItems.length} delicacies catalogued</strong>
                        </div>
                        <div className="flex justify-between py-1.5 text-charcoal-muted">
                          <span>Notice Window</span>
                          <strong className="text-charcoal font-semibold">{settings.booking_notice_hours || 2} hours notice required</strong>
                        </div>
                      </div>
                    </div>

                    {/* Quick navigation card */}
                    <div className="bg-charcoal text-cream-soft rounded-2xl p-5 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif text-sm font-extrabold text-gold tracking-wide">Secure Operations Cabin</h4>
                        <p className="text-xs text-cream-soft/70 font-light mt-1.5 leading-relaxed">
                          Clearance logs: Live feeds are active. Toggle sections using the side drawer to authorize slots, verify guest records, manage seating capabilities, or block custom dates for private events.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-gold/60 tracking-widest mt-4">SYS CLEARANCE LEVEL: ADMIN ✓</span>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: RESERVATIONS */}
              {activeTab === 'reservations' && (
                <div className="space-y-6 text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="font-serif text-xl font-extrabold text-charcoal">Patron Reservation Logs</h3>
                      <p className="text-xs text-charcoal-muted font-light mt-0.5">Authorize booking requests, assign times, or manage client interactions.</p>
                    </div>

                    {/* Filters bar */}
                    <div className="flex flex-wrap items-center gap-2">
                      <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-cream-soft border border-cream-deep/75 text-xs px-3 py-1.5 rounded-lg font-bold text-charcoal cursor-pointer"
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>

                      <input 
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="bg-cream-soft border border-cream-deep/75 text-xs px-3 py-1.5 rounded-lg font-mono text-charcoal cursor-pointer"
                      />

                      {(filterStatus !== 'all' || filterDate) && (
                        <button
                          onClick={() => { setFilterStatus('all'); setFilterDate(''); }}
                          className="bg-cream-deep text-charcoal text-[10px] font-bold px-2.5 py-1 rounded-md"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Reservations Table */}
                  <div className="bg-white border border-cream-deep rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto -mx-2 px-2">
                      <table className="w-full text-left text-xs min-w-[640px]">
                        <thead className="bg-charcoal text-cream-soft font-mono uppercase text-[9px] tracking-wider border-b border-cream-deep">
                          <tr>
                            <th className="p-3 sm:p-4">Patron / Guest</th>
                            <th className="p-3 sm:p-4">Contact</th>
                            <th className="p-3 sm:p-4">Table / Size</th>
                            <th className="p-3 sm:p-4">Date / Hours</th>
                            <th className="p-3 sm:p-4">Status Flag</th>
                            <th className="p-3 sm:p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-cream-deep/60">
                          {reservations
                            .filter(r => filterStatus === 'all' || r.status === filterStatus)
                            .filter(r => !filterDate || r.reservation_date === filterDate)
                            .map((res) => {
                              const tableObj = tables.find(t => t.id === res.table_id);
                              return (
                                <tr key={res.id} className="hover:bg-cream-soft/35 transition-colors">
                                  <td className="p-3 sm:p-4">
                                    <p className="font-semibold text-charcoal">{res.full_name}</p>
                                    <p className="text-[10px] text-charcoal-muted font-light font-mono truncate max-w-[120px] sm:max-w-[150px]">{res.email || 'No email registered'}</p>
                                  </td>
                                  <td className="p-3 sm:p-4">
                                    <a href={`tel:${res.phone}`} className="font-mono text-gold-hover hover:underline block">{res.phone}</a>
                                  </td>
                                  <td className="p-3 sm:p-4">
                                    <p className="font-semibold text-charcoal">{tableObj ? tableObj.table_name : `Table (${res.table_id})`}</p>
                                    <p className="text-[10px] text-charcoal-muted">{res.party_size} Guests</p>
                                  </td>
                                  <td className="p-3 sm:p-4">
                                    <p className="font-semibold text-charcoal font-mono">{res.reservation_date}</p>
                                    <p className="text-[10px] font-mono text-charcoal-muted">{res.start_time} - {res.end_time}</p>
                                  </td>
                                  <td className="p-3 sm:p-4">
                                    <span className={`inline-block px-2 py-1.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wide
                                      ${res.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' : ''}
                                      ${res.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : ''}
                                      ${res.status === 'completed' ? 'bg-blue-100 text-blue-800 border border-blue-200' : ''}
                                      ${res.status === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-200' : ''}
                                    `}>
                                      {res.status}
                                    </span>
                                  </td>
                                  <td className="p-3 sm:p-4 text-right space-x-1 whitespace-nowrap">
                                    <select
                                      value={res.status}
                                      disabled={!isSuperAdmin}
                                      onChange={(e) => handleUpdateStatus(res.id, e.target.value)}
                                      className="bg-cream-soft border border-cream-deep text-[10px] font-bold py-1.5 px-2 rounded-md text-charcoal cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[32px]"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="confirmed">Confirmed</option>
                                      <option value="cancelled">Cancelled</option>
                                      <option value="completed">Completed</option>
                                    </select>
                                    {isSuperAdmin && (
                                      <button
                                        onClick={() => handleDeleteReservation(res.id)}
                                        className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50/50 transition-all inline-block align-middle min-w-[32px] min-h-[32px]"
                                        title="Delete Reservation"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}

                          {reservations.length === 0 && (
                            <tr>
                              <td colSpan={6} className="p-8 sm:p-10 text-center text-charcoal-muted font-light">No records found in Firestore reservations collection.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RESTAURANT TABLES */}
              {activeTab === 'tables' && (
                <div className="space-y-6 text-left">
                  <div>
                    <h3 className="font-serif text-xl font-extrabold text-charcoal border-b pb-2 mb-1">Hygienic Table Capacities</h3>
                    <p className="text-xs text-charcoal-muted leading-relaxed font-light">Configure tables that seat custom parties. Active tables affect availability automatically in the reservations engine.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Table form */}
                    {isSuperAdmin ? (
                      <form onSubmit={handleAddTable} className="bg-cream-soft/40 border border-cream-deep rounded-2xl p-5 space-y-4 h-fit">
                        <h4 className="font-serif text-sm font-bold text-charcoal flex items-center gap-2">
                          {editingTable ? <Edit3 className="w-4 h-4 text-gold" /> : <PlusCircle className="w-4 h-4 text-gold" />}
                          <span>{editingTable ? 'Edit Restaurant Table' : 'Register Table'}</span>
                        </h4>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block">Table Name *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Table 7 (Cabin C)"
                            value={newTable.table_name}
                            onChange={(e) => setNewTable(prev => ({ ...prev, table_name: e.target.value }))}
                            className="w-full bg-white px-3 py-3.5 min-h-[44px] rounded-xl border border-cream-deep text-xs text-charcoal"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block">Max Seats *</label>
                            <input 
                              type="number" 
                              required
                              min={1}
                              max={50}
                              value={newTable.capacity}
                              onChange={(e) => setNewTable(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                              className="w-full bg-white px-3 py-3.5 min-h-[44px] rounded-xl border border-cream-deep text-xs text-charcoal"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block">Display Area</label>
                            <input 
                              type="text" 
                              placeholder="e.g. VIP Cabin"
                              value={newTable.area}
                              onChange={(e) => setNewTable(prev => ({ ...prev, area: e.target.value }))}
                              className="w-full bg-white px-3 py-3.5 min-h-[44px] rounded-xl border border-cream-deep text-xs text-charcoal"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input 
                            type="checkbox" 
                            id="table_active" 
                            checked={newTable.is_active}
                            onChange={(e) => setNewTable(prev => ({ ...prev, is_active: e.target.checked }))}
                            className="accent-gold h-4 w-4"
                          />
                          <label htmlFor="table_active" className="text-xs font-bold text-charcoal cursor-pointer">Activate table immediately</label>
                        </div>

                        <div className="space-y-2">
                          <button 
                            type="submit"
                            className="w-full bg-charcoal hover:bg-charcoal/95 text-gold font-bold py-3.5 min-h-[44px] rounded-xl uppercase text-[10px] tracking-wider transition-all cursor-pointer"
                          >
                            {editingTable ? 'Save Table Changes' : 'Register Table'}
                          </button>
                          {editingTable && (
                            <button 
                              type="button"
                              onClick={() => {
                                setEditingTable(null);
                                setNewTable({ table_name: '', capacity: 2, area: 'Main Hall', is_active: true });
                              }}
                              className="w-full bg-cream-deep hover:bg-cream-deep/80 text-charcoal font-bold py-3.5 min-h-[44px] rounded-xl uppercase text-[10px] tracking-wider transition-all cursor-pointer"
                            >
                              Cancel Edit
                            </button>
                          )}
                        </div>
                      </form>
                    ) : null}

                    {/* Tables list */}
                    <div className={`${isSuperAdmin ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3`}>
                      <h4 className="font-serif text-sm font-bold text-charcoal">Registered Tables list</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {tables.map(t => (
                          <div 
                            key={t.id} 
                            className={`border rounded-2xl p-4 flex flex-col justify-between transition-all
                              ${t.is_active ? 'bg-white border-cream-deep' : 'bg-zinc-50 border-zinc-200/60 opacity-70'}`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-serif text-sm font-semibold text-charcoal">{t.table_name}</h5>
                                <span className="inline-block bg-cream-deep/50 text-[9px] font-mono text-charcoal-muted px-1.5 py-0.5 rounded-md mt-1 uppercase">{t.area}</span>
                              </div>
                              {isSuperAdmin ? (
                                <button
                                  onClick={() => handleToggleTableActive(t.id, t.is_active)}
                                  className="text-charcoal/80 hover:text-gold p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-cream-deep/30"
                                  title={t.is_active ? "Deactivate" : "Activate"}
                                >
                                  {t.is_active ? <ToggleRight className="w-5 h-5 text-gold" /> : <ToggleLeft className="w-5 h-5 text-zinc-400" />}
                                </button>
                              ) : (
                                <div className="p-1">
                                  {t.is_active ? <ToggleRight className="w-5 h-5 text-gold/60 cursor-not-allowed" /> : <ToggleLeft className="w-5 h-5 text-zinc-300 cursor-not-allowed" />}
                                </div>
                              )}
                            </div>

                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-cream-deep/40 text-xs">
                              <span className="text-charcoal-muted font-mono">{t.capacity} Max Seats</span>
                              {isSuperAdmin && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingTable(t);
                                      setNewTable({ table_name: t.table_name, capacity: t.capacity, area: t.area, is_active: t.is_active });
                                    }}
                                    className="text-gold hover:text-gold-hover text-[10px] font-semibold flex items-center gap-1 cursor-pointer min-h-[32px] px-2 py-1.5 rounded-lg hover:bg-gold/5 transition-all"
                                    title="Edit Table Details"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteTable(t.id)}
                                    className="text-red-500 hover:text-red-700 text-[10px] font-semibold flex items-center gap-1 cursor-pointer min-h-[32px] px-2 py-1.5 rounded-lg hover:bg-red-50 transition-all"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {tables.length === 0 && (
                          <div className="col-span-2 text-center p-8 bg-cream-soft border border-cream-deep border-dashed rounded-2xl text-charcoal-muted text-xs">No tables online yet.</div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 4: MENU ITEMS */}
              {activeTab === 'menu' && (
                <div className="space-y-6 text-left">
                  <div>
                    <h3 className="font-serif text-xl font-extrabold text-charcoal border-b pb-2 mb-1">Delicacy Catalog</h3>
                    <p className="text-xs text-charcoal-muted leading-relaxed font-light">Add, edit, or feature delicacies from the Sutra Lounge menu. Featured items show prominently in the public offerings.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add item */}
                    {isSuperAdmin ? (
                      <form onSubmit={handleAddMenuItem} className="bg-cream-soft/40 border border-cream-deep rounded-2xl p-5 space-y-4 h-fit">
                        <h4 className="font-serif text-sm font-bold text-charcoal flex items-center gap-2">
                          {editingMenuItem ? <Edit3 className="w-4 h-4 text-gold" /> : <PlusCircle className="w-4 h-4 text-gold" />}
                          <span>{editingMenuItem ? 'Edit Delicacy' : 'Add Delicacy'}</span>
                        </h4>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block">Item Name *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Aberdeen Recipe Sandwich"
                            value={newMenuItem.name}
                            onChange={(e) => setNewMenuItem(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-white px-3 py-3.5 min-h-[44px] rounded-xl border border-cream-deep text-xs text-charcoal"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block">Price (NPR) *</label>
                            <input 
                              type="number" 
                              required
                              min={0}
                              value={newMenuItem.price}
                              onChange={(e) => setNewMenuItem(prev => ({ ...prev, price: Number(e.target.value) }))}
                              className="w-full bg-white px-3 py-3.5 min-h-[44px] rounded-xl border border-cream-deep text-xs text-charcoal font-mono"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block">Category *</label>
                            <select
                              value={newMenuItem.category}
                              onChange={(e) => setNewMenuItem(prev => ({ ...prev, category: e.target.value }))}
                              className="w-full bg-white px-3 py-3.5 min-h-[44px] rounded-xl border border-cream-deep text-xs text-charcoal"
                            >
                              <option value="Mains">Mains</option>
                              <option value="Sandwiches">Sandwiches</option>
                              <option value="Breakfast">Breakfast</option>
                              <option value="Drinks">Drinks</option>
                              <option value="Desserts">Desserts</option>
                              <option value="Momo Specialties">Momo Specialties</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block">Description</label>
                          <textarea 
                            rows={3}
                            placeholder="A brief culinary description..."
                            value={newMenuItem.description}
                            onChange={(e) => setNewMenuItem(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full bg-white px-3 py-3 min-h-[44px] rounded-xl border border-cream-deep text-xs text-charcoal resize-none"
                          />
                        </div>

                        <div className="flex flex-col gap-2 pt-1">
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              id="menu_active" 
                              checked={newMenuItem.is_active}
                              onChange={(e) => setNewMenuItem(prev => ({ ...prev, is_active: e.target.checked }))}
                              className="accent-gold h-4 w-4"
                            />
                            <label htmlFor="menu_active" className="text-xs font-bold text-charcoal cursor-pointer">Make item active publicly</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              id="menu_featured" 
                              checked={newMenuItem.is_featured}
                              onChange={(e) => setNewMenuItem(prev => ({ ...prev, is_featured: e.target.checked }))}
                              className="accent-gold h-4 w-4"
                            />
                            <label htmlFor="menu_featured" className="text-xs font-bold text-charcoal cursor-pointer">Feature on landing section homepage</label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <button 
                            type="submit"
                            className="w-full bg-charcoal hover:bg-charcoal/95 text-gold font-bold py-3.5 min-h-[44px] rounded-xl uppercase text-[10px] tracking-wider transition-all cursor-pointer"
                          >
                            {editingMenuItem ? 'Save Delicacy Changes' : 'Add to Catalog'}
                          </button>
                          {editingMenuItem && (
                            <button 
                              type="button"
                              onClick={() => {
                                setEditingMenuItem(null);
                                setNewMenuItem({ name: '', description: '', price: 300, category: 'Mains', is_featured: false, is_active: true });
                              }}
                              className="w-full bg-cream-deep hover:bg-cream-deep/80 text-charcoal font-bold py-3.5 min-h-[44px] rounded-xl uppercase text-[10px] tracking-wider transition-all cursor-pointer"
                            >
                              Cancel Edit
                            </button>
                          )}
                        </div>
                      </form>
                    ) : null}

                    {/* Catalog list */}
                    <div className={`${isSuperAdmin ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3`}>
                      <h4 className="font-serif text-sm font-bold text-charcoal">Catalog Delicacies</h4>
                      <div className="bg-white border border-cream-deep rounded-2xl overflow-hidden shadow-xs">
                        <div className="max-h-[500px] overflow-y-auto">
                          <table className="w-full text-left text-xs text-charcoal">
                            <thead className="bg-cream-deep/40 text-charcoal font-mono uppercase text-[9px] tracking-wider border-b border-cream-deep/60">
                              <tr>
                                <th className="p-3">Delicacy / Descr</th>
                                <th className="p-3">Category</th>
                                <th className="p-3 font-mono">Price</th>
                                <th className="p-3 text-center">Status</th>
                                {isSuperAdmin && <th className="p-3 text-right">Actions</th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-cream-deep/40">
                              {menuItems.map(item => (
                                <tr key={item.id} className={`hover:bg-cream-soft/20 ${!item.is_active ? 'bg-zinc-50 opacity-60' : ''}`}>
                                  <td className="p-3">
                                    <div className="flex items-center gap-1.5">
                                      <p className="font-bold text-charcoal text-xs">{item.name}</p>
                                      {item.is_featured && <span className="bg-gold/15 text-gold-hover text-[8px] font-mono font-bold px-1 py-0.5 rounded-md">FEATURED</span>}
                                    </div>
                                    <p className="text-[10px] text-charcoal-muted leading-relaxed max-w-xs">{item.description}</p>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-cream-deep text-charcoal-muted font-mono">{item.category}</span>
                                  </td>
                                  <td className="p-3 font-mono font-semibold text-charcoal">
                                    NPR {item.price}
                                  </td>
                                  <td className="p-3 text-center space-x-2">
                                    <button 
                                      disabled={!isSuperAdmin}
                                      onClick={() => handleToggleMenuBoolean(item.id, 'is_active', item.is_active)}
                                      className={`text-[9px] font-bold px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed ${item.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-700'}`}
                                    >
                                      {item.is_active ? 'Active' : 'Muted'}
                                    </button>
                                    <button 
                                      disabled={!isSuperAdmin}
                                      onClick={() => handleToggleMenuBoolean(item.id, 'is_featured', item.is_featured)}
                                      className={`text-[9px] font-bold px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed ${item.is_featured ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-700'}`}
                                      title="Toggle Feature Card Display"
                                    >
                                      Card
                                    </button>
                                  </td>
                                  {isSuperAdmin && (
                                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                                      <button
                                        onClick={() => {
                                          setEditingMenuItem(item);
                                          setNewMenuItem({
                                            name: item.name,
                                            description: item.description || '',
                                            price: Number(item.price),
                                            category: item.category,
                                            is_featured: item.is_featured || false,
                                            is_active: item.is_active !== false
                                          });
                                        }}
                                        className="text-gold-hover hover:text-charcoal p-1 inline-block"
                                        title="Edit Delicacy"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteMenuItem(item.id)}
                                        className="text-red-500 hover:text-red-700 p-1 inline-block"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))}

                              {menuItems.length === 0 && (
                                <tr>
                                  <td colSpan={isSuperAdmin ? 5 : 4} className="p-10 text-center text-charcoal-muted">Menu database is currently empty.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 5: BUSINESS HOURS */}
              {activeTab === 'hours' && (
                <div className="space-y-6 text-left">
                  <div>
                    <h3 className="font-serif text-xl font-extrabold text-charcoal border-b pb-2 mb-1">Standard Operating Hours</h3>
                    <p className="text-xs text-charcoal-muted leading-relaxed font-light">Set days when Sutra Lounge accepts dining guests. Reservations are blocked during closed times automatically.</p>
                  </div>

                  <div className="bg-white border border-cream-deep rounded-2xl overflow-hidden shadow-xs max-w-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-charcoal text-cream-soft font-mono uppercase text-[9px] tracking-wider border-b border-cream-deep">
                        <tr>
                          <th className="p-4">Weekday</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Starts At (24H)</th>
                          <th className="p-4">Closes At (24H)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream-deep/60">
                        {businessHours.map(row => (
                          <tr key={row.weekday} className="hover:bg-cream-soft/35">
                            <td className="p-4 font-bold text-charcoal">{row.weekday}</td>
                            <td className="p-4">
                              <button
                                disabled={!isSuperAdmin}
                                onClick={() => handleUpdateHourRow(row.weekday.toLowerCase(), 'is_open', !row.is_open)}
                                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border disabled:opacity-75 disabled:cursor-not-allowed ${row.is_open ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}
                              >
                                {row.is_open ? 'OPENING DAILY' : 'CLOSED'}
                              </button>
                            </td>
                            <td className="p-4">
                              <input 
                                type="time"
                                value={row.start_time}
                                disabled={!row.is_open || !isSuperAdmin}
                                onChange={(e) => handleUpdateHourRow(row.weekday.toLowerCase(), 'start_time', e.target.value)}
                                className="bg-cream-soft border border-cream-deep px-2 py-1 rounded font-mono text-charcoal disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </td>
                            <td className="p-4">
                              <input 
                                type="time"
                                value={row.end_time}
                                disabled={!row.is_open || !isSuperAdmin}
                                onChange={(e) => handleUpdateHourRow(row.weekday.toLowerCase(), 'end_time', e.target.value)}
                                className="bg-cream-soft border border-cream-deep px-2 py-1 rounded font-mono text-charcoal disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: BLOCKED DATES */}
              {activeTab === 'blocked' && (
                <div className="space-y-6 text-left">
                  <div>
                    <h3 className="font-serif text-xl font-extrabold text-charcoal border-b pb-2 mb-1">Blocked Holiday Dates</h3>
                    <p className="text-xs text-charcoal-muted leading-relaxed font-light">Block specific days (holidays, private bookings, maintenance shutdowns) to prevent public reservations completely on those dates.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add blocked date */}
                    {isSuperAdmin ? (
                      <form onSubmit={handleAddBlockedDate} className="bg-cream-soft/40 border border-cream-deep rounded-2xl p-5 space-y-4 h-fit">
                        <h4 className="font-serif text-sm font-bold text-charcoal">Block Custom Date</h4>
                        
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block">Select Calendar Date *</label>
                           <input 
                            type="date"
                            required
                            value={newBlockedDate.blocked_date}
                            onChange={(e) => setNewBlockedDate(prev => ({ ...prev, blocked_date: e.target.value }))}
                            className="w-full bg-white px-3 py-3.5 min-h-[44px] rounded-xl border border-cream-deep text-xs font-mono text-charcoal"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block">Reason (e.g. Dashain Festival closure)</label>
                          <input 
                            type="text"
                            placeholder="e.g. National Holy Day"
                            value={newBlockedDate.reason}
                            onChange={(e) => setNewBlockedDate(prev => ({ ...prev, reason: e.target.value }))}
                            className="w-full bg-white px-3 py-3.5 min-h-[44px] rounded-xl border border-cream-deep text-xs text-charcoal"
                          />
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-charcoal hover:bg-charcoal/95 text-gold font-bold py-3.5 min-h-[44px] rounded-xl uppercase text-[10px] tracking-wider transition-all cursor-pointer"
                        >
                          Authorize Blockout
                        </button>
                      </form>
                    ) : null}

                    {/* Blocked Dates list */}
                    <div className={`${isSuperAdmin ? 'lg:col-span-1' : 'lg:col-span-2'} space-y-3`}>
                      <h4 className="font-serif text-sm font-bold text-charcoal">Authorized Blockouts</h4>
                      <div className="bg-white border border-cream-deep rounded-2xl overflow-hidden shadow-xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-cream-deep/40 text-charcoal font-mono uppercase text-[9px] tracking-wider border-b border-cream-deep/60">
                            <tr>
                              <th className="p-3">Blocked Date</th>
                              <th className="p-3">Reason</th>
                              {isSuperAdmin && <th className="p-3 text-right">Delete</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-cream-deep/40">
                            {blockedDates.map(row => (
                              <tr key={row.id} className="hover:bg-cream-soft/20">
                                <td className="p-3 font-mono font-bold text-charcoal">{row.blocked_date}</td>
                                <td className="p-3 text-charcoal font-light">{row.reason || 'No description provided'}</td>
                                {isSuperAdmin && (
                                  <td className="p-3 text-right">
                                    <button onClick={() => handleDeleteBlockedDate(row.id)} className="text-red-500 hover:text-red-700 p-1">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}

                            {blockedDates.length === 0 && (
                              <tr>
                                <td colSpan={isSuperAdmin ? 3 : 2} className="p-8 text-center text-charcoal-muted font-light">No custom block dates registered.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: RESTAURANT RETRIEVAL AND SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-6 text-left max-w-3xl">
                  <div>
                    <h3 className="font-serif text-xl font-extrabold text-charcoal border-b pb-2 mb-1">Global Restaurant Settings</h3>
                    <p className="text-xs text-charcoal-muted leading-relaxed font-light">Configure notices, maximum capacity restrictions, and intervals for dining allocations across the reservation system.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block font-semibold">Restaurant Public Name</label>
                      <input 
                        type="text" 
                        disabled={!isSuperAdmin}
                        value={settings.restaurant_name}
                        onChange={(e) => setSettings(prev => ({ ...prev, restaurant_name: e.target.value }))}
                        className="w-full bg-cream-soft/40 px-3 py-2 border border-cream-deep rounded-xl text-xs font-semibold text-charcoal disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block font-semibold">Restaurant Email</label>
                      <input 
                        type="email" 
                        disabled={!isSuperAdmin}
                        value={settings.restaurant_email}
                        onChange={(e) => setSettings(prev => ({ ...prev, restaurant_email: e.target.value }))}
                        className="w-full bg-cream-soft/40 px-3 py-2 border border-cream-deep rounded-xl text-xs font-mono text-charcoal disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block font-semibold">Contact Direct Phone</label>
                      <input 
                        type="text" 
                        disabled={!isSuperAdmin}
                        value={settings.restaurant_phone}
                        onChange={(e) => setSettings(prev => ({ ...prev, restaurant_phone: e.target.value }))}
                        className="w-full bg-cream-soft/40 px-3 py-2 border border-cream-deep rounded-xl text-xs font-mono text-charcoal disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block font-semibold">Seat Limit (Max Party Size)</label>
                      <input 
                        type="number" 
                        disabled={!isSuperAdmin}
                        value={settings.max_party_size}
                        onChange={(e) => setSettings(prev => ({ ...prev, max_party_size: Number(e.target.value) }))}
                        className="w-full bg-cream-soft/40 px-3 py-2 border border-cream-deep rounded-xl text-xs font-mono text-charcoal disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block font-semibold">Physical Location Address</label>
                      <input 
                        type="text" 
                        disabled={!isSuperAdmin}
                        value={settings.restaurant_address}
                        onChange={(e) => setSettings(prev => ({ ...prev, restaurant_address: e.target.value }))}
                        className="w-full bg-cream-soft/40 px-3 py-2 border border-cream-deep rounded-xl text-xs font-light text-charcoal disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block font-semibold">Booking Slot Interval (Minutes)</label>
                      <input 
                        type="number" 
                        disabled={!isSuperAdmin}
                        value={settings.slot_interval_minutes}
                        onChange={(e) => setSettings(prev => ({ ...prev, slot_interval_minutes: Number(e.target.value) }))}
                        className="w-full bg-cream-soft/40 px-3 py-2 border border-cream-deep rounded-xl text-xs font-mono text-charcoal disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block font-semibold">Default Seating Block (Minutes)</label>
                      <input 
                        type="number" 
                        disabled={!isSuperAdmin}
                        value={settings.default_reservation_duration_minutes}
                        onChange={(e) => setSettings(prev => ({ ...prev, default_reservation_duration_minutes: Number(e.target.value) }))}
                        className="w-full bg-cream-soft/40 px-3 py-2 border border-cream-deep rounded-xl text-xs font-mono text-charcoal disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block font-semibold">Required Notice Lead Time (Hours)</label>
                      <input 
                        type="number" 
                        disabled={!isSuperAdmin}
                        value={settings.booking_notice_hours}
                        onChange={(e) => setSettings(prev => ({ ...prev, booking_notice_hours: Number(e.target.value) }))}
                        className="w-full bg-cream-soft/40 px-3 py-2 border border-cream-deep rounded-xl text-xs font-mono text-charcoal disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <p className="text-[9px] text-charcoal-muted font-mono leading-relaxed mt-1">Guests cannot book tables starting sooner than this amount of hours after the current clock time.</p>
                    </div>

                    <div className="space-y-1.5 md:col-span-2 border-t border-cream-deep pt-4 mt-2">
                      <h4 className="font-serif text-sm font-bold text-charcoal flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-gold" />
                        <span>Media Customization Assets</span>
                      </h4>
                      <p className="text-[10px] text-charcoal-muted font-light">Custom secure HTTPS image links deployed to the public interface. Standard static files or cloud storage URLs are supported.</p>
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block font-semibold flex items-center gap-1">
                        <Shield className="w-3 h-3 text-gold" />
                        <span>Hero Background Image URL (Secure HTTPS)</span>
                      </label>
                      <input 
                        type="url" 
                        disabled={!isSuperAdmin}
                        placeholder="https://example.com/hero-bg.jpg (Secure protocol required)"
                        value={settings.hero_image_url || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, hero_image_url: e.target.value }))}
                        className="w-full bg-cream-soft/40 px-3 py-2 border border-cream-deep rounded-xl text-xs font-mono text-charcoal disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <p className="text-[9px] text-charcoal-muted font-mono leading-relaxed mt-1">Provide a secure URL (starting with https) to override the default hero background image.</p>
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block font-semibold flex items-center gap-1">
                        <Shield className="w-3 h-3 text-gold" />
                        <span>Special Featured Dish Image URL (Secure HTTPS)</span>
                      </label>
                      <input 
                        type="url" 
                        disabled={!isSuperAdmin}
                        placeholder="https://example.com/dish.jpg (Secure protocol required)"
                        value={settings.dish_image_url || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, dish_image_url: e.target.value }))}
                        className="w-full bg-cream-soft/40 px-3 py-2 border border-cream-deep rounded-xl text-xs font-mono text-charcoal disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <p className="text-[9px] text-charcoal-muted font-mono leading-relaxed mt-1">Provide a secure URL (starting with https) to override the main featured chicken sandwich dish image.</p>
                    </div>
                  </div>

                  {isSuperAdmin && (
                    <button 
                      type="submit"
                      className="bg-gold hover:bg-gold-hover text-cream-soft font-bold rounded-xl px-6 py-3 uppercase text-xs tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <Save className="w-4 h-4 text-charcoal" />
                      <span>Apply System Parameters</span>
                    </button>
                  )}
                </form>
              )}

              {activeTab === 'admins' && (
                <div className="space-y-6 text-left">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-charcoal">Sutralounge Security Registry</h3>
                    <p className="text-xs text-charcoal-muted leading-relaxed font-light">Register, audit, and revoke administrative credentials. Users mapped in this security database obtain full database modification permissions.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {isSuperAdmin ? (
                      <form onSubmit={handleAddAdmin} className="space-y-4 bg-cream-soft/40 p-5 border border-cream-deep/60 rounded-2xl h-fit">
                        <h4 className="font-bold text-xs tracking-wider uppercase text-charcoal pb-2 border-b border-cream-deep/40">Register New Admin</h4>
                        
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block font-semibold">User Authentication ID (UID)</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. 5xX3PzpL7bSdf..."
                            value={newAdmin.user_id}
                            onChange={(e) => setNewAdmin(prev => ({ ...prev, user_id: e.target.value }))}
                            className="w-full bg-white px-3 py-2 border border-cream-deep rounded-xl text-xs font-mono text-charcoal focus:ring-1 focus:ring-gold outline-none"
                          />
                          <p className="text-[9px] text-charcoal-muted font-mono leading-normal">Can be retrieved from Firebase Console Auth or provided by dynamic Google/Email login sessions.</p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block font-semibold">Admin Email Label</label>
                          <input 
                            type="email" 
                            placeholder="e.g. user@example.com"
                            value={newAdmin.email}
                            onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full bg-white px-3 py-2 border border-cream-deep rounded-xl text-xs font-mono text-charcoal focus:ring-1 focus:ring-gold outline-none"
                          />
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-gold hover:bg-gold-hover text-charcoal font-bold rounded-xl py-3 uppercase text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4 text-charcoal" />
                          <span>Authorize Administrator</span>
                        </button>
                      </form>
                    ) : null}

                    <div className={`${isSuperAdmin ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
                      <div className="border border-cream-deep/60 rounded-2xl overflow-hidden bg-white">
                        <div className="bg-cream-soft/60 px-4 py-3.5 border-b border-cream-deep/60">
                          <h4 className="font-bold text-xs tracking-wider uppercase text-charcoal">Authorized Registry Checklist</h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-charcoal">
                            <thead>
                              <tr className="bg-cream-soft/25 border-b border-cream-deep/40 font-mono text-[10px] tracking-wider text-charcoal-muted uppercase">
                                <th className="p-3">User UID (Primary Key)</th>
                                <th className="p-3">Email Reference</th>
                                <th className="p-3">Authorization Date</th>
                                {isSuperAdmin && <th className="p-3 text-right">Actions</th>}
                              </tr>
                            </thead>
                            <tbody>
                              {adminUsers.map(adm => (
                                <tr key={adm.id} className="border-b border-cream-deep/30 hover:bg-cream-soft/10 transition-colors">
                                  <td className="p-3 font-mono font-medium text-gold select-all">{adm.user_id}</td>
                                  <td className="p-3">{adm.email || 'No label'}</td>
                                  <td className="p-3 text-charcoal-muted font-light">{adm.created_at ? new Date(adm.created_at).toLocaleString() : 'N/A'}</td>
                                  {isSuperAdmin && (
                                    <td className="p-3 text-right">
                                      <button 
                                        type="button"
                                        onClick={() => handleDeleteAdmin(adm.id)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        title="Revoke Administrative Authorization"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))}

                              {/* Standard system fallbacks */}
                              <tr className="border-b border-cream-deep/20 bg-gold/5 italic text-charcoal/80">
                                <td className="p-3 font-mono">System Hardcoded Administrator</td>
                                <td className="p-3 font-semibold text-gold">admin@sutralounge.com.np</td>
                                <td className="p-3 font-light text-charcoal-muted/70">Bootstrap default</td>
                                {isSuperAdmin && <td className="p-3 text-right font-mono text-[9px] uppercase pr-4 select-none text-zinc-400">Protected</td>}
                              </tr>
                              <tr className="border-b border-cream-deep/20 bg-gold/5 italic text-charcoal/80">
                                <td className="p-3 font-mono">Owner Dynamic Administrator</td>
                                <td className="p-3 font-semibold text-gold">j7259022@gmail.com</td>
                                <td className="p-3 font-light text-charcoal-muted/70">Owner account preset</td>
                                {isSuperAdmin && <td className="p-3 text-right font-mono text-[9px] uppercase pr-4 select-none text-zinc-400">Protected</td>}
                              </tr>

                              {adminUsers.length === 0 && (
                                <tr>
                                  <td colSpan={isSuperAdmin ? 4 : 3} className="p-5 text-center text-charcoal-muted italic font-light">No additional dynamic administrators registered. Fill form to add custom permissions.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
