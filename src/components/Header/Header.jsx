import React, { useState, useEffect, useRef } from "react";
import styles from "./header.module.css";
import { FaSearch, FaBars, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import { HiOutlineShoppingCart } from "react-icons/hi2";
import { FiChevronDown } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../DataProvider/DataProvider";
import { supabase, isSupabaseConfigured } from "../../Utility/supabase";
import { ACTIONS } from "../../Utility/actions";
import { toast } from "react-toastify";
import { CATEGORIES } from "../../data/categories";

function Header() {
  const navigate = useNavigate();
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [headerState, setHeaderState] = useState("visible");
  const [country, setCountry] = useState("");
  const headerRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const { cart, user, dispatch, shippingDetails } = useCart();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const headerHeight = headerRef.current
        ? headerRef.current.offsetHeight
        : 0;

      if (currentScrollY > lastScrollY && currentScrollY > headerHeight) {
        if (headerState !== "hidden") setHeaderState("hidden");
      } else if (currentScrollY < lastScrollY && currentScrollY > 0) {
        if (headerState !== "topFixed") setHeaderState("topFixed");
      } else if (currentScrollY === 0) {
        if (headerState !== "visible") setHeaderState("visible");
      }
      setLastScrollY(currentScrollY <= 0 ? 0 : currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, headerState]);

  useEffect(() => {
    if (!shippingDetails?.country) {
      fetch("https://ipapi.co/json/")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.country_name) {
            setCountry(data.country_name);
          }
        })
        .catch(() => {});
    }
  }, [shippingDetails]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayCountry = shippingDetails?.country || country || "Country";

  const secondaryNavLinks = [
    { label: "All categories", href: "/results" },
    ...CATEGORIES.map((cat) => ({
      label: cat.title,
      href: `/category/${cat.slug}`,
    })),
    { label: "Deals", href: "/results?q=deal" },
  ];

  const handleSignOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    dispatch({ type: ACTIONS.SET_USER, payload: null });
    toast.success("Signed out successfully!");
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (searchCategory !== "all") {
      navigate(`/category/${searchCategory}${query ? `?q=${encodeURIComponent(query)}` : ""}`);
      return;
    }
    if (query) {
      navigate(`/results?q=${encodeURIComponent(query)}`);
      return;
    }
    navigate("/results");
  };

  const closeMobileMenu = () => {
    setShowMenu(false);
    setShowMobileCategories(false);
  };

  return (
    <header
      ref={headerRef}
      className={`
        ${styles.headerWrapper}
        ${headerState === "hidden" ? styles.headerHidden : ""}
        ${headerState === "topFixed" ? styles.headerTopFixed : ""}
      `}
    >
      <div className={styles.topRow}>
        <div className={styles.leftSection}>
          <button
            className={`${styles.menuBtn} ${
              isMobile ? "" : styles.hideOnDesktopFlex
            }`}
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Open menu"
            type="button"
          >
            <FaBars />
          </button>
          <Link to="/" className={styles.logoLink} aria-label="Da'a Connect home">
            <span className={styles.logoMark}>D</span>
            <span className={styles.logoWordmark}>Da&apos;a <b>Connect</b></span>
          </Link>
          <Link
            to="/shipping"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className={`${styles.deliverTo} ${styles.deliverToDesktop}`}>
              <FaMapMarkerAlt className={styles.locationIcon} />
              <div className={styles.deliverTextWrap}>
                <span className={styles.deliverLabel}>Shop from Ghana</span>
                <span className={styles.deliverCountry}>{displayCountry}</span>
              </div>
            </div>
          </Link>
        </div>

        <form className={styles.searchBar} onSubmit={handleSearchSubmit}>
          <select
            className={styles.searchDropdown}
            title="Search category"
            value={searchCategory}
            onChange={(event) => setSearchCategory(event.target.value)}
            aria-label="Filter search by category"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.title}
              </option>
            ))}
          </select>
          <input
            className={styles.searchInput}
            placeholder="Search Da'a Connect"
            aria-label="Search Da'a Connect"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <button className={styles.searchBtn} type="submit" title="Search">
            <FaSearch />
          </button>
        </form>

        <div className={styles.rightSection}>
          <div
            className={`${styles.langWrap} ${styles.hideOnMobile}`}
            onMouseEnter={() => setShowLangDropdown(true)}
            onMouseLeave={() => setShowLangDropdown(false)}
          >
            <span className={styles.flagEmoji} aria-hidden="true">
              🇺🇸
            </span>
            <span className={styles.langText}>EN</span>
            <FiChevronDown className={styles.chevronIcon} />
            {showLangDropdown && (
              <div className={styles.dropdownMenu}>
                <div>EN - English</div>
                <div>ES - Español</div>
                <div>DE - Deutsch</div>
              </div>
            )}
          </div>
          <div
            className={styles.accountWrap}
            onMouseEnter={() => setShowAccountDropdown(true)}
            onMouseLeave={() => setShowAccountDropdown(false)}
          >
            <FaUser
              className={`${styles.accountIcon} ${styles.showOnMobile}`}
            />
            {isMobile ? (
              user ? (
                <>
                  <span className={styles.smallText}>
                    Hello,{` `}
                    {user.user_metadata?.display_name ||
                      user.user_metadata?.full_name ||
                      (user.email
                        ? user.email.split("@")[0]
                        : "User")}
                  </span>
                  <span
                    className={styles.boldText}
                    onClick={handleSignOut}
                    style={{ cursor: "pointer" }}
                  >
                    Sign Out
                  </span>
                </>
              ) : (
                <Link
                  to="/auth/signin"
                  className={`${styles.boldText} ${styles.signInMobile}`}
                >
                  Sign In{" "}
                  <FiChevronDown className={styles.chevronIconMobileSignIn} />
                </Link>
              )
            ) : user ? (
              <>
                <span className={styles.smallText}>
                  Hello,{` `}
                  {user.reloadUserInfo?.displayName ||
                    user.displayName ||
                    (user.email
                      ? user.email.split("@")[0]
                      : user.reloadUserInfo?.email?.split("@")[0])}
                </span>
                <span className={styles.boldText}>
                  Account & Lists{" "}
                  <FiChevronDown className={styles.chevronIcon} />
                </span>
              </>
            ) : (
              <>
                <span className={styles.smallText}>Hello, sign in</span>
                <Link to="/auth/signin" className={styles.boldText}>
                  Account & Lists{" "}
                  <FiChevronDown className={styles.chevronIcon} />
                </Link>
              </>
            )}
            {showAccountDropdown && (
              <div className={styles.dropdownMenu}>
                {user ? (
                  <>
                    <Link to="/account">Your Account</Link>
                    <Link to="/orders">Your Orders</Link>
                    <span onClick={handleSignOut} style={{ cursor: "pointer" }}>
                      Sign Out
                    </span>
                  </>
                ) : (
                  <>
                    <Link to="/auth/signin">Sign In</Link>
                    <Link to="/orders">Your Orders</Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className={`${styles.ordersWrap} ${styles.hideOnMobile}`}>
            <span className={styles.smallText}>Returns</span>
            <Link to="/orders" className={styles.boldText}>
              & Orders
            </Link>
          </div>
          {user && (
            <Link to="/vendor" className={`${styles.ordersWrap} ${styles.hideOnMobile}`}>
              <span className={styles.smallText}>Seller</span>
              <span className={styles.boldText}>Dashboard</span>
            </Link>
          )}
          <Link to="/cart" className={styles.cartWrap}>
            <HiOutlineShoppingCart className={styles.cartIcon} />
            <span className={styles.cartCount}>
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
            <span className={styles.cartText}>Cart</span>
          </Link>
        </div>
      </div>

      <nav
        className={`
          ${styles.bottomRow}
          ${headerState !== "visible" ? styles.bottomRowHidden : ""}
        `}
      >
        {!isMobile && (
          <div className={styles.categoryDropdownWrap} ref={categoryDropdownRef}>
            <button
              type="button"
              className={`${styles.navLink} ${styles.navLinkWithIcon} ${styles.categoryToggle}`}
              aria-expanded={showCategoryDropdown}
              aria-haspopup="true"
              onClick={() => setShowCategoryDropdown((open) => !open)}
            >
              <FaBars className={styles.navIcon} />
              Shop categories
              <FiChevronDown className={styles.chevronIcon} />
            </button>
            {showCategoryDropdown && (
              <div className={styles.categoryDropdownMenu} role="menu">
                <Link
                  to="/results"
                  className={styles.categoryDropdownItem}
                  role="menuitem"
                  onClick={() => setShowCategoryDropdown(false)}
                >
                  All categories
                </Link>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/category/${cat.slug}`}
                    className={styles.categoryDropdownItem}
                    role="menuitem"
                    onClick={() => setShowCategoryDropdown(false)}
                  >
                    {cat.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={styles.navLinksScroll}>
          {(isMobile ? secondaryNavLinks : secondaryNavLinks.slice(1)).map((link) => (
            <Link key={link.href} to={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}

          {!isMobile && (
            <>
              <Link to="/results" className={styles.navLink}>
                Fresh picks
              </Link>
              <Link to="/category/crafts-gifts" className={styles.navLink}>
                Ghana-made
              </Link>
              <Link to="/vendor" className={styles.navLink}>
                Sell with us
              </Link>
              <span className={styles.navLink}>Help centre</span>
            </>
          )}
        </div>
      </nav>

      <div
        className={`
          ${styles.deliverTo}
          ${styles.deliverToMobile}
          ${headerState !== "visible" ? styles.bottomRowHidden : ""} 
        `}
      >
        <Link
          to="/shipping"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className={styles.deliverToMobile}>
            <FaMapMarkerAlt className={styles.locationIcon} />
            <span>Shop from Ghana · Deliver to {displayCountry}</span>
          </div>
        </Link>
      </div>

      <div
        className={`${styles.mobileMenu} ${
          showMenu ? styles.mobileMenuOpen : ""
        }`}
        style={{ pointerEvents: showMenu ? "auto" : "none" }}
      >
        <div className={styles.mobileMenuHeader}>
          <FaUser className={styles.accountIcon} />
          <h3 style={{ flex: 1 }}>
            Hello,{" "}
            {user ? (
              user.user_metadata?.display_name ||
              user.user_metadata?.full_name ||
              user.email
            ) : (
              <Link to="/auth/signin">Sign In</Link>
            )}
          </h3>
          <button
            className={styles.menuCloseBtn}
            aria-label="Close menu"
            onClick={closeMobileMenu}
            type="button"
          >
            ×
          </button>
        </div>
        <Link to="/" className={styles.navLink} onClick={closeMobileMenu}>
          Home
        </Link>
        <button
          type="button"
          className={`${styles.navLink} ${styles.mobileCategoryToggle}`}
          onClick={() => setShowMobileCategories((open) => !open)}
          aria-expanded={showMobileCategories}
        >
          Browse categories
          <FiChevronDown className={styles.chevronIcon} />
        </button>
        {showMobileCategories && (
          <div className={styles.mobileCategoryList}>
            <Link
              to="/results"
              className={styles.mobileCategoryItem}
              onClick={closeMobileMenu}
            >
              All categories
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className={styles.mobileCategoryItem}
                onClick={closeMobileMenu}
              >
                {cat.title}
              </Link>
            ))}
          </div>
        )}
        {user ? (
          <Link
            to="/vendor"
            className={styles.navLink}
            onClick={closeMobileMenu}
          >
            Seller dashboard
          </Link>
        ) : (
          <Link
            to="/auth/signup"
            className={styles.navLink}
            onClick={closeMobileMenu}
          >
            Become a seller
          </Link>
        )}
        <Link
          to="/results"
          className={styles.navLink}
          onClick={closeMobileMenu}
        >
          Fresh picks
        </Link>
        <div className={styles.mobileMenuItem}>
          <Link
            to="/orders"
            className={styles.navLink}
            onClick={closeMobileMenu}
          >
            Your Orders
          </Link>
        </div>
        <div className={styles.mobileMenuItem}>
          <span className={styles.navLink}>Language: EN</span>
        </div>
        <span className={styles.navLink}>Customer Service</span>
        <span className={styles.navLink}>Settings</span>
        <span
          className={styles.navLink}
          onClick={() => {
            handleSignOut();
            closeMobileMenu();
          }}
          style={{ cursor: "pointer" }}
        >
          Sign Out
        </span>
      </div>
    </header>
  );
}

export default Header;
