import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, Clock, Settings, Search, DollarSign,
  Phone, Mail, MessageSquare, ChevronDown, ChevronUp, User, FileText
} from 'lucide-react';
import { BookingContext } from '../context/BookingContext';
import './Admin.css';

const Admin = () => {
  const { t } = useTranslation();
  const { rooms, reservations, customers, updateReservationProps, loading } = useContext(BookingContext);

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('adminAuth') === 'true');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const resp = await fetch('/api/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const result = await resp.json();
      if (result.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('adminAuth', 'true');
      } else {
        setLoginError(result.error || t('admin.login_error'));
      }
    } catch (err) {
      setLoginError(t('admin.server_error'));
    }
    setIsLoggingIn(false);
  };

  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'confirmed': return <span className="badge badge-success"><Check size={14} /> {t('admin.status_confirmed')}</span>;
      case 'pending': return <span className="badge badge-warning"><Clock size={14} /> {t('admin.status_pending')}</span>;
      case 'cancelled': return <span className="badge badge-danger"><X size={14} /> {t('admin.status_cancelled')}</span>;
      default: return null;
    }
  };

  const PaymentBadge = ({ status }) => (
    status === 'paid'
      ? <span className="badge badge-success">{t('admin.paid')}</span>
      : <span className="badge badge-danger">{t('admin.unpaid')}</span>
  );

  const updateStatus = async (id, newStatus) => await updateReservationProps(id, { status: newStatus });
  const togglePayment = async (id, currentStatus) => {
    const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
    await updateReservationProps(id, { paymentStatus: newStatus });
  };

  const formatDate = (timestamp) => new Date(timestamp).toLocaleDateString('zh-TW');

  const getRoomName = (roomId) => {
    const room = rooms.find(r => r.ID === roomId || r.id === roomId);
    return room ? (room.Name || room.name) : roomId;
  };

  // Get full customer info for a reservation
  const getCustomerInfo = (res) => {
    // Try to find in customers array (raw data from backend)
    const customer = customers?.find(c => c.Name === res.guestName);
    return {
      phone: res.phone || customer?.Phone || '',
      lineId: res.lineId || customer?.LineID || '',
      email: res.email || customer?.Email || '',
      specialRequests: res.specialRequests || customer?.SpecialRequests || '',
    };
  };

  const filteredReservations = reservations.filter(res => {
    const matchesStatus = filterStatus === 'all' || res.status === filterStatus;
    const matchesPayment = filterPayment === 'all' || res.paymentStatus === filterPayment;
    const matchesSearch =
      res.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(res.id).includes(searchTerm) ||
      getRoomName(res.roomId)?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPayment && matchesSearch;
  });

  const toggleExpand = (id) => {
    setExpandedRow(prev => prev === id ? null : id);
  };

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    unpaid: reservations.filter(r => r.paymentStatus !== 'paid' && r.status !== 'cancelled').length,
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-page" style={{ paddingTop: '120px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          className="admin-dashboard glass-panel"
          style={{ maxWidth: '420px', width: '100%', padding: '48px 40px', textAlign: 'center' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Settings size={48} style={{ color: '#0ea5e9', marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '8px' }}>{t('admin.login_title')}</h2>
          <p style={{ color: '#94a3b8', marginBottom: '30px' }}>{t('admin.login_subtitle')}</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder={t('admin.password_placeholder')}
              style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', marginBottom: '15px', fontSize: '1rem', boxSizing: 'border-box' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoggingIn}
            />
            {loginError && <p style={{ color: '#ef4444', marginBottom: '15px', fontSize: '0.9rem' }}>{loginError}</p>}
            <button
              type="submit"
              className="action-btn approve-btn"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem' }}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? t('admin.verifying') : t('admin.login_btn')}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="admin-page" style={{ paddingTop: '120px' }}>
      <div className="container">
        <motion.div className="admin-header center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="section-title"><Settings size={32} style={{ marginRight: '12px' }} />{t('admin.title')}</h1>
          <p className="section-subtitle">{t('admin.subtitle')}</p>
        </motion.div>

        {/* Stats Row */}
        <motion.div className="admin-stats-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <div className="stat-card">
            <div className="stat-num">{stats.total}</div>
            <div className="stat-label">{t('admin.stat_total')}</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-num">{stats.pending}</div>
            <div className="stat-label">{t('admin.stat_pending')}</div>
          </div>
          <div className="stat-card confirmed">
            <div className="stat-num">{stats.confirmed}</div>
            <div className="stat-label">{t('admin.stat_confirmed')}</div>
          </div>
          <div className="stat-card unpaid">
            <div className="stat-num">{stats.unpaid}</div>
            <div className="stat-label">{t('admin.stat_unpaid')}</div>
          </div>
        </motion.div>

        <motion.div className="admin-dashboard glass-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {/* Controls */}
          <div className="admin-controls">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder={t('admin.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-box">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">{t('admin.filter_all_status')}</option>
                <option value="pending">{t('admin.status_pending')}</option>
                <option value="confirmed">{t('admin.status_confirmed')}</option>
                <option value="cancelled">{t('admin.status_cancelled')}</option>
              </select>
            </div>
            <div className="filter-box">
              <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)}>
                <option value="all">{t('admin.filter_all_payment')}</option>
                <option value="unpaid">{t('admin.unpaid')}</option>
                <option value="paid">{t('admin.paid')}</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.col_order')}</th>
                  <th>{t('admin.guest_name')}</th>
                  <th>{t('admin.col_contact')}</th>
                  <th>{t('admin.room_type')}</th>
                  <th>{t('admin.dates')}</th>
                  <th>{t('admin.col_fee')}</th>
                  <th>{t('admin.col_payment')}</th>
                  <th>{t('admin.status')}</th>
                  <th>{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                      <div className="loading-dots">{t('admin.loading')}</div>
                    </td>
                  </tr>
                ) : filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#6d819c' }}>
                      {t('admin.no_reservations')}
                    </td>
                  </tr>
                ) : filteredReservations.map((res) => {
                  const info = getCustomerInfo(res);
                  const isExpanded = expandedRow === res.id;
                  const nights = Math.round((res.checkOut - res.checkIn) / (1000 * 60 * 60 * 24));
                  return (
                    <React.Fragment key={res.id}>
                      <tr className={isExpanded ? 'expanded-row' : ''}>
                        <td className="res-id">{res.id}</td>
                        <td className="res-guest">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={14} style={{ color: 'var(--text-light)' }} />
                            {res.guestName}
                          </div>
                        </td>
                        <td>
                          <div className="contact-cell">
                            {info.phone && <div className="contact-item"><Phone size={13} />{info.phone}</div>}
                            {info.lineId && <div className="contact-item"><MessageSquare size={13} />LINE: {info.lineId}</div>}
                            {info.email && <div className="contact-item email-item"><Mail size={13} />{info.email}</div>}
                            {!info.phone && !info.lineId && !info.email && <span style={{ color: '#aaa', fontSize: '0.85rem' }}>—</span>}
                          </div>
                        </td>
                        <td>{getRoomName(res.roomId)}</td>
                        <td>
                          <div style={{ fontSize: '0.9rem' }}>{formatDate(res.checkIn)}</div>
                          <div style={{ fontSize: '0.9rem' }}>→ {formatDate(res.checkOut)}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{nights} {t('admin.nights')} · {res.guests} {t('admin.pax')}</div>
                        </td>
                        <td style={{ fontWeight: 'bold', color: 'var(--aegean-blue)' }}>
                          NT${Number(res.totalFee)?.toLocaleString()}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <PaymentBadge status={res.paymentStatus} />
                            <button
                              className="action-btn"
                              style={{ backgroundColor: '#64748B', width: '24px', height: '24px' }}
                              onClick={() => togglePayment(res.id, res.paymentStatus)}
                              title={t('admin.toggle_payment')}
                            >
                              <DollarSign size={12} />
                            </button>
                          </div>
                        </td>
                        <td><StatusBadge status={res.status} /></td>
                        <td className="res-actions">
                          {res.status === 'pending' && (
                            <button className="action-btn approve-btn" onClick={() => updateStatus(res.id, 'confirmed')} title={t('admin.action_approve')}>
                              <Check size={14} />
                            </button>
                          )}
                          {res.status !== 'cancelled' && (
                            <button className="action-btn cancel-btn" onClick={() => updateStatus(res.id, 'cancelled')} title={t('admin.action_cancel')}>
                              <X size={14} />
                            </button>
                          )}
                          <button
                            className="action-btn detail-btn"
                            onClick={() => toggleExpand(res.id)}
                            title={t('admin.view_details')}
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>
                      {/* Expanded Detail Row */}
                      <AnimatePresence>
                        {isExpanded && (
                          <tr className="detail-row">
                            <td colSpan="9" style={{ padding: 0 }}>
                              <motion.div
                                className="detail-panel"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="detail-grid">
                                  <div className="detail-item">
                                    <div className="detail-label"><Phone size={15} /> {t('admin.col_phone')}</div>
                                    <div className="detail-value">{info.phone || '—'}</div>
                                  </div>
                                  <div className="detail-item">
                                    <div className="detail-label"><MessageSquare size={15} /> {t('admin.col_line')}</div>
                                    <div className="detail-value">{info.lineId || '—'}</div>
                                  </div>
                                  <div className="detail-item">
                                    <div className="detail-label"><Mail size={15} /> {t('admin.col_email')}</div>
                                    <div className="detail-value">{info.email || '—'}</div>
                                  </div>
                                  <div className="detail-item full-width">
                                    <div className="detail-label"><FileText size={15} /> {t('admin.col_requests')}</div>
                                    <div className="detail-value requests-text">
                                      {info.specialRequests || <span style={{ color: '#aaa' }}>{t('admin.no_requests')}</span>}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;
