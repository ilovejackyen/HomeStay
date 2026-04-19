import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  format, addDays, subDays, startOfDay, isWithinInterval, 
  eachDayOfInterval, isSameDay, isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';
import './AdminCalendar.css';

const AdminCalendar = ({ rooms, reservations }) => {
  const { t } = useTranslation();
  
  // Date window state (start from today by default)
  const [windowStart, setWindowStart] = useState(startOfDay(new Date()));
  const daysToShow = 14;
  
  const dateRange = useMemo(() => {
    return eachDayOfInterval({
      start: windowStart,
      end: addDays(windowStart, daysToShow - 1)
    });
  }, [windowStart]);

  const handlePrev = () => setWindowStart(prev => subDays(prev, daysToShow));
  const handleNext = () => setWindowStart(prev => addDays(prev, daysToShow));
  const handleToday = () => setWindowStart(startOfDay(new Date()));

  const getReservationsForRoomAndDate = (roomId, date) => {
    return reservations.filter(res => {
      // Room match
      const isRoomMatch = res.roomId === roomId;
      if (!isRoomMatch) return false;
      
      // Status filter (exclude cancelled)
      if (res.status === 'cancelled') return false;

      // Date match - checking if date is between checkIn and checkOut
      // Note: checkOut day usually allows new checkIn, so we use checkOut - 1 day for visualization
      const start = startOfDay(new Date(res.checkIn));
      const end = subDays(startOfDay(new Date(res.checkOut)), 1); // Stay ends the night before checkout date
      
      return isWithinInterval(date, { start, end }) || isSameDay(date, start);
    });
  };

  return (
    <div className="admin-calendar">
      <div className="calendar-controls">
        <h3 className="calendar-title">
          <CalendarIcon size={20} />
          {t('admin.calendar_title')}
        </h3>
        <div className="calendar-nav">
          <button onClick={handlePrev} className="nav-btn" title={t('admin.prev_period')}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleToday} className="nav-btn today-btn">
            {t('admin.today')}
          </button>
          <button onClick={handleNext} className="nav-btn" title={t('admin.next_period')}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="calendar-grid-container">
        <div className="calendar-grid">
          {/* Header Row: Dates */}
          <div className="grid-row header-row">
            <div className="room-col header-cell">{t('admin.room_type')}</div>
            {dateRange.map(date => (
              <div key={date.toString()} className={`date-cell header-cell ${isToday(date) ? 'is-today' : ''}`}>
                <div className="day-name">{format(date, 'EEE')}</div>
                <div className="day-num">{format(date, 'MM/dd')}</div>
              </div>
            ))}
          </div>

          {/* Room Rows */}
          {rooms.map(room => (
            <div key={room.ID || room.id} className="grid-row room-row">
              <div className="room-col room-name-cell">
                {room.Name || room.name}
              </div>
              {dateRange.map(date => {
                const dayReservations = getReservationsForRoomAndDate(room.ID || room.id, date);
                const hasRes = dayReservations.length > 0;
                
                return (
                  <div key={date.toString()} className="date-cell grid-cell">
                    {dayReservations.map(res => (
                      <div 
                        key={res.id} 
                        className={`res-block status-${res.status}`}
                        title={`${res.guestName} (${res.phone || 'N/A'})`}
                      >
                        <div className="res-mini-info">
                          <span className="guest-initial">{res.guestName?.charAt(0)}</span>
                          <div className="res-tooltip">
                            <div className="tooltip-name">{res.guestName}</div>
                            <div className="tooltip-id">#{res.id}</div>
                            <div className="tooltip-contact">{res.phone}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot status-confirmed"></span>
          <span>{t('admin.status_confirmed')}</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot status-pending"></span>
          <span>{t('admin.status_pending')}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminCalendar;
