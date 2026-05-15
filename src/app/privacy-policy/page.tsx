import styles from "../legal.module.css";

export default function PrivacyPolicy() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Privacy Policy</h1>
      <p className={styles.lastUpdated}>Last Updated: May 15, 2026</p>
      
      <div className={styles.content}>
        <p>At <strong>Sahu Mobiles</strong>, accessible from <strong>sahumobilewala.com</strong>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Sahu Mobiles and how we use it.</p>

        <h2>1. Information We Collect</h2>
        <p>When you purchase a smartphone or register on our site, we collect information that helps us fulfill your order and provide support:</p>
        <ul>
          <li><strong>Name and Contact Details</strong> (Email, Phone Number)</li>
          <li><strong>Delivery Address</strong> and Pincode</li>
          <li><strong>Payment information</strong> (processed securely via Razorpay)</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect in various ways, including to:</p>
        <ul>
          <li>Provide, operate, and maintain our website</li>
          <li>Improve, personalize, and expand our website</li>
          <li>Process your orders and provide <strong>2-hour express delivery</strong></li>
          <li>Communicate with you for customer service and updates</li>
        </ul>

        <h2>3. Log Files</h2>
        <p>Sahu Mobiles follows a standard procedure of using <strong>log files</strong>. These files log visitors when they visit websites. This is a standard part of hosting services' analytics.</p>

        <h2>4. Data Security</h2>
        <p>We implement a variety of <strong>security measures</strong> to maintain the safety of your personal information. Your data is contained behind secured networks and is only accessible by a limited number of persons with special access rights.</p>

        <h2>5. Contact Us</h2>
        <p>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <strong>Care@sahumobilewala.com</strong>.</p>
      </div>
    </div>
  );
}
