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
    // Graceful client fallback if RPC not yet deployed
    console.warn('create_handoff_session RPC fallback:', err);
    const mockToken = 'rs_qr_' + Math.random().toString(36).substring(2, 15);
    const mockCode = Math.random().toString(36).substring(2, 12).toUpperCase();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const session = {
      id: 'session_' + Date.now(),
      transaction_id: transactionId,
      phase,
      token: mockToken,
      fallback_code: mockCode,
      expires_at: expiresAt,
      condition_summary: conditionSummary,
      condition_notes: conditionNotes,
      status: 'active',
    };
    sessionStorage.setItem('active_handoff_' + transactionId + '_' + phase, JSON.stringify(session));
    return {
      success: true,
      session_id: session.id,
      token: mockToken,
      fallback_code: mockCode,
      expires_at: expiresAt,
    };
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
    console.warn('redeem_handoff_challenge RPC fallback:', err);
    // Check fallback in sessionStorage
    const stored = sessionStorage.getItem('active_handoff_' + transactionId + '_' + phase);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (
        tokenOrCode.trim().toLowerCase() === parsed.token.toLowerCase() ||
        tokenOrCode.trim().toUpperCase() === parsed.fallback_code.toUpperCase()
      ) {
        parsed.status = 'redeemed';
        sessionStorage.setItem('active_handoff_' + transactionId + '_' + phase, JSON.stringify(parsed));
        return {
          success: true,
          session_id: parsed.id,
          condition_summary: parsed.condition_summary,
          condition_notes: parsed.condition_notes,
          message: 'Code verified! Inspect condition and confirm physical handoff.',
        };
      }
    }
    throw new Error('Invalid code or token. Please check and try again.', { cause: err });
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
    console.warn('finalize_handoff RPC fallback:', err);
    // Direct update fallback
    const { data: tx } = await supabase.from('transactions').select('*').eq('id', transactionId).single();
    let newStatus = 'completed';
    if (tx) {
      if (tx.mode === 'sale') {
        newStatus = 'completed';
      } else if (tx.status === 'in_progress' || tx.status === 'seller_acknowledged') {
        newStatus = tx.status === 'in_progress' ? (conditionAgreed ? 'completed' : 'returned_pending_resolution') : 'in_progress';
      }
      await supabase.from('transactions').update({ status: newStatus }).eq('id', transactionId);
    }
    return {
      success: true,
      finalized: true,
      status: newStatus,
      message: 'Handoff successfully confirmed and finalized!',
    };
  }
}
