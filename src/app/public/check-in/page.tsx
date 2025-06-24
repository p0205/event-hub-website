'use client';
import React, { useState } from 'react';
import styles from './checkin.module.css';
import attendanceService from '@/services/attendanceService';
import { useSearchParams } from 'next/navigation';

const CheckinPage = () => {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const qrCodePayload = searchParams.get('q');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!qrCodePayload || !email) {
        setError('Missing QR payload or email.');
        setLoading(false);
        return;
      }
      await attendanceService.checkIn(qrCodePayload, email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Attendance Check-In</h2>
          <p className={styles.subtitle}>Please enter UTeM email to record your attendance for this session.</p>
        </div>
        {/* <h1 className={styles.eventTitle}>Event Check-In</h1> */}
        {/* <p className={styles.session}>Session: <span className={styles.sessionName}>{sessionName}</span></p> */}
        {submitted ? (
          <div className={styles.success} style={{textAlign: 'center', padding: '24px 0'}}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{display: 'block', margin: '0 auto 12px'}}><circle cx="12" cy="12" r="12" fill="#22c55e"/><path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <div style={{fontSize: 20, fontWeight: 700, marginBottom: 6}}>Check-in Successful!</div>
            <div style={{fontSize: 16}}>Thank you! Your attendance has been recorded.</div>
          </div>
        ) : (
          <form onSubmit={handleCheckIn}>
            <label htmlFor="email" className={styles.formLabel}>UTeM Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Enter your UTeM email"
              className={styles.input}
              disabled={loading}
            />
            {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
            <button
              type="submit"
              className={styles.button}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckinPage; 