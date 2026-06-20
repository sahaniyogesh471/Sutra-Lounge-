// Complete translations mapping for Sutra Lounge Hetauda (English <-> Nepali)

export type LanguageType = 'en' | 'ne';

export const STATIC_TRANSLATIONS: Record<string, Record<LanguageType, string>> = {
  // Navigation
  'nav_home': { en: 'Home', ne: 'गृह' },
  'nav_menu': { en: 'The Menu', ne: 'परिकार सूची' },
  'nav_services': { en: 'Services', ne: 'सेवाहरू' },
  'nav_story': { en: 'Vibe & Story', ne: 'कथा र वातावरण' },
  'nav_reviews': { en: 'Reviews', ne: 'प्रतिक्रिया' },
  'nav_contact': { en: 'Quick Placement Query', ne: 'बुकिङ र सम्पर्क' },
  'nav_visit_reserve': { en: 'Visit Us / Reserve', ne: 'हामीलाई भेट्नुहोस् / बुकिङ' },
  'nav_call_lounge': { en: 'Call Lounge', ne: 'लाउन्ज कल गर्नुहोस्' },
  'nav_whatsapp_support': { en: 'WhatsApp Support', ne: 'व्हाट्सएप सपोर्ट' },
  'nav_admin_panel': { en: 'Business Control Panel', ne: 'व्यवसाय नियन्त्रण कक्ष' },
  'nav_brand_subtitle': { en: 'Best Restaurant in Hetauda', ne: 'हेटौंडाको उत्कृष्ट रेस्टुरेन्ट' },

  // Hero Section
  'hero_badge': { en: "HETAUDA'S NEW CULINARY BENCHMARK", ne: 'हेटौंडाको नयाँ उत्कृष्ट स्वाद गन्तव्य' },
  'hero_title': { en: 'SUTRA LOUNGE', ne: 'सुत्र लाउन्ज' },
  'hero_subtitle': { en: 'Premium grill platters, barista-grade refreshments, and local delicacies prepared with absolute care in the heart of Hetauda.', ne: 'हेटौंडाको मुटुमा विशेष ग्रिल प्लेटर्स, ब्यारिस्टा कफी र स्थानीय स्वादिष्ट परिकारहरू अत्यन्तै प्रेम र हेरचाहका साथ तयार पारिन्छ।' },
  'hero_cta_reserve': { en: 'Experience Fine Dining', ne: 'उत्कृष्ट डाइनिंग अनुभव' },
  'hero_cta_menu': { en: 'Explore Menu Highlights', ne: 'विशेष परिकार सूची' },
  'hero_rating_badge': { en: '4.2 Star Rated (312+ Google Reviews)', ne: '४.२ स्टार रेटिङ (३१२+ गुगल रिभ्यूहरू)' },
  'hero_reviews_link': { en: 'Verified Feedback', ne: 'प्रमाणित प्रतिक्रिया' },
  'hero_budget': { en: 'Budget: Rs 500 – 3,000 per person', ne: 'बजेट: प्रति व्यक्ति रु ५०० – ३,०००' },
  'hero_address_label': { en: 'Address', ne: 'ठेगाना' },
  'hero_address_value': { en: 'Nagar Bikash Samiti Marg', ne: 'नगर विकास समिति मार्ग' },
  'hero_hours_label': { en: 'Opening Hours', ne: 'खुल्ने समय' },
  'hero_hours_value': { en: 'Daily: 8:00 AM – 9:00 PM', ne: 'दैनिक: बिहान ८:०० – बेलुका ९:००' },
  'hero_cta_visit': { en: 'Visit Us (Secure Table)', ne: 'हामीलाई भेट्नुहोस् / टेबल बुकिङ' },
  'hero_cta_explore': { en: 'Explore Highlights', ne: 'विशेषताहरू हेर्नुहोस्' },
  'hero_overlay_vibe': { en: 'Sutra Lounge Vibe', ne: 'सुत्र लाउन्ज वातावरण' },
  'hero_overlay_desc': { en: 'Hetauda • Cozy & Well-Decorated', ne: 'हेटौंडा • आरामदायी र सुसज्जित' },
  'hero_feedback_suffix': { en: 'Local Feedback', ne: 'स्थानीय प्रतिक्रियाहरू' },

  // Announcements Banner
  'announcement_prefix': { en: 'LATEST UPDATE', ne: 'नयाँ अपडेट' },

  // Owner Notice
  'owner_badge': { en: 'OWNER VERIFIED FLASH NOTICE', ne: 'संचालकद्वारा प्रमाणीकृत विशेष सूचना' },
  'owner_tag_label': { en: 'Trending tags:', ne: 'चर्चित ट्यागहरू:' },

  // Features / Reassurance
  'features_google_rating_title': { en: '4.2★ Star Google Rating', ne: '४.२★ स्टार गुगल रेटिङ' },
  'features_google_rating_desc': { en: 'Backed by over 312 genuine customer reviews praising our beautiful design, rapid delivery, and outstanding menu quality.', ne: 'हाम्रो सुन्दर आन्तरिक सज्जा, छिटो सेवा र उत्कृष्ट स्वादको प्रशंसा गर्दै ३१२+ भन्दा बढी वास्तविक ग्राहकहरूले दिनुभएको प्रतिक्रिया।' },
  'features_local_sourcing_title': { en: 'Premium Local Sourcing', ne: 'प्रिमियम स्थानीय सामग्री' },
  'features_local_sourcing_desc': { en: 'Each dish is prepared Daily with fresh ingredients sourced from dependable local Hetauda farms and markets under high hygiene.', ne: 'प्रत्येक परिकार हेटौंडाका स्थानीय बजार तथा कृषि फार्महरूबाट ल्याइएका ताजा र स्वस्थकर सामग्रीबाट पूर्ण सरसफाईका साथ तयार गरिन्छ।' },
  'features_chill_zone_title': { en: 'Comfortable Chill Zone', ne: 'आरामदायी चिल जोन' },
  'features_chill_zone_desc': { en: 'Engineered with premium wooden accents, cozy soft beige and gold furnishings making it Hetauda’s premier hangout spot.', ne: 'काठको आकर्षक कलाकृति र आरामदायी सोफाहरूको साथमा सुनौलो प्रकाशले सजिएको हेटौंडाकै उत्कृष्ट र रमाइलो भेटघाट स्थल।' },

  // Menu Section
  'menu_title': { en: 'Our Culinary Masterpieces', ne: 'हाम्रा विशेष परिकारहरू' },
  'menu_subtitle': { en: 'Crafted with passion, ingredients of supreme premium quality, and curated recipes.', ne: 'प्यासन, प्रिमियम गुणस्तरका सामग्री र विशेष रेसिपीहरूका साथ तयार पारिएका परिकारहरू।' },
  'menu_btn_book': { en: 'Inquire About This Dish', ne: 'यस परिकारबारे सोधपुछ' },
  'menu_popular_badge': { en: 'POPULAR CHOICE', ne: 'धेरै रूचाइएको' },
  'menu_instagram_badge': { en: 'View on Socials', ne: 'सामाजिक सञ्जालमा हेर्नुहोस्' },

  // Services Section
  'services_badge': { en: 'DESIGNED FOR HIGHEST COMFORT', ne: 'सर्वोच्च आराम र सुविधाको लाग' },
  'services_title': { en: 'Sutra Hospitality Services', ne: 'सुत्र हस्पिटालिटी सेवाहरू' },
  'services_subtitle': { en: 'Savor premium local gastronomy packaged in outstanding multi-zone lounges, corporate dinners, match setups, and swift delivery conveniences.', ne: 'हाम्रो मल्टि-जोन लाउन्ज, कर्पोरेट डिनर, प्रत्यक्ष खेलकुद प्रसारण र छिटो प्याकेजिङ सेवाहरू मार्फत प्रिमियम गास्ट्रोनोमीको आनन्द लिनुहोस्।' },

  // Story / Vibe Section
  'story_badge': { en: 'CRISP ARCHITECTURE. IMPECCABLE SANITATION.', ne: 'उत्कृष्ट वास्तुकला र उच्च सरसफाई' },
  'story_title': { en: 'Our Story & Aesthetic Detail', ne: 'हाम्रो कथा र विशेषता' },
  'story_p1': { en: 'Enjoy custom ambient lighting that highlights elegant woodwork and calming beige/gold seating details. Our kitchen is run under pristine hygiene codes, offering fresh menus seven days a week. We serve hot breakfast deals starting from 8:00 AM, up to delightful late-evening dinners that close on 9:00 PM.', ne: 'काठको आकर्षक कलाकृति र आरामदायी बेज तथा सुनौलो रङका सिटहरूको संयोजनले लाउन्जको वातावरणलाई मनमोहक बनाउँछ। हाम्रो भान्सा पूर्ण रूपमा स्वच्छ र स्वस्थकर छ। हामी हप्ताको सातै दिन बिहान ८:०० बजेको स्वादिष्ट ब्रेकफास्टदेखि बेलुका ९:०० बजेको विशिष्ट डिनरसम्म ताजा परिकारहरू पस्कन्छौं।' },
  'story_p2': { en: 'Sutra Lounge represents a monumental leap forward in Hetauda’s modern dining era, bridging traditional Nepali hospitality with international culinary craftsmanship.', ne: 'सुत्र लाउन्ज हेटौंडाको आधुनिक डाइनिंग क्षेत्रमा एउटा ठूलो क्रान्ति हो, जसले परम्परागत नेपाली आतिथ्यता र अन्तर्राष्ट्रिय स्वाद कलालाई एकै ठाउँमा जोड्दछ।' },

  // Reviews Section
  'reviews_badge': { en: 'REAL FEEDBACK FROM REAL PEOPLE', ne: 'वास्तविक मानिसहरूका वास्तविक प्रतिक्रियाहरू' },
  'reviews_title': { en: 'What Hetauda Feels About Us', ne: 'हाम्रो बारेमा हेटौंडावासीको भनाइ' },
  'reviews_subtitle': { en: 'We cherish every voice. Sourced transparently from our active 312 Google Maps reviewers.', ne: 'हामी प्रत्येक ग्राहकको प्रतिक्रियाको कदर गर्दछौं। गुगल म्याप्सका ३१२+ सक्रिय समीक्षकहरूबाट पारदर्शी रूपमा प्राप्त।' },
  'reviews_filter_all': { en: 'All Verified Feedbacks', ne: 'सबै प्रमाणित प्रतिक्रियाहरू' },
  'reviews_filter_stars': { en: 'Star Rating', ne: 'स्टार रेटिङ्ग' },
  'reviews_rating_label': { en: 'Google Maps Placement Rating', ne: 'गुगल म्याप्स समीक्षा दर' },
  'reviews_verified_text': { en: 'Verified Placements', ne: 'प्रमाणित समीक्षाहरू' },

  // Media Gallery Section
  'gallery_badge': { en: 'SUTRA MEDIA DESK', ne: 'सुत्र मिडिया डेस्क' },
  'gallery_title': { en: 'Atmospheric Visual Gallery', ne: 'हाम्रो सुन्दर दृश्य ग्यालरी' },
  'gallery_subtitle': { en: 'Real snaps shared by our active Google Local Guides showcasing cozy corners and premium platters.', ne: 'हाम्रा सक्रिय गुगल लोकल गाइडहरूद्वारा खिचिएका केही वास्तविक तस्विरहरू जसले आरामदायक कुनाहरू र प्रिमियम परिकारहरू चित्रण गर्छन्।' },

  // Booking / Reservation Section
  'booking_badge': { en: 'SECURE INSTANT RESERVATION', ne: 'अहिले नै सजिलै टेबल बुक गर्नुहोस्' },
  'booking_title': { en: 'Dynamic Placement Query Hub', ne: 'बुकिङ तथा सोधपुछ कक्ष' },
  'booking_subtitle': { en: 'Skip the line. Pre-book your lounge cabins, reserve dinner spaces, or draft localized takeaway orders in 1-Click.', ne: 'लाइन बस्नु पर्ने झन्झटबाट मुक्त रहनुहोस्। आफ्नो रोजाइको क्याबिन बुकिङ, डिनर टेबल बुकिङ वा अनलाइन अर्डर तत्कालै पठाउनुहोस्।' },
  'booking_form_card_title': { en: 'Submit Booking Query', ne: 'बुकिङ सोधपुछ पठाउनुहोस्' },
  
  // Form Fields
  'field_name': { en: 'Full Name', ne: 'पूरा नाम' },
  'field_name_placeholder': { en: 'e.g. Ram Bahadur', ne: 'उदाहरण: राम बहादुर' },
  'field_phone': { en: 'WhatsApp or Mobile (Nepal)', ne: 'व्हाट्सएप वा मोबाइल नम्बर (नेपाल)' },
  'field_phone_placeholder': { en: 'e.g. 9845xxxxxx or 057-xxxxxx', ne: 'उदाहरण: ९८४५xxxxxx वा ०५७-xxxxxx' },
  'field_service': { en: 'Preferred Order Type / Service', ne: 'पसन्दको अर्डर प्रकार / सेवा' },
  'field_date': { en: 'Planned Date', ne: 'योजना गरिएको मिति' },
  'field_time': { en: 'Planned Time', ne: 'योजना गरिएको समय' },
  'field_guests': { en: 'Party Size (Guests)', ne: 'जम्मा व्यक्तिहरू (गेस्ट)' },
  'field_message': { en: 'Special Requests / Additional Details', ne: 'विशेष अनुरोध / थप विवरणहरू' },
  'field_message_placeholder': { en: 'e.g. Birthday decoration, double chili spice preference, etc.', ne: 'उदाहरण: जन्मदिनको सजावट, थप पिरो वा मसलाको विवरण, आदि।' },
  'field_submit_btn': { en: 'Submit Booking Query', ne: 'बुकिङ सोधपुछ दर्ता गर्नुहोस्' },
  'field_whatsapp_btn': { en: 'Forward via WhatsApp', ne: 'व्हाट्सएप मार्फत पठाउनुहोस्' },
  'submit_success_title': { en: 'QUERY INITIATED SUCCESSFULLY!', ne: 'सोधपुछ सफलतापूर्वक दर्ता भयो!' },
  'submit_success_desc': { en: 'Your booking has been compiled into our system. For immediate validation and table lock-in, forward this compiled receipt over to our live desk on WhatsApp:', ne: 'तपाईंको बुकिङ हाम्रो प्रणालीमा रेकर्ड गरिएको छ। तत्काल जानकारी पुष्टि गर्नको लागि तलको व्हाट्सएप बटन थिचेर हाम्रो काउन्टरमा पठाउनुहोस्:' },
  'submit_success_whatsapp_action': { en: 'Forward Draft to WhatsApp', ne: 'व्हाट्सएपमा ड्राफ्ट पठाउनुहोस्' },
  'submit_success_reset_btn': { en: 'Create New Query', ne: 'नयाँ सोधपुछ सुरु गर्नुहोस्' },
  'error_name_empty': { en: 'Please mention your full name', ne: 'कृपया तपाईंको पूरा नाम उल्लेख गर्नुहोस्' },
  'error_phone_empty': { en: 'Please state a valid Nepalese phone number', ne: 'कृपया मान्य नेपाली फोन नम्बर दर्ता गर्नुहोस्' },

  // Recent Reservations
  'recent_bookings_title': { en: 'Live Booking Queue', ne: 'हालका बुकिङहरूको स्थिति' },
  'recent_bookings_subtitle': { en: 'Active placement tickets currently in process:', ne: 'प्रक्रियामा रहेका सक्रिय बुकिङहरू:' },
  'recent_seats': { en: 'seats', ne: 'सिट' },

  // Location Details Panel
  'location_title': { en: 'Secure Location Directions', ne: 'सजिलो स्थान र मार्गनिर्देशन' },
  'location_addr_label': { en: 'Sutra Coordinates', ne: 'सुत्र ठेगाना' },
  'location_phone_label': { en: 'Direct Line Desk', ne: 'लाउन्ज फोन डेस्क' },
  'location_hours_label': { en: 'Timings', ne: 'संचालन समय' },
  'location_google_btn': { en: 'Navigate Google Maps', ne: 'गुगल म्याप्स नेभिगेसन खोलौं' },

  // Footer
  'footer_desc': { en: 'Nagar Bikash Samiti Marg, Hetauda 44107, Nepal. The leading modern restaurant landmark in town. Savor signature sandwich platters, barista-grade refreshments, and local delicacies prepared with absolute care.', ne: 'नगर विकास समिति मार्ग, हेटौंडा ४४१०७, नेपाल। सहरकै उत्कृष्ट आधुनिक रेस्टुरेन्ट र लाउन्ज। आउनुहोस्, स्वादिष्ट स्यान्डविच, स्तरिय कफी र स्थानीय विशिष्ठ स्वादको आनन्द लिनुहोस्।' },
  'footer_operating_status': { en: 'Operating Daily • 8:00 AM – 9:00 PM', ne: 'दैनिक संचालन • बिहान ८:०० देखि बेलुका ९:०० सम्म' },
  'footer_useful_links': { en: 'Useful Landmarks', ne: 'उपयोगी लिङ्कहरू' },
  'footer_contact_header': { en: 'Lounge Contact Desk', ne: 'लाउन्ज सम्पर्क डेस्क' },
  'footer_copyright': { en: 'Sutra Lounge Hetauda. All Rights Reserved.', ne: 'सुत्र लाउन्ज हेटौंडा। सर्वाधिकार सुरक्षित।' },
  'footer_designed_by': { en: 'Crafted with premium local hospitality', ne: 'प्रिमियम स्थानीय आतिथ्यताका साथ निर्माण गरिएको' },

  // FAQ Page Elements
  'faq_section_title': { en: 'Frequently Asked Questions', ne: 'बारम्बार सोधिने प्रश्नहरू' },
  'faq_section_subtitle': { en: 'Got questions about seating, booking, or pricing? Find rapid answers below.', ne: 'परिकार, मूल्य वा बुकिङको बारेमा केही सोध्नु छ? यहाँ धेरै सोधिने प्रश्नहरूको उत्तर पाउनुहोस्।' },
};

