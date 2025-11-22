import { supabase } from '../../../shared/lib/supabase';
import { SignInCredentials, SignUpCredentials, AuthSession } from '../model/types';

export async function signIn(credentials: SignInCredentials): Promise<AuthSession> {
  const { email, password } = credentials;
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.session) {
    throw new Error('No session returned from sign in');
  }

  return data.session;
}

export async function signUp(credentials: SignUpCredentials): Promise<{ session: AuthSession | null; user: any }> {
  const { email, password } = credentials;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    session: data.session,
    user: data.user,
  };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function getSession(): Promise<AuthSession | null> {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return session;
}

export async function refreshSession(): Promise<AuthSession | null> {
  const { data: { session }, error } = await supabase.auth.refreshSession();

  if (error) {
    throw new Error(error.message);
  }

  return session;
}

