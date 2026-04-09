import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wifi, Coffee, Maximize, Wind } from 'lucide-react';
import './RoomCard.css';

const RoomCard = ({ title, description, image, price, delay = 0 }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <motion.div 
      className="room-card glass-panel"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10 }}
    >
      <div className="room-image-wrapper">
        <img src={image} alt={title} className="room-image" />
        <div className="room-price">
          <span>{price}</span> / night
        </div>
      </div>
      
      <div className="room-details">
        <h3 className="room-title">{title}</h3>
        <p className="room-desc">{description}</p>
        
        <div className="room-amenities">
          <div className="amenity" title="Free Wifi"><Wifi size={18} /></div>
          <div className="amenity" title="Breakfast"><Coffee size={18} /></div>
          <div className="amenity" title="Spacious"><Maximize size={18} /></div>
          <div className="amenity" title="AC"><Wind size={18} /></div>
        </div>
        
        <button 
          className="btn btn-outline room-btn"
          onClick={() => navigate('/booking')}
        >
          {t('rooms_section.book_now')}
        </button>
      </div>
    </motion.div>
  );
};

export default RoomCard;
