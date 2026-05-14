import styles from "./page.module.css";

export default function ContactPage() {
  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.content}>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.description}>
          Have a question or need help with your order? Get in touch with us!
        </p>

        <div className={styles.grid}>
          <div className={styles.contactInfo}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Store Location</h3>
              <p className={styles.infoText}>
                <a 
                  href="https://maps.app.goo.gl/aZDFYLxtSwGaqEGi8?g_st=aw" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#d4af37', textDecoration: 'underline' }}
                >
                  View on Google Maps
                </a>
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Email</h3>
              <p className={styles.infoText}>Care@sahumobilewala.com</p>
            </div>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Phone</h3>
              <p className={styles.infoText}>+91 9792967002</p>
            </div>
          </div>

          <div className={styles.contactForm}>
            <form className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Name</label>
                <input type="text" className={styles.input} placeholder="Your name" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input type="email" className={styles.input} placeholder="Your email address" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Message</label>
                <textarea className={styles.textarea} placeholder="How can we help you?" rows={5}></textarea>
              </div>
              <button type="button" className={`btn btn-primary ${styles.submitBtn}`}>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
