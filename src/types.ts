export interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
}

export interface InquiryForm {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  serviceType: 'Dine-In' | 'Takeout' | 'Catering' | 'General';
  guests: number;
  message: string;
  subscribe: boolean;
}

export interface RestaurantSettingsRecord {
  slot_interval_minutes?: number | null;
  booking_notice_hours?: number | null;
  default_reservation_duration_minutes?: number | null;
  max_party_size?: number | null;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface MenuItem {
  title: string;
  price: string;
  description: string;
  category: string;
  image?: string;
  isPopular?: boolean;
  socialLink?: string;
}

export interface Review {
  author: string;
  role: string;
  stars: number;
  timeAgo: string;
  content: string;
  highlights: string[];
}

export interface BusinessInfo {
  name: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  mapsLink: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  hours: { day: string; time: string }[];
  latitude?: number;
  longitude?: number;
  placeId?: string;
  cid?: string;
  plusCode?: string;
  facebookLink?: string;
  instagramLink?: string;
  tiktokLink?: string;
  targetDomain?: string;
}

export interface GalleryPhoto {
  url: string;
  caption: string;
  author: string;
  category: 'Interior' | 'Food' | 'Drinks' | 'Exterior';
  stars: number;
  socialLink?: string;
}

