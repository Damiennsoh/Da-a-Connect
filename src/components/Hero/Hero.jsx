import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import styles from "./hero.module.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { img as heroImages } from "./img/data";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const heroCopy = [
  {
    eyebrow: "Made for Ghana, open to the world",
    title: "Find pieces with a story.",
    body: "From Accra makers to everyday essentials, shop a marketplace that feels close to home.",
    action: "Explore the marketplace",
    href: "/results",
  },
  {
    eyebrow: "Wear your roots & style",
    title: "Textiles, fashion, and craft.",
    body: "Discover expressive fashion, handmade jewelry, and thoughtful accessories from independent sellers.",
    action: "Shop fashion & textiles",
    href: "/category/fashion-textiles",
  },
  {
    eyebrow: "Modern living & tech",
    title: "Electronics & smart gadgets.",
    body: "Upgrade your workspace and home with reliable devices, appliances, and high quality electronics.",
    action: "Shop electronics",
    href: "/category/electronics",
  },
  {
    eyebrow: "Natural beauty & wellness",
    title: "Pure care for mind & body.",
    body: "Indulge in authentic skincare, organic oils, and handcrafted wellness products.",
    action: "Shop beauty & care",
    href: "/category/beauty-care",
  },
];

const Hero = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className={styles.heroWrapper} aria-label="Da'a Connect highlights">
      <Carousel
        autoPlay
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        interval={4500}
        transitionTime={700}
        swipeable
        emulateTouch
        showArrows
        showIndicators
        stopOnHover={false}
        swipeScrollTolerance={5}
        renderArrowPrev={(onClickHandler, hasPrev, label) =>
          hasPrev && (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              aria-label="Previous highlight"
              className={`${styles.carouselArrow} ${styles.carouselArrowPrev}`}
            >
              <FaChevronLeft size={isMobile ? 18 : 24} />
            </button>
          )
        }
        renderArrowNext={(onClickHandler, hasNext, label) =>
          hasNext && (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              aria-label="Next highlight"
              className={`${styles.carouselArrow} ${styles.carouselArrowNext}`}
            >
              <FaChevronRight size={isMobile ? 18 : 24} />
            </button>
          )
        }
      >
        {heroImages.map((image, index) => {
          const copy = heroCopy[index];
          return (
            <div className={styles.heroSlide} key={image}>
              <img
                src={image}
                alt={`${copy.title} — Da'a Connect`}
                width="1200"
                height="500"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding={index === 0 ? "sync" : "async"}
              />
              <div className={styles.heroCopy}>
                <p className={styles.eyebrow}>{copy.eyebrow}</p>
                <h1>{copy.title}</h1>
                <p className={styles.body}>{copy.body}</p>
                <Link to={copy.href} className={styles.heroAction}>
                  {copy.action} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          );
        })}
      </Carousel>
    </section>
  );
};

export default Hero;
