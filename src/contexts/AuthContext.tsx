
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

interface ProfileData {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  theme_preference?: string;
  compact_mode?: boolean;
  language_preference?: string;
  email_notifications?: boolean;
  browser_notifications?: boolean;
  task_reminders?: boolean;
  mentions?: boolean;
  auto_save?: boolean;
  usage_analytics?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: ProfileData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Only set up the listener once
    if (initialized) return;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          navigate('/reset-password');
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        // Handle auth events
        if (event === 'SIGNED_IN') {
          toast.success("Successfully signed in!");
          
          // Create or ensure profile exists when user signs in
          if (session?.user) {
            setTimeout(() => {
              ensureProfileExists(session.user.id);
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          toast.success("Successfully signed out!");
        } else if (event === 'USER_UPDATED') {
          toast.success("User information updated");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Create or ensure profile exists when app loads with existing session
      if (session?.user) {
        setTimeout(() => {
          ensureProfileExists(session.user.id);
        }, 0);
      }
      
      setLoading(false);
      setInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Ensure a profile record exists for the user
  const ensureProfileExists = async (userId: string) => {
    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();
      
      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error checking profile:", fetchError);
        return;
      }
      
      // If profile doesn't exist, create it with default values
      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            first_name: user?.user_metadata?.first_name || "",
            last_name: user?.user_metadata?.last_name || "",
            theme_preference: "light",
            compact_mode: false,
            language_preference: "English (US)",
            email_notifications: true,
            browser_notifications: true,
            task_reminders: true,
            mentions: true,
            auto_save: true,
            usage_analytics: false
          });
          
        if (insertError) {
          console.error("Error creating profile:", insertError);
        }
      }
    } catch (error) {
      console.error("Error in ensureProfileExists:", error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const names = fullName.trim().split(" ");
      const firstName = names[0] || "";
      const lastName = names.slice(1).join(" ") || "";
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) throw error;
      
      toast.success("Sign up successful! Please check your email to verify your account.");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during sign up");
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Invalid login credentials");
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Error signing in with Google");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Error signing out");
      throw error;
    }
  };

  const updateProfile = async (data: ProfileData) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
        
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Error updating profile");
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
