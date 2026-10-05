import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

// Define what data this auth context will provide to components
type AuthContextType = {
  user: User | null; // Current user object or null if not logged in
  session: Session | null; // Current session with tokens
  signInWithGoogle: (idToken: string) => Promise<void>; // Function to log in with Google OAuth
  signOut: () => Promise<void>; // Function to log out
  loading: boolean; // Whether auth state is still being checked
};

// Create the context (the "storage box" for auth data)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps your app and manages auth state
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State: stores current user, session, and loading status
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in when app loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes (login, logout, session refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Cleanup: stop listening when component unmounts
    return () => subscription.unsubscribe();
  }, []);

  // Trigger Google OAuth sign-in popup
  const signInWithGoogle = async (idToken: string) => {
  const { error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken,
  });

  if (error) {
    throw error;
  }
};

  // End user session and clear auth state
  const signOut = async () => {
    const { error } = await supabase.auth.signOut({
    scope: "local",
  });

  if (error) {
    throw error;
  }
  };

  // Provide auth data to all child components
  return (
    <AuthContext.Provider
      value={{ user, session, signInWithGoogle, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to access auth context in any component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context; // Returns { user, session, signInWithGoogle, signOut, loading }
};