// Map default menu items to Nepali
export const MENU_TRANSLATIONS: Record<string, { title: string; description: string; category: string }> = {
  'Fresh Pancakes Breakfast': {
    title: 'ताजा प्यानकेक ब्रेकफास्ट',
    category: 'ब्रेकफास्ट कम्बो',
    description: 'महको सिरप, हिमाली ताजा अर्गानिक कफी, र लाउन्जको विशेष बिहानी स्वागत पेय पदार्थको साथमा पस्किएको स्वादिष्ट प्यानकेक।'
  },
  'Crispy Chicken Wings': {
    title: 'क्रिस्पी चिकेन विंग्स',
    category: 'केही खाजा र स्न्याक्स',
    description: 'हाम्रा सेफद्वारा तयार पारिएका ठूला विंग्सहरू जसलाई डिप-फ्राई गरेर लाउन्जको विशेष तातो र अमिलो ससमा डुबाइन्छ।'
  },
  'Chilly Pork': {
    title: 'चिली पोर्क',
    category: 'केही खाजा र स्न्याक्स',
    description: 'नरम पोर्कका पीसहरू जसलाई उच्च तापक्रममा हरियो खुर्सानी, प्याज, भेडे खुर्सानी र हरियो प्याजका साथ स्वादिलो बनाइएको छ।'
  },
  'Veg-Chilly Momo': {
    title: 'वेज-चिली मःमः',
    category: 'केही खाजा र स्न्याक्स',
    description: 'ताजा तरकारीहरू कोचिएको ममः जसलाई डिप-फ्राई गरी लाउन्जको विशेष पिरो लसुन चिली ससमा मिसाएर पस्किइन्छ।'
  },
  'Paneer Katti Roll': {
    title: 'पनीर काठ्ठी रोल',
    category: 'केही खाजा र स्न्याक्स',
    description: 'तन्दुरमा सेकाइएको पनीरलाई पुदिनाको चटनी र प्याजको साथ क्रिस्पी तातो पराठामा बेरेर तयार पारिएको स्वादिलो रोल।'
  },
  'Authentic Butter Naan & Chicken Curry': {
    title: 'बटर नान र चिकेन करी',
    category: 'विशेष खाना (भारतीय परिकार)',
    description: 'तन्दुर ओभनमा तातो पकाइएको बटर गार्लिक नान र स्वादिलो, क्रिमी स्थानीय गोलभेडा तथा काजु ससमा पाकेको चिकेन करी।'
  },
  'Aromatic Chicken Biryani': {
    title: 'सुगन्धित चिकेन बिर्यानी',
    category: 'विशेष खाना (भारतीय परिकार)',
    description: 'उच्च स्तरिय बासमती चामल, नरम चिकेन पीस र केशरको मिश्रणबाट दम शैलीमा पाकेको विशेष बिर्यानी। पुदिना रायताको साथ पस्किइन्छ।'
  },
  'Sizzling Chicken Tandoori Platter': {
    title: 'सिजलिङ् चिकेन तन्दुरी प्लाटर',
    category: 'विशेष खाना (भारतीय परिकार)',
    description: 'अदुवा, लसुन र स्थानीय जडीबुटीहरू मोलेर रातभर राखिएको सिंगो चिकेन पिस तन्दुर ओभनमा पोलिएको विशेष परिकार।'
  },
  'Signature Toast Chicken Sandwich': {
    title: 'विशेष टोस्टेड चिकेन स्यान्डविच',
    category: 'कफी र स्यान्डविच',
    description: 'हेटौंडाकै सर्वाधिक लोकप्रिय स्यान्डविच। नौनीमा सेकाइएको नरम पाउरोटी, ग्रिल गरिएको डबल चिकेन, स्वीस चिज, लेटुस र लाउन्जको गोप्य स्पेशल सस।'
  },
  'Classic Mint Virgin Mojito': {
    title: 'क्लासिक मिन्ट भर्जिन मोजितो',
    category: 'मकटेल र पेय पदार्थ',
    description: 'पुदिनाको ताजा पात, कागती, ब्राउन सुगर र क्रस गरिएको हिउँको पानी मिसाएर तयार पारिएको स्फूर्तिदायी पेय पदार्थ।'
  },
  'Specialty Latte Macchiato': {
    title: 'स्पेशल लाटे माकियातो',
    category: 'मकटेल र पेय पदार्थ',
    description: 'ताजा अराबिका कफी एस्प्रेसो र तातो बाक्लो दूधको मखमली फिँजसहित ब्यारिस्टा शैलीमा तयार पारिएको क्लासिक कफी।'
  }
};

