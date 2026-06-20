import { BusinessInfo, Service, FAQItem, MenuItem, Review, GalleryPhoto } from './types';
import sutraPancakes from './assets/images/sutra_pancakes_1781234540304.jpg';
import crispyChickenWings from './assets/images/crispy_chicken_wings_1781234556579.jpg';
import chillyPork from './assets/images/chilly_pork_1781234602061.jpg';
import vegMomo from './assets/images/veg_momo_1781234616913.jpg';
import paneerRoll from './assets/images/paneer_roll_1781234630290.jpg';
import butterNaanCurry from './assets/images/butter_naan_curry_1781264474282.jpg';
import chickenBiryani from './assets/images/chicken_biryani_1781264491983.jpg';
import sizzlingTandoori from './assets/images/sizzling_tandoori_1781234571439.jpg';
import chickenSandwich from './assets/images/chicken_sandwich_1781234586059.jpg';
import mintMojito from './assets/images/mint_mojito_1781234642673.jpg';
import latteMacchiato from './assets/images/latte_macchiato_1781264507039.jpg';
import loungeInterior from './assets/images/lounge_interior_1781264521294.jpg';
import barCounter from './assets/images/bar_counter_1781264533823.jpg';
import chickenPizza from './assets/images/chicken_pizza_1781264551782.jpg';
import friedMomo from './assets/images/fried_momo_1781264566590.jpg';
import rooftopPatio from './assets/images/rooftop_patio_1781264582785.jpg';

export const BUSINESS_DETAILS: BusinessInfo = {
  name: 'Sutra Lounge Hetauda',
  tagline: 'The gamechanger in the restaurant & lounge scene in Hetauda. Offering the most sumptuous food & drinks along with good music and great times.',
  address: 'Nagar Bikash Samiti Marg, Huprachaur, Hetauda-5, District: Makwanpur, Postal Code: 44107, Nepal',
  city: 'Hetauda',
  phone: '057-522111',
  whatsapp: '+97757522111',
  email: 'sutraloungehtd@gmail.com',
  mapsLink: 'https://www.google.com/maps/place/Sutra+Lounge+%7C+Best+Restaurant+in+Hetauda,+Nagar+Bikash+Samiti+Marg,+Hetauda+44107/@27.4237096,85.0347971,17z/data=!4m6!3m5!1s0x39eb49d4a0ef0cad:0xc31278c2c7be2928!8m2!3d27.4237096!4d85.0347971!16s%2Fg%2F11qmr0859t',
  rating: 4.2,
  reviewCount: 312,
  priceRange: 'Rs 350-1,200',
  hours: [
    { day: 'Monday - Sunday (Restaurant)', time: '8:00 AM – 9:00 PM' },
    { day: 'Daily Breakfast Section', time: '7:00 AM – 11:00 AM' }
  ],
  latitude: 27.4237096,
  longitude: 85.0347971,
  placeId: 'ChIJzQzv_NRL6zkRKBm-x8J4EsM',
  cid: '14056430164946856232',
  plusCode: 'GMF6+PX Hetauda, Nepal',
  facebookLink: 'https://www.facebook.com/SutraLounge/',
  instagramLink: 'https://www.instagram.com/sutraloungehetauda/',
  tiktokLink: 'https://www.tiktok.com/@sutraloungehtd?_r=1&_t=ZP-979HM28bRZW',
  targetDomain: 'sutralounge.com.np'
};

export const PROMO_ANNOUNCEMENTS = [
  "🎉 Celebrating our 5th Anniversary! Serving Hetauda with premium culinary excellence. ❤️",
  "🍳 Breakfast Combos Active from 7:00 AM to 11:00 AM Daily — Coffee, Pancakes & more!",
  "💨 Hookah Special: Premium Shisha setups for just Rs. 345 everyday until 2:00 PM!",
  "🔥 Friday Night Specials: 50% Off on Indian & Tandoori Items & Live Acoustic Music! 🎸"
];

// Owner's verified announcement (Feb 12, 2026)
export const OWNER_UPDATE = {
  date: 'February 12, 2026',
  content: 'Crispy on the outside, juicy on the inside 🍗🔥 Our signature Chicken Sandwich at Sutra Lounge, Hetauda is stacked with bold flavors, fresh ingredients, and that perfect golden crunch. One bite and you’ll keep coming back for more 😋🥪 Join us for the best food experience in town!',
  tags: ['SutraLounge', 'ChickenSandwich', 'BestFoodHetauda', 'HetaudaEats']
};

