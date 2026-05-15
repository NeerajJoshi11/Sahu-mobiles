import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.container}>
      <div className={styles.errorCode}>404</div>
      <h1 className={styles.title}>Page Not Found</h1>
      <p className={styles.description}>
        The premium experience you're looking for seems to have moved or doesn't exist. 
        Let's get you back to the flagship collection.
      </p>
      
      <div className={styles.actions}>
        <Link href="/" className={styles.homeBtn}>
          Back to Store
        </Link>
        <Link href="/contact" className={styles.supportBtn}>
          Contact Support
        </Link>
      </div>
    </main>
  );
}
