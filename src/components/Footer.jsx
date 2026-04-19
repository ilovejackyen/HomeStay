import React from 'react';
import { useTranslation } from 'react-i18next';
import { Anchor, Mail, MessageSquare } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand">
              <Anchor size={28} className="brand-icon" />
              <span>{t('brand')}</span>
            </div>
            <p className="footer-desc">
              {t('hero.subtitle')}
            </p>
          </div>
          
          <div className="footer-contact">
            <h3>{t('footer.services_title')}</h3>
            <p>{t('footer.services')}</p>
            <h3 style={{marginTop: '20px'}}>{t('nav.booking')}</h3>
            <p>{t('footer.address')}</p>
            <p>{t('footer.contact')}</p>
          </div>
          
          <div className="footer-social">
            <h3>Contact Us</h3>
            <div className="social-links">
              <a href="#" aria-label="Mail"><Mail /></a>
              <a href="#" aria-label="Message"><MessageSquare /></a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>{t('footer.rights')}</p>
          <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
            v1.3.6
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
