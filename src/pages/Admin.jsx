import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, X, Clock, Settings, Search, DollarSign } from 'lucide-react';
import { BookingContext } from '../context/BookingContext';
import './Admin.css';

const Admin = () => {
  const { t } = useTranslation();
  
  const { rooms, reservations, updateReservationProps, loading } = useContext(BookingContext);
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const StatusBadge = ({ status }) => {
    switch(status) {
      case 'confirmed':
        return <span className="badge badge-success"><Check size={14} /> {t('admin.status_confirmed')}</span>;
      case 'pending':
        return <span className="badge badge-warning"><Clock size={14} /> {t('admin.status_pending')}</span>;
      case 'cancelled':
        return <span className="badge badge-danger"><X size={14} /> {t('admin.status_cancelled')}</span>;
      default:
        return null;
    }
  };

  const PaymentBadge = ({ status }) => {
    return status === 'paid' 
      ? <span className="badge badge-success">Paid</span> 
      : <span className="badge badge-danger">Unpaid</span>;
  };

  const updateStatus = async (id, newStatus) => {
    await updateReservationProps(id, { status: newStatus });
  };

  const togglePayment = async (id, currentStatus) => {
    const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
    await updateReservationProps(id, { paymentStatus: newStatus });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getRoomName = (roomId) => {
    const room = rooms.find(r => r.ID === roomId || r.id === roomId);
    return room ? `${room.Name || room.name}` : roomId;
  };

  const filteredReservations = reservations.filter(res => {
    const matchesStatus = filterStatus === 'all' || res.status === filterStatus;
    const matchesPayment = filterPayment === 'all' || res.paymentStatus === filterPayment;
    const matchesSearch = res.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || String(res.id).includes(searchTerm);
    return matchesStatus && matchesPayment && matchesSearch;
  });

  return (
    <div className="admin-page" style={{ paddingTop: '120px' }}>
      <div className="container">
        <motion.div 
          className="admin-header center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="section-title"><Settings size={32} style={{marginRight: '12px'}}/>{t('admin.title')}</h1>
          <p className="section-subtitle">Real-time Excel Physical Database Backend</p>
        </motion.div>

        <motion.div 
          className="admin-dashboard glass-panel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="admin-controls">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by name or Order ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-box">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Booking Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
             <div className="filter-box">
              <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)}>
                <option value="all">All Payment Status</option>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>{t('admin.guest_name')}</th>
                  <th>{t('admin.room_type')}</th>
                  <th>{t('admin.dates')}</th>
                  <th>Fee (NT$)</th>
                  <th>Payment</th>
                  <th>Booking {t('admin.status')}</th>
                  <th>{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr>
                     <td colSpan="8" style={{textAlign: 'center', padding: '30px'}}>Loading from Excel API...</td>
                   </tr>
                ) : filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{textAlign: 'center', padding: '30px', color: '#6d819c'}}>No reservations found.</td>
                  </tr>
                ) : filteredReservations.map((res) => (
                  <tr key={res.id}>
                    <td className="res-id">{res.id}</td>
                    <td className="res-guest">{res.guestName}</td>
                    <td>{getRoomName(res.roomId)}</td>
                    <td>{formatDate(res.checkIn)} - {formatDate(res.checkOut)}</td>
                    <td style={{fontWeight: 'bold'}}>${res.totalFee?.toLocaleString()}</td>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <PaymentBadge status={res.paymentStatus} />
                        <button 
                          className="action-btn" 
                          style={{backgroundColor: '#64748B', width: '24px', height: '24px'}}
                          onClick={() => togglePayment(res.id, res.paymentStatus)}
                          title="Toggle Payment Status"
                        >
                          <DollarSign size={14} />
                        </button>
                      </div>
                    </td>
                    <td><StatusBadge status={res.status} /></td>
                    <td className="res-actions">
                      {res.status === 'pending' && (
                        <button 
                          className="action-btn approve-btn" 
                          onClick={() => updateStatus(res.id, 'confirmed')}
                          title={t('admin.action_approve')}
                        >
                          <Check size={16} />
                        </button>
                      )}
                      {res.status !== 'cancelled' && (
                        <button 
                          className="action-btn cancel-btn" 
                          onClick={() => updateStatus(res.id, 'cancelled')}
                          title={t('admin.action_cancel')}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;
