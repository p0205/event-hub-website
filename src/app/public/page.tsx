'use client';

import { Calendar} from 'lucide-react';
import Image from 'next/image';
import styles from './public.module.css';
import { useRouter } from 'next/navigation';


const EventHub = () => {
  const router = useRouter();

  // No event/calendar/filter state or functions needed
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section id="home" className={styles.hero}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroContentRow}>
          {/* Left Content */}
          <div className={styles.heroLeft}>
            <h1 className={styles.heroTitle}>Explore FTMK&apos;s Event Hub</h1>
            <p className={styles.heroSubtitle}>
              Dive into a diverse range of events designed to inspire, educate, and connect our university community and beyond.
            </p>
            <button 
              className={styles.heroButton}
              onClick={() => router.push('/public/calendar')}
            >
              <Calendar className={styles.buttonIcon} />
              Discover Events
            </button>
          </div>
          {/* Right Content: QR Code Only */}
          <div className={styles.heroRight}>
            <h2 className={styles.qrHeroTitle}>Download the FTMK Event Hub</h2>
            <Image src="/app_download.png" alt="FTMK App QR Code" width={200} height={200} className={styles.heroQrImage} />
            <p className={styles.heroQrText}>Scan this QR code to download the FTMK Event Hub Android App.</p>
            <p className={styles.heroQrAltDownload}>
              Can&apos;t scan? Download <a href="https://drive.google.com/uc?export=download&id=183yl-lWcoYxu3ko_UsMSNYLUBRwihIW3" className="text-amber-700 hover:text-amber-800 font-semibold underline">Here</a>
            </p>
            <ul className={styles.heroFeatureList}>
              <li><span className={styles.heroFeatureIcon}>✔</span> View all events</li>
              <li><span className={styles.heroFeatureIcon}>✔</span> Manage your personal events</li>
              <li><span className={styles.heroFeatureIcon}>✔</span> Built-in navigation to event venues</li>
            </ul>
           
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContentCentered}>
          <div className={styles.footerLogoRow}>
            <Image src="/utemLogo.png" alt="UTeM Logo" width={120} height={40} className={styles.footerLogo} />
            <Image src="/ftmkLogo.png" alt="FTMK Logo" width={120} height={40} className={styles.footerLogo} />
          </div>
         
        </div>
       
        <div className={styles.footerBottom}>
          <p>&copy; 2025 FTMK Event Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default EventHub;