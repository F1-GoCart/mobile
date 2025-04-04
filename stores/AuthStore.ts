import { AuthError, Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "~/lib/supabase";

interface AuthState {
  session: Session | null | undefined;
  setSession: (session: Session | null) => void;
  login: (email: string, password: string) => Promise<User | AuthError | null>;
  loginAnonymously: () => Promise<User | AuthError | null>;
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
  loginAnonymously: async () => {
    const { data, error } = await supabase.auth.signInAnonymously({
      options: {
        data: {
          name: "Nikos Pasion",
          avatar_url:
            "https://fgupppcvyddxuttscnpn.supabase.co/storage/v1/object/public/avatar//nikos.jpg",
        },
      },
    });
    if (error) return Promise.reject(error);
    set({ session: data.session });
    return Promise.resolve(data.user);
  },
  loginWithGoogle: async () => {
    return Promise.reject(new Error("Not supported in IOS"));
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
