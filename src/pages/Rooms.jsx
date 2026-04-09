import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import RoomCard from '../components/RoomCard';
import './Home.css'; // Reuse some layout styles

const Rooms = () => {
  const { t } = useTranslation();

  return (
    <div className="rooms-page" style={{ paddingTop: '120px' }}>
      <section className="container section-padding">
        <motion.div
          className="section-header center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="section-title">{t('rooms_section.title')}</h1>
          <p className="section-subtitle">{t('rooms_section.subtitle')}</p>
        </motion.div>

        <div className="rooms-grid">
          <RoomCard
            title={t('rooms_section.room_201')}
            description={t('rooms_section.room_201_desc')}
            image="/assets/IMG_9614.JPG"
            price="$250"
            delay={0.2}
          />
          <RoomCard
            title={t('rooms_section.room_202')}
            description={t('rooms_section.room_202_desc')}
            image="/assets/IMG_9617.JPG"
            price="$550"
            delay={0.4}
          />
          <RoomCard
            title={t('rooms_section.room_203')}
            description={t('rooms_section.room_203_desc')}
            image="/assets/IMG_9618.JPG"
            price="$300"
            delay={0.6}
          />
        </div>
      </section>
    </div>
  );
};

export default Rooms;