// Map Services to Nepali
export const SERVICES_TRANSLATIONS: Record<string, { title: string; description: string; features: string[] }> = {
  'dine-in': {
    title: 'भोजन हल (Dine-In)',
    description: 'आरामको लागि डिजाइन गरिएको मल्टि-जोन वास्तुकला। एउटै छानामुनि विभिन्न रमाइलो वातावरणको आनन्द लिनुहोस्।',
    features: [
      'आधुनिक र जीवन्त इन्डोर सिटिङ लाउन्ज',
      'रोमान्टिक जोडी तथा परिवारको लागि क्याबिनहरू',
      'खुल्ला र हावादार आकर्षक रुफटप गार्डेन'
    ]
  },
  'events': {
    title: 'विशेष कार्यक्रम आयोजना',
    description: 'तपाईंका अविस्मरणीय कार्यक्रमहरू र समूह जमघटहरूको लागि उत्कृष्ट आतिथ्य प्रदान गर्ने हेटौंडाकै लोकप्रिय ठाउँ।',
    features: [
      'व्यावसायिक कर्पोरेट मिटिङ् तथा लन्च कार्यक्रम',
      'पारिवारिक जमघट तथा जन्मदिनको सजावट र उत्सव',
      'विभिन्न निजी पार्टी र भोजहरूको विशेष व्यवस्थापन'
    ]
  },
  'sports': {
    title: 'खेलकुद र मनोरञ्जन',
    description: 'ठूलो स्क्रिनको साथमा प्रत्यक्ष खेलकुदको मज्जा र उत्कृष्ट सांगीतिक साँझहरूको अनुभव लिनुहोस्।',
    features: [
      'ठूलो प्रोजेक्टर स्क्रिनमा लाइभ म्याचको रमाइलो',
      'नेपाल प्रिमियर लिग (NPL) को विशेष लाइभ प्रदर्शन',
      'प्रत्येक हप्ताको शुक्रबार र शनिबार लाइभ म्युजिक'
    ]
  },
  'hookah': {
    title: 'हुक्का लाउन्ज अनुभव',
    description: 'हाम्रो विशेष जोनहरूमा उत्कृष्ट स्वाद र प्रिमियम प्रविधिमा सजाइएका हुक्का सेटअपहरूका साथ आनन्द लिनुहोस्।',
    features: [
      'अन्तर्राष्ट्रिय प्रिमियम फ्लेवर हुक्का तथा शिशा',
      'शान्त र आरामदायक छुट्टै स्मोकिङ लाउन्ज',
      'दिउँसो २:०० बजे सम्मको लाग विशेष छुट मूल्य'
    ]
  },
  'conveniences': {
    title: 'लाउन्ज सुविधाहरू',
    description: 'तपाईंको सुविधा र आरामलाई ध्यानमा राखेर व्यवस्था गरिएका आधुनिक डिजिटल सुविधाहरू।',
    features: [
      'सुरक्षित र फराकिलो नि:शुल्क पार्किङ क्षेत्र',
      'उच्च गतिको नि:शुल्क ग्राहक वाई-फाई सेवा',
      'डिजिटल अर्डर र आधुनिक एनएफसी डिजिटल भुक्तानी'
    ]
  },
  'takeout': {
    title: 'टेक-अवे र पार्सल सेवा',
    description: 'घरैमा बसेर लाउन्जको स्वाद लिनको लागि सुरक्षित प्याकिङ र भरपर्दो डेलिभरी सेवाहरू।',
    features: [
      'छिटो र छरितो टेक-अवे र प्रि-अर्डर सुविधा',
      'हेटौंडा भित्रै स्थानीय डेलिभरी पार्टनर तथा छिटो ढुवानी',
      'खाना तातो राख्ने सुरक्षित तथा इको-फ्रेन्डली प्याकेजिङ'
    ]
  }
};

