import Calendar from '@/components/Calendar';

export default function PublicCalendarPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
      <div style={{ width: '100%', maxWidth: 900 }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '2rem', fontWeight: 600 }}>Public Event Calendar</h1>
        <Calendar />
      </div>
    </main>
  );
} 