export const MENU_HIGHLIGHTS: MenuItem[] = [
  // Breakfast Combo
  {
    title: 'Fresh Pancakes Breakfast',
    price: 'NPR 490',
    description: 'Fluffy golden-brown pancakes served with honey syrup, your choice of freshly brewed Himalayan coffee, and an exclusive complimentary morning welcome drink.',
    category: 'Breakfast Combo',
    image: sutraPancakes,
    isPopular: true,
    socialLink: 'https://www.instagram.com/sutraloungehetauda/'
  },

  // Appetizers & Quick Bites
  {
    title: 'Crispy Chicken Wings',
    price: 'NPR 450',
    description: 'Crispy chef-seasoned giant wings deep fried to robust perfection and glazed in our sweet, hot, and spicy house local reduction.',
    category: 'Appetizers & Quick Bites',
    image: crispyChickenWings,
    isPopular: true,
    socialLink: 'https://www.facebook.com/SutraLounge/'
  },
  {
    title: 'Chilly Pork',
    price: 'NPR 550',
    description: 'Seared tender country pork chunks wok-tossed on high flame with fiery hot chilies, onions, sweet bell peppers, and fresh local spring greens.',
    category: 'Appetizers & Quick Bites',
    image: chillyPork,
    socialLink: 'https://www.instagram.com/sutraloungehetauda/'
  },
  {
    title: 'Veg-Chilly Momo',
    price: 'NPR 380',
    description: 'Finely stuffed fresh vegetable momo dumplings deep fried and pan-tossed in our hot, aromatic garlic chili sauce and spring scallions.',
    category: 'Appetizers & Quick Bites',
    image: vegMomo,
    socialLink: 'https://www.facebook.com/SutraLounge/'
  },
  {
    title: 'Paneer Katti Roll',
    price: 'NPR 390',
    description: 'Crumbled cottage cheese skewers charred in a clay tandoor oven, wrapped in a hot golden paratha flatbread with mint chutney and crisp onions.',
    category: 'Appetizers & Quick Bites',
    image: paneerRoll,
    socialLink: 'https://www.instagram.com/sutraloungehetauda/'
  },

  // Mains (Indian Specialty)
  {
    title: 'Authentic Butter Naan & Chicken Curry',
    price: 'NPR 650',
    description: 'Clay-oven baked butter garlic naan matched perfectly with our luscious, creamy local tomato-cashew chicken curry cooked in raw butter.',
    category: 'Mains (Indian Specialty)',
    image: butterNaanCurry,
    isPopular: true,
    socialLink: 'https://www.instagram.com/sutraloungehetauda/'
  },
  {
    title: 'Aromatic Chicken Biryani',
    price: 'NPR 750',
    description: 'Classic dum-cooked layers of premium aged basmati rice, tender chicken, saffron, and exotic spices. Served steaming hot with spiced cold yogurt raita.',
    category: 'Mains (Indian Specialty)',
    image: chickenBiryani,
    socialLink: 'https://www.facebook.com/SutraLounge/'
  },
  {
    title: 'Sizzling Chicken Tandoori Platter',
    price: 'NPR 1,150',
    description: 'Traditional bone-in chicken thighs marinaded overnight in fresh ginger-garlic-paste and spicy local mountain herbs, clay-oven roasted.',
    category: 'Mains (Indian Specialty)',
    image: sizzlingTandoori,
    socialLink: 'https://www.facebook.com/SutraLounge/'
  },

  // Cafe & Sandwiches
  {
    title: 'Signature Toast Chicken Sandwich',
    price: 'NPR 550',
    description: 'The definitive town favorite. Soft, hand-sliced sandwich bread grilled until butter-crispy, stacked double with chicken, Swiss cheese, lettuce, tomatoes, and secret signature lounge dressing.',
    category: 'Cafe & Sandwiches',
    image: chickenSandwich,
    isPopular: true,
    socialLink: 'https://www.instagram.com/sutraloungehetauda/'
  },

  // Mocktails & Beverages
  {
    title: 'Classic Mint Virgin Mojito',
    price: 'NPR 280',
    description: 'An incredibly invigorating soda cooler centered on muddled fresh garden-plucked mint sprigs, organic key limes, brown sugar syrup, and crushed ice.',
    category: 'Mocktails & Beverages',
    image: mintMojito,
    socialLink: 'https://www.instagram.com/sutraloungehetauda/'
  },
  {
    title: 'Specialty Latte Macchiato',
    price: 'NPR 240',
    description: 'Freshly ground barista-standard premium Arabica espresso blend, layered elegantly through dense hot steam milk and velvety froth.',
    category: 'Mocktails & Beverages',
    image: latteMacchiato,
    socialLink: 'https://www.instagram.com/sutraloungehetauda/'
  }
];

