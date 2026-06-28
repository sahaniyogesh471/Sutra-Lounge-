import React, { useState, useRef, useEffect } from 'react';
import { 
  Phone, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Mail, 
  Check, 
  ChevronDown, 
  Menu, 
  X, 
  Utensils, 
  ChefHat, 
  ShoppingBag, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Star,
  DollarSign,
  Facebook,
  Instagram,
  Tv,
  Flame,
  Wifi,
  Truck,
  Calendar,
  Users,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BUSINESS_DETAILS as INITIAL_BUSINESS_DETAILS, SERVICES_LIST as INITIAL_SERVICES_LIST, FAQS as INITIAL_FAQS, REASSURANCE_POINTS as INITIAL_REASSURANCE_POINTS, MENU_HIGHLIGHTS as INITIAL_MENU_HIGHLIGHTS, AUTHENTIC_REVIEWS as INITIAL_AUTHENTIC_REVIEWS, OWNER_UPDATE as INITIAL_OWNER_UPDATE, MAPS_GALLERY_PHOTOS as INITIAL_MAPS_GALLERY_PHOTOS, PROMO_ANNOUNCEMENTS as INITIAL_PROMO_ANNOUNCEMENTS } from './data';
import { InquiryForm } from './types';
import { LazyImage } from './components/LazyImage';
import { AdminPanel } from './components/AdminPanel';
import { 
  db, 
  seedDatabaseIfEmpty, 
  handleFirestoreError, 
  OperationType,
  collection, 
  onSnapshot, 
  addDoc 
} from './firebase';
import { 
  LanguageType, 
  STATIC_TRANSLATIONS, 
  MENU_TRANSLATIONS, 
  SERVICES_TRANSLATIONS, 
  FAQS_TRANSLATIONS, 
  PHOTO_TRANSLATIONS,
  SERVICE_TYPE_NAMES
} from './translations';

// Reusable SVG TikTok Icon
export const TikTokIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.63 4.14 1.02 1.11 2.44 1.8 3.93 1.95v3.93a11.51 11.51 0 0 1-5.54-1.5 5.56 5.56 0 0 1-.02 5.07c-1.02 2.25-3.1 3.8-5.54 4.1-2.43.3-4.9-.5-6.52-2.3C2.8 13.62 2.2 11.13 2.72 8.7a8.24 8.24 0 0 1 5.4-6.1c1.3-.41 2.69-.37 3.94.13.04.75-.01 1.5.01 2.25-.97-.42-2.07-.46-3.07-.12a5.56 5.56 0 0 0-3.5 4.88 5.56 5.56 0 0 0 5.02 5.54c2.5.25 4.85-1.32 5.37-3.77.16-.76.13-1.54.11-2.31c0-3.07-.01-6.13-.01-9.2z" />
  </svg>
);

// Hero images hosted on ImgBB CDN for fast global delivery
const heroImage = 'https://i.ibb.co/wNNbMTxY/sutra-hero-bg.png';
const dishImage = 'https://i.ibb.co/Xxd8hkQb/sutra-hero-dish.png';

// Premium Cinematic Animation Presets
// NOTE: keep transitions short — long staggered delays cause content to appear "hidden"
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0 }
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
  }
};

// Safe storage helper to avoid crashes in restricted sandboxes (e.g. iframes, private browsing)
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`[SafeStorage] Could not read key "${key}":`, e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[SafeStorage] Could not write key "${key}":`, e);
    }
  }
};

// Handpicked signature offerings reflecting the pride & culinary art of Sutra Lounge, Hetauda
const SIGNATURE_DISHES = [
  {
    title: 'Sizzling Chicken Tandoori Platter',
    price: 'NPR 1,150',
    description: 'Traditional bone-in chicken thighs marinated overnight in hand-ground ginger-garlic paste and spicy local mountain herbs, clay-oven roasted to succulent smoky perfection. Served sizzling with glazed onions.',
    badge: 'Chef Specialty',
    image: 'https://i.ibb.co/S4mZt4v1/sutra-tandoori.png'
  },
  {
    title: 'Signature Toast Chicken Sandwich',
    price: 'NPR 550',
    description: 'The definitive town favorite. Hand-sliced bread grilled butter-crisp, stacked double with seasoned pan-grilled chicken, Swiss cheese, fresh lettuce, tomatoes, and secret signature lounge dressing.',
    badge: 'Town Favorite',
    image: 'https://i.ibb.co/V0pPPSFR/sutra-chicken-sandwich.png'
  },
  {
    title: 'Fresh Pancakes Breakfast Combo',
    price: 'NPR 490',
    description: 'Fluffy golden-brown handcrafted pancakes served sweet with organic honey syrup, complete with your choice of premium brewed Himalayan coffee or high-altitude green tea.',
    badge: 'Breakfast Sensation',
    image: 'https://i.ibb.co/QjMZ1Tfj/sutra-pancakes.png'
  },
  {
    title: 'Classic Mint Virgin Mojito',
    price: 'NPR 280',
    description: 'An invigorating specialty cooler blending muddled fresh garden-plucked mint sprigs, organic key limes, pure cane sugar syrup, and premium carbonated mountain soda over crushed ice.',
    badge: 'Mixology Craft',
    image: 'https://i.ibb.co/FbPRRd4g/sutra-mint-mojito.png'
  }
];

const formatTimeTo12Hour = (timeStr: string) => {
  if (!timeStr) return '';
  try {
    const [hoursStr, minutesStr] = timeStr.split(':');
    const hours = parseInt(hoursStr, 10);
    if (isNaN(hours)) return timeStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutesStr || '00'} ${ampm}`;
  } catch (e) {
    return timeStr;
  }
};

