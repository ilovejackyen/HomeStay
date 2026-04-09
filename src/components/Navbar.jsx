import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, Anchor } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="brand">
          <Anchor size={28} className="brand-icon" />
          <span>{t('brand')}</span>
        </Link>
        
        <nav className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>{t('nav.home')}</Link>
          <Link to="/rooms" className={location.pathname === '/rooms' ? 'active' : ''}>{t('nav.rooms')}</Link>
          <Link to="/booking" className={location.pathname === '/booking' ? 'active' : ''}>{t('nav.booking')}</Link>
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>{t('nav.admin')}</Link>
          <button className="lang-toggle btn-outline" onClick={toggleLanguage}>
            <Globe size={18} />
            {t('nav.language')}
          </button>
        </nav>

        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
