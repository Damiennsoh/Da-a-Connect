import React, { useState, useEffect } from "react";
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
  },
  {
    eyebrow: "Wear your roots",
    title: "Textiles, style, and craft.",
    body: "Discover expressive fashion and thoughtful accessories from independent sellers.",
    action: "Shop fashion & textiles",
  },
  {
    eyebrow: "Bring home something meaningful",
    title: "Made by hands. Chosen by you.",
    body: "Find warm home details, pantry favourites, and gifts that make every day better.",
    action: "Meet local makers",
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
              />
              <div className={styles.heroCopy}>
                <p className={styles.eyebrow}>{copy.eyebrow}</p>
                <h1>{copy.title}</h1>
                <p className={styles.body}>{copy.body}</p>
                <span className={styles.heroAction}>{copy.action} <span aria-hidden="true">→</span></span>
              </div>
            </div>
          );
        })}
      </Carousel>
    </section>
  );
};

export default Hero;