export const AUTHENTIC_REVIEWS: Review[] = [
  {
    author: 'Dipesh K. Shrestha',
    role: 'Local Guide • 226 reviews',
    stars: 5,
    timeAgo: '5 months ago',
    content: 'Tried the chicken pizza and fried chicken momo, and both were really tasty. The place has a nice & comfortable vibe. Service was quick.',
    highlights: ['Chicken Pizza', 'Fried Chicken Momo', 'Comfortable Vibe']
  },
  {
    author: 'Aakash Rai',
    role: 'Verified Customer',
    stars: 5,
    timeAgo: '3 months ago',
    content: 'Had a really enjoyable experience here. The place feels welcoming and comfortable, perfect for a relaxed meal. The staff were friendly and attentive, making everything easy and pleasant.',
    highlights: ['Welcoming atmosphere', 'Friendly staff', 'Attentive service']
  },
  {
    author: 'Kritisha Giri',
    role: 'Verified Customer',
    stars: 5,
    timeAgo: '4 months ago',
    content: 'I had a fantastic experience at Sutra. The menu has a great variety, and every dish I tried was fresh and flavorful. The restaurant itself is cozy and well-decorated, making it perfect for a casual dinner or a special night out.',
    highlights: ['Fresh & Flavorful', 'Cozy interior', 'Great variety']
  },
  {
    author: 'Niranjan Adhikari',
    role: 'Local Guide',
    stars: 5,
    timeAgo: '2 months ago',
    content: 'Undoubtedly the best chicken chilli in Hetauda! The price was very reasonable for the premium quality and portion size. The atmospheric gold lighting setup feels luxurious.',
    highlights: ['Best Chicken Chilli', 'Portion size', 'Premium quality']
  },
  {
    author: 'Sneha Shrestha',
    role: 'Verified Customer',
    stars: 5,
    timeAgo: '1 month ago',
    content: 'Sutra Lounge has such an incredible vibe. The barista cappuccino is robust and perfectly frothed, and their signature Chicken Sandwich lives up to the owner update! Super crunchy and juicy.',
    highlights: ['Robust Cappuccino', 'Chicken Sandwich crunch', 'Incredible vibe']
  },
  {
    author: 'Prakash Thapa',
    role: 'Business Local Guide',
    stars: 4,
    timeAgo: '6 months ago',
    content: 'Highly professional hospitality. We placed a pre-order takeout of momos, sandwiches, and stone-baked pizza for an office team launch. It was packed premiumly, secure, and remained steaming hot.',
    highlights: ['Secure warm packaging', 'Professional hospitality', 'Office pre-order']
  }
];

export const SERVICES_LIST: Service[] = [
  {
    id: 'dine-in',
    title: 'Dine-In Layouts',
    description: 'Multi-zone architecture designed for comfort. Enjoy multiple cozy atmospheres curated under one roof.',
    features: [
      'Vibrant modern indoor lounge setting',
      'Romantic private dining cabins',
      'Relaxed open rooftop patio'
    ]
  },
  {
    id: 'events',
    title: 'Event Hosting',
    description: 'The premium landmark for hosting your memorable events and group gatherings with top-tier hospitality.',
    features: [
      'Tailored corporate business lunches',
      'Warm family gatherings & birthday setups',
      'Dedicated private group celebrations'
    ]
  },
  {
    id: 'sports',
    title: 'Sports & Entertainment',
    description: 'Immersive entertainment. Live life loud with community match screenings and acoustic sets.',
    features: [
      'Big-screen high-energy live match screenings',
      'Nepal Premier League (NPL) match screening',
      'Seasonal live acoustic music nights'
    ]
  },
  {
    id: 'hookah',
    title: 'Hookah Lounge Experience',
    description: 'Unwind with premium experiences and flavored setups in our exclusive lounge zones.',
    features: [
      'Premium Hookah/Shisha exotic flavors',
      'Exclusive relaxing lounge zones',
      'Special pricing offers everyday until 2:00 PM'
    ]
  },
  {
    id: 'conveniences',
    title: 'Lounge Conveniences',
    description: 'Hassle-free modern amenities built around your seamless comfort and dining schedule.',
    features: [
      'Free dedicated spatial vehicle parking area',
      'High-speed guest customer Wi-Fi access',
      'Table reservations & modern NFC payments'
    ]
  },
  {
    id: 'takeout',
    title: 'Logistics & Takeaway',
    description: 'Enjoy exceptional food wherever you are with secure pickup and localized deliveries.',
    features: [
      'Curbside pickup & pre-order takeaway',
      'Third-party localized delivery partnerships',
      'High-quality heat-preserving food packaging'
    ]
  }
];

