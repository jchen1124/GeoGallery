import { useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import CloseIcon from "@mui/icons-material/Close";
import "../styles/HomePage.css";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo2.jpg";
import { useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

const HomePage = () => {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState("");

  const closeLogin = () => {
    setLoginOpen(false);
    setLoginError("");
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setLoginError("Google did not return a login credential.");
      return;
    }

    try {
      setLoginError("");
      await signInWithGoogle(response.credential);
      closeLogin();
      navigate("/map");
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setLoginError("Unable to sign in with Google. Please try again.");
    }
  };

  return (
    <main className="landing-container">
      <nav className="landing-nav">
        <div className="landing-brand">
          <img src={logo} alt="" />
          <span>GeoGallery</span>
        </div>

        {!user && (
          <button
            className="nav-signin-button"
            type="button"
            onClick={() => setLoginOpen(true)}
          >
            Sign in
          </button>
        )}
      </nav>

      <section className="landing-shell">
        <div className="landing-content">
          <p className="landing-kicker">Photo memories, mapped by place</p>
          <h1 className="landing-title">GeoGallery</h1>

          <p className="landing-subtitle">
            Build a personal travel map from the photos and places you want to
            remember.
          </p>

          <p className="landing-description">
            Upload a photo, pin it to the world, and revisit your saved moments
            through an interactive map designed around places, not folders.
          </p>

          <div className="landing-actions">
            {user ? (
              <button
                className="explore-button"
                onClick={() => navigate("/map")}
              >
                Open Map
              </button>
            ) : (
              <button
                className="guest-link"
                onClick={() => navigate("/map")}
                type="button"
              >
                Preview the map
              </button>
            )}
          </div>
        </div>
      </section>

      <Dialog
        open={loginOpen && !user}
        onClose={closeLogin}
        aria-labelledby="login-dialog-title"
        aria-describedby="login-dialog-description"
        slotProps={{ paper: { className: "login-dialog" } }}
      >
        <button
          className="login-dialog-close"
          type="button"
          aria-label="Close sign in dialog"
          onClick={closeLogin}
        >
          <CloseIcon fontSize="small" />
        </button>
        <h2 id="login-dialog-title">Sign in to GeoGallery</h2>
        <p id="login-dialog-description">
          Welcome back! Please sign in to continue.
        </p>
        <div className="login-dialog-provider">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() =>
              setLoginError("Google sign-in failed. Please try again.")
            }
            shape="pill"
            size="large"
            text="continue_with"
            theme="outline"
            width="260"
          />
        </div>
        {loginError && (
          <p className="login-error" role="alert">
            {loginError}
          </p>
        )}
      </Dialog>
    </main>
  );
};

export default HomePage;
