import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="hero">
      <div className="hero-background">
        <div className="hero-overlay"></div>
        {/* We use the requested image from the local pics folder */}
        <img src="/assets/IMG_9624.JPG" alt="Island Arch Homestay" className="hero-image" />
      </div>
      
      <div className="container hero-content">
        <motion.div 
          className="hero-text"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <motion.div 
            className="hero-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Compass size={16} />
            <span>Santorini, Greece</span>
          </motion.div>
          
          <h1 className="hero-title">{t('hero.title')}</h1>
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
          
          <motion.button 
            className="btn btn-primary hero-btn"
            onClick={() => navigate('/booking')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('hero.cta')}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
