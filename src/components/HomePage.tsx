import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import CloseIcon from "@mui/icons-material/Close";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import logo from "../assets/logo2.jpg";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import "../styles/HomePage.css";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

type PreviewPost = {
  id: number;
  latitude: number;
  longitude: number;
  description: string;
  imageUrl: string | null;
};

const HomePage = () => {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [posts, setPosts] = useState<PreviewPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<PreviewPost | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadPosts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data: PreviewPost[] = await response.json();
        setPosts(data.filter((post) => Number.isFinite(post.latitude) && Number.isFinite(post.longitude)));
      } catch (error) {
        if (!controller.signal.aborted) console.error("Unable to load map preview pins:", error);
      }
    };
    if (import.meta.env.VITE_API_URL) loadPosts();
    return () => controller.abort();
  }, []);

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
      <header className="landing-nav">
        <a className="landing-brand" href="/" aria-label="GeoGallery home">
          <img className="landing-brand-logo" src={logo} alt="" />
          <span>GeoGallery</span>
        </a>
        <div className="landing-nav-actions">
          <button className="landing-nav-link" type="button" onClick={() => navigate("/map")}>Explore map</button>
          {user ? (
            <button className="nav-signin-button" type="button" onClick={() => navigate("/map")}>Open my map <ArrowOutwardIcon fontSize="small" /></button>
          ) : (  
            <button className="nav-signin-button" type="button" onClick={() => setLoginOpen(true)}>Sign in <ArrowOutwardIcon fontSize="small" /></button>
          )}
        </div>
      </header>

      <section className="landing-shell" aria-labelledby="landing-title">
        <div className="landing-content">
          <p className="landing-kicker"><span className="landing-kicker-line" /> A home for the places you remember</p>
          <h1 className="landing-title" id="landing-title">Every photo<br />has a place.</h1>
          <p className="landing-subtitle">Pin your favorite moments to a map and see your story unfold, one place at a time.</p>
          <div className="landing-actions">
            <button className="explore-button" type="button" onClick={() => navigate("/map")}>Explore the map <ArrowOutwardIcon fontSize="small" /></button>
            {!user && <button className="guest-link" type="button" onClick={() => setLoginOpen(true)}>Sign in to add a memory</button>}
          </div>
          <div className="landing-note">
            <span className="landing-note-rule" />
            <p>More than a photo album.<br /><strong>A way back to anywhere.</strong></p>
          </div>
        </div>

        <div className="landing-map-column">
          <div className="landing-map-heading"><span>THE WORLD, THROUGH YOUR LENS</span><span>01 / EXPLORE</span></div>
          <div className="landing-map-frame">
            <div className="landing-map" aria-label="Interactive preview of the GeoGallery map">
              {import.meta.env.VITE_MAPBOX_TOKEN ? (
                <Map
                  initialViewState={{ longitude: -100, latitude: 45, zoom: 1.55 }}
                  mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                  mapStyle="mapbox://styles/mapbox/light-v11"
                  scrollZoom={false}
                  dragRotate={false}
                  touchPitch={false}
                  onClick={() => setSelectedPost(null)}
                >
                  {posts.map((post) => (
                    <Marker key={post.id} longitude={post.longitude} latitude={post.latitude} anchor="bottom" onClick={(event) => { event.originalEvent.stopPropagation(); setSelectedPost(post); }}>
                      <button className="landing-map-pin" type="button" aria-label={`View photo pin: ${post.description || "Pinned place"}`}><PlaceOutlinedIcon fontSize="small" /></button>
                    </Marker>
                  ))}
                  {selectedPost && (
                    <Popup longitude={selectedPost.longitude} latitude={selectedPost.latitude} anchor="bottom" offset={32} closeOnClick={false} onClose={() => setSelectedPost(null)} maxWidth="230px">
                      <div className="landing-map-popup">
                        {selectedPost.imageUrl && <img src={selectedPost.imageUrl} alt="" />}
                        <p>{selectedPost.description || "A place worth remembering"}</p>
                      </div>
                    </Popup>
                  )}
                </Map>
              ) : <div className="landing-map-unavailable">Map preview is unavailable.</div>}
            </div>
            <div className="landing-map-topline"><span className="landing-live-dot" /> INTERACTIVE MAP PREVIEW</div>
            <div className="landing-map-bottom">
              <span>Drag to explore the world</span>
              <button type="button" onClick={() => navigate("/map")}>Open full map <ArrowOutwardIcon fontSize="small" /></button>
            </div>
          </div>
          <p className="landing-map-caption">Places hold the details. Put your memories back on the map.</p>
        </div>
      </section>

      <div className="landing-footer">
        <span>01 &nbsp; FIND A PLACE</span>
        <span>02 &nbsp; PIN A PHOTO</span>
        <span>03 &nbsp; REVISIT THE MOMENT</span>
        <span className="landing-footer-brand">GeoGallery © {new Date().getFullYear()}</span>
      </div>

      <Dialog open={loginOpen && !user} onClose={closeLogin} aria-labelledby="login-dialog-title" aria-describedby="login-dialog-description" slotProps={{ paper: { className: "login-dialog" } }}>
        <button className="login-dialog-close" type="button" aria-label="Close sign in dialog" onClick={closeLogin}><CloseIcon fontSize="small" /></button>
        <h2 id="login-dialog-title">Sign in to GeoGallery</h2>
        <p id="login-dialog-description">Save your photos and revisit the places that matter.</p>
        <div className="login-dialog-provider"><GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setLoginError("Google sign-in failed. Please try again.")} shape="pill" size="large" text="continue_with" theme="outline" width="260" /></div>
        {loginError && <p className="login-error" role="alert">{loginError}</p>}
      </Dialog>
    </main>
  );
};

export default HomePage;
