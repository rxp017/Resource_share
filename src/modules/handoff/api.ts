// src/modules/handoff/api.ts
import { supabase } from '../../shared/api-client/supabase';

export interface HandoffSession {
  id: string;
  transaction_id: string;
  phase: 'pickup' | 'return';
  created_by: string;
  expected_redeemer: string;
  status: 'active' | 'redeemed' | 'expired' | 'canceled';
  expires_at: string;
  condition_summary: string;
  condition_notes: string;
  token?: string;
  fallback_code?: string;
}

export interface HandoffAcknowledgement {
  id: string;
  session_id: string;
  transaction_id: string;
  actor_id: string;
  phase: 'pickup' | 'return';
  decision: 'confirmed' | 'disputed';
  condition_agreed: boolean;
  notes: string;
  created_at: string;
}

export async function createHandoffSession(
  transactionId: string,
  phase: 'pickup' | 'return',
  conditionSummary = '',
  conditionNotes = ''
): Promise<{ success: boolean; session_id: string; token: string; fallback_code: string; expires_at: string }> {
  try {
    const { data, error } = await supabase.rpc('create_handoff_session', {
      p_transaction_id: transactionId,
      p_phase: phase,
      p_condition_summary: conditionSummary,
      p_condition_notes: conditionNotes,
    });

    if (error) throw error;
    return data;
  } catch (err: unknown) {
    console.warn('create_handoff_session RPC failed:', err);
    // Fail honestly: a fabricated QR session would manufacture fake handoffs.
    throw new Error('Handoff session could not be created right now. Please try again.', { cause: err });
  }
}

export async function redeemHandoffChallenge(
  transactionId: string,
  phase: 'pickup' | 'return',
  tokenOrCode: string
): Promise<{ success: boolean; session_id: string; condition_summary?: string; condition_notes?: string; message: string }> {
  try {
    const { data, error } = await supabase.rpc('redeem_handoff_challenge', {
      p_transaction_id: transactionId,
      p_phase: phase,
      p_token_or_code: tokenOrCode.trim(),
    });

    if (error) throw error;
    return data;
  } catch (err: unknown) {
    console.warn('redeem_handoff_challenge RPC failed:', err);
    // Fail honestly: never verify a code against a client-side fabricated session.
    throw new Error('Code verification is unavailable right now. Please try again.', { cause: err });
  }
}

export async function finalizeHandoff(
  transactionId: string,
  sessionId: string,
  decision: 'confirmed' | 'disputed',
  conditionAgreed = true,
  notes = ''
): Promise<{ success: boolean; finalized: boolean; status?: string; message: string }> {
  try {
    const { data, error } = await supabase.rpc('finalize_handoff', {
      p_transaction_id: transactionId,
      p_session_id: sessionId,
      p_decision: decision,
      p_condition_agreed: conditionAgreed,
      p_notes: notes,
    });

    if (error) throw error;
    return data;
  } catch (err: unknown) {
    console.warn('finalize_handoff RPC failed:', err);
    // Fail honestly: never mark an exchange completed via a client-side direct update.
    throw new Error('Handoff could not be finalized right now. Please try again.', { cause: err });
  }
}
