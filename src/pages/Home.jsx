import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import RoomCard from '../components/RoomCard';
import './Home.css';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="home-page">
      <Hero />
      
      <section className="about-section container section-padding">
        <motion.div 
          className="section-header center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">{t('about.title')}</h2>
          <div className="about-content" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', lineHeight: '1.8', fontSize: '1.1rem', color: 'var(--text-light)' }}>
            <p style={{ marginBottom: '20px' }}>{t('about.desc1')}</p>
            <p>{t('about.desc2')}</p>
          </div>
        </motion.div>
      </section>
      
      <section className="rooms-preview container section-padding">
        <motion.div 
          className="section-header center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">{t('rooms_section.title')}</h2>
          <p className="section-subtitle">{t('rooms_section.subtitle')}</p>
        </motion.div>
        
        <div className="rooms-grid">
          <RoomCard 
            title={t('rooms_section.room_201')}
            description={t('rooms_section.room_201_desc')}
            image="/assets/IMG_9612.JPG"
            price="$250"
            delay={0.2}
          />
          <RoomCard 
            title={t('rooms_section.room_202')}
            description={t('rooms_section.room_202_desc')}
            image="/assets/IMG_9616.JPG"
            price="$550"
            delay={0.4}
          />
          <RoomCard 
            title={t('rooms_section.room_203')}
            description={t('rooms_section.room_203_desc')}
            image="/assets/IMG_9615.JPG"
            price="$300"
            delay={0.6}
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
