// Auth feature exports
export { useAuth, AuthProvider } from './lib/auth-context';
export { AuthGuard } from './lib/auth-guard';
export { useAuthCheck } from './lib/use-auth-check';
export { signIn, signUp, signOut, getSession, refreshSession } from './api/auth-api';
export type {
  AuthUser,
  AuthSession,
  SignInCredentials,
  SignUpCredentials,
  AuthState,
  AuthContextValue,
} from './model/types';

