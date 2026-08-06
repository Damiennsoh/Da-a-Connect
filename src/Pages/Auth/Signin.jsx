import React, { useState } from "react";
import styles from "./auth.module.css";
import { useNavigate, Link } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../../Utility/supabase";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { useCart } from "../../components/DataProvider/DataProvider";

const Signin = () => {
  useCart();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  document.title = "Sign in | Da'a Connect";

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const handleEmailBlur = (e) => {
    if (
      e.target.value === "" ||
      !e.target.value.includes("@") ||
      !e.target.value.includes(".")
    ) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordBlur = (e) => {
    if (e.target.value === "") {
      setPasswordError("Please enter your password.");
    } else if (e.target.value.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
    } else {
      setPasswordError("");
    }
  };

  const LogInUser = async () => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error("Authentication is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }
    if (emailError || passwordError || !email || !password) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in successfully!");
      navigate("/home");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const GoogleAuth = async () => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error("Authentication is not configured yet.");
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/home` },
      });
      if (error) throw error;
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className={styles.signinPage}>
      <div className={styles.loginNavbar}>
        <div className={styles.navLeft}>
          <button onClick={() => navigate(-1)} className={styles.backButton} aria-label="Go back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <div className={styles.mainLogo}>
            <Link to="/" className={styles.brandText}>
              Da&apos;a <b>Connect</b>
            </Link>
          </div>
        </div>
        <div>
          <Link to="/auth/signup">
            <button className={`${styles.signupBtn} ${styles.topBtn}`}>
              Sign up
            </button>
          </Link>
        </div>
      </div>
      <div className={styles.background} aria-hidden="true" />
      <div className={styles.mainForm}>
          <div className={styles.loginForm}>
            <div className={styles.someText}>
              <p className={styles.user}>User Login</p>
              <p className={styles.userDesc}>
                Hey, Enter your details to get sign in to your account
              </p>
            </div>
            <div className={styles.userDetails}>
              <input
                type="email"
                placeholder="Enter Email"
                className={styles.email}
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                required
              />
              {emailError && (
                <div className={styles.errorMessage}>{emailError}</div>
              )}
              <input
                type="password"
                placeholder="Password"
                className={styles.password}
                value={password}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                required
              />
              {passwordError && (
                <div className={styles.errorMessage}>{passwordError}</div>
              )}
              <button
                onClick={LogInUser}
                className={styles.signinBtn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ClipLoader color="#ffffff" size={20} />
                ) : (
                  "Sign in"
                )}
              </button>
              <div className={styles.extraButtons}>
                <p className={styles.or}>&#x2015; Or &#x2015;</p>
                <button
                  onClick={GoogleAuth}
                  className={styles.google}
                  disabled={isLoading}
                >
                  <span className={styles.googleLabel}>Sign in with Google</span>
                </button>
              </div>
              <div className={styles.disclaimer}>
                By signing-in you agree to the{" "}
                <span className={styles.fakeHighlight}>
                  FAKE Conditions of Use &amp; Sale
                </span>
                .
                <br />
                Please see our{" "}
                <span className={styles.fakeHighlight}>Privacy Notice</span>,
                our <span className={styles.fakeHighlight}>Cookies Notice</span>{" "}
                and our{" "}
                <span className={styles.fakeHighlight}>
                  Interest-Based Ads Notice
                </span>
                .
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Signin;
