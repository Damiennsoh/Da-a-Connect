import React from "react";
import styles from "./footer.module.css";

const Footer = () => {

  return (
    <footer className={styles.footerWrapper}>
      <div className={styles.footerContent}>
        <div className={styles.brandBlock}>
          <div className={styles.footerMark}>D</div>
          <h2>Da&apos;a <span>Connect</span></h2>
          <p>A trusted marketplace for Ghana&apos;s everyday finds, thoughtful gifts, and brilliant local makers.</p>
          <p className={styles.builtBy}>Built with care by <strong>PsyCatech-Solutions</strong>.</p>
        </div>
        <div className={styles.footerSection}>
          <h3>Discover</h3>
          <a href="/results">Fresh picks</a>
          <a href="/category/electronics">Electronics</a>
          <a href="/category/fashion-textiles">Fashion &amp; textiles</a>
          <a href="/category/home-living">Home &amp; living</a>
        </div>
        <div className={styles.footerSection}>
          <h3>For shoppers</h3>
          <a href="/orders">Track an order</a>
          <a href="/shipping">Delivery information</a>
          <a href="/cart">Your basket</a>
          <a href="/auth/signin">Sign in</a>
        </div>
        <div className={styles.footerSection}>
          <h3>For sellers</h3>
          <a href="/vendor">Become a seller</a>
          <a href="/results">Seller stories</a>
          <a href="/results">Seller support</a>
          <a href="/results">Community standards</a>
        </div>
        <div className={styles.contactBlock}>
          <h3>Talk to us</h3>
          <p>Accra, Greater Accra Region</p>
          <a href="mailto:hello@daaconnect.com">hello@daaconnect.com</a>
          <a href="tel:+233302000000">+233 (0) 30 200 0000</a>
          <p className={styles.hours}>Mon–Fri · 8:00–17:00 GMT</p>
        </div>
      </div>
      <div className={styles.footerBottomLinks}>
        <span>Ghana · English · GHS</span>
        <div className={styles.legalLinks}><a href="/results">Privacy</a><a href="/results">Terms</a><a href="/results">Returns</a></div>
        <span>© {new Date().getFullYear()} Da&apos;a Connect · PsyCatech-Solutions</span>
      </div>
    </footer>
  );
};

export default Footer;
