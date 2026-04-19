import React, { useState, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  Users, Calendar as CalendarIcon, User, Home as HomeIcon,
  Phone, Mail, MessageSquare, Search, CheckCircle, ChevronRight, ChevronLeft, Star
} from 'lucide-react';
import { BookingContext } from '../context/BookingContext';
import './Booking.css';

const Booking = () => {
  const { t } = useTranslation();
  const { rooms, reservations, addReservationAsync } = useContext(BookingContext);

  // Step 1: Availability check
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [guests, setGuests] = useState(2);
  const [availableRooms, setAvailableRooms] = useState(null); // null = not searched yet
  const [hasSearched, setHasSearched] = useState(false);

  // Step 2: Booking form
  const [step, setStep] = useState(1); // 1 = search, 2 = fill form
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  // Contact info
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [lineId, setLineId] = useState('');
  const [email, setEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

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

  const handleSearch = (e) => {
    e.preventDefault();
    const checkIn = new Date(startDate);
    checkIn.setHours(0, 0, 0, 0);
    const checkOut = new Date(endDate);
    checkOut.setHours(0, 0, 0, 0);

    const results = rooms.map(room => {
      const roomId = room.ID || room.id;
      const available = checkAvailability(roomId, checkIn, checkOut);
      return { ...room, available };
    });

    setAvailableRooms(results);
    setHasSearched(true);
    setSelectedRoomId(null);
    setStatusMsg({ type: '', text: '' });
  };

  const handleSelectRoom = (room) => {
    setSelectedRoomId(room.ID || room.id);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToSearch = () => {
    setStep(1);
    setStatusMsg({ type: '', text: '' });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setStatusMsg({ type: 'error', text: t('booking.error_name') });
      return;
    }
    if (!phone.trim() && !lineId.trim() && !email.trim()) {
      setStatusMsg({ type: 'error', text: t('booking.error_contact') });
      return;
    }

    const checkIn = new Date(startDate);
    checkIn.setHours(0, 0, 0, 0);
    const checkOut = new Date(endDate);
    checkOut.setHours(0, 0, 0, 0);

    const isAvailable = checkAvailability(selectedRoomId, checkIn, checkOut);
    if (!isAvailable) {
      setStatusMsg({ type: 'error', text: t('booking.already_booked', '對不起，該房型在您選擇的日期內已被預約，請選擇其他日期或房型。') });
      return;
    }

    const selectedRoom = rooms.find(r => (r.ID || r.id) === selectedRoomId);
    if (!selectedRoom) return;

    const days = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const finalFee = (selectedRoom.BaseRate || selectedRoom.baseRate || 0) * days;

    try {
      setIsSubmitting(true);
      const newResId = await addReservationAsync({
        roomId: selectedRoomId,
        guestName: guestName,
        phone: phone,
        lineId: lineId,
        email: email,
        specialRequests: specialRequests,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests: guests,
        totalFee: finalFee,
      });

      setStatusMsg({
        type: 'success',
        text: t('booking.success_msg', { id: newResId, room: selectedRoom.Name || selectedRoom.name, fee: finalFee.toLocaleString() })
      });
      // Reset form
      setGuestName(''); setPhone(''); setLineId(''); setEmail(''); setSpecialRequests('');
      setStep(1);
      setHasSearched(false);
      setAvailableRooms(null);
    } catch (error) {
      setStatusMsg({ type: 'error', text: t('booking.error_server') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRoom = useMemo(() =>
    rooms.find(r => (r.ID || r.id) === selectedRoomId),
    [rooms, selectedRoomId]
  );

  const days = useMemo(() => {
    const checkIn = new Date(startDate); checkIn.setHours(0, 0, 0, 0);
    const checkOut = new Date(endDate); checkOut.setHours(0, 0, 0, 0);
    return Math.max(1, Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);

  const estimatedFee = selectedRoom ? (selectedRoom.BaseRate || selectedRoom.baseRate || 0) * days : 0;

  const handleCheckInChange = (date) => {
    setStartDate(date);
    setHasSearched(false);
    
    // If check-out is not after check-in, auto-advance it to check-in + 1 day
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    if (endDate <= date) {
      setEndDate(nextDay);
    }
  };

  // Room type key mapping for i18n image/desc
  const roomKeys = { R201: '201', R202: '202', R203: '203' };

  return (
    <div className="booking-page" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container booking-container" style={{ maxWidth: '900px' }}>

        {/* Page Title */}
        <motion.div className="booking-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="section-title">{t('booking.title')}</h1>
          <p className="section-subtitle">{t('booking.subtitle')}</p>
        </motion.div>

        {/* Step Indicator */}
        <div className="booking-steps">
          <div className={`booking-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
            <div className="step-circle">
              {step > 1 ? <CheckCircle size={18} /> : <span>1</span>}
            </div>
            <span>{t('booking.step1')}</span>
          </div>
          <div className="step-connector" />
          <div className={`booking-step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-circle"><span>2</span></div>
            <span>{t('booking.step2')}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ===== STEP 1: Search Availability ===== */}
          {step === 1 && (
            <motion.div
              key="step1"
              className="booking-form-wrapper glass-panel"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
            >
              <form onSubmit={handleSearch}>
                <div className="booking-form search-form">
                  <div className="form-group">
                    <label><CalendarIcon size={18} /> {t('booking.check_in')}</label>
                    <DatePicker
                      selected={startDate}
                      onChange={handleCheckInChange}
                      selectsStart startDate={startDate} endDate={endDate}
                      minDate={new Date()} className="date-input" dateFormat="yyyy/MM/dd"
                    />
                  </div>
                  <div className="form-group">
                    <label><CalendarIcon size={18} /> {t('booking.check_out')}</label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => { setEndDate(date); setHasSearched(false); }}
                      selectsEnd startDate={startDate} endDate={endDate}
                      minDate={new Date(new Date(startDate).getTime() + 86400000)} className="date-input" dateFormat="yyyy/MM/dd"
                    />
                  </div>
                  <div className="form-group">
                    <label><Users size={18} /> {t('booking.guests')}</label>
                    <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="guest-select">
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num} {t('booking.pax')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary submit-btn" style={{ height: '48px', gap: '8px', display: 'flex', alignItems: 'center' }}>
                      <Search size={18} /> {t('booking.search')}
                    </button>
                  </div>
                </div>
              </form>

              {/* Search Results */}
              <AnimatePresence>
                {hasSearched && availableRooms && (
                  <motion.div
                    className="availability-results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h3 className="results-title">
                      {t('booking.results_title')}
                      <span className="results-dates">
                        {startDate.toLocaleDateString('zh-TW')} – {endDate.toLocaleDateString('zh-TW')} ({days} {t('booking.nights')})
                      </span>
                    </h3>
                    <div className="room-availability-grid">
                      {availableRooms.map((room) => {
                        const roomId = room.ID || room.id;
                        const fee = (room.BaseRate || room.baseRate || 0) * days;
                        return (
                          <motion.div
                            key={roomId}
                            className={`room-avail-card ${room.available ? 'available' : 'unavailable'}`}
                            whileHover={room.available ? { scale: 1.02, y: -4 } : {}}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="room-avail-status">
                              {room.available
                                ? <span className="avail-badge available-badge">✓ {t('booking.available')}</span>
                                : <span className="avail-badge booked-badge">✗ {t('booking.unavailable')}</span>
                              }
                            </div>
                            <div className="room-avail-info">
                              <div className="room-avail-name">{room.Name || room.name}</div>
                              <div className="room-avail-fee">
                                NT$ {fee.toLocaleString()}
                                <span className="fee-note"> / {days} {t('booking.nights')}</span>
                              </div>
                              <div className="room-avail-rate">
                                ({t('booking.per_night')} NT$ {(room.BaseRate || room.baseRate || 0).toLocaleString()})
                              </div>
                            </div>
                            {room.available && (
                              <button
                                className="btn btn-primary room-select-btn"
                                onClick={() => handleSelectRoom(room)}
                              >
                                {t('booking.select_room')} <ChevronRight size={18} />
                              </button>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Global success/error msg on step 1 (after submit from step 2) */}
              {statusMsg.text && (
                <div className={`status-msg ${statusMsg.type}`}>
                  {statusMsg.type === 'success' && <CheckCircle size={20} />}
                  {statusMsg.text}
                </div>
              )}
            </motion.div>
          )}

          {/* ===== STEP 2: Fill in Guest Details ===== */}
          {step === 2 && (
            <motion.div
              key="step2"
              className="booking-form-wrapper glass-panel"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4 }}
            >
              {/* Selected room summary */}
              {selectedRoom && (
                <div className="selected-room-summary">
                  <div className="selected-room-info">
                    <Star size={18} className="star-icon" />
                    <div>
                      <div className="selected-room-name">{selectedRoom.Name || selectedRoom.name}</div>
                      <div className="selected-room-detail">
                        {startDate.toLocaleDateString('zh-TW')} → {endDate.toLocaleDateString('zh-TW')}
                        &nbsp;·&nbsp; {days} {t('booking.nights')}
                        &nbsp;·&nbsp; {guests} {t('booking.pax')}
                        &nbsp;·&nbsp; <strong>NT$ {estimatedFee.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                  <button className="btn-back" onClick={handleBackToSearch}>
                    <ChevronLeft size={16} /> {t('booking.back')}
                  </button>
                </div>
              )}

              <form onSubmit={handleBooking} className="detail-form">
                <div className="form-section-title">{t('booking.section_guest')}</div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label><User size={18} /> {t('booking.guest_name')}</label>
                    <input type="text" className="date-input" value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder={t('booking.placeholder_name')} required disabled={isSubmitting} />
                  </div>
                  <div className="form-group">
                    <label><Users size={18} /> {t('booking.guests')}</label>
                    <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="guest-select" disabled={isSubmitting}>
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num} {t('booking.pax')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-section-title" style={{ marginTop: '24px' }}>{t('booking.section_contact')}</div>
                <p className="form-hint">{t('booking.contact_hint')}</p>
                <div className="form-row-3">
                  <div className="form-group">
                    <label><Phone size={18} /> {t('booking.phone')}</label>
                    <input type="tel" className="date-input" value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('booking.placeholder_phone')} disabled={isSubmitting} />
                  </div>
                  <div className="form-group">
                    <label><MessageSquare size={18} /> {t('booking.line_id')}</label>
                    <input type="text" className="date-input" value={lineId}
                      onChange={(e) => setLineId(e.target.value)}
                      placeholder={t('booking.placeholder_line')} disabled={isSubmitting} />
                  </div>
                  <div className="form-group">
                    <label><Mail size={18} /> {t('booking.email')}</label>
                    <input type="email" className="date-input" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('booking.placeholder_email')} disabled={isSubmitting} />
                  </div>
                </div>

                <div className="form-section-title" style={{ marginTop: '24px' }}>{t('booking.section_requests')}</div>
                <div className="form-group">
                  <label><MessageSquare size={18} /> {t('booking.special_requests')}</label>
                  <textarea
                    className="date-input request-textarea"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder={t('booking.placeholder_requests')}
                    rows={4}
                    disabled={isSubmitting}
                  />
                </div>

                {statusMsg.text && (
                  <div className={`status-msg ${statusMsg.type}`}>
                    {statusMsg.text}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="button" className="btn-back-full" onClick={handleBackToSearch} disabled={isSubmitting}>
                    <ChevronLeft size={16} /> {t('booking.back')}
                  </button>
                  <button type="submit" className="btn btn-primary submit-btn" style={{ flex: 1, gap: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} disabled={isSubmitting}>
                    {isSubmitting ? t('booking.processing') : <>{t('booking.confirm_booking')} <ChevronRight size={18} /></>}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Booking;