export default function App() {
  // Seeding and Firestore Sync States
  const [dbReservations, setDbReservations] = useState<any[]>([]);
  const [dbTables, setDbTables] = useState<any[]>([]);
  const [dbBusinessHours, setDbBusinessHours] = useState<any[]>([]);
  const [dbBlockedDates, setDbBlockedDates] = useState<any[]>([]);
  const [dbSettings, setDbSettings] = useState<any>({
    restaurant_name: "Sutra Lounge",
    restaurant_email: "info@sutralounge.com.np",
    restaurant_phone: "+977 1500000",
    restaurant_address: "Nagar Bikash Samiti Marg, Hetauda 44107, Nepal",
    slot_interval_minutes: 30,
    booking_notice_hours: 2,
    default_reservation_duration_minutes: 90,
    max_party_size: 20,
    hero_image_url: "",
    dish_image_url: ""
  });
  const [dbMenuItems, setDbMenuItems] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);

  // Trigger seeding once on app load
  useEffect(() => {
    seedDatabaseIfEmpty();
  }, []);

  // Listen to Firestore updates
  useEffect(() => {
    const unsubReservations = onSnapshot(collection(db, 'reservations'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDbReservations(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reservations');
    });
    const unsubTables = onSnapshot(collection(db, 'restaurant_tables'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDbTables(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'restaurant_tables');
    });
    const unsubHours = onSnapshot(collection(db, 'business_hours'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ weekday: doc.id, ...doc.data() }));
      setDbBusinessHours(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'business_hours');
    });
    const unsubBlocked = onSnapshot(collection(db, 'blocked_dates'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDbBlockedDates(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'blocked_dates');
    });
    const unsubSettings = onSnapshot(collection(db, 'restaurant_settings'), (snapshot) => {
      const defaultDoc = snapshot.docs.find(doc => doc.id === 'default');
      if (defaultDoc) {
        const data = defaultDoc.data() || {};
        setDbSettings({
          restaurant_name: data.restaurant_name || "Sutra Lounge",
          restaurant_email: data.restaurant_email || "info@sutralounge.com.np",
          restaurant_phone: data.restaurant_phone || "+977 1500000",
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
    const unsubMenu = onSnapshot(collection(db, 'menu_items'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDbMenuItems(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'menu_items');
    });

    return () => {
      unsubReservations();
      unsubTables();
      unsubHours();
      unsubBlocked();
      unsubSettings();
      unsubMenu();
    };
  }, []);

  // Dynamic slot calculations
  const calculateAvailableSlots = (selectedDateStr: string, guests: number): any[] => {
    try {
      if (!selectedDateStr) return [];
      
      // Check blocked holidays: check both fields to be completely compliant and robust
      const isBlocked = dbBlockedDates.some(b => b.date === selectedDateStr || b.blocked_date === selectedDateStr);
      if (isBlocked) {
        console.log(`[Slot Calculation] Slot generation skipped: Date ${selectedDateStr} is exists in blocked_dates.`);
        return [];
      }

      const partySize = Number(guests);
      const maxPartySize = Number(dbSettings?.max_party_size || 20);
      if (partySize > maxPartySize || partySize < 1) {
        console.log(`[Slot Calculation] Selected party size ${partySize} is outside allowed range (1 - ${maxPartySize}).`);
        return [];
      }

      // Determine weekday from date YYYY-MM-DD
      const parts = selectedDateStr.split('-');
      if (parts.length !== 3) return [];
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (isNaN(year) || isNaN(month) || isNaN(day)) return [];

      const targetDate = new Date(year, month - 1, day);
      const targetDayIndex = targetDate.getDay(); // 0-6
      const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const weekdayName = weekdayNames[targetDayIndex];

      const hoursToUse = dbBusinessHours.length > 0 ? dbBusinessHours : [
        { id: "sunday", day: "Sunday", weekday: 0, is_open: true, start_time: "12:00", end_time: "22:00" },
        { id: "monday", day: "Monday", weekday: 1, is_open: true, start_time: "12:00", end_time: "22:00" },
        { id: "tuesday", day: "Tuesday", weekday: 2, is_open: true, start_time: "12:00", end_time: "22:00" },
        { id: "wednesday", day: "Wednesday", weekday: 3, is_open: true, start_time: "12:00", end_time: "22:00" },
        { id: "thursday", day: "Thursday", weekday: 4, is_open: true, start_time: "12:00", end_time: "23:00" },
        { id: "friday", day: "Friday", weekday: 5, is_open: true, start_time: "12:00", end_time: "23:00" },
        { id: "saturday", day: "Saturday", weekday: 6, is_open: true, start_time: "12:00", end_time: "22:00" }
      ];

      const dayConfig = hoursToUse.find(h => {
        if (h.weekday === undefined || h.weekday === null) return false;
        const wkStr = String(h.weekday).trim().toLowerCase();
        // Check if numeric matching (0-6)
        if (wkStr === String(targetDayIndex)) return true;
        // Check if day name matching
        if (wkStr === weekdayName.toLowerCase()) return true;
        // Fallback checks
        if (h.day && String(h.day).toLowerCase() === weekdayName.toLowerCase()) return true;
        return false;
      });

      if (!dayConfig || !dayConfig.is_open) {
        console.log(`[Slot Calculation] Restaurant is closed on ${weekdayName}.`);
        return [];
      }

      // Parse business hours (e.g. "08:00")
      const [startHour, startMin] = dayConfig.start_time.split(':').map(Number);
      const [endHour, endMin] = dayConfig.end_time.split(':').map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      const slotInterval = Number(dbSettings?.slot_interval_minutes || 30);
      const duration = Number(dbSettings?.default_reservation_duration_minutes || 90);

      const tablesToUse = dbTables.length > 0 ? dbTables : [
        { id: "t1", table_name: "Table 1 (Window)", capacity: 2, area: "Main Hall", is_active: true },
        { id: "t2", table_name: "Table 2 (Cozy Corner)", capacity: 2, area: "Main Hall", is_active: true },
        { id: "t3", table_name: "Table 3 (Family)", capacity: 6, area: "Sutra Lounge Room", is_active: true },
        { id: "t4", table_name: "Table 4 (Cabin A)", capacity: 4, area: "Private VIP Cabin", is_active: true },
        { id: "t5", table_name: "Table 5 (Cabin B)", capacity: 4, area: "Private VIP Cabin", is_active: true },
        { id: "t6", table_name: "Table 6 (Executive Banner)", capacity: 8, area: "Private VIP Cabin", is_active: true }
      ];

      // Check active tables matching capacity: active restaurant_tables row has capacity >= party_size
      const activeTables = tablesToUse.filter(t => {
        const isActive = t.is_active === true || t.is_active === 'true' || t.is_active === undefined;
        const capacity = Number(t.capacity);
        return isActive && capacity >= partySize;
      });

      if (activeTables.length === 0) {
        console.log(`[Slot Calculation] No active tables have capacity >= ${partySize}.`);
        return [];
      }

      const slots = [];
      const now = new Date();
      const bookingNoticeHours = Number(dbSettings?.booking_notice_hours || 2);
      const noticeMs = bookingNoticeHours * 60 * 60 * 1000;

      // Start calculating slots
      for (let minutes = startMinutes; minutes + duration <= endMinutes; minutes += slotInterval) {
        const slotHour = Math.floor(minutes / 60);
        const slotMin = minutes % 60;

        const slotStart = new Date(year, month - 1, day, slotHour, slotMin, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);

        // booking notice window check: Slots that violate restaurant_settings.booking_notice_hours must be excluded
        if (slotStart.getTime() < now.getTime() + noticeMs) {
          continue;
        }

        let assignedTableId: string | null = null;

        // Try to allocate tables, sorting by capacity for optimal placement
        const sortedTables = [...activeTables].sort((a, b) => Number(a.capacity) - Number(b.capacity));

        for (const table of sortedTables) {
          // Check overlapping reservations on the same table
          const isOverlapping = dbReservations.some(res => {
            if (res.status === 'cancelled') return false; // Reservations with status = "cancelled" must NOT block tables
            if (res.table_id !== table.id) return false;
            if (res.reservation_date !== selectedDateStr) return false;

            try {
              const [resStartH, resStartM] = res.start_time.split(':').map(Number);
              const [resEndH, resEndM] = res.end_time.split(':').map(Number);

              const resStart = new Date(year, month - 1, day, resStartH, resStartM, 0, 0);
              const resEnd = new Date(year, month - 1, day, resEndH, resEndM, 0, 0);

              // Overlap rule: new_start < existing_end AND new_end > existing_start
              return slotStart.getTime() < resEnd.getTime() && slotEnd.getTime() > resStart.getTime();
            } catch (e) {
              console.error("[Slot Calculation] Error parsing overlapping reservation:", res, e);
              return false;
            }
          });

          if (!isOverlapping) {
            assignedTableId = table.id;
            break;
          }
        }

        if (assignedTableId) {
          const displayHours = slotHour % 12 || 12;
          const displayMins = slotMin.toString().padStart(2, '0');
          const ampm = slotHour >= 12 ? 'PM' : 'AM';
          const label = `${displayHours}:${displayMins} ${ampm}`;

          slots.push({
            start: slotStart,
            end: slotEnd,
            label,
            tableId: assignedTableId
          });
        }
      }

      return slots;
    } catch (error) {
      console.error("[Slot Calculation] Safety loop caught error:", error);
      return [];
    }
  };

  // Adaptive reactive states with shadow overrides for secure administration
  const [businessDetails, setBusinessDetails] = useState(() => {
    const saved = safeStorage.getItem('sutra_business_details');
    return saved ? JSON.parse(saved) : INITIAL_BUSINESS_DETAILS;
  });
  const [menuHighlights, setMenuHighlights] = useState(() => {
    const saved = safeStorage.getItem('sutra_menu_highlights');
    return saved ? JSON.parse(saved) : INITIAL_MENU_HIGHLIGHTS;
  });
  const [servicesList, setServicesList] = useState(() => {
    const saved = safeStorage.getItem('sutra_services_list');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES_LIST;
  });
  const [ownerUpdate, setOwnerUpdate] = useState(() => {
    const saved = safeStorage.getItem('sutra_owner_update');
    return saved ? JSON.parse(saved) : INITIAL_OWNER_UPDATE;
  });
  const [galleryPhotos, setGalleryPhotos] = useState(() => {
    const saved = safeStorage.getItem('sutra_gallery_photos');
    return saved ? JSON.parse(saved) : INITIAL_MAPS_GALLERY_PHOTOS;
  });
  const [faqs, setFaqs] = useState(() => {
    const saved = safeStorage.getItem('sutra_faqs');
    return saved ? JSON.parse(saved) : INITIAL_FAQS;
  });
  const [reassurancePoints, setReassurancePoints] = useState(() => {
    const saved = safeStorage.getItem('sutra_reassurance_points');
    return saved ? JSON.parse(saved) : INITIAL_REASSURANCE_POINTS;
  });
  const [authenticReviews, setAuthenticReviews] = useState(() => {
    const saved = safeStorage.getItem('sutra_authentic_reviews');
    return saved ? JSON.parse(saved) : INITIAL_AUTHENTIC_REVIEWS;
  });
  const [promoAnnouncements, setPromoAnnouncements] = useState(() => {
    const saved = safeStorage.getItem('sutra_promo_announcements');
    return saved ? JSON.parse(saved) : INITIAL_PROMO_ANNOUNCEMENTS;
  });

  // Local state for the Admin Panel modal interface
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const [heroImageUrl, setHeroImageUrl] = useState(() => {
    return safeStorage.getItem('sutra_hero_image') || '';
  });
  const [dishImageUrl, setDishImageUrl] = useState(() => {
    return safeStorage.getItem('sutra_dish_image') || '';
  });

  // Shadow variables corresponding to lower level exports
  const BUSINESS_DETAILS = {
    ...businessDetails,
    name: dbSettings?.restaurant_name || businessDetails.name,
    email: dbSettings?.restaurant_email || businessDetails.email,
    phone: dbSettings?.restaurant_phone || businessDetails.phone,
    address: dbSettings?.restaurant_address || businessDetails.address,
    hours: dbBusinessHours?.length > 0 
      ? dbBusinessHours.map(h => ({ day: h.weekday, time: h.is_open ? `${h.start_time} - ${h.end_time}` : 'Closed' }))
      : businessDetails.hours
  };
  const MENU_HIGHLIGHTS = dbMenuItems?.length > 0 
    ? dbMenuItems.filter(i => i.is_active).map(i => ({
        id: i.id,
        title: i.name,
        price: `NPR ${i.price}`,
        description: i.description,
        category: i.category,
        isPopular: i.is_featured,
        image: i.image_url || i.image || SIGNATURE_DISHES[0].image,
      }))
    : menuHighlights;
  const SERVICES_LIST = servicesList;
  const OWNER_UPDATE = ownerUpdate;
  const MAPS_GALLERY_PHOTOS = galleryPhotos;
  const FAQS = faqs;
  const REASSURANCE_POINTS = reassurancePoints;
  const AUTHENTIC_REVIEWS = authenticReviews;
  const PROMO_ANNOUNCEMENTS = promoAnnouncements;

  const [lang, setLang] = useState<LanguageType>(() => {
    try {
      const saved = localStorage.getItem('sutra_lang');
      return (saved as LanguageType) === 'ne' ? 'ne' : 'en';
    } catch (e) {
      return 'en';
    }
  });

  // Dynamic SEO Document Title update based on current language
  useEffect(() => {
    if (lang === 'ne') {
      document.title = "सुत्र लाउन्ज - हेटौंडाको उत्कृष्ट रेस्टुरेन्ट र लाउन्ज | Sutra Lounge";
    } else {
      document.title = "Sutra Lounge - Best Restaurant & Lounge in Hetauda, Nepal";
    }
  }, [lang]);

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'ne' : 'en';
    setLang(newLang);
    try {
      localStorage.setItem('sutra_lang', newLang);
    } catch (e) {
      console.warn(e);
    }
  };

  const t = (key: string): string => {
    if (STATIC_TRANSLATIONS[key]) {
      return STATIC_TRANSLATIONS[key][lang];
    }
    return key;
  };

  const translateReview = (rev: typeof INITIAL_AUTHENTIC_REVIEWS[0]) => {
    if (lang === 'en') return rev;
    
    const REVIEWS_MAPPINGS: Record<string, { role: string; timeAgo: string; content: string; highlights: string[] }> = {
      'Dipesh K. Shrestha': {
        role: 'लोकल गाइड • २२६ समीक्षाहरू',
        timeAgo: '५ महिना अगाडि',
        content: 'चिकेन पिज्जा र फ्राइड चिकेन ममः दुवै चाखेँ, असाध्यै स्वादिलो थियो। यहाँको वातावरण र सिटिङ निकै आरामदायी र शान्त छ। सेवा पनि निकै छिटो थियो।',
        highlights: ['चिकेन पिज्जा', 'फ्राइड चिकेन मःमः', 'आरामदायक वातावरण']
      },
      'Aakash Rai': {
        role: 'प्रमाणित ग्राहक',
        timeAgo: '३ महिना अगाडि',
        content: 'यहाँको अनुभव असाध्यै रमाइलो रह्यो। भेटघाट र आरामसँग खाना खानको लागि निकै उपयुक्त र स्वागतयोग्य ठाउँ छ। कर्मचारीहरूको व्यवहार निकै मित्रवत र सेवामुखी थियो।',
        highlights: ['स्वागतयोग्य वातावरण', 'मित्रवत स्टाफ', 'उत्कृष्ट सेवा']
      },
      'Kritisha Giri': {
        role: 'प्रमाणित ग्राहक',
        timeAgo: '४ महिना अगाडि',
        content: 'सुत्रमा ���ेरो अनुभव उत्कृष्ट रह्यो। मेनुमा परिकारहरूको राम्रो विविधता छ र मैले अर्डर गरेका मःमः तथा पेय पदार्थहरू ताजा र स्वादिष्ट थिए। रेस्टुरेन्टको आन्तरिक सज्जा निकै मनमोहक छ।',
        highlights: ['ताजा र स्वादिलो', 'सुन्दर आन्तरिक सज्जा', 'राम्रो विविधता']
      },
      'Niranjan Adhikari': {
        role: 'लोकल गाइड',
        timeAgo: '२ महिना अगाडि',
        content: 'हेटौंडाकै उत्कृष्ट चिकेन चिली! मूल्य र खानाको परिमाण दुवै धेरै राम्रो छ। सुनौलो एम्बियन्ट लाइटिङ सेटअपले लाउन्जलाई प्रिमियम र विलासी लुक दिएको छ।',
        highlights: ['उत्कृष्ट चिकेन चिली', 'खानाको परिमाण', 'प्रिमियम गुणस्तर']
      },
      'Sneha Shrestha': {
        role: 'प्रमाणित ग्राहक',
        timeAgo: '१ महिना अगाडि',
        content: 'सुत्र लाउन्जको वातावरण मनमोहक छ। ब्यारिस्टा क्यापुचिनो कफी र क्रिस्पी चिकेन स्यान्डविच असाध्यै मिठो छ। चिकेन स्यान्डविच साच्चै नै निकै क्रन्ची र जुसी छ।',
        highlights: ['उत्कृष्ट क्यापुचिनो कफी', 'क्रिस्पी चिकेन स्यान्डविच', 'अद्भुत वातावरण']
      },
      'Prakash Thapa': {
        role: 'बिजनेस लोकल गाइड',
        timeAgo: '६ महिना अगाडि',
        content: 'निकै व्यावसायिक हस्पिटालिटी। हामीले अफिस टिम लन्चको लागि मःमः, स्यान्डविच र पिज्जा अर्डर गरेका थियौं। प्याकेजिङ निकै सुरक्षित र खाना एकदमै तातो थियो।',
        highlights: ['सुरक्षित र तातो प्याकेजिङ', 'व्यावसायिक आतिथ्यता', 'अफिस टीम लन्च']
      }
    };
    
    const mapped = REVIEWS_MAPPINGS[rev.author];
    if (mapped) {
      return {
        ...rev,
        role: mapped.role,
        timeAgo: mapped.timeAgo,
        content: mapped.content,
        highlights: mapped.highlights
      };
    }
    return rev;
  };

  const translateDay = (day: string) => {
    if (lang === 'en') return day;
    const days: Record<string, string> = {
      'Monday': 'सोमबार',
      'Tuesday': 'मङ्गलबार',
      'Wednesday': 'बुधबार',
      'Thursday': 'बिहीबार',
      'Friday': 'शुक्रबार',
      'Saturday': 'शनिबार',
      'Sunday': 'आइतबार',
      'Daily': 'दैनिक',
      'Monday - Sunday': 'सोमबार - आइतबार'
    };
    return days[day] || day;
  };

  const translateHourTime = (timeStr: string) => {
    if (lang === 'en') return timeStr;
    return timeStr
      .replace('8:00 AM', 'बिहान ८:००')
      .replace('9:00 PM', 'बेलुका ९:००')
      .replace('AM', 'बिहान')
      .replace('PM', 'बेलुका');
  };

  const getLocalizedCategoryName = (category: string) => {
    if (lang === 'en') return category;
    if (category === 'All') return 'सबै';
    if (category === 'Interior') return 'भित्री दृश्य';
    if (category === 'Food') return 'स्वादिष्ट भोजन';
    if (category === 'Drinks') return 'पेय पदार्थ';
    if (category === 'Exterior') return 'बाहिरी दृश्य';
    const item = MENU_HIGHLIGHTS.find(i => i.category === category);
    if (item && MENU_TRANSLATIONS[item.title]) {
      return MENU_TRANSLATIONS[item.title].category;
    }
    return category;
  };

  const getTranslatedSignatureDish = (dish: typeof SIGNATURE_DISHES[0]) => {
    if (lang === 'en') return dish;
    
    let title = dish.title;
    let description = dish.description;
    let badge = dish.badge;
    
    if (dish.title.includes('Tandoori') || dish.title.includes('तन्दुरी')) {
      const tr = MENU_TRANSLATIONS['Sizzling Chicken Tandoori Platter'];
      title = tr ? tr.title : dish.title;
      description = tr ? tr.description : dish.description;
      badge = 'विशेष सेफ सिफारिस';
    } else if (dish.title.includes('Sandwich') || dish.title.includes('स्यान्डविच')) {
      const tr = MENU_TRANSLATIONS['Signature Toast Chicken Sandwich'];
      title = tr ? tr.title : dish.title;
      description = tr ? tr.description : dish.description;
      badge = 'लोकप्रिय परिकार';
    } else if (dish.title.includes('Pancakes') || dish.title.includes('प्यानकेक')) {
      const tr = MENU_TRANSLATIONS['Fresh Pancakes Breakfast'];
      title = tr ? tr.title : dish.title;
      description = tr ? tr.description : dish.description;
      badge = 'बिहानी विशेष';
    }
    
    return {
      ...dish,
      title,
      description,
      badge
    };
  };

  const translateMenuItem = (item: typeof INITIAL_MENU_HIGHLIGHTS[0]) => {
    if (lang === 'en') return item;
    const translation = MENU_TRANSLATIONS[item.title];
    if (translation) {
      return {
        ...item,
        title: translation.title,
        category: translation.category,
        description: translation.description
      };
    }
    return item;
  };

  const translateService = (service: typeof INITIAL_SERVICES_LIST[0]) => {
    if (lang === 'en') return service;
    const translation = SERVICES_TRANSLATIONS[service.id];
    if (translation) {
      return {
        ...service,
        title: translation.title,
        description: translation.description,
        features: translation.features
      };
    }
    return service;
  };

  const translateFaq = (faq: typeof INITIAL_FAQS[0]) => {
    if (lang === 'en') return faq;
    const translation = FAQS_TRANSLATIONS[faq.question];
    if (translation) {
      return {
        ...faq,
        question: translation.question,
        answer: translation.answer
      };
    }
    return faq;
  };

  const translatePhoto = (photo: typeof INITIAL_MAPS_GALLERY_PHOTOS[0]) => {
    if (lang === 'en') return photo;
    const translation = PHOTO_TRANSLATIONS[photo.caption];
    if (translation) {
      return {
        ...photo,
        caption: translation
      };
    }
    return photo;
  };

  const getTranslatedReassuranceTitle = (title: string) => {
    if (lang === 'en') return title;
    if (title.includes('4.2★')) return t('features_google_rating_title');
    if (title.includes('Local Sourcing')) return t('features_local_sourcing_title');
    if (title.includes('Chill Zone')) return t('features_chill_zone_title');
    return title;
  };

  const getTranslatedReassuranceDesc = (title: string, desc: string) => {
    if (lang === 'en') return desc;
    if (title.includes('4.2★')) return t('features_google_rating_desc');
    if (title.includes('Local Sourcing')) return t('features_local_sourcing_desc');
    if (title.includes('Chill Zone')) return t('features_chill_zone_desc');
    return desc;
  };

  const getTranslatedAnnouncement = (ann: string) => {
    if (lang === 'en') return ann;
    if (ann.includes('Anniversary')) return '🎉 हाम्रो ५ औं वार्षिकोत्सव मनाउँदै! हेटौंडालाई प्रिमियम स्वादका साथ सेवा गर्दैछौं। ❤️';
    if (ann.includes('Breakfast')) return '🍳 दैनिक बिहान ७:०० दे�����ि ११:०० सम्म ब्रेकफास्ट कम्बो सक्रिय — कफी, प्यानकेक र थप!';
    if (ann.includes('Hookah')) return '💨 हुक्का स्पेशल: प्रिमियम शिसा सेटअप मात्र रु. ३४५ मा हरेक दिन दिउँसो २:०० बजेसम्म!';
    if (ann.includes('Friday')) return '🔥 विशेष शुक्रबार: इन्डियन र तन्दुरी परिकारहरूमा ५०% छुट र प्रत्यक्ष संगीत साँझ! 🎸';
    return ann;
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedReviewStar, setSelectedReviewStar] = useState<number | 'All'>('All');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState<string>('All');
  const [currentPromoIdx, setCurrentPromoIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPromoIdx(prev => (prev + 1) % PROMO_ANNOUNCEMENTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Local date-formatting helper to handle timezone safely
  const getTodayDateString = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayVal = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dayVal}`;
  };

  const isTimeInPast = (timeStr: string, dateStr: string) => {
    if (!timeStr || !dateStr) return false;
    const today = getTodayDateString();
    if (dateStr < today) return true;
    if (dateStr > today) return false;
    
    // Hour and minute comparison with current local hours/minutes
    const parts = timeStr.split(':');
    if (parts.length < 2) return false;
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    if (isNaN(h) || isNaN(m)) return false;

    const d = new Date();
    const currentHour = d.getHours();
    const currentMin = d.getMinutes();
    
    if (h < currentHour) return true;
    if (h === currentHour && m < currentMin) return true;
    return false;
  };

  const timeOptions = [
    { value: "08:00", label: "8:00 AM / बिहान ८:००" },
    { value: "08:30", label: "8:30 AM / बिहान ८:३०" },
    { value: "09:00", label: "9:00 AM / बिहान ९:००" },
    { value: "09:30", label: "9:30 AM / बिहान ९:३०" },
    { value: "10:00", label: "10:00 AM / बिहान १०:००" },
    { value: "10:30", label: "10:30 AM / बिहान १०:३०" },
    { value: "11:00", label: "11:00 AM / बिहान ११:००" },
    { value: "11:30", label: "11:30 AM / बिहान ११:३०" },
    { value: "12:00", label: "12:00 PM / दिउँसो १२:००" },
    { value: "12:30", label: "12:30 PM / दिउँसो १२:३०" },
    { value: "13:00", label: "1:00 PM / दिउँसो १:००" },
    { value: "13:30", label: "1:30 PM / दिउँसो १:३०" },
    { value: "14:00", label: "2:00 PM / दिउँसो २:००" },
    { value: "14:30", label: "2:30 PM / दिउँसो २:३०" },
    { value: "15:00", label: "3:00 PM / दिउँसो ३:००" },
    { value: "15:30", label: "3:30 PM / दिउँसो ३:३०" },
    { value: "16:00", label: "4:00 PM / दिउँसो ४:००" },
    { value: "16:30", label: "4:30 PM / दिउँसो ४:३०" },
    { value: "17:00", label: "5:00 PM / बेलुका ५:००" },
    { value: "17:30", label: "5:30 PM / बेलुका ५:३०" },
    { value: "18:00", label: "6:00 PM / बेलुका ६:००" },
    { value: "18:30", label: "6:30 PM / बेलुका ६:३०" },
    { value: "19:00", label: "7:00 PM / बेलुका ७:००" },
    { value: "19:30", label: "7:30 PM / बेलुका ७:३०" },
    { value: "20:00", label: "8:00 PM / बेलुका ८:००" },
    { value: "20:30", label: "8:30 PM / बेलुका ८:३०" },
    { value: "21:00", label: "9:00 PM / बेलुका ९:००" }
  ];

  const getInitialTime = () => {
    const todayStr = getTodayDateString();
    const defaultVal = '18:00';
    if (!isTimeInPast(defaultVal, todayStr)) {
      return defaultVal;
    }
    const firstOption = timeOptions.find(opt => !isTimeInPast(opt.value, todayStr));
    return firstOption ? firstOption.value : '18:00';
  };

  const getInitialDateAndTime = () => {
    const todayStr = getTodayDateString();
    const firstOption = timeOptions.find(opt => !isTimeInPast(opt.value, todayStr));
    if (firstOption) {
      return {
        date: todayStr,
        time: firstOption.value
      };
    } else {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayVal = String(d.getDate()).padStart(2, '0');
      const tomorrowStr = `${y}-${m}-${dayVal}`;
      return {
        date: tomorrowStr,
        time: '12:00'
      };
    }
  };

  // Form persistence in current browser session
  const [form, setForm] = useState<InquiryForm>(() => {
    const initData = getInitialDateAndTime();
    return {
      name: '',
      phone: '',
      email: '',
      date: initData.date,
      time: initData.time,
      serviceType: 'Dine-In',
      guests: 2,
      message: '',
      subscribe: true
    };
  });

  const [submittedReservations, setSubmittedReservations] = useState<InquiryForm[]>([]);

  // Refs for navigation anchoring
  const menuSectionRef = useRef<HTMLDivElement>(null);
  const servicesSectionRef = useRef<HTMLDivElement>(null);
  const storySectionRef = useRef<HTMLDivElement>(null);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);
  const contactSectionRef = useRef<HTMLDivElement>(null);
  const locationSectionRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
      setTimeout(() => {
        if (ref.current) {
          ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    } else {
      if (ref.current) {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const scrollToTop = () => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 200);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(BUSINESS_DETAILS.address);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormError(null); // Clear errors dynamically

    // Reset slot selection if parameters that affect availability are changed
    if (name === 'date' || name === 'guests' || name === 'serviceType') {
      setSelectedSlot(null);
    }

    if (name === 'date') {
      const today = getTodayDateString();
      if (value < today) {
        setForm(prev => {
          const initData = getInitialDateAndTime();
          return {
            ...prev,
            date: initData.date,
            time: initData.time
          };
        });
        setFormError(lang === 'en' 
          ? "Choosing past dates is not allowed. Date has been set to the next available date." 
          : "गएको मिति चयन गर्न अनुमति छैन। मिति उपलब्ध अर्को मितिमा सेट गरिएको छ।");
        return;
      } else {
        const firstOption = timeOptions.find(opt => !isTimeInPast(opt.value, value));
        const nextTime = (firstOption && isTimeInPast(form.time, value)) 
          ? firstOption.value 
          : form.time;

        setForm(prev => ({
          ...prev,
          date: value,
          time: nextTime
        }));
        setFormError(null);
        return;
      }
    }

    if (name === 'time') {
      setForm(prev => ({ ...prev, time: value }));
      if (isTimeInPast(value, form.date)) {
        setFormError(lang === 'en'
          ? "The selected time is in the past. Please choose a future time."
          : "चयन गरिएको समय बितिसकेको छ। कृपया भविष्यको समय छनोट गर्नुहोस्।");
      } else {
        setFormError(null);
      }
      return;
    }

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const today = getTodayDateString();
    if (form.date < today) {
      setFormError(lang === 'en'
        ? "Reservations on past dates are not permitted."
        : "गएको मितिको बुकिङ गर्न अनुमति छैन।");
      return;
    }

    if (form.serviceType !== 'Dine-In' && isTimeInPast(form.time, form.date)) {
      setFormError(lang === 'en'
        ? "The requested time is in the past."
        : "चयन गरिएको समय बितिसकेको छ।");
      return;
    }

    if (!form.name.trim() || !form.phone.trim()) {
      setFormError(lang === 'en'
        ? "Please fill in your name and a valid phone number to request booking!"
        : "कृपया बुकिङ अनुरोध गर्न आफ्नो पूरा नाम र एउटा मान्य फोन नम्बर भर्नुहोस्!");
      return;
    }

    const partySize = Math.floor(Number(form.guests));
    const maxPartySize = Number(dbSettings?.max_party_size || 20);

    if (form.serviceType === 'Dine-In') {
      if (partySize > maxPartySize || partySize < 1) {
        setFormError(lang === 'en'
          ? `Party size cannot exceed maximum limit of ${maxPartySize} guests.`
          : `पाहुनाको संख्या अधिकतम सीमा ${maxPartySize} भन्दा बढी हुन सक्दैन।`);
        return;
      }

      if (!selectedSlot) {
        setFormError(lang === 'en'
          ? "Please select an available dining slot from the grid below!"
          : "कृपया उपलब्ध बुकिङ समयहरू मध्ये एक चयन गर्नुहोस्!");
        return;
      }
    }

    setFormError(null);
    
    try {
      let start_time = form.time;
      let end_time = form.time;
      let table_id = "unassigned";

      if (form.serviceType === 'Dine-In' && selectedSlot) {
        table_id = selectedSlot.tableId;
        
        // Extract exact start_time and end_time formatted as "HH:MM"
        const startH = selectedSlot.start.getHours().toString().padStart(2, '0');
        const startM = selectedSlot.start.getMinutes().toString().padStart(2, '0');
        start_time = `${startH}:${startM}`;

        const endH = selectedSlot.end.getHours().toString().padStart(2, '0');
        const endM = selectedSlot.end.getMinutes().toString().padStart(2, '0');
        end_time = `${endH}:${endM}`;
      } else {
        // Fallback for non-Dine-In bookings
        try {
          const [sh, sm] = form.time.split(':').map(Number);
          const duration = dbSettings?.default_reservation_duration_minutes || 90;
          const endTotalMin = sh * 60 + sm + duration;
          const eh = Math.floor(endTotalMin / 60) % 24;
          const em = endTotalMin % 60;
          start_time = `${sh.toString().padStart(2, '0')}:${sm.toString().padStart(2, '0')}`;
          end_time = `${eh.toString().padStart(2, '0')}:${em.toString().padStart(2, '0')}`;
        } catch (e) {
          // Keep defaults
        }
      }

      // Exact schema representation mapping
      const resData = {
        full_name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim(),
        party_size: partySize,
        table_id: table_id,
        reservation_date: form.date,
        start_time: start_time,
        end_time: end_time,
        status: "pending",
        special_requests: form.message.trim() || null,
        created_at: new Date().toISOString()
      };

      try {
        await addDoc(collection(db, 'reservations'), resData);
      } catch (err: any) {
        handleFirestoreError(err, OperationType.CREATE, 'reservations');
      }
      setSubmitSuccess(true);

      // Build pre-filled WhatsApp message with full booking details
      const formattedStartTime = formatTimeTo12Hour(start_time);
      const formattedEndTime = formatTimeTo12Hour(end_time);
      const serviceTypeLabel = resData.table_id !== 'unassigned'
        ? `Dine-In (Table: ${resData.table_id})`
        : form.serviceType;

      const waMessage = `🍽️ *New Table Booking - Sutra Lounge*

👤 *Name:* ${resData.full_name}
📞 *Phone:* ${resData.phone}${resData.email ? `\n📧 *Email:* ${resData.email}` : ''}
🛎️ *Service:* ${serviceTypeLabel}
📅 *Date:* ${resData.reservation_date}
⏰ *Time:* ${formattedStartTime} – ${formattedEndTime}
👥 *Guests:* ${resData.party_size} Pax
${resData.special_requests ? `📝 *Special Requests:* ${resData.special_requests}` : ''}
📌 *Status:* Pending Confirmation

Please confirm or contact the guest. Thank you! 🙏`;

      const cleanAdminNum = getCleanWhatsAppNumber(BUSINESS_DETAILS.whatsapp);
      const waUrl = `https://wa.me/${cleanAdminNum}?text=${encodeURIComponent(waMessage)}`;

      // Short delay so success state renders before redirect
      setTimeout(() => {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }, 500);

    } catch (err: any) {
      console.error("Firestore Save Error:", err);
      setFormError(lang === 'en' 
        ? "Failed to save reservation. Please verify your database connection or try another slot." 
        : "डाटाबेस त्रुटि: बुकिङ सुरक्षित गर्न सकिएन। पुनः प्रयास गर्नुहोस्।");
    }
  };

  const resetFormAfterSubmission = () => {
    const todayStr = getTodayDateString();
    const initTime = getInitialTime();
    setForm({
      name: '',
      phone: '',
      email: '',
      date: todayStr,
      time: initTime,
      serviceType: 'Dine-In',
      guests: 2,
      message: '',
      subscribe: true
    });
    setSelectedSlot(null);
    setFormError(null);
    setSubmitSuccess(false);
  };

  const getCleanWhatsAppNumber = (whatsappStr: string) => {
    if (!whatsappStr) return '97757522111';
    return whatsappStr.replace(/[^\d]/g, '');
  };

  const getCleanPhoneUrl = (phoneStr: string) => {
    if (!phoneStr) return '';
    const cleaned = phoneStr.replace(/[^\d+]/g, '');
    return `tel:${cleaned}`;
  };

  // Custom pre-configured Nepalese WhatsApp order pre-filler format
  const getWhatsAppMessageUrl = () => {
    const formattedTime = formatTimeTo12Hour(form.time);

    const text = `🍽️ *New Table Booking - Sutra Lounge*

👤 *Name:* ${form.name}
📞 *Phone:* ${form.phone}${form.email ? `\n📧 *Email:* ${form.email}` : ''}
🛎️ *Service:* ${form.serviceType}
📅 *Date:* ${form.date}
⏰ *Time:* ${formattedTime}
👥 *Guests:* ${form.guests} Pax
${form.message ? `📝 *Special Requests:* ${form.message}` : ''}
📌 *Status:* Pending Confirmation

Please confirm or contact the guest. Thank you! 🙏`;
    const cleanNum = getCleanWhatsAppNumber(BUSINESS_DETAILS.whatsapp);
    return `https://wa.me/${cleanNum}?text=${encodeURIComponent(text)}`;
  };

  const categories = ['All', ...Array.from(new Set(MENU_HIGHLIGHTS.map(item => item.category)))];
  
  const filteredMenuItems = selectedCategory === 'All' 
    ? MENU_HIGHLIGHTS.map(translateMenuItem) 
    : MENU_HIGHLIGHTS.filter(item => item.category === selectedCategory).map(translateMenuItem);

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col font-sans text-charcoal bg-cream-soft relative antialiased">
      
      {/* TOP PROMOTIONAL ANNOUNCEMENT BAR */}
      <div id="promo-bar" className="bg-charcoal text-cream-soft py-2 px-4 border-b border-gold/15 flex justify-center items-center gap-2 relative overflow-hidden text-center text-[11px] sm:text-xs font-semibold z-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/15 via-transparent to-transparent opacity-70 pointer-events-none" />
        <div className="flex items-center gap-1.5 justify-center max-w-7xl mx-auto relative z-10 select-none">
          <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse shrink-0" />
          <AnimatePresence mode="wait">
            <motion.span
              key={currentPromoIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="tracking-wide text-cream-soft"
            >
              {getTranslatedAnnouncement(PROMO_ANNOUNCEMENTS[currentPromoIdx])}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-cream-deep/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* STICKY LUXURY NAVIGATION */}
      <header className="sticky top-0 z-50 bg-cream-soft/85 backdrop-blur-md border-b border-cream-deep">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo brand styling */}
          <button 
            onClick={scrollToTop} 
            className="flex items-center gap-3 group cursor-pointer text-left focus:outline-none bg-transparent border-none p-0"
            aria-label="Sutra Lounge Home"
          >
            <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-cream-soft font-serif font-bold text-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
              S
            </div>
            <div className="text-left">
              <span className="font-serif text-lg tracking-wider font-extrabold uppercase block text-charcoal">
                SUTRA LOUNGE
              </span>
              <span className="font-mono text-[9px] tracking-widest text-gold uppercase block -mt-1 font-semibold">
                {lang === 'en' ? 'Best Restaurant in Hetauda' : 'हेटौंडाको उत्कृष्ट रेस्टुरेन्ट'}
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <button 
              onClick={scrollToTop} 
              className="text-xs tracking-wider uppercase font-bold text-charcoal hover:text-gold transition-colors cursor-pointer focus:outline-none bg-transparent border-none p-0"
            >
              {t('nav_home')}
            </button>
            <button 
              onClick={() => scrollToSection(menuSectionRef)} 
              className="text-xs tracking-wider uppercase font-bold text-charcoal-muted hover:text-gold transition-colors cursor-pointer focus:outline-none bg-transparent border-none p-0"
            >
              {t('nav_menu')}
            </button>
            <button 
              onClick={() => scrollToSection(servicesSectionRef)} 
              className="text-xs tracking-wider uppercase font-bold text-charcoal-muted hover:text-gold transition-colors cursor-pointer focus:outline-none bg-transparent border-none p-0"
            >
              {t('nav_services')}
            </button>
            <button 
              onClick={() => scrollToSection(storySectionRef)} 
              className="text-xs tracking-wider uppercase font-bold text-charcoal-muted hover:text-gold transition-colors cursor-pointer focus:outline-none bg-transparent border-none p-0"
            >
              {t('nav_story')}
            </button>
            <button 
              onClick={() => scrollToSection(reviewsSectionRef)} 
              className="text-xs tracking-wider uppercase font-bold text-charcoal-muted hover:text-gold transition-colors cursor-pointer focus:outline-none bg-transparent border-none p-0"
            >
              {t('nav_reviews')}
            </button>
          </nav>

          {/* Contact Core Actions */}
          <div className="hidden lg:flex items-center gap-5">
            {/* Social media quick follows */}
            <div className="flex items-center gap-2 border-r border-cream-deep pr-4">
              {BUSINESS_DETAILS.facebookLink && (
                <a 
                  href={BUSINESS_DETAILS.facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-cream-deep text-charcoal hover:bg-gold hover:text-cream-soft flex items-center justify-center transition-all duration-300 shadow-2xs"
                  title="Follow us on Facebook"
                  aria-label="Sutra Lounge Facebook Page"
                >
                  <Facebook className="w-4.5 h-4.5" />
                </a>
              )}
              {BUSINESS_DETAILS.instagramLink && (
                <a 
                  href={BUSINESS_DETAILS.instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-cream-deep text-charcoal hover:bg-gold hover:text-cream-soft flex items-center justify-center transition-all duration-300 shadow-2xs"
                  title="Follow us on Instagram"
                  aria-label="Sutra Lounge Instagram Profile"
                >
                  <Instagram className="w-4.5 h-4.5" />
                </a>
              )}
              {BUSINESS_DETAILS.tiktokLink && (
                <a 
                  href={BUSINESS_DETAILS.tiktokLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-cream-deep text-charcoal hover:bg-gold hover:text-cream-soft flex items-center justify-center transition-all duration-300 shadow-2xs"
                  title="Follow us on TikTok"
                  aria-label="Sutra Lounge TikTok Profile"
                >
                  <TikTokIcon className="w-4 h-4" />
                </a>
              )}
            </div>
            
            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-full border border-gold/40 hover:border-gold hover:bg-gold/5 flex items-center gap-1 mt-[2px] text-[11px] font-bold tracking-wider text-charcoal cursor-pointer uppercase transition-all duration-300"
              title="Change Language / भाषा परिवर्तन"
            >
              <span className={`transition-opacity duration-200 ${lang === 'en' ? 'text-gold' : 'text-charcoal-muted/65'}`}>EN</span>
              <span className="text-gold/30 font-light">|</span>
              <span className={`transition-opacity duration-200 ${lang === 'ne' ? 'text-gold' : 'text-charcoal-muted/65'}`}>NEP</span>
            </button>

            <a 
              href={getCleanPhoneUrl(BUSINESS_DETAILS.phone)} 
              className="flex items-center gap-2 text-sm font-semibold text-charcoal hover:text-gold transition-colors"
              id="top-phone-action"
            >
              <div className="w-8 h-8 rounded-full bg-gold-light flex items-center justify-center text-gold">
                <Phone className="w-4 h-4" />
              </div>
              <span className="font-mono text-xs">{BUSINESS_DETAILS.phone}</span>
            </a>
            
            <button 
              onClick={() => scrollToSection(contactSectionRef)}
              className="bg-gold hover:bg-gold-hover text-cream-soft px-6 py-3 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 hover:shadow-md cursor-pointer"
              id="top-cta-action"
            >
              {t('nav_visit_reserve')}
            </button>
          </div>

          {/* Mobile Hamburguer Trigger */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-2.5 h-[38px] min-w-[38px] bg-cream-deep/60 text-charcoal border border-gold/15 rounded-full hover:bg-cream-deep transition-colors text-[10px] font-extrabold flex items-center justify-center cursor-pointer uppercase select-none"
              title="Change Language / भाषा"
              aria-label="Language Toggle"
            >
              {lang === 'en' ? 'नेप' : 'EN'}
            </button>
            <a 
              href={getCleanPhoneUrl(BUSINESS_DETAILS.phone)} 
              className="p-2.5 bg-gold-light text-gold rounded-full hover:bg-cream-deep transition-colors"
              aria-label="Call Business"
            >
              <Phone className="w-4.5 h-4.5" />
            </a>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 bg-cream-deep rounded-full text-charcoal transition-colors focus:outline-none cursor-pointer"
              aria-label="Menu Toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 font-bold" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-cream-deep bg-cream-soft overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                {/* Language switch box in mobile drawer */}
                <div className="flex items-center justify-between pb-3.5 border-b border-cream-deep">
                  <span className="text-xs font-bold text-charcoal-muted uppercase tracking-wider">Language / भाषा</span>
                  <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cream-deep/60 rounded-full text-xs font-bold text-gold cursor-pointer uppercase transition-all duration-300 border border-gold/15"
                  >
                    <span>{lang === 'en' ? 'नेपाली (NEP)' : 'English (EN)'}</span>
                  </button>
                </div>

                <button 
                  onClick={() => { scrollToTop(); setMobileMenuOpen(false); }} 
                  className="block w-full text-left text-sm font-bold uppercase tracking-wider text-charcoal py-2 border-b border-cream-deep cursor-pointer focus:outline-none bg-transparent border-none p-0"
                >
                  {t('nav_home')}
                </button>
                <button 
                  onClick={() => { scrollToSection(menuSectionRef); setMobileMenuOpen(false); }}
                  className="block w-full text-left text-sm font-bold uppercase tracking-wider text-charcoal py-2 border-b border-cream-deep cursor-pointer focus:outline-none bg-transparent border-none p-0"
                >
                  {t('nav_menu')}
                </button>
                <button 
                  onClick={() => { scrollToSection(servicesSectionRef); setMobileMenuOpen(false); }}
                  className="block w-full text-left text-sm font-bold uppercase tracking-wider text-charcoal py-2 border-b border-cream-deep cursor-pointer focus:outline-none bg-transparent border-none p-0"
                >
                  {t('nav_services')}
                </button>
                <button 
                  onClick={() => { scrollToSection(storySectionRef); setMobileMenuOpen(false); }}
                  className="block w-full text-left text-sm font-bold uppercase tracking-wider text-charcoal py-2 border-b border-cream-deep cursor-pointer focus:outline-none bg-transparent border-none p-0"
                >
                  {t('nav_story')}
                </button>
                <button 
                  onClick={() => { scrollToSection(reviewsSectionRef); setMobileMenuOpen(false); }}
                  className="block w-full text-left text-sm font-bold uppercase tracking-wider text-charcoal py-2 border-b border-cream-deep cursor-pointer focus:outline-none bg-transparent border-none p-0"
                >
                  {t('nav_reviews')}
                </button>
                <button 
                  onClick={() => { scrollToSection(contactSectionRef); setMobileMenuOpen(false); }}
                  className="block w-full text-left text-sm font-bold uppercase tracking-wider text-gold py-2 cursor-pointer focus:outline-none bg-transparent border-none p-0"
                >
                  {t('nav_visit_reserve')}
                </button>

                <div className="pt-4 flex flex-col gap-3">
                  <a 
                    href={getCleanPhoneUrl(BUSINESS_DETAILS.phone)}
                    className="flex items-center justify-center gap-3 bg-cream-deep text-charcoal py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider h-11"
                  >
                    <Phone className="w-4 h-4 text-gold" />
                    {t('nav_call_lounge')}: {BUSINESS_DETAILS.phone}
                  </a>
                  <a 
                    href={`https://wa.me/${getCleanWhatsAppNumber(BUSINESS_DETAILS.whatsapp)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-3 bg-green-600 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider h-11"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {t('nav_whatsapp_support')}
                  </a>

                  {/* Mobile Social Follow Rows */}
                  <div className="flex gap-2 justify-center pt-2">
                    {BUSINESS_DETAILS.facebookLink && (
                      <a 
                        href={BUSINESS_DETAILS.facebookLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 bg-[#1877F2]/10 text-[#1877F2] py-2 px-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border border-[#1877F2]/15"
                      >
                        <Facebook className="w-3.5 h-3.5" />
                        <span>Facebook</span>
                      </a>
                    )}
                    {BUSINESS_DETAILS.instagramLink && (
                      <a 
                        href={BUSINESS_DETAILS.instagramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 bg-[#E1306C]/10 text-[#E1306C] py-2 px-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border border-[#E1306C]/15"
                      >
                        <Instagram className="w-3.5 h-3.5" />
                        <span>Instagram</span>
                      </a>
                    )}
                    {BUSINESS_DETAILS.tiktokLink && (
                      <a 
                        href={BUSINESS_DETAILS.tiktokLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 bg-black/10 text-black py-2 px-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border border-black/15"
                      >
                        <TikTokIcon className="w-3.5 h-3.5" />
                        <span>TikTok</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION */}
      <motion.section 
        initial="hidden"
        animate="visible"
        viewport={{ once: true }}
        className="relative py-12 md:py-20 lg:py-28 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content with staggered fade in */}
          <motion.div 
            variants={staggerContainer}
            className="lg:col-span-7 text-left space-y-6"
          >
            
            {/* Trust Badging showing actual metrics */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-light border border-gold/20 rounded-full text-[10px] sm:text-xs font-bold tracking-wider text-gold uppercase">
                <Star className="w-3.5 h-3.5 fill-current" />
                {lang === 'en' 
                  ? `${BUSINESS_DETAILS.rating} Star Rated (${BUSINESS_DETAILS.reviewCount} Google Reviews)` 
                  : t('hero_rating_badge')}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-cream-deep rounded-full text-[10px] sm:text-xs font-bold tracking-wider text-charcoal-muted uppercase">
                <Sparkles className="w-3 h-3 text-gold" />
                {lang === 'en' ? 'Budget: Rs 500 – 3,000 per person' : 'बजेट: प्रति व्यक्ति रु ५०० – ३,०००'}
              </span>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-4">
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6.5xl tracking-tight text-charcoal leading-none">
                {lang === 'en' ? 'Sutra Lounge' : t('hero_title')} <br />
                <span className="text-gold font-light italic">
                  {lang === 'en' ? 'Your Trusted Local Culinary Oasis' : t('hero_badge')}
                </span>
              </h1>
              <p className="font-serif text-lg md:text-xl text-charcoal-muted leading-relaxed font-light">
                {lang === 'en' 
                  ? 'Discover why Sutra Lounge is beloved as the premier restaurant in Hetauda, Nepal. Premium dine-in ambience, reliable takeout, and bespoke catering.'
                  : t('hero_subtitle')}
              </p>
            </motion.div>

            <motion.p variants={fadeInUp} className="text-sm sm:text-base text-charcoal-muted leading-relaxed max-w-xl font-light">
              {lang === 'en' 
                ? 'We welcome you to Nagar Bikash Samiti Marg, Hetauda. Known for cozy wood decor, quick service, and exceptional dishes (featuring our signature Chicken Sandwich, rich Momo platters, and authentic hot drinks), we provide a perfect culinary escape.'
                : 'नगर विकास समिति मार्ग, हेटौंडा ५ मा यहाँहरूलाई स्वागत छ। हाम्रो सुन्दर काठको आन्तरिक वातावरण, छिटो सेवा र विशेष स्वादिष्ट परिकारहरू (जस्तै विशेष चिकेन स्यान्डविच, स्वादिलो ममः प्लेटर्स र अर्गानिक पेय पदार्थ) को आनन्द लिनुहोस्।'}
            </motion.p>

            {/* Google Profile Quick Links (Directions, Save) */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md pt-2">
              <div className="border border-cream-deep bg-cream-soft rounded-2xl p-4 flex items-center justify-between hover:border-gold/30 transition-colors duration-300">
                <div className="text-left">
                  <p className="text-[10px] font-mono tracking-wider text-gold uppercase font-bold">{lang === 'en' ? 'Address' : 'ठेगाना'}</p>
                  <p className="text-xs font-semibold text-charcoal truncate max-w-[160px]">{lang === 'en' ? 'Nagar Bikash Samiti Marg' : 'नगर विकास समिति मार्ग'}</p>
                </div>
                <a 
                  href={BUSINESS_DETAILS.mapsLink} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-2 bg-gold-light text-gold hover:bg-gold hover:text-white rounded-xl transition-all"
                  title="View on Google Maps"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="border border-cream-deep bg-cream-soft rounded-2xl p-4 flex items-center justify-between hover:border-gold/30 transition-colors duration-300">
                <div className="text-left">
                  <p className="text-[10px] font-mono tracking-wider text-gold uppercase font-bold font-semibold">{lang === 'en' ? 'Opening Hours' : t('location_hours_label')}</p>
                  <p className="text-xs font-semibold text-charcoal">{lang === 'en' ? 'Daily: 8:00 AM – 9:00 PM' : 'दैनिक: बिहान ८:०० – बेलुका ९:००'}</p>
                </div>
                <div className="p-2 bg-cream-deep text-charcoal-muted rounded-xl">
                  <Clock className="w-4 h-4 text-gold" />
                </div>
              </div>
            </motion.div>

            {/* Main Action CTAs */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button
                onClick={() => scrollToSection(contactSectionRef)}
                className="bg-gold hover:bg-gold-hover text-cream-soft py-4 px-8 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer scale-100 hover:scale-102 active:scale-98"
                id="hero-book-now"
              >
                <span>{lang === 'en' ? 'Visit Us (Secure Table)' : 'हामीलाई भेट्नुहोस् / टेबल बुकिङ'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => scrollToSection(menuSectionRef)}
                className="bg-transparent border border-gold hover:bg-gold-light text-gold py-4 px-8 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer scale-100 hover:scale-102 active:scale-98"
                id="hero-explore-menu"
              >
                <span>{lang === 'en' ? 'Explore Highlights' : t('hero_cta_menu')}</span>
              </button>
            </motion.div>

          </motion.div>

          {/* Hero Right Visual Column with Slide In Right and zoom on hover */}
          <motion.div 
            variants={slideInRight}
            className="lg:col-span-5 relative mt-8 lg:mt-0"
          >
            <div className="relative group">
              {/* Outer classic gold geometry accents */}
              <div className="absolute -inset-3 rounded-3xl border-2 border-gold/15 rotate-1 group-hover:rotate-0 transition-transform duration-500" />
              <div className="absolute -inset-1.5 bg-cream-deep rounded-3xl -rotate-2 group-hover:rotate-0 transition-transform duration-500 -z-10" />
              
              <div className="relative overflow-hidden rounded-2xl shadow-xl aspect-square sm:aspect-[4/3] lg:aspect-square bg-cream-deep">
                <img 
                  src={dbSettings?.hero_image_url || heroImageUrl || heroImage} 
                  alt="Sutra Lounge cozy elegant wood interior and gold lighting" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                
                {/* Embedded Information Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-charcoal/95 backdrop-blur-sm p-4 rounded-xl border border-gold/20 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center text-cream-soft">
                  <div>
                    <h4 className="font-serif text-sm font-bold tracking-wide">
                      {lang === 'en' ? 'Sutra Lounge Vibe' : 'सुत्र लाउन्ज वातावरण'}
                    </h4>
                    <span className="text-[10px] text-gold font-mono tracking-widest uppercase font-semibold block">
                      {lang === 'en' ? 'Hetauda • Cozy & Well-Decorated' : 'हेटौंडा • आरामदायी र सुसज्जित'}
                    </span>
                  </div>
                  <div className="text-right whitespace-nowrap shrink-0">
                    <p className="text-xs font-semibold text-gold font-mono flex items-center gap-1">
                      ★★★★☆ {BUSINESS_DETAILS.rating}
                    </p>
                    <p className="text-[9px] text-cream-soft/60">
                      {BUSINESS_DETAILS.reviewCount} {lang === 'en' ? 'Local Feedback' : 'स्थानीय प्रतिक्रियाहरू'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.section>

      {/* SPECIAL ANNOUNCEMENT SECTION (FROM OWNER) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeInUp}
        className="py-12 bg-cream-deep/40 border-y border-cream-deep px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto bg-cream-soft border border-gold/15 shadow-sm rounded-2xl p-6 sm:p-10 text-left relative overflow-hidden">
          
          {/* Ornament line */}
          <div className="absolute top-0 left-0 w-2 h-full bg-gold" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-gold uppercase font-bold">
                <Sparkles className="w-3.5 h-3.5 text-gold animate-spin-slow" />
                {lang === 'en' ? 'Featured update from the Owner' : 'संचालकद्वारा विशेष जानकारी / सूचना'}
              </span>
              <p className="font-serif italic text-base sm:text-lg text-charcoal leading-relaxed font-light">
                &ldquo;{lang === 'en' 
                  ? OWNER_UPDATE.content 
                  : 'बाहिर कुरकुरा, भित्र रसिलो 🍗🔥 सुत्र लाउन्ज, हेटौंडाको हाम्रो विशेष चिकेन स्यान्डविच उत्कृष्ट स्वाद, ताजा सामग्री र एकदमै मीठो क्रन्चले भरिएको छ। एकचोटि चाखेपछि तपाईं बारम्बार खाइरहनुहुनेछ 😋🥪 सहरकै उत्कृष्ट खानाको अनुभव लिन हामीकहाँ पाल्नुहोस्!'
                }&rdquo;
              </p>
              <div className="flex flex-wrap gap-2">
                {lang === 'en' ? (
                  OWNER_UPDATE.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] font-mono text-gold-hover hover:underline cursor-pointer">
                      #{tag}
                    </span>
                  ))
                ) : (
                  ['सुत्रलाउन्ज', 'चिकेनस्यान्डविच', 'हेटौंडाकैउत्कृष्टखाना'].map((tag, i) => (
                    <span key={i} className="text-[10px] font-mono text-gold-hover hover:underline cursor-pointer">
                      #{tag}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Quick date stamp */}
            <div className="shrink-0 text-left md:text-right border-t md:border-t-0 md:border-l border-cream-deep pt-4 md:pt-0 pl-0 md:pl-6">
              <p className="text-[10px] font-mono tracking-wide text-charcoal-muted uppercase">
                {lang === 'en' ? 'Published' : 'प्रकाशित मिति'}
              </p>
              <p className="text-xs font-bold text-charcoal">
                {lang === 'en' ? OWNER_UPDATE.date : '१२ फेब्रुअरी, २०२६'}
              </p>
            </div>
          </div>

        </div>
      </motion.section>

      {/* EXQUISITE LOUNGE MENU SECTION */}
      <section ref={menuSectionRef} id="menu" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
        
        {/* Header */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeInUp}
          className="text-center max-w-2xl mx-auto mb-12 space-y-3"
        >
          <span className="font-mono text-xs tracking-widest text-gold uppercase font-bold block">
            {lang === 'en' ? "Bespoke Culinary Sensation" : "विशेष स्वाद कल�� र शैली"}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal tracking-tight font-extrabold">
            {t('menu_title')}
          </h2>
          <div className="w-16 h-1 bg-gold mx-auto" />
          <p className="text-sm text-charcoal-muted pt-2 font-light">
            {t('menu_subtitle')}
          </p>
        </motion.div>

        {/* CHEF'S SIGNATURE HIGHLIGHTS GRID */}
        <div className="mb-24 mt-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            className="text-center mb-12 space-y-2 relative"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gold font-bold font-mono pt-4">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              {lang === 'en' ? 'Prestige Showcase' : 'उच्च कोटीको प्रस्तुति'}
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-charcoal font-black tracking-tight uppercase">
              {lang === 'en' ? "Chef’s Signature Selections" : 'सेफका विशेष उत्कृष्ट परिकारहरू'}
            </h3>
            <p className="text-xs text-charcoal-muted max-w-xl mx-auto font-light leading-relaxed">
              {lang === 'en' 
                ? "Curated masterly pairings representing the heart, heat, and soul of Sutra Lounge. Expertly prepared with exquisite local spice reductions and freshly sourced ingredients." 
                : "सुत्र लाउन्जको मुख्य स्वाद र आत्मा प्रतिनिधित्व गर्ने विशेष परिकारहरू। रैथाने नेपाली म��ला र ताजा स्थानीय सामग्रीहरूद्वारा विशेषज्ञताका साथ तयार गरिएको।"}
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {SIGNATURE_DISHES.map(getTranslatedSignatureDish).map((dish) => (
              <motion.div
                key={dish.title}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.2, ease: "easeOut" } }}
                className="bg-cream-soft border border-cream-deep rounded-2xl overflow-hidden hover:border-gold/30 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group text-left relative"
              >
                <div>
                  {/* Photo area with luxury overlays */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-deep border-b border-cream-deep">
                    {/* Badge */}
                    <span className="absolute top-3.5 left-3.5 bg-charcoal/90 text-gold text-[8px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-gold/20 shadow-md z-10 flex items-center gap-1.5 backdrop-blur-xs">
                      <Flame className="w-2.5 h-2.5 text-gold animate-pulseAndFlow" />
                      <span>{dish.badge}</span>
                    </span>
                    
                    {/* Price tag */}
                    <span className="absolute top-3.5 right-3.5 bg-gold border border-gold/15 text-cream-soft text-[10px] font-mono font-extrabold tracking-tight px-3 py-1 rounded-lg shadow-md z-10">
                      {dish.price}
                    </span>

                    <LazyImage 
                      src={dish.image} 
                      alt={dish.title} 
                      wrapperClassName="w-full h-full"
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 select-none"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Card description details */}
                  <div className="p-5 space-y-2.5">
                    <h4 className="font-serif text-base sm:text-lg font-bold text-charcoal group-hover:text-gold transition-colors block leading-snug">
                      {dish.title}
                    </h4>
                    <p className="text-xs text-charcoal-muted leading-relaxed font-light">
                      {dish.description}
                    </p>
                  </div>
                </div>

                {/* Card CTA actions */}
                <div className="px-5 pb-5 pt-3.5 flex items-center justify-between border-t border-cream-deep/45 mt-4 bg-cream-soft/35">
                  <div className="flex items-center gap-1 text-[10px] text-gold font-mono uppercase font-bold tracking-wider">
                    <ChefHat className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Hygienic Craft' : 'उच्च स्तरीय सफाइ'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(prev => ({
                        ...prev,
                        message: lang === 'en'
                          ? `Hetauda Greetings! I am highly interested in tasting or booking a table for "${dish.title}" at Sutra Lounge!`
                          : `हेटौंडाबाट नमस्कार! म विशेष गरी सुत्र लाउन्जको "${dish.title}" परिकार चाख्न वा टेबल बुकिङ गर्न इच्छुक छु!`
                      }));
                      scrollToSection(contactSectionRef);
                    }}
                    className="text-[10px] font-extrabold uppercase tracking-widest text-charcoal hover:text-gold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{t('menu_btn_book')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick guidance / CTA panel to incentivize exploring or visiting */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            className="mt-12 bg-cream-deep/30 rounded-2xl p-6 sm:p-8 border border-cream-deep flex flex-col md:flex-row items-center justify-between gap-6 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl -z-10" />
            <div className="space-y-1 max-w-2xl">
              <h4 className="font-serif text-sm sm:text-base font-bold text-charcoal flex items-center gap-2">
                <Utensils className="w-4 h-4 text-gold shrink-0" />
                <span>{lang === 'en' ? 'Craving more delicacies?' : 'थप स्वादिष्ट परिकारहरूको इच्छा छ?'}</span>
              </h4>
              <p className="text-xs text-charcoal-muted font-light leading-relaxed">
                {lang === 'en' 
                  ? 'Explore our full, dynamically filterable menu below featuring Appetizers, Mocktails, Indian Curries and cafe bites, or complete a secure reservation inquiry to experience modern restaurant hospitality at Nagar Bikash Samiti Marg, Huprachaur.'
                  : 'हाम्रो पूर्ण मेनुमा एपीटाइजर, मकटेल, भारतीय परिकार र क्याफे खाजाहरू उपलब्ध छन्। नगर विकास समिति मार्ग, हुप्रचौरमा सुत्र आतिथ्यता अनुभव गर्न बुकिङ सोधपुछ फारम भर्नुहोस्।'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
              <button 
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  const categoryElement = document.getElementById('menu-categories-anchor');
                  if (categoryElement) {
                    categoryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    scrollToSection(menuSectionRef);
                  }
                }}
                className="bg-charcoal hover:bg-gold text-white hover:text-charcoal transition-all text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <span>{lang === 'en' ? 'Browse Full Menu' : 'पूर्ण मेनु हेर्नुहोस्'}</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </button>
              
              <button 
                type="button"
                onClick={() => scrollToSection(contactSectionRef)}
                className="bg-transparent border-2 border-charcoal hover:bg-charcoal hover:text-white transition-all text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full cursor-pointer text-center active:scale-95"
              >
                <span>{lang === 'en' ? 'Reserve a Table' : 'क्याबिन/टेबल बुकिङ'}</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Scroll anchor for categories */}
        <div id="menu-categories-anchor" className="scroll-mt-24 mb-6" />

        {/* Filter categories - interactive scale hover */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeInUp}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer scale-100 active:scale-95 ${
                selectedCategory === category
                  ? 'bg-gold text-cream-soft shadow-sm'
                  : 'bg-cream-deep/50 hover:bg-cream-deep text-charcoal-muted'
              }`}
            >
              {getLocalizedCategoryName(category as string)}
            </button>
          ))}
        </motion.div>

        {/* Menu Items Grid - Staggered entrance */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredMenuItems.map((item, index) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                key={`${item.title}-${index}`}
                className="bg-cream-soft border border-cream-deep rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-gold/30 hover:shadow-md transition-all duration-300 relative group text-left"
              >
                <div>
                  {item.image && (
                    <div className="relative aspect-video sm:aspect-square md:aspect-video rounded-xl overflow-hidden mb-4 bg-cream-deep border border-cream-deep">
                      <LazyImage 
                        src={item.image} 
                        alt={item.title} 
                        wrapperClassName="w-full h-full"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
                        referrerPolicy="no-referrer"
                      />
                      {item.isPopular && (
                        <span className="absolute top-2.5 right-2.5 bg-gold border border-gold/15 text-cream-soft px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold shadow-md">
                          {lang === 'en' ? "Chef's Pick" : "विशेष रोजाइ"}
                        </span>
                      )}
                      {item.socialLink && (
                        <a 
                          href={item.socialLink}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute top-2.5 left-2.5 bg-charcoal/80 hover:bg-charcoal/95 border border-gold/20 text-cream-soft px-2 py-0.5 rounded-full text-[8.5px] font-medium tracking-wide flex items-center gap-1 shadow-sm transition-all cursor-pointer z-10"
                        >
                          {item.socialLink.includes('instagram') ? (
                            <>
                              <Instagram className="w-3 h-3 text-gold" />
                              <span>{lang === 'en' ? 'Instagram Feed' : 'इन्स्टाग्राम'}</span>
                            </>
                          ) : (
                            <>
                              <Facebook className="w-3 h-3 text-gold" />
                              <span>{lang === 'en' ? 'Facebook Page' : 'फेसबुक पेज'}</span>
                            </>
                          )}
                        </a>
                      )}
                    </div>
                  )}

                  {!item.image && item.isPopular && (
                    <span className="absolute top-4 right-4 bg-gold-light border border-gold/25 text-gold px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold">
                      {lang === 'en' ? "Chef's Pick" : "विशेष रोजाइ"}
                    </span>
                  )}

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-gold uppercase tracking-widest block font-medium">
                      {item.category}
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-charcoal group-hover:text-gold transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-charcoal-muted leading-relaxed font-light">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-cream-deep flex items-center justify-between">
                  <span className="inline-flex items-center px-3 py-1 bg-gold-light border border-gold/25 rounded-full text-xs font-mono font-bold text-gold-hover">
                    {item.price}
                  </span>
                  <button
                    onClick={() => {
                      setForm(prev => ({
                        ...prev,
                        message: lang === 'en'
                          ? `Interested in ordering the ${item.title}.`
                          : `म सुत्र लाउन्जको ${item.title} परिकार अर्डर गर्न इच्छुक छु।`
                      }));
                      scrollToSection(contactSectionRef);
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider text-gold hover:text-gold-hover flex items-center gap-1 cursor-pointer"
                  >
                    {lang === 'en' ? 'Order Info' : 'अर्डर सोधपुछ'}
                    <ChevronRight className="w-3 h-3 animate-pulse" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Highlight Showcase Plate with dishImage */}
        <div className="mt-16 bg-cream-soft rounded-3xl overflow-hidden border border-cream-deep grid grid-cols-1 lg:grid-cols-12 items-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={slideInLeft}
            className="lg:col-span-5 aspect-[4/3] lg:aspect-auto lg:h-full min-h-[300px]"
          >
            <img 
              src={dbSettings?.dish_image_url || dishImageUrl || dishImage} 
              alt="Gourmet Plated Dish at Sutra Lounge Hetauda" 
              className="w-full h-full object-cover select-none"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={slideInRight}
            className="lg:col-span-7 p-8 sm:p-12 text-left space-y-6"
          >
            <span className="font-mono text-xs tracking-widest text-gold uppercase font-bold block">
              {lang === 'en' ? 'Gourmet Precision' : 'उत्कृष्ट स्वाद कला र सुदृढता'}
            </span>
            <h3 className="font-serif text-2xl sm:text-3.5xl text-charcoal leading-tight font-extrabold">
              {lang === 'en' ? 'Exceptional Food Experience' : 'विशेष र उत्कृष्ट भोजन अनुभव'}
            </h3>
            <p className="text-sm sm:text-base text-charcoal-muted leading-relaxed font-light">
              {lang === 'en'
                ? 'We focus on absolute culinary integrity. From selecting locally harvested veggies to utilizing pure premium standards of seasoning, we guarantee that whether you choose simple dine-in comfort, safe pickup containers, or customized event menus, you will be deeply pleased of your own accord.'
                : 'हामी खाद्य सामग्रीहरूको पूर्ण शुद्धता र गुणस्तरमा ध्यान दिन्छौं। हेटौंडाका स्थानीय ताजा तरकारी छनोट देखि लिएर स्तरिय मसलाहरूको प्रयोग सम्म, हामी ग्यारेन्टी दिन्छौं कि तपाईंको प्रत्येक भोजन विशेष र सन्तोषजनक हुनेछ।'}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-cream-deep pt-6">
              <div>
                <p className="text-[11px] font-mono tracking-wide uppercase text-gold">
                  {lang === 'en' ? 'Clean Prep' : 'पूर्ण सरसफाई'}
                </p>
                <p className="text-xs font-bold text-charcoal">
                  {lang === 'en' ? 'Hygienic Kitchen' : 'स्वास्थ्यकर भान्सा'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-mono tracking-wide uppercase text-gold">
                  {lang === 'en' ? 'Quick Turnaround' : 'छरितो र सजिलो'}
                </p>
                <p className="text-xs font-bold text-charcoal">
                  {lang === 'en' ? 'Fast Service Desk' : 'छिटो सेवा डेस्क'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-mono tracking-wide uppercase text-gold">
                  {lang === 'en' ? 'Locally Loved' : 'स्थानीय रोजाइ'}
                </p>
                <p className="text-xs font-bold text-charcoal">
                  {BUSINESS_DETAILS.rating} {lang === 'en' ? 'Google Rating' : 'गुगल रेटिङ'}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => scrollToSection(contactSectionRef)}
                className="bg-gold hover:bg-gold-hover text-cream-soft text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-full transition-all duration-300 scale-100 active:scale-95 cursor-pointer shadow-sm hover:shadow"
              >
                {lang === 'en' ? 'Inquire or Order Now' : 'अर्डर वा सोधपुछ गर्नुहोस्'}
              </button>
            </div>
          </motion.div>
        </div>

      </section>

      {/* SERVICES SECTION */}
      <section 
        ref={servicesSectionRef} 
        id="services" 
        className="py-16 md:py-24 bg-cream-deep/30 border-y border-cream-deep overflow-hidden scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Title */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto mb-16 space-y-3"
          >
            <span className="font-mono text-xs tracking-widest text-gold uppercase block font-bold">
              {lang === 'en' ? 'Tailored Logistics' : 'हस्पिटालिटी र सेवाहरू'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal tracking-tight font-extrabold">
              {t('services_title')}
            </h2>
            <div className="w-16 h-1 bg-gold mx-auto" />
            <p className="text-sm text-charcoal-muted pt-2 font-light">
              {t('services_subtitle')}
            </p>
          </motion.div>

          {/* Cards with stagger on roll-in */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {SERVICES_LIST.map(translateService).map((service, idx) => {
              const Icon = 
                service.id === 'dine-in' ? Utensils :
                service.id === 'events' ? Users :
                service.id === 'sports' ? Tv :
                service.id === 'hookah' ? Flame :
                service.id === 'conveniences' ? Wifi :
                service.id === 'takeout' ? Truck : Sparkles;
              return (
                <motion.div 
                  variants={fadeInUp}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  key={service.id}
                  className="bg-cream-soft border border-cream-deep rounded-2xl p-8 hover:shadow-lg hover:border-gold/30 transition-all duration-300 flex flex-col justify-between text-left"
                >
                  <div className="space-y-6">
                    <div className="w-12 h-12 rounded-full bg-gold-light flex items-center justify-center text-gold">
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-serif text-xl font-bold text-charcoal">{service.title}</h3>
                      <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed font-light">
                        {service.description}
                      </p>
                    </div>

                    <ul className="space-y-3">
                      {service.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-charcoal">
                          <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 mt-6 border-t border-cream-deep">
                    <button
                      onClick={() => {
                        setForm(prev => ({
                          ...prev,
                          serviceType: 
                            service.id === 'dine-in' || service.id === 'hookah' || service.id === 'conveniences' ? 'Dine-In' :
                            service.id === 'takeout' ? 'Takeout' :
                            service.id === 'events' || service.id === 'sports' ? 'Catering' : 'General'
                        }));
                        scrollToSection(contactSectionRef);
                      }}
                      className="text-xs font-bold tracking-wider uppercase text-gold hover:text-gold-hover flex items-center gap-1 cursor-pointer"
                    >
                      {lang === 'en' ? 'Request Details' : 'थप विवरण बुझ्नुहोस्'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

        </div>
      </section>

      {/* STORY & VIBE SECTION */}
      <section ref={storySectionRef} id="story-section" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={slideInLeft}
            className="lg:col-span-5 text-left space-y-4"
          >
            <span className="font-mono text-xs tracking-widest text-gold uppercase block font-bold">
              {lang === 'en' ? 'Our Aesthetic Story' : 'हाम्रो सुन्दर आन्तरिक वातावरण'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal tracking-tight font-extrabold leading-tight">
              {lang === 'en' ? 'A Warm, Harmonious Place to Connect' : t('story_title')}
            </h2>
            <div className="w-12 h-1 bg-gold" />
            <p className="text-sm sm:text-base text-charcoal-muted leading-relaxed font-light">
              {lang === 'en' 
                ? 'Nestled right on Nagar Bikash Samiti Marg, Hetauda 44107, Sutra Lounge was built with a specific goal: providing an eye-safe, beautifully designed hub where people feel genuinely welcome of their own accord.' 
                : 'नगर विकास समिति मार्ग, हेटौंडा ४४१०७ मा अवस्थित, सुत्र लाउन्ज एक विशेष उद्देश्यका साथ निर्माण गरिएको हो: जहाँ आउने प्रत्येक पाहुनाले पूर्ण रूपमा न्यानो आतिथ्यता र आरामदायी वातावरणको प्रत्यक्ष अनुभूति गर्न सकून्।'
              }
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={slideInRight}
            className="lg:col-span-7 border-l-0 lg:border-l border-cream-deep pl-0 lg:pl-10 text-left space-y-6"
          >
            <p className="text-sm sm:text-base text-charcoal leading-relaxed font-light">
              {t('story_p1')}
            </p>
            <p className="text-sm text-charcoal-muted leading-relaxed font-light">
              {lang === 'en' 
                ? "Whether you represent local families holding weekend meetups, corporate executives arranging quick business coffee briefings, or food lovers carrying home takeout, you're supported by friendly floor personnel ready to perfect every detail of your meal. No wonder we hold a solid reputation across Hetauda, Nepal." 
                : "चाहे तपाईं सप्ताहान्तमा भेटघाट गर्ने स्थानीय परिवार हुनुहोस्, कर्पोरेट बैठकहरूको लागि आउने नेतृत्वकर्ताहरू हुनुहोस्, वा घरमा खाना लैजाने फुड लभरहरू; हाम्रा विनम्र र दक्ष स्टाफहरू तपाईंको सेवामा हरदम तत्पर छन्। त्यसैले त सुत्र लाउन्ज हेटौंडाको पहिलो रोजाइ बन्न सफल भएको छ।"
              }
            </p>
            
            <div className="p-5 bg-gold-light border border-gold/15 rounded-xl">
              <p className="font-serif italic text-sm text-gold">
                &ldquo;{lang === 'en' 
                  ? 'A clean space, professional barista coffees, crispy sandwhiches, and real warm Nepalese hospitality.' 
                  : 'एक सफा र स्वच्छ ठाउँ, व्यावसायिक ब्यारिस्टा कफी, क्रिस्पी स्यान्डविच र न्यानो र हार्दिक नेपाली आतिथ्यता।'
                }&rdquo;
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* REASSURANCE ACCENTS ROW (SLATE THEME) */}
      <section className="py-16 bg-charcoal text-cream-soft rounded-t-3xl relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto mb-12 space-y-3"
          >
            <span className="font-mono text-xs tracking-widest text-gold uppercase block">
              {lang === 'en' ? 'Core Principles' : 'मुख्य सिद्धान्तहरू'}
            </span>
            <h2 className="font-serif text-2.5xl sm:text-3.5xl text-cream-soft font-extrabold tracking-tight">
              {lang === 'en' ? 'Why Hetauda Trusts Us' : 'हेटौंडाबासीले हामीलाई किन विश्वास गर्नुहुन्छ'}
            </h2>
            <div className="w-12 h-1 bg-gold mx-auto" />
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {REASSURANCE_POINTS.map((point, i) => (
              <motion.div 
                variants={fadeInUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                key={i} 
                className="bg-charcoal/40 border border-cream-deep/10 p-8 rounded-2xl text-left space-y-4 hover:border-gold/30 transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center text-gold text-xs font-mono font-bold border border-gold/25">
                  0{i + 1}
                </div>
                <h3 className="font-serif text-lg text-cream-soft font-bold">
                  {getTranslatedReassuranceTitle(point.title)}
                </h3>
                <p className="text-xs sm:text-sm text-cream-soft/75 leading-relaxed font-light">
                  {getTranslatedReassuranceDesc(point.title, point.desc)}
                </p>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* REVIEWS & ACCREDITATION SECTION */}
      <section ref={reviewsSectionRef} id="reviews" className="py-16 md:py-24 bg-cream-deep/20 px-4 sm:px-6 lg:px-8 border-y border-cream-deep overflow-hidden scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto mb-12 space-y-3"
          >
            <span className="font-mono text-xs tracking-widest text-gold uppercase block font-bold">
              {lang === 'en' ? 'Verified Patron Stories' : 'प्रमाणित ग्राहकका कथाहरू'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal tracking-tight font-extrabold">
              {t('reviews_title')}
            </h2>
            <div className="w-16 h-1 bg-gold mx-auto" />
            <p className="text-sm text-charcoal-muted pt-2 font-light">
              {lang === 'en'
                ? `We cherish every voice. Sourced transparently from our active ${BUSINESS_DETAILS.reviewCount} Google Maps reviewers.`
                : `हामी प्रत्येक प्रतिक्रियाको कदर गर्दछौं। गुगल म्य��प्सका ${BUSINESS_DETAILS.reviewCount}+ सक्रिय समीक्षकहरूबाट पारदर्शी रूपमा प्राप्त।`
              }
            </p>
          </motion.div>

          {/* GOOGLE REVIEWS ANALYTICS DASHBOARD CARD */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            className="bg-cream-soft border border-cream-deep rounded-3xl p-6 sm:p-10 mb-12 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 text-left items-center"
          >
            {/* Box 1: Overall Average rating */}
            <div className="md:col-span-4 text-center md:text-left space-y-3 md:border-r border-cream-deep md:pr-8 py-2">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <span className="font-serif text-5xl sm:text-6xl font-extrabold text-charcoal">{BUSINESS_DETAILS.rating}</span>
                <div>
                  <div className="flex gap-0.5 text-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.round(BUSINESS_DETAILS.rating) ? 'fill-gold text-gold' : 'text-gold/35'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-charcoal-muted mt-1 font-semibold">{lang === 'en' ? 'Nepal Local Index' : 'नेपाल लोकल इन्डेक्स'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-charcoal">
                  {lang === 'en' ? `${BUSINESS_DETAILS.reviewCount} Verified Placements` : `${BUSINESS_DETAILS.reviewCount}+ प्रमाणित समीक्षाहरू`}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-green-700 font-medium mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
                  <span>{lang === 'en' ? 'Verified Public Business Profile' : 'प्रमाणित आधिकारिक व्यापार खाता'}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Percentage breakdown of stars */}
            <div className="md:col-span-4 space-y-2 py-2 md:border-r border-cream-deep md:px-8">
              <span className="font-mono text-[10px] tracking-widest text-gold uppercase block font-bold mb-2">
                {lang === 'en' ? 'Rating Distribution' : 'समीक्षा वितरण/रेटिङ विभाजन'}
              </span>
              {[
                { star: 5, pct: 78 },
                { star: 4, pct: 16 },
                { star: 3, pct: 4 },
                { star: 2, pct: 1 },
                { star: 1, pct: 1 }
              ].map(row => (
                <div key={row.star} className="flex items-center gap-3 text-xs">
                  <span className="w-3 text-right font-mono font-bold text-charcoal">{row.star}★</span>
                  <div className="flex-1 h-2 bg-cream-deep rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${row.pct}%` }}
                      transition={{ duration: 1, delay: 0.1 }}
                      className="h-full bg-gold rounded-full" 
                    />
                  </div>
                  <span className="w-8 text-left font-mono text-charcoal-muted font-light">{row.pct}%</span>
                </div>
              ))}
            </div>

            {/* Box 3: Categorized ratings criteria */}
            <div className="md:col-span-4 space-y-4 py-2 md:pl-8">
              <span className="font-mono text-[10px] tracking-widest text-gold uppercase block font-bold">
                {lang === 'en' ? 'Category Scoring' : 'विधागत अंकहरू'}
              </span>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-charcoal mb-1">
                    <span>{lang === 'en' ? 'Food & Beverage Quality' : 'खाना र पेय पदार्थको गुणस्तर'}</span>
                    <span className="font-mono font-bold text-gold-hover">4.3 / 5.0</span>
                  </div>
                  <div className="w-full h-1 bg-cream-deep rounded-full overflow-hidden">
                    <div className="w-[86%] h-full bg-charcoal" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-semibold text-charcoal mb-1">
                    <span>{lang === 'en' ? 'Floor Hospitality & Service' : 'सत्कार र सेवा व्यवस्थापन'}</span>
                    <span className="font-mono font-bold text-gold-hover">4.1 / 5.0</span>
                  </div>
                  <div className="w-full h-1 bg-cream-deep rounded-full overflow-hidden">
                    <div className="w-[82%] h-full bg-charcoal" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-semibold text-charcoal mb-1">
                    <span>{lang === 'en' ? 'Atmosphere, Wood & Vibe' : 'वातावरण, आन्तरिक सज्जा र वाइब'}</span>
                    <span className="font-mono font-bold text-gold-hover">4.4 / 5.0</span>
                  </div>
                  <div className="w-full h-1 bg-cream-deep rounded-full overflow-hidden">
                    <div className="w-[88%] h-full bg-charcoal" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* DYNAMIC RATINGS FILTER BUTTONS */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex flex-wrap justify-center items-center gap-2.5 mb-10 border-b border-cream-deep pb-6 max-w-xl mx-auto"
          >
            <span className="text-xs font-bold text-charcoal-muted uppercase mr-2 block sm:inline">
              {lang === 'en' ? 'Filter reviews:' : 'समीक्षा फिल्टर गर्नुहोस्:'}
            </span>
            {[
              { id: 'All', label: lang === 'en' ? 'All Feedbacks' : 'सबै प्रतिक्रियाहरू' },
              { id: 5, label: lang === 'en' ? '5★ Excellent Only' : '५★ उत्कृष्ट मात्र' },
              { id: 4, label: lang === 'en' ? '4★ Very Good Only' : '४★ धेरै राम्रो मात्र' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedReviewStar(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer scale-100 active:scale-95 ${
                  selectedReviewStar === tab.id
                    ? 'bg-charcoal text-cream-soft shadow-sm'
                    : 'bg-cream-soft hover:bg-cream-deep/60 text-charcoal-muted border border-cream-deep'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Dynamic Reviews Grid */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {AUTHENTIC_REVIEWS
                .filter(rev => selectedReviewStar === 'All' || rev.stars === selectedReviewStar)
                .map(translateReview)
                .map((rev, i) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    key={rev.author} 
                    className="bg-cream-soft border border-cream-deep rounded-2xl p-6 sm:p-8 flex flex-col justify-between text-left hover:shadow-lg hover:border-gold/25 transition-all duration-300 relative"
                  >
                    <div className="space-y-4">
                      {/* Rating Stars with correct solid/empty selection */}
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, idx) => (
                          <Star 
                            key={idx} 
                            className={`w-4 h-4 ${idx < rev.stars ? 'fill-gold text-gold' : 'text-gold/20'}`} 
                          />
                        ))}
                      </div>

                      <p className="text-xs sm:text-sm text-charcoal-muted font-light leading-relaxed min-h-[72px]">
                        &ldquo;{rev.content}&rdquo;
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {rev.highlights.map(h => (
                          <span key={h} className="inline-block bg-cream-deep/60 px-2 py-0.5 rounded text-[9px] font-mono text-charcoal-muted uppercase tracking-tight">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-5 mt-5 border-t border-cream-deep flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">{rev.author}</h4>
                        <span className="text-[9px] text-gold-hover font-mono block uppercase">{rev.role}</span>
                      </div>
                      <span className="text-[10px] font-mono text-charcoal-muted font-light">{rev.timeAgo}</span>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </motion.div>

        </div>
      </section>

      {/* GOOGLE MAPS DIRECT PATRON GALLERY */}
      <section id="maps-gallery" className="py-16 md:py-24 bg-cream-soft px-4 sm:px-6 lg:px-8 border-b border-cream-deep overflow-hidden">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto mb-10 space-y-3"
          >
            <span className="font-mono text-xs tracking-widest text-gold uppercase block font-bold">
              {lang === 'en' ? 'Google Maps Photo Stream' : 'गुगल म्याप्स फोटो स्ट्रिम'}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal tracking-tight font-extrabold">
              {lang === 'en' ? 'Real Patron Snapshots' : 'वास्तविक ग्राहकहरूद्वारा खिचिएका तस्विरहरू'}
            </h2>
            <div className="w-12 h-1 bg-gold mx-auto" />
            <p className="text-sm text-charcoal-muted font-light pt-1">
              {lang === 'en'
                ? 'Browse organic crowd-sourced photos uploaded by local patrons and verified foodies directly to our Google Places feed.'
                : 'स्थानीय ग्राहकहरू र प्रमाणित फुडीहरूद्वारा सिधा हाम्रो गुगल बिजनेस खातामा राखिएका वास्तविक तस्विरहरू हेर्नुहोस्।'
              }
            </p>
          </motion.div>

          {/* Filtering Categories */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex flex-wrap justify-center items-center gap-2 mb-10 max-w-xl mx-auto"
          >
            {['All', 'Interior', 'Food', 'Drinks', 'Exterior'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedGalleryCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer scale-100 active:scale-95 ${
                  selectedGalleryCategory === cat
                    ? 'bg-gold text-cream-soft shadow-xs'
                    : 'bg-cream-deep/30 hover:bg-cream-deep/60 text-charcoal-muted'
                }`}
              >
                {getLocalizedCategoryName(cat)}
              </button>
            ))}
          </motion.div>

          {/* Photos Grid */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {MAPS_GALLERY_PHOTOS
                .filter(photo => photo.is_active !== false)
                .filter(photo => selectedGalleryCategory === 'All' || photo.category === selectedGalleryCategory)
                .map(translatePhoto)
                .map((photo, index) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    key={photo.url}
                    className="bg-cream-soft border border-cream-deep rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-gold/25 transition-all text-left flex flex-col justify-between"
                  >
                    <div className="relative aspect-video sm:aspect-square md:aspect-video w-full bg-cream-deep overflow-hidden group">
                      <LazyImage 
                        src={photo.url} 
                        alt={photo.caption} 
                        wrapperClassName="w-full h-full"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-3 left-3 bg-charcoal/90 backdrop-blur-xs px-2 py-0.5 rounded text-[8.5px] font-mono font-bold text-cream-soft uppercase tracking-wide border border-gold/15">
                        {getLocalizedCategoryName(photo.category)}
                      </span>
                      {photo.socialLink && (
                        <a 
                          href={photo.socialLink}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute top-3 right-3 bg-charcoal/80 hover:bg-charcoal/95 border border-gold/20 text-cream-soft px-2 py-0.5 rounded-full text-[8.5px] font-medium tracking-wide flex items-center gap-1 shadow-sm transition-all cursor-pointer z-10"
                        >
                          {photo.socialLink.includes('instagram') ? (
                            <>
                              <Instagram className="w-3 h-3 text-gold" />
                              <span>Instagram</span>
                            </>
                          ) : (
                            <>
                              <Facebook className="w-3 h-3 text-gold" />
                              <span>Facebook</span>
                            </>
                          )}
                        </a>
                      )}
                    </div>
                    <div className="p-5 flex flex-col justify-between flex-1">
                      <p className="text-xs text-charcoal font-light leading-relaxed mb-4">
                        &ldquo;{photo.caption}&rdquo;
                      </p>
                      
                      <div className="border-t border-cream-deep pt-3 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-charcoal uppercase tracking-wider">{photo.author}</p>
                          <span className="text-[8px] text-gold-hover font-mono block uppercase">Google Maps Stream</span>
                        </div>
                        <div className="flex gap-0.5 text-gold shrink-0">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < photo.stars ? 'fill-gold text-gold' : 'text-gold/20'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </motion.div>

        </div>
      </section>

      {/* DYNAMIC RESERVATION HUB */}
      <section 
        ref={contactSectionRef} 
        id="reservation" 
        className="py-16 md:py-24 bg-cream-soft px-4 sm:px-6 lg:px-8 scroll-mt-24"
      >
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="font-mono text-xs tracking-widest text-gold uppercase block font-bold">
              {lang === 'en' ? 'Instant Ordering & Booking' : 'तत्काल बुकिङ र अर्डर प्रणाली'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal tracking-tight font-extrabold">
              {t('booking_title')}
            </h2>
            <div className="w-12 h-1 bg-gold mx-auto" />
            <p className="text-sm text-charcoal-muted font-light">
              {t('booking_subtitle')}
            </p>
          </div>

          <div className="bg-cream-soft border border-cream-deep shadow-xl rounded-3xl overflow-hidden p-6 sm:p-10">
            
            <AnimatePresence mode="wait">
              {!submitSuccess ? (
                <motion.form 
                  key="inquiry-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleFormSubmit} 
                  className="space-y-6 text-left"
                >
                  {formError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 border border-red-200/60 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block shrink-0 animate-pulse" />
                      <span>{formError}</span>
                    </motion.div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-charcoal uppercase block">
                        {lang === 'en' ? 'Your Full Name *' : 'तपाईंको पूरा नाम *'}
                      </label>
                      <input 
                        type="text" 
                        name="name" 
                        required
                        placeholder={lang === 'en' ? 'e.g. Robin Shrestha' : 'उदाहरण: रविन श्रेष्ठ'}
                        value={form.name}
                        onChange={handleFormChange}
                        className="w-full bg-cream-soft px-4 py-3.5 rounded-xl border border-cream-deep focus:outline-none focus:border-gold text-sm transition-colors font-light"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-charcoal uppercase block">
                        {lang === 'en' ? 'Phone Number *' : 'फोन नम्बर *'}
                      </label>
                      <input 
                        type="tel" 
                        name="phone" 
                        required
                        placeholder={lang === 'en' ? 'e.g. 057-522111 or 98XXXXXXXX' : 'उदाहरण: ९८XXXXXXXX'}
                        value={form.phone}
                        onChange={handleFormChange}
                        className="w-full bg-cream-soft px-4 py-3.5 rounded-xl border border-cream-deep focus:outline-none focus:border-gold text-sm transition-colors font-mono font-light"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-charcoal uppercase block">
                        {lang === 'en' ? 'Email Address (Optional)' : 'इमेल ठेगाना (वैकल्पिक)'}
                      </label>
                      <input 
                        type="email" 
                        name="email" 
                        placeholder={lang === 'en' ? 'e.g. customer@gmail.com' : 'उदाहरण: customer@gmail.com'}
                        value={form.email}
                        onChange={handleFormChange}
                        className="w-full bg-cream-soft px-4 py-3.5 rounded-xl border border-cream-deep focus:outline-none focus:border-gold text-sm transition-colors font-light"
                      />
                    </div>

                    {/* Service selection */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-charcoal uppercase block">
                        {lang === 'en' ? 'Select Plan Type' : 'सेवा प्रकार चयन गर्नुहोस्'}
                      </label>
                      <select 
                        name="serviceType" 
                        value={form.serviceType}
                        onChange={handleFormChange}
                        className="w-full bg-cream-soft px-4 py-3.5 rounded-xl border border-cream-deep focus:outline-none focus:border-gold text-sm transition-colors font-semibold"
                      >
                        <option value="Dine-In">{lang === 'en' ? 'Dine-In Table Booking' : 'भोजन हल क्याबिन बुकिङ (Dine-In)'}</option>
                        <option value="Takeout">{lang === 'en' ? 'Takeout / Pickup Pre-Order' : 'खाना पार्सल/टेक-अवे अर्डर'}</option>
                        <option value="Catering">{lang === 'en' ? 'Event Catering Packages' : 'विशेष कार्यक्रम खानपान प्याकेज'}</option>
                        <option value="General">{lang === 'en' ? 'General Inquiry' : 'सामान्य सोधपुछ'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Reservation Specific parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-charcoal uppercase block">
                        {lang === 'en' ? 'Requested Date' : 'बुकिङ गर्न चाहेको मिति'}
                      </label>
                      <input 
                        type="date" 
                        name="date" 
                        value={form.date}
                        min={getTodayDateString()}
                        onChange={handleFormChange}
                        className="w-full bg-cream-soft px-4 py-3.5 rounded-xl border border-cream-deep focus:outline-none focus:border-gold text-sm transition-colors font-mono font-light gap-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold tracking-wider text-charcoal uppercase block">
                        {lang === 'en' ? 'Requested Time *' : 'बुकिङ समय *'}
                      </label>
                      {form.serviceType === 'Dine-In' ? (
                        <div id="dine-in-time-text-indicator" className="w-full bg-cream-deep/20 px-4 py-3.5 rounded-xl border border-cream-deep text-xs font-semibold text-gold-hover h-[48px] flex items-center justify-between font-mono">
                          <span>{selectedSlot ? selectedSlot.label : (lang === 'en' ? 'Select Slot Below' : 'तल समय रोज्नुहोस्')}</span>
                          <Clock className="w-4 h-4 text-gold-hover shrink-0 animate-pulse-once" />
                        </div>
                      ) : (
                        <select 
                          name="time" 
                          id="form-time-select-fallback"
                          value={form.time}
                          onChange={handleFormChange}
                          className="w-full bg-cream-soft px-4 py-3.5 rounded-xl border border-cream-deep focus:outline-none focus:border-gold text-sm transition-colors font-mono font-light cursor-pointer"
                        >
                          {(() => {
                            const isToday = form.date === getTodayDateString();
                            return timeOptions.map(opt => {
                              const isPast = isTimeInPast(opt.value, form.date);
                              return (
                                <option key={opt.value} value={opt.value} disabled={isPast}>
                                  {opt.label} {isPast ? (lang === 'en' ? ' (Blocked)' : ' (ब्लक)') : ''}
                                </option>
                              );
                            });
                          })()}
                        </select>
                      )}
                    </div>

                    <div className="space-y-2">
                       <label className="text-[11px] font-bold tracking-wider text-charcoal uppercase block">
                        {lang === 'en' ? 'Party Size (Guests)' : 'पाहुना संख्या (गेस्ट)'}
                      </label>
                      <input 
                        type="number" 
                        name="guests" 
                        id="form-guests-picker-input"
                        min="1" 
                        max={dbSettings?.max_party_size || 20}
                        value={form.guests}
                        onChange={handleFormChange}
                        className="w-full bg-cream-soft px-4 py-3.5 rounded-xl border border-cream-deep focus:outline-none focus:border-gold text-sm transition-colors font-light"
                      />
                    </div>
                  </div>

                  {/* Dynamic available slot selection for Dine-In Table Booking */}
                  {form.serviceType === 'Dine-In' && (
                    <div id="dine-in-slots-container" className="space-y-3 bg-cream-deep/20 border border-cream-deep p-4 sm:p-5 rounded-2xl">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <h4 className="text-xs font-bold tracking-wider text-charcoal uppercase flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gold-hover shrink-0" />
                          <span>{lang === 'en' ? 'Available Table Booking Slots' : 'उपलब्ध टेबल बुकिङ समयहरू'}</span>
                        </h4>
                        <span id="slots-meta-badge" className="text-[10px] font-mono font-semibold text-charcoal bg-cream-deep px-2 py-0.5 rounded-md uppercase">
                          {form.date ? `${form.date} (${form.guests} guests)` : 'Select date and party size'}
                        </span>
                      </div>

                      {form.date ? (
                        (() => {
                          const slots = calculateAvailableSlots(form.date, Number(form.guests));
                          if (slots.length === 0) {
                            return (
                              <div id="no-slots-alert" className="p-4 bg-amber-50 border border-amber-200/60 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                <span>
                                  {lang === 'en' 
                                    ? 'No availability matching this capacity or date. Try another date or adjust party size!' 
                                    : 'चयन गरिएको मितिमा पाहुनाको संख्या अनुसारको टेबल वा समय उपलब्ध छैन। कृपया अर्को मिति वा पाहुना संख्या परिवर्तन गर्नुहोस्।'}
                                </span>
                              </div>
                            );
                          }
                          return (
                            <div className="space-y-2">
                              <div id="slots-grid-wrapper" className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                {slots.map((slot, index) => {
                                  const isSelected = selectedSlot && selectedSlot.start.getTime() === slot.start.getTime();
                                  return (
                                    <button
                                      id={`slot-button-${index}`}
                                      key={index}
                                      type="button"
                                      onClick={() => {
                                        setSelectedSlot(slot);
                                        const hStr = slot.start.getHours().toString().padStart(2, '0');
                                        const mStr = slot.start.getMinutes().toString().padStart(2, '0');
                                        setForm(prev => ({ ...prev, time: `${hStr}:${mStr}` }));
                                      }}
                                      className={`py-2 px-3 text-xs font-mono rounded-lg border text-center transition-all cursor-pointer scale-100 active:scale-95
                                        ${isSelected 
                                          ? 'bg-gold text-cream-soft border-gold font-bold shadow-sm' 
                                          : 'bg-white hover:bg-cream-soft/60 text-charcoal border-cream-deep hover:border-gold/30'}`}
                                    >
                                      {slot.label}
                                    </button>
                                  );
                                })}
                              </div>
                              {form.date === getTodayDateString() && (
                                <p className="text-[10px] text-charcoal/60 font-light mt-1 text-left italic">
                                  {lang === 'en' 
                                    ? `* Note: Today's slots starting within the next ${dbSettings?.booking_notice_hours || 2} hours are hidden for operational prep. Change date for more options.` 
                                    : `* नोट: तयारी समयका कारण आजका आगामी ${dbSettings?.booking_notice_hours || 2} घण्टा भित्रका समयहरू देखिने छैनन्। थप समय रोज्न अर्को मिति चयन गर्नुहोस्।`}
                                </p>
                              )}
                            </div>
                          );
                        })()
                      ) : (
                        <p id="slots-help-text" className="text-xs text-charcoal-muted font-light leading-relaxed">
                          {lang === 'en' 
                            ? 'Select requested date and party size to compute real available table slots dynamically.' 
                            : 'वास्तविक उपलब्ध समयहरू ��णना गर्न कृपया मिति र पाहुना संख्या भर्नुहोस्।'}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Textarea */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold tracking-wider text-charcoal uppercase block">
                      {lang === 'en' ? 'Special requests or Dietary Restrictions' : 'विशेष अनुरोध वा खाना सम्बन्धी प्राथमिकता'}
                    </label>
                    <textarea 
                      name="message" 
                      rows={3}
                      placeholder={lang === 'en' ? 'e.g. allergy considerations, table by the window, or specific food items you wanted pre-ordered...' : 'उदाहरण: सञ्झ्याल नजिकैको टेबल, एभर्डिन रेसिपी, इत्यादि...'}
                      value={form.message}
                      onChange={handleFormChange}
                      className="w-full bg-cream-soft px-4 py-3.5 rounded-xl border border-cream-deep focus:outline-none focus:border-gold text-sm transition-colors resize-none font-light"
                    />
                  </div>

                  {/* Checkbox consent */}
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="subscribe"
                      name="subscribe"
                      checked={form.subscribe}
                      onChange={handleFormChange}
                      className="mt-1 accent-gold cursor-pointer"
                    />
                    <label htmlFor="subscribe" className="text-xs text-charcoal-muted leading-relaxed font-light">
                      {lang === 'en'
                        ? 'I agree to let Sutra Lounge process my data under strict security to finalize details.'
                        : 'म सुत्र लाउन्जलाई मेरो बुकिङ विवरण सुरक्षित रूपमा व्यवस्थापन गर्न सहमति दिन्छु।'
                      }
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      type="submit"
                      className="bg-gold hover:bg-gold-hover text-cream-soft font-bold rounded-xl py-4 uppercase text-xs tracking-wider transition-all shadow-md cursor-pointer text-center"
                    >
                      {lang === 'en' ? 'Submit Booking Query' : 'बुकिङ सोधपुछ पठाउनुहोस्'}
                    </button>
                    
                    <a 
                      href={getWhatsAppMessageUrl()}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl py-4 uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {lang === 'en' ? 'Forward via WhatsApp' : 'व्हाट्सएप मार्फत पठाउनुहोस्'}
                    </a>
                  </div>
                </motion.form>
              ) : (
                <motion.div 
                  key="success-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-6 text-center space-y-6"
                >
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto">
                    <Check className="w-7 h-7" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl font-bold text-charcoal">
                      {lang === 'en' ? 'Details Received!' : 'विवरण प्राप्त भयो!'}
                    </h3>
                    <p className="text-sm text-charcoal-muted max-w-lg mx-auto font-light">
                      {lang === 'en' ? (
                        <>Thank you, <span className="font-semibold text-charcoal">{form.name}</span>! Your request is captured for review.</>
                      ) : (
                        <>धन्यवाद, <span className="font-semibold text-charcoal">{form.name}</span>! तपाईंको बुकिङ सोधपुछ सुरक्षित गरिएको छ।</>
                      )}
                    </p>
                  </div>

                  {/* Preview Receipt */}
                  <div className="bg-cream-deep/40 rounded-2xl p-6 text-left max-w-md mx-auto space-y-2 text-xs border border-cream-deep">
                    <span className="font-mono text-[9px] tracking-wider uppercase text-gold font-bold block mb-1">
                      {lang === 'en' ? 'Placement Intent Draft' : 'अर्डर/बुकिङ विवरण मस्यौदा'}
                    </span>
                    <p className="text-charcoal">
                      <strong className="text-charcoal-muted">{lang === 'en' ? 'Sought:' : 'सेवा प्रकार:'}</strong> {form.serviceType}
                    </p>
                    <p className="text-charcoal">
                      <strong className="text-charcoal-muted">{lang === 'en' ? 'Guests:' : 'पाहुना संख्या:'}</strong> {form.guests} {lang === 'en' ? 'Persons' : 'जना'}
                    </p>
                    <p className="text-charcoal">
                      <strong className="text-charcoal-muted">{lang === 'en' ? 'Date & Time:' : 'मिति र समय:'}</strong> {form.date} &bull; {formatTimeTo12Hour(form.time)}
                    </p>
                    <p className="text-charcoal">
                      <strong className="text-charcoal-muted">{lang === 'en' ? 'Phone:' : 'फोन नम्बर:'}</strong> {form.phone}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 max-w-sm mx-auto">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                    <p className="text-xs text-green-700 font-semibold">
                      {lang === 'en'
                        ? 'WhatsApp opened automatically with your booking details!'
                        : 'व्हाट्सएप स्वतः खुलेको छ — बुकिङ विवरणसहित!'}
                    </p>
                  </div>

                  <p className="text-xs text-charcoal-muted max-w-sm mx-auto font-light leading-relaxed">
                    {lang === 'en' 
                      ? "If WhatsApp didn't open, tap the button below to resend your booking details directly to our desk."
                      : 'यदि व्हाट्सएप नखुलेको भए, तलको बटन थिचेर बुकिङ विवरण पठाउनुहोस्।'
                    }
                  </p>

                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <a 
                      href={getWhatsAppMessageUrl()}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-full px-8 py-3.5 text-xs uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {lang === 'en' ? 'Re-open WhatsApp' : 'व्हाट्सएप पुनः खोल्नुहोस्'}
                    </a>
                    
                    <button 
                      onClick={resetFormAfterSubmission}
                      className="text-xs font-bold uppercase tracking-wider text-gold hover:text-gold-hover py-3.5 px-6 rounded-full border border-gold/30 hover:bg-gold-light transition-all cursor-pointer"
                    >
                      {lang === 'en' ? 'New Booking Intent' : 'नयाँ बुकिङ गर्नुहोस्'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Persistent List for current turn visibility */}
          {submittedReservations.length > 0 && (
            <div className="mt-8 bg-cream-deep/30 rounded-2xl p-6 border border-cream-deep text-left space-y-4">
              <h4 className="font-serif text-xs font-extrabold text-charcoal uppercase tracking-wider">
                Current Session Ledger ({submittedReservations.length})
              </h4>
              <div className="divide-y divide-cream-deep">
                {submittedReservations.map((res, idx) => (
                  <div key={idx} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-charcoal">{res.name}</span>
                      <span className="mx-2 text-charcoal/30">&bull;</span>
                      <span className="text-charcoal-muted">{res.serviceType}</span>
                    </div>
                    <span className="font-mono text-gold-hover font-semibold">{res.guests} seats ({formatTimeTo12Hour(res.time)})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* LOCATION & SERVICE HOURS */}
      <section 
        ref={locationSectionRef} 
        id="location" 
        className="py-16 md:py-24 bg-cream-deep/20 border-t border-cream-deep px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Left Card Details */}
            <div className="lg:col-span-5 text-left flex flex-col justify-between space-y-8">
              
              <div className="space-y-6">
                <span className="font-mono text-xs tracking-widest text-gold uppercase font-bold block">
                  {lang === 'en' ? 'Find the Restaurant' : 'हाम्रो रेस्टुरेन्ट भेट्टाउनुहोस्'}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-charcoal tracking-tight font-extrabold">
                  {lang === 'en' ? 'Where to Locate Us' : 'हामीलाई कहाँ फेला पार्ने'}
                </h2>
                <div className="w-12 h-1 bg-gold" />
                
                <p className="text-sm text-charcoal-muted leading-relaxed font-light">
                  {lang === 'en' 
                    ? 'Sutra Lounge operates from our central location in Nagar Bikash Samiti Marg, Hetauda. Stop by to take in the serene vibe daily!' 
                    : 'सुत्र लाउन्ज हेटौंडाको नगर विकास समिति मार्���को मध्य भागमा अवस्थित छ। दैनिक शान्त र मनमोहक वातावरणको आनन्द लिन आउनुहोस्!'
                  }
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-gold-light flex items-center justify-center text-gold shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block">
                        {lang === 'en' ? 'Full Address' : 'पूरा ठेगाना'}
                      </p>
                      <p className="text-sm font-semibold text-charcoal">
                        {lang === 'en' ? BUSINESS_DETAILS.address : 'नगर विकास समिति मार्ग, हेटौंडा ४४१०७, नेपाल (सिटिजन बैंकको पछाडि)'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-gold-light flex items-center justify-center text-gold shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block">
                        {lang === 'en' ? 'Direct Line Desk' : 'सोधपुछ फोन डेस्क'}
                      </p>
                      <p className="text-sm font-bold text-charcoal">
                        <a href={getCleanPhoneUrl(BUSINESS_DETAILS.phone)} className="hover:text-gold transition-colors font-mono">
                          {BUSINESS_DETAILS.phone}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-gold-light flex items-center justify-center text-gold shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block">
                        {lang === 'en' ? 'Email Desk' : 'सोधपुछ इमेल डेस्क'}
                      </p>
                      <p className="text-sm font-semibold text-charcoal">
                        <a href={`mailto:${BUSINESS_DETAILS.email}`} className="hover:text-gold transition-colors truncate block font-mono">
                          {BUSINESS_DETAILS.email}
                        </a>
                      </p>
                    </div>
                  </div>

                  {BUSINESS_DETAILS.plusCode && (
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 bg-gold-light/65 rounded-full flex items-center justify-center text-gold shrink-0">
                        <span className="text-[10.5px] font-mono font-bold">P+</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block">
                          {lang === 'en' ? 'Google Plus Code' : 'गुगल प्लस कोड'}
                        </p>
                        <p className="text-sm font-semibold text-charcoal font-mono">{BUSINESS_DETAILS.plusCode}</p>
                      </div>
                    </div>
                  )}

                  {BUSINESS_DETAILS.latitude && BUSINESS_DETAILS.longitude && (
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 bg-gold-light/65 rounded-full flex items-center justify-center text-gold shrink-0">
                        <span className="text-[10px] font-mono font-extrabold">GPS</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono tracking-wider text-charcoal-muted uppercase block">
                          {lang === 'en' ? 'Coordinates' : 'भौगोलिक निर्देशांक (GPS)'}
                        </p>
                        <p className="text-sm font-semibold text-charcoal font-mono">{BUSINESS_DETAILS.latitude}° N, {BUSINESS_DETAILS.longitude}° E</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Map Actions helper */}
              <div className="pt-2 flex flex-wrap gap-3">
                <a 
                  href={BUSINESS_DETAILS.mapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gold hover:bg-gold-hover text-cream-soft text-xs font-bold px-6 py-3.5 rounded-full uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all text-center cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'en' ? 'Navigate with GMaps' : 'गुगल नक्सा मार्फत निर्देशन'}
                  </span>
                </a>
                
                <button 
                  onClick={handleCopyAddress}
                  className="bg-cream-deep hover:bg-cream-deep/80 text-charcoal text-xs font-semibold px-5 py-3.5 rounded-full uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-gold-hover" />
                  <span>
                    {isCopying 
                      ? (lang === 'en' ? 'Address Copied!' : 'ठेगाना कपी भयो!') 
                      : (lang === 'en' ? 'Copy Address' : 'ठेगाना कपी गर्नुहोस्')
                    }
                  </span>
                </button>
              </div>

            </div>

            {/* Right Hours & Map Block */}
            <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
              
              {/* Dynamic Interactive Google Map Card */}
              <div className="relative w-full h-[280px] rounded-3xl overflow-hidden shadow-xs border border-cream-deep bg-cream-soft group">
                <iframe 
                  src="https://maps.google.com/maps?q=27.4237096,85.0347971(Sutra%20Lounge)&t=&z=17&ie=UTF8&iwloc=&output=embed" 
                  className="absolute inset-0 w-full h-full border-0 group-hover:opacity-95 transition-opacity"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Sutra Lounge Google Maps Location"
                />
                <div className="absolute top-3 left-3 bg-charcoal/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-gold/20 text-[9px] font-mono font-bold text-cream-soft tracking-wider uppercase flex items-center gap-1.5 pointer-events-none shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-ping" />
                  <span>{lang === 'en' ? 'Real Google Maps Visual' : 'गुगल म्याप्स वास्तविक नक्सा दृश्य'}</span>
                </div>
              </div>

              {/* Opening Hours list nested in premium design */}
              <div className="bg-cream-soft border border-cream-deep rounded-3xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="font-serif text-lg font-bold text-charcoal mb-4 text-left">
                    {lang === 'en' ? 'Opening Hours & Reservation Times' : 'खुल्ने समय तालिका र बुकिङ आवधिक'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BUSINESS_DETAILS.hours.map((hour, i) => (
                      <div 
                        key={i} 
                        className="bg-cream-deep/20 border border-cream-deep/40 p-2.5 rounded-xl flex justify-between items-center"
                      >
                        <span className="text-[10px] font-extrabold text-charcoal-muted uppercase">
                          {translateDay(hour.day)}
                        </span>
                        <span className="text-xs font-bold text-charcoal font-mono text-right">
                          {lang === 'en' 
                            ? hour.time 
                            : hour.time.replace('AM', 'बिहान').replace('PM', 'बेलुका').replace('Daily', 'दैनिक')
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info block explaining accessibility */}
                <div className="bg-cream-deep/40 rounded-2xl p-4 text-left space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
                    <h4 className="font-serif text-xs font-bold text-charcoal">
                      {lang === 'en' ? 'Area & Parking Accessibility Guide' : 'यातायात र पार्किङ सेवा विवरण'}
                    </h4>
                  </div>
                  <p className="text-[11px] text-charcoal-muted leading-relaxed font-light">
                    {lang === 'en'
                      ? 'Sutra Lounge is centrally located along Nagar Bikash Samiti Marg in Hetauda. We feature designated customer vehicle slots directly in front of the entryway, enabling seamless local ride drops and safe parking for motorbikes and cars.'
                      : 'सुत्र लाउन्ज हेटौंडाको नगर विकास समिति मार्ग क्षेत्रमा सुलभ रूपमा अवस्थित छ। हाम्रो प्रवेशद्वारको ठीक अगाडि ग्राहकहरूका लागि सवारी साधन तथा मोटरसाइकलहरू व्यवस्थित र सुरक्षित रूपमा पार्किङ गर्ने पर्याप्त ठाउँ छ।'
                    }
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS SECTION */}
      <section className="py-16 md:py-24 bg-cream-soft px-4 sm:px-6 lg:px-8 border-t border-cream-deep">
        <div className="max-w-3xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12 space-y-3">
            <span className="font-mono text-xs tracking-widest text-gold uppercase block font-bold">
              {lang === 'en' ? 'Got Questions? Have Answers' : 'केहि जिज्ञासाहरू छन्? यहाँ उत्तरहरू छन्'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal tracking-tight font-extrabold">
              {lang === 'en' ? 'Frequently Asked Questions' : 'बारम्बार सोधिने प्रश्नहरू'}
            </h2>
            <div className="w-12 h-1 bg-gold mx-auto" />
          </div>

          {/* Accordion list */}
          <div className="space-y-4 text-left">
            {FAQS.map(translateFaq).map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index} 
                  className="bg-cream-soft border border-cream-deep rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button 
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                  >
                    <span className="font-serif text-base sm:text-lg font-bold text-charcoal pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gold shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-charcoal-muted leading-relaxed border-t border-cream-deep/65 whitespace-pre-line font-light">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-charcoal text-cream-soft border-t border-cream-deep/10 pt-16 pb-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-left mb-12">
          
          <div className="md:col-span-2 space-y-4">
            <span className="font-serif text-xl tracking-wider font-extrabold uppercase block text-cream-soft">
              SUTRA LOUNGE
            </span>
            <p className="text-xs text-cream-soft/60 leading-relaxed font-light max-w-sm">
              {lang === 'en' 
                ? 'Nagar Bikash Samiti Marg, Hetauda 44107, Nepal. The leading modern restaurant landmark in town. Savor signature sandwich platters, barista-grade refreshments, and local delicacies prepared with absolute care.'
                : 'नगर विकास समिति मार्ग, हेटौंडा ४४१०७, नेपाल। शहरको मुख्य आधुनिक र प्रिमियम रेस्टुरेन्ट। हाम्रो विशेष एभर्डिन रेसिपी स्यान्डविच, स्तरिय कफी र चिसो पेय पदार्थहरूको स्वादिष्ट स्वाद लिनुहोस्।'
              }
            </p>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block animate-pulse" />
              <p className="text-[10px] font-mono text-gold uppercase tracking-wider">
                {lang === 'en' ? 'Operating Daily • 8:00 AM – 9:00 PM' : 'सञ्चालन समय: दैनिक बिहान ८:०० – बेलुका ९:००'}
              </p>
            </div>

            {/* Social media connections */}
            <div className="flex items-center gap-3 pt-2">
              {BUSINESS_DETAILS.facebookLink && (
                <a 
                  href={BUSINESS_DETAILS.facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-cream-soft/10 text-cream-soft hover:bg-gold hover:text-charcoal flex items-center justify-center transition-all duration-300 border border-cream-soft/10 hover:border-gold"
                  aria-label="Connect with us on Facebook"
                  title="Sutra Lounge Facebook Page"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {BUSINESS_DETAILS.instagramLink && (
                <a 
                  href={BUSINESS_DETAILS.instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-cream-soft/10 text-cream-soft hover:bg-gold hover:text-charcoal flex items-center justify-center transition-all duration-300 border border-cream-soft/10 hover:border-gold"
                  aria-label="Connect with us on Instagram"
                  title="Sutra Lounge Instagram Profile"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {BUSINESS_DETAILS.tiktokLink && (
                <a 
                  href={BUSINESS_DETAILS.tiktokLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-cream-soft/10 text-cream-soft hover:bg-gold hover:text-charcoal flex items-center justify-center transition-all duration-300 border border-cream-soft/10 hover:border-gold"
                  aria-label="Connect with us on TikTok"
                  title="Sutra Lounge TikTok Profile"
                >
                  <TikTokIcon className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-bold text-gold">
              {lang === 'en' ? 'Explore' : 'अन्वेषण गर्���ुहोस्'}
            </h4>
            <ul className="space-y-2 text-xs font-light text-cream-soft/75">
              <li>
                <button onClick={() => scrollToSection(menuSectionRef)} className="hover:text-gold transition-colors cursor-pointer">
                  {lang === 'en' ? 'The Lounge Menu' : 'लाउन्ज मेनु'}
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection(servicesSectionRef)} className="hover:text-gold transition-colors cursor-pointer">
                  {lang === 'en' ? 'Our Services' : 'हाम्रा सेवाहरू'}
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection(storySectionRef)} className="hover:text-gold transition-colors cursor-pointer">
                  {lang === 'en' ? 'Our Story' : 'हाम्रो कथा'}
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection(contactSectionRef)} className="hover:text-gold transition-colors cursor-pointer">
                  {lang === 'en' ? 'Reserve a Table' : 'क्याबिन/टेबल बुकिङ'}
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-bold text-gold font-semibold">
              {lang === 'en' ? 'Immediate Actions' : 'सम्पर्क विवरण'}
            </h4>
            <ul className="space-y-3.5 text-xs font-light text-cream-soft/75">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <a href={getCleanPhoneUrl(BUSINESS_DETAILS.phone)} className="hover:text-gold transition-colors font-mono font-bold">
                  {BUSINESS_DETAILS.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gold shrink-0" />
                <a href={`https://wa.me/${getCleanWhatsAppNumber(BUSINESS_DETAILS.whatsapp)}`} target="_blank" rel="noreferrer" className="hover:text-gold transition-colors">
                  {lang === 'en' ? 'WhatsApp Support' : 'व्हाट्सएप मार्फत सोधपुछ'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold shrink-0 truncate" />
                <a href={`mailto:${BUSINESS_DETAILS.email}`} className="hover:text-gold transition-colors truncate block">
                  {BUSINESS_DETAILS.email}
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-cream-deep/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-cream-soft/45 font-light gap-4">
          <p className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-start">
            <span>
              {lang === 'en' 
                ? '© 2026 Sutra Lounge Restaurant. All Rights Reserved. Nagar Bikash Samiti Marg, Hetauda, Nepal.' 
                : '© २०२६ सुत्र लाउन्ज रेस्टुरेन्ट एन्ड क्याफे। सर्वाधिकार सुरक्षित। नगर विकास समिति मार्ग, हेटौंडा, नेपाल।'
              }
            </span>
            <span className="text-cream-soft/20 hidden sm:inline">|</span>
            <button 
              type="button" 
              onClick={() => setIsAdminOpen(true)}
              className="text-gold/60 hover:text-gold hover:underline font-semibold cursor-pointer py-0.5 px-1.5 rounded transition-all flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-gold/80" />
              <span>
                {lang === 'en' ? 'Admin Desk' : 'सञ्चालक पोर्टल'}
              </span>
            </button>
          </p>
          <p className="font-mono text-[10px] tracking-widest text-gold text-right">
            {lang === 'en' 
              ? 'PREMIUM DINING • HYGIENIC • COZY ATMOSPHERE' 
              : 'उत्कृष्ट स्वाद • स्वस्थकर वातावरण • पारिवारिक सेवा'
            }
          </p>
        </div>
      </footer>

      {/* SECURED CONSOLE PORTAL PANEL */}
      <AdminPanel 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        businessDetails={businessDetails}
        setBusinessDetails={setBusinessDetails}
        menuHighlights={menuHighlights}
        setMenuHighlights={setMenuHighlights}
        servicesList={servicesList}
        setServicesList={setServicesList}
        ownerUpdate={ownerUpdate}
        setOwnerUpdate={setOwnerUpdate}
        galleryPhotos={galleryPhotos}
        setGalleryPhotos={setGalleryPhotos}
        faqs={faqs}
        setFaqs={setFaqs}
        reassurancePoints={reassurancePoints}
        setReassurancePoints={setReassurancePoints}
        authenticReviews={authenticReviews}
        setAuthenticReviews={setAuthenticReviews}
        promoAnnouncements={promoAnnouncements}
        setPromoAnnouncements={setPromoAnnouncements}
        heroImageUrl={heroImageUrl}
        setHeroImageUrl={setHeroImageUrl}
        dishImageUrl={dishImageUrl}
        setDishImageUrl={setDishImageUrl}
      />

    </div>
  );
}
