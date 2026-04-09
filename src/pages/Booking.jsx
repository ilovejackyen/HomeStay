import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Users, Calendar as CalendarIcon, User, Home as HomeIcon } from 'lucide-react';
import { BookingContext } from '../context/BookingContext';
import './Booking.css';

const Booking = () => {
  const { t } = useTranslation();
  const { rooms, reservations, addReservationAsync } = useContext(BookingContext);
  
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [guests, setGuests] = useState(2);
  const [selectedRoomId, setSelectedRoomId] = useState("R201");
  const [guestName, setGuestName] = useState("");
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkAvailability = (roomId, checkInDate, checkOutDate) => {
    return !reservations.some(res => {
      if (res.roomId !== roomId || res.status === 'cancelled') return false;
      
      const existingStart = res.checkIn;
      const existingEnd = res.checkOut;
      const newStart = checkInDate.getTime();
      const newEnd = checkOutDate.getTime();
      
      return (newStart < existingEnd && newEnd > existingStart);
    });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setStatusMsg({ type: 'error', text: "Please enter your name." });
      return;
    }

    const checkIn = new Date(startDate);
    checkIn.setHours(0,0,0,0);
    const checkOut = new Date(endDate);
    checkOut.setHours(0,0,0,0);

    const isAvailable = checkAvailability(selectedRoomId, checkIn, checkOut);
    
    if (!isAvailable) {
      setStatusMsg({ type: 'error', text: t('booking.already_booked', '對不起，該房型在您選擇的日期內已被預約，請選擇其他日期或房型。') });
      return;
    }

    const selectedRoom = rooms.find(r => r.id === selectedRoomId) || rooms.find(r => String(r.ID) === String(selectedRoomId));
    if (!selectedRoom) return;

    const days = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const finalFee = (selectedRoom.BaseRate || selectedRoom.baseRate || 0) * days;
    
    try {
      setIsSubmitting(true);
      const newResId = await addReservationAsync({
        roomId: selectedRoomId,
        guestName: guestName,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests: guests,
        totalFee: finalFee,
      });

      setStatusMsg({ type: 'success', text: `Success! Reservation #${newResId} submitted for ${selectedRoom.Name || selectedRoom.name}. Total: NT$${finalFee}` });
      setGuestName("");
    } catch (error) {
      setStatusMsg({ type: 'error', text: "Error submitting booking. Server issue." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="booking-page" style={{ paddingTop: '120px' }}>
      <div className="container booking-container">
        <motion.div 
          className="booking-form-wrapper glass-panel"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="booking-header">
            <h2>{t('booking.title')}</h2>
          </div>
          
          <form className="booking-form" onSubmit={handleBooking}>
            <div className="form-group">
              <label><User size={18} /> {t('admin.guest_name')}</label>
              <input 
                type="text" 
                className="date-input" 
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Your Name"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label><HomeIcon size={18} /> {t('admin.room_type')}</label>
              <select className="guest-select" value={selectedRoomId} onChange={(e) => setSelectedRoomId(e.target.value)} disabled={isSubmitting}>
                {rooms.map(r => (
                  <option key={r.ID || r.id} value={r.ID || r.id}>{r.Name || `${r.number} ${r.name}`}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label><CalendarIcon size={18} /> {t('booking.check_in')}</label>
              <DatePicker 
                selected={startDate} 
                onChange={(date) => setStartDate(date)} 
                selectsStart
                startDate={startDate}
                endDate={endDate}
                minDate={new Date()}
                className="date-input"
                dateFormat="yyyy/MM/dd"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label><CalendarIcon size={18} /> {t('booking.check_out')}</label>
              <DatePicker 
                selected={endDate} 
                onChange={(date) => setEndDate(date)} 
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                className="date-input"
                dateFormat="yyyy/MM/dd"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label><Users size={18} /> {t('booking.guests')}</label>
              <select 
                value={guests} 
                onChange={(e) => setGuests(Number(e.target.value))}
                className="guest-select"
                disabled={isSubmitting}
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} Guests</option>
                ))}
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : `${t('booking.search')} / Book`}
            </button>
          </form>
          
          {statusMsg.text && (
            <div style={{
              marginTop: '20px', 
              padding: '15px', 
              background: statusMsg.type === 'error' ? '#FCE8E6' : '#E6F4EA', 
              color: statusMsg.type === 'error' ? '#D93025' : '#1E8E3E', 
              borderRadius: '8px', 
              textAlign: 'center',
              fontWeight: 500
            }}>
              {statusMsg.text}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Booking;
