import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { AuthError, Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "~/lib/supabase";

interface AuthState {
  session: Session | null | undefined;
  setSession: (session: Session | null) => void;
  login: (email: string, password: string) => Promise<User | AuthError | null>;
  loginWithGoogle: () => Promise<User | AuthError | null>;
  register: (
    email: string,
    password: string,
  ) => Promise<User | AuthError | null>;
  logout: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  session: undefined,
  setSession: (session) => set({ session }),
  login: async (email, password) => {
    if (!email) return Promise.reject("Email is required");
    if (!password) return Promise.reject("Password is required");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return Promise.reject(error);

    set({ session: data.session });
    return Promise.resolve(data.user);
  },
  loginWithGoogle: async () => {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    if (userInfo.data?.idToken) {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: userInfo.data.idToken,
      });
      if (error) return Promise.reject(error);
      set({ session: data.session });
      return Promise.resolve(data.user);
    } else {
      return Promise.reject(new Error("no ID token present!"));
    }
  },
  register: async (email, password) => {
    if (!email) return Promise.reject("Email is required");
    if (!password) return Promise.reject("Password is required");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) return Promise.reject(error);

    set({ session: data.session });
    return Promise.resolve(data.user);
  },
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return Promise.reject(error);
    set({ session: null });
    return Promise.resolve();
  },
}));

export default useAuthStore;
