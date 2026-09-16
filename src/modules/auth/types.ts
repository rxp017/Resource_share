// src/modules/auth/types.ts
import type { User, Session } from '@supabase/supabase-js';

export type MembershipStatus = 'pending' | 'active' | 'suspended' | 'expired';
export type MembershipRole = 'student' | 'moderator' | 'admin';

export interface MembershipInfo {
  eligible: boolean;
  status?: MembershipStatus;
  role?: MembershipRole;
  campus_id?: string;
  reason?: string;
}

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  membership: MembershipInfo | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshMembership: () => Promise<MembershipInfo | null>;
}