export const FAQS: FAQItem[] = [
  {
    question: 'Where is Sutra Lounge located?',
    answer: 'We are situated in the heart of Hetauda, Nepal at Nagar Bikash Samiti Marg, Hetauda 44107. Our central location is very easy to find, with convenient space for vehicles.'
  },
  {
    question: 'What are the core operating hours?',
    answer: 'We are open seven days a week, from Monday to Sunday, starting from 8:00 AM until 9:00 PM.'
  },
  {
    question: 'What is the typical price range at Sutra Lounge?',
    answer: 'Our menu ranges from Rs 500 to Rs 3,000 per person, representing premium food quality served with excellent care.'
  },
  {
    question: 'How do I place an order or reserve a table?',
    answer: 'You can secure private tables or schedule takeout orders by calling 057-522111 or messaging us on WhatsApp at 057-522111. You can also send an instant query through our online placement system!'
  }
];

export const REASSURANCE_POINTS = [
  {
    title: '4.2★ Star Google Rating',
    desc: 'Backed by over 312 genuine customer reviews praising our beautiful design, rapid delivery, and outstanding menu quality.'
  },
  {
    title: 'Premium Local Sourcing',
    desc: 'Each dish is prepared Daily with fresh ingredients sourced from dependable local Hetauda farms and markets under high hygiene.'
  },
  {
    title: 'Comfortable Chill Zone',
    desc: 'Engineered with premium wooden accents, cozy soft beige and gold furnishings making it Hetauda’s premier hangout spot.'
  }
];


export const MAPS_GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    url: loungeInterior,
    caption: 'Cozy luxurious lounge seating with golden ambient lighting and elegant wooden pillars',
    author: 'Pujan Shrestha (Local Guide)',
    category: 'Interior',
    stars: 5,
    socialLink: 'https://www.instagram.com/sutraloungehetauda/'
  },
  {
    url: barCounter,
    caption: 'Main dining counter area featuring premium wood decor and welcoming hospitality structure',
    author: 'Aarav Devkota (Verified Reviewer)',
    category: 'Interior',
    stars: 5,
    socialLink: 'https://www.instagram.com/sutraloungehetauda/'
  },
  {
    url: chickenPizza,
    caption: 'Satisfying gourmet Stone-Baked Chicken Pizza served hot with melting cheese pulls',
    author: 'Sneha Shrestha (Business Guide)',
    category: 'Food',
    stars: 5,
    socialLink: 'https://www.facebook.com/SutraLounge/'
  },
  {
    url: latteMacchiato,
    caption: 'Barista cappuccino with robust flavor profile and perfect milk frothing art',
    author: 'Barsha Thapa (Local Guide)',
    category: 'Drinks',
    stars: 5,
    socialLink: 'https://www.instagram.com/sutraloungehetauda/'
  },
  {
    url: friedMomo,
    caption: 'Crisp Fried Chicken Momos plated alongside traditional spiced Nepalese pickling chutney',
    author: 'Sanjay Chaudhari (Verified Patron)',
    category: 'Food',
    stars: 5,
    socialLink: 'https://www.facebook.com/SutraLounge/'
  },
  {
    url: rooftopPatio,
    caption: 'Sutra Lounge premium cozy lighting & gourmet hospitality details',
    author: 'Rabin Lama (Local Guide)',
    category: 'Exterior',
    stars: 4,
    socialLink: 'https://www.instagram.com/sutraloungehetauda/'
  }
];
