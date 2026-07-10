import React, { useState } from 'react';
import { Phone, Menu, X, Facebook, Instagram } from 'lucide-react';
import { TikTokIcon } from '../App';

interface NavigationProps {
  lang: string;
  t: (key: string) => string;
  toggleLanguage: () => void;
  businessDetails: any;
  scrollToTop: () => void;
  scrollToSection: (ref: React.RefObject<HTMLDivElement>) => void;
  menuSectionRef: React.RefObject<HTMLDivElement>;
  servicesSectionRef: React.RefObject<HTMLDivElement>;
  storySectionRef: React.RefObject<HTMLDivElement>;
  reviewsSectionRef: React.RefObject<HTMLDivElement>;
  onAdminClick: () => void;
  getCleanPhoneUrl: (phone: string) => string;
}

export const Navigation: React.FC<NavigationProps> = ({
  lang,
  t,
  toggleLanguage,
  businessDetails,
  scrollToTop,
  scrollToSection,
  menuSectionRef,
  servicesSectionRef,
  storySectionRef,
  reviewsSectionRef,
  onAdminClick,
  getCleanPhoneUrl,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: t('nav_home'), onClick: scrollToTop },
    { label: t('nav_menu'), onClick: () => scrollToSection(menuSectionRef) },
    { label: t('nav_services'), onClick: () => scrollToSection(servicesSectionRef) },
    { label: t('nav_story'), onClick: () => scrollToSection(storySectionRef) },
    { label: t('nav_reviews'), onClick: () => scrollToSection(reviewsSectionRef) },
  ];

  return (
    <header className="sticky top-0 z-40 bg-cream-soft/85 backdrop-blur-md border-b border-cream-deep">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <button 
          onClick={scrollToTop}
          className="flex items-center gap-3 group cursor-pointer text-left focus:outline-none bg-transparent border-none p-0"
          aria-label="Sutra Lounge Home"
        >
          <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-cream-soft font-serif font-bold text-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
            S
          </div>
          <div className="text-left hidden sm:block">
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
          {navLinks.map((link) => (
            <button 
              key={link.label}
              onClick={link.onClick}
              className="text-xs tracking-wider uppercase font-bold text-charcoal-muted hover:text-gold transition-colors cursor-pointer focus:outline-none bg-transparent border-none p-0"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-5">
          <div className="flex items-center gap-2 border-r border-cream-deep pr-4">
            {businessDetails?.facebookLink && (
              <a href={businessDetails.facebookLink} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-cream-deep text-charcoal hover:bg-gold hover:text-cream-soft flex items-center justify-center transition-all duration-300">
                <Facebook className="w-4.5 h-4.5" />
              </a>
            )}
            {businessDetails?.instagramLink && (
              <a href={businessDetails.instagramLink} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-cream-deep text-charcoal hover:bg-gold hover:text-cream-soft flex items-center justify-center transition-all duration-300">
                <Instagram className="w-4.5 h-4.5" />
              </a>
            )}
            {businessDetails?.tiktokLink && (
              <a href={businessDetails.tiktokLink} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-cream-deep text-charcoal hover:bg-gold hover:text-cream-soft flex items-center justify-center transition-all duration-300">
                <TikTokIcon className="w-4 h-4" />
              </a>
            )}
          </div>
          
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-full border border-gold/40 hover:border-gold hover:bg-gold/5 flex items-center gap-1 text-[11px] font-bold tracking-wider text-charcoal cursor-pointer uppercase transition-all duration-300"
          >
            <span className={`transition-opacity ${lang === 'en' ? 'text-gold' : 'text-charcoal-muted/65'}`}>EN</span>
            <span className="text-gold/30">|</span>
            <span className={`transition-opacity ${lang === 'ne' ? 'text-gold' : 'text-charcoal-muted/65'}`}>NEP</span>
          </button>

          <a 
            href={getCleanPhoneUrl(businessDetails?.phone)}
            className="flex items-center gap-2 text-sm font-semibold text-charcoal hover:text-gold transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gold-light flex items-center justify-center text-gold">
              <Phone className="w-4 h-4" />
            </div>
            <span className="font-mono text-xs">{businessDetails?.phone}</span>
          </a>
          
          <button
            onClick={onAdminClick}
            className="px-3 py-1.5 rounded-full bg-gold text-cream-soft font-bold text-xs uppercase hover:bg-gold-dark transition-colors"
          >
            Admin
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-charcoal hover:text-gold transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-cream-deep bg-cream-soft">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  link.onClick();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-sm font-semibold text-charcoal hover:text-gold transition-colors py-2"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
