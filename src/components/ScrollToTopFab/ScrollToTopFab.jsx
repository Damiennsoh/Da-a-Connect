import React, { useState, useEffect } from "react";
import { FiArrowUp } from "react-icons/fi";
import styles from "./ScrollToTopFab.module.css";

const ScrollToTopFab = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className={`${styles.fabContainer} ${isVisible ? styles.visible : ""}`}>
      <button
        onClick={scrollToTop}
        className={styles.fabButton}
        aria-label="Scroll to top"
      >
        <FiArrowUp size={24} />
      </button>
    </div>
  );
};

export default ScrollToTopFab;
