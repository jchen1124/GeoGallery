import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo2.jpg";
import { useState } from "react";
import {
  GoogleLogin,
  type CredentialResponse,
} from "@react-oauth/google";

const HomePage = () => {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setLoginError("Google did not return a login credential.");
      return;
    }

    try {
      setLoginError("");
      await signInWithGoogle(response.credential);
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
          <button className="continue-guest" onClick={() => navigate("/map")}>
            Explore as Guest
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
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() =>
                  setLoginError("Google sign-in was cancelled or failed.")
                }
                shape="pill"
                size="large"
                text="signin_with"
                theme="outline"
              />
            )}

            {!user && (
              <button
                className="guest-link"
                onClick={() => navigate("/map")}
                type="button"
              >
                Preview the map
              </button>
            )}
          </div>

          {loginError && (
            <p className="login-error" role="alert">
              {loginError}
            </p>
          )}
        </div>

      </section>
    </main>
  );
};

export default HomePage;
