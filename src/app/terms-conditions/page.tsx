import styles from "../legal.module.css";

export default function TermsConditions() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Terms & Conditions</h1>
      <p className={styles.lastUpdated}>Last Updated: May 15, 2026</p>
      
      <div className={styles.content}>
        <h2>1. Agreement to Terms</h2>
        <p>By accessing <strong>sahumobilewala.com</strong>, you agree to be bound by these <strong>Terms and Conditions</strong> and all applicable laws and regulations.</p>

        <h2>2. Intellectual Property</h2>
        <p>The content, logos, and product images on this site are the exclusive property of <strong>Sahu Mobiles</strong> and are protected by international copyright and trademark laws.</p>

        <h2>3. Product Information</h2>
        <p>We attempt to be as accurate as possible with product descriptions and pricing. However, Sahu Mobiles does not warrant that product descriptions or other content is 100% accurate, complete, or error-free. In the event of a <strong>pricing error</strong>, we reserve the right to cancel the order and provide a full refund.</p>

        <h2>4. Express Delivery (2-Hour)</h2>
        <p>Our <strong>2-hour express delivery</strong> is only available for eligible pincodes and orders placed within operational hours. While we strive to meet every deadline, Sahu Mobiles is not liable for delays caused by extreme weather, traffic, or unforeseen circumstances.</p>

        <h2>5. Limitation of Liability</h2>
        <p><strong>Sahu Mobiles</strong> shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our products or services.</p>

        <h2>6. Governing Law</h2>
        <p>These terms are governed by and construed in accordance with the laws of <strong>India</strong>, and you irrevocably submit to the exclusive jurisdiction of the courts in <strong>Amethi, Uttar Pradesh</strong>.</p>
      </div>
    </div>
  );
}
