import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { LazyImage } from './LazyImage';

interface HeroSectionProps {
  heroImage: string;
  dishImage: string;
  lang: string;
  t: (key: string) => string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ heroImage, dishImage, lang, t }) => {
  const [isVisible, setIsVisible] = useState(true);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-cream-soft via-cream-soft to-gold/3" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            variants={fadeInUp}
            className="flex flex-col gap-6 sm:gap-8 z-10"
          >
            <div className="space-y-3 sm:space-y-4">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal leading-tight">
                {lang === 'en' ? 'Premium Dining Experience' : 'प्रिमियम खान्ने अनुभव'}
              </h1>
              <p className="text-base sm:text-lg text-charcoal-muted leading-relaxed">
                {lang === 'en' 
                  ? 'Discover luxury dining with authentic flavors and warm hospitality in the heart of Hetauda'
                  : 'हेटौंडाको मुलमा प्रामाणिक स्वाद र गर्मजोसले भरपूर विलासी भोजन अनुभव गरेर हेर्नुहोस्'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="px-6 sm:px-8 py-3 sm:py-4 bg-gold text-cream-soft font-semibold rounded-lg hover:bg-gold-dark transition-colors duration-300">
                {lang === 'en' ? 'Book a Table' : 'टेबल बुक गर्नुहोस्'}
              </button>
              <button className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-gold text-gold font-semibold rounded-lg hover:bg-gold/10 transition-colors duration-300">
                {lang === 'en' ? 'View Menu' : 'मेनु हेर्नुहोस्'}
              </button>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div 
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="relative h-96 sm:h-[450px] lg:h-[500px]"
          >
            {heroImage && (
              <LazyImage
                src={heroImage}
                alt="Sutra Lounge Restaurant"
                wrapperClassName="w-full h-full rounded-2xl shadow-2xl overflow-hidden"
                className="w-full h-full object-cover"
                eager
              />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