// FAQS
export const FAQS_TRANSLATIONS: Record<string, { question: string; answer: string }> = {
  'Where is Sutra Lounge located?': {
    question: 'सुत्र लाउन्ज कहाँ अवस्थित छ?',
    answer: 'हामी हेटौंडाको केन्द्र भाग हुप्राचौर नजिकै नगर विकास समिति मार्ग, हेटौंडा ५ मा अवस्थित छौं। यहाँ पुग्न एकदमै सजिलो छ र सवारी साधन पार्किङको लागी प्रशस्त ठाउँ छ।'
  },
  'What are the core operating hours?': {
    question: 'लाउन्ज खोल्ने र बन्द हुने समय के हो?',
    answer: 'हामी हप्ताको सातै दिन सोमबार देखि आइतबार सम्म बिहान ८:०० बजे देखि राती ९:०० बजे सम्म खुल्ला रहन्छौं।'
  },
  'What is the typical price range at Sutra Lounge?': {
    question: 'सुत्र लाउन्जको अनुमानित मूल्य कति छ?',
    answer: 'हाम्रो मेनु अनुसार प्रति व्यक्ति औसत खर्च रु ३५० देखि रु १२०० सम्म पर्दछ, जुन प्रिमियम गुणस्तर र उत्कृष्ट सेवा अनुसार निकै मुनासिब हो।'
  },
  'How do I place an order or reserve a table?': {
    question: 'म कसरी टेबल बुक गर्न वा अर्डर गर्न सक्छु?',
    answer: 'तपाईंले सीधा कल गरी ०५७-५२२१११ मा वा व्हाट्सएप ०५७-५२२१११ मा म्यासेज गरेर आफ्नो क्याबिन बुक गर्न सक्नुहुन्छ। साथै यसै वेबसाइटको तल दिइएको अनलाइन बुकिङ प्रणालीबाट पनि बुकिङ सन्देश पठाउन सक्नुहुन्छ!'
  }
};

