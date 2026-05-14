import styles from "./page.module.css";

export default function AboutPage() {
  return (
    <div className={styles.pageWrapper}>
      {/* Premium Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroGlow}></div>
        <div className="container">
          <h1 className={styles.title}>About Sahu Mobiles</h1>
          <p className={styles.subtitle}>Your Trusted Destination for Premium Technology in Amethi</p>
        </div>
      </section>

      <section className={`container ${styles.contentSection}`}>
        {/* Story Grid */}
        <div className={styles.storyGrid}>
          <div className={styles.textContent}>
            <h2 className={styles.sectionTitle}>Our Story & Mission</h2>
            <div className={styles.divider}></div>
            <p className={styles.text}>
              Welcome to <strong className={styles.highlight}>SAHU MOBILES AND ELECTRONICS!</strong> We are located in the heart of Ramganj, Amethi. We are dedicated to providing the best mobile phones, electronic accessories, and premium services to our customers.
            </p>
            <p className={styles.text}>
              Whether you need the latest smartphone or reliable electronics, we are here to serve you with quality and trust. Our commitment is to bring the future of technology directly to your hands with unparalleled service.
            </p>
          </div>
          
          {/* Abstract Premium Visual Element */}
          <div className={styles.visualElement}>
            <div className={styles.glassCard}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={styles.heroIcon}>
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
              <div className={styles.floatingBadge}>Since 2024</div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className={styles.valuesWrapper}>
          <h2 className={styles.valuesTitle}>Why Choose Us</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.iconWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <h3 className={styles.valueHeading}>Latest Technology</h3>
              <p className={styles.valueText}>Access to the newest and most advanced smartphones as soon as they launch.</p>
            </div>
            
            <div className={styles.valueCard}>
              <div className={styles.iconWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className={styles.valueHeading}>Premium Quality</h3>
              <p className={styles.valueText}>We guarantee the authenticity and quality of every electronic product we sell.</p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.iconWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className={styles.valueHeading}>Trusted Service</h3>
              <p className={styles.valueText}>A dedicated customer support team located right in the heart of Amethi.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
