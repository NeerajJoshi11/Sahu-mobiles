import Link from "next/link";
import styles from "./page.module.css";

export default function SuccessPage() {
  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--background)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h1 className={styles.title}>Payment Successful!</h1>
        <p className={styles.description}>
          Thank you for your order. We have received your payment and are processing your order. 
          A confirmation email has been sent to your provided address.
        </p>
        <Link href="/" className="btn btn-primary">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
