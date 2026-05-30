import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

type Profile = { id: string; name: string | null; created_at: string | null };
type Subscription = { id: string; user_id: string; stripe_customer_id: string | null;
  stripe_subscription_id: string | null; plan: string; status: string;
  current_period_end: string | null; created_at: string | null; updated_at: string | null;
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  subscription: Subscription | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchSubscription(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        (async () => {
          await fetchProfile(session.user.id);
          await fetchSubscription(session.user.id);
        })();
      } else {
        setProfile(null);
        setSubscription(null);
      }
    });

    return () => authSub.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      setProfile(data);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const { data: retryData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (retryData) setProfile(retryData);
    }
  }

  async function fetchSubscription(userId: string) {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      setSubscription(data);
    } else {
      // Free plan sub may not exist yet (trigger delay) — retry once
      await new Promise((resolve) => setTimeout(resolve, 800));
      const { data: retryData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      setSubscription(retryData ?? { plan: 'free', status: 'active' } as unknown as Subscription);
    }
  }

  async function refreshSubscription() {
    if (!user) return;
    await fetchSubscription(user.id);
  }

  async function signUp(email: string, password: string, name: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    return { error: error as Error | null };
  }

  async function signIn(email: string, password: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setSubscription(null);
  }

  const value = {
    user,
    profile,
    session,
    subscription,
    loading,
    signUp,
    signIn,
    signOut,
    refreshSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