// Map photo captions
export const PHOTO_TRANSLATIONS: Record<string, string> = {
  'Cozy luxurious lounge seating with golden ambient lighting and elegant wooden pillars': 'आकर्षक काठका पिलर र सुनौलो प्रकाश सहितको आरामदायी लक्जरी लाउन्ज सिटिङ क्षेत्र',
  'Main dining counter area featuring premium wood decor and welcoming hospitality structure': 'प्रिमियम काठको बुट्टा र स्वागतार्थी बार काउन्टर डाइनिंग क्षेत्र',
  'Satisfying gourmet Stone-Baked Chicken Pizza served hot with melting cheese pulls': 'तातो तातो पस्किएको स्वादिष्ट र क्रिस्पी स्टोन-बेक्ड चिकेन पिज्जा',
  'Barista cappuccino with robust flavor profile and perfect milk frothing art': 'अत्यन्तै मिठो फ्लेभर र मखमली फिँजले सजिएको ब्यारिस्टा क्यापुचिनो कफी',
  'Crisp Fried Chicken Momos plated alongside traditional spiced Nepalese pickling chutney': 'विशेष अचार चटनीको साथमा पस्किएको क्रिस्पी प्रिमियम फ्राइड चिकेन ममः',
  'Sutra Lounge premium cozy lighting & gourmet hospitality details': 'सुत्र लाउन्जको प्रिमियम आरामदायी लाइटिङ र स्वादिष्ट हस्पिटालिटी विवरण'
};

// Translate Service Types (Form values)
export const SERVICE_TYPE_NAMES: Record<string, Record<LanguageType, string>> = {
  'Dine-In Cabin Reservation': { en: 'Dine-In Cabin Reservation', ne: 'भोजन क्याबिन बुकिङ' },
  'Corporate Business High Lunch': { en: 'Corporate Business High Lunch', ne: 'कर्पोरेट लन्च/मिटिङ' },
  'Sweet Private Birthday Setup': { en: 'Sweet Private Birthday Setup', ne: 'विशेष जन्मदिन सजावट' },
  'Premium Hookah Lounge Slot': { en: 'Premium Hookah Lounge Slot', ne: 'हुक्का लाउन्ज स्लट' },
  'Local Food Takeaway Prep': { en: 'Local Food Takeaway Prep', ne: 'खाना पार्सल/टेक-अवे अर्डर' }
};
