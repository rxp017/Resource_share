// src/modules/exchanges/api.ts
import { supabase } from '../../shared/api-client/supabase';
import { resizeAndStripExif } from '../listings/imageUtils';
import type {
  TransactionItem,
  CreateExchangeRequestPayload,
  PaymentProof,
  PaymentAcknowledgement,
  TransactionMode,
} from './types';

interface RawTransactionRow {
  [key: string]: unknown;
  listings?: {
    id: string;
    title: string;
    mode: TransactionMode;
    price_paise: number;
    deposit_paise: number;
    pickup_zone: string;
    version: number;
    listing_media?: { storage_path: string }[];
  } | null;
}

/**
 * Creates an exchange request (Sale, Free Loan, or Rental) via request_exchange RPC.
 */
export async function createExchangeRequest(
  payload: CreateExchangeRequestPayload
): Promise<{ success: boolean; transaction_id: string; status: string; quoted_price_paise: number }> {
  const { data, error } = await supabase.rpc('request_exchange', {
    p_listing_id: payload.listingId,
    p_start_date: payload.startDate || null,
    p_end_date: payload.endDate || null,
    p_note: payload.note || null,
    p_expected_listing_version: payload.expectedListingVersion || null,
    p_idempotency_key: payload.idempotencyKey || null,
  });

  if (error) {
    throw new Error(error.message || 'Failed to submit exchange request.');
  }

  return data;
}

/**
 * Owner accepts exchange request via accept_exchange_request RPC.
 */
export async function acceptExchangeRequest(
  transactionId: string,
  expectedVersion?: number,
  idempotencyKey?: string
): Promise<{ success: boolean; transaction_id: string; status: string }> {
  const { data, error } = await supabase.rpc('accept_exchange_request', {
    p_transaction_id: transactionId,
    p_expected_version: expectedVersion || null,
    p_idempotency_key: idempotencyKey || null,
  });

  if (error) {
    if (error.code === '23P01') {
      throw new Error('This item has already been booked for overlapping dates by another student.');
    }
    throw new Error(error.message || 'Failed to accept exchange request.');
  }

  return data;
}

/**
 * Owner declines exchange request via decline_exchange_request RPC.
 */
export async function declineExchangeRequest(
  transactionId: string,
  expectedVersion?: number,
  idempotencyKey?: string
): Promise<{ success: boolean; transaction_id: string; status: string }> {
  const { data, error } = await supabase.rpc('decline_exchange_request', {
    p_transaction_id: transactionId,
    p_expected_version: expectedVersion || null,
    p_idempotency_key: idempotencyKey || null,
  });

  if (error) {
    throw new Error(error.message || 'Failed to decline exchange request.');
  }

  return data;
}

/**
 * Requester withdraws exchange request via withdraw_exchange_request RPC.
 */
export async function withdrawExchangeRequest(
  transactionId: string,
  expectedVersion?: number,
  idempotencyKey?: string
): Promise<{ success: boolean; transaction_id: string; status: string }> {
  const { data, error } = await supabase.rpc('withdraw_exchange_request', {
    p_transaction_id: transactionId,
    p_expected_version: expectedVersion || null,
    p_idempotency_key: idempotencyKey || null,
  });

  if (error) {
    throw new Error(error.message || 'Failed to withdraw exchange request.');
  }

  return data;
}

/**
 * Either participant cancels before pickup via cancel_before_pickup RPC.
 */
export async function cancelBeforePickup(
  transactionId: string,
  reason?: string,
  expectedVersion?: number,
  idempotencyKey?: string
): Promise<{ success: boolean; transaction_id: string; status: string }> {
  const { data, error } = await supabase.rpc('cancel_before_pickup', {
    p_transaction_id: transactionId,
    p_expected_version: expectedVersion || null,
    p_reason: reason || null,
    p_idempotency_key: idempotencyKey || null,
  });

  if (error) {
    throw new Error(error.message || 'Failed to cancel exchange.');
  }

  return data;
}

/**
 * Compresses receipt image and uploads to private bucket `payment-proofs`.
 */
export async function uploadPaymentProofImage(
  file: File,
  payerId: string,
  transactionId: string,
  version: number
): Promise<string> {
  const compressedBlob = await resizeAndStripExif(file);
  const storagePath = `proofs/${payerId}/${transactionId}/v${version}_${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from('payment-proofs')
    .upload(storagePath, compressedBlob, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed uploading payment proof: ${uploadError.message}`);
  }

  return storagePath;
}

/**
 * Submits payment proof via submit_payment_proof RPC.
 */
export async function submitPaymentProof(
  transactionId: string,
  amountPaise: number,
  storagePath: string,
  maskedReference?: string,
  idempotencyKey?: string
): Promise<{ success: boolean; transaction_id: string; proof_id: string; version: number; status: string }> {
  const { data, error } = await supabase.rpc('submit_payment_proof', {
    p_transaction_id: transactionId,
    p_amount_paise: amountPaise,
    p_storage_path: storagePath,
    p_masked_reference: maskedReference || null,
    p_idempotency_key: idempotencyKey || null,
  });

  if (error) {
    throw new Error(error.message || 'Failed to submit payment proof.');
  }

  return data;
}

/**
 * Seller acknowledges or disputes payment proof via acknowledge_payment RPC.
 */
export async function acknowledgePayment(
  proofId: string,
  decision: 'acknowledged' | 'disputed',
  reason?: string,
  expectedTxVersion?: number,
  idempotencyKey?: string
): Promise<{ success: boolean; transaction_id: string; status: string }> {
  const { data, error } = await supabase.rpc('acknowledge_payment', {
    p_proof_id: proofId,
    p_decision: decision,
    p_reason: reason || null,
    p_expected_tx_version: expectedTxVersion || null,
    p_idempotency_key: idempotencyKey || null,
  });

  if (error) {
    throw new Error(error.message || 'Failed to acknowledge payment proof.');
  }

  return data;
}

/**
 * Fetches all transactions where the user is either the requester or the owner.
 */
export async function getMyTransactions(userId: string): Promise<TransactionItem[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id,
      listing_id,
      asset_id,
      campus_id,
      owner_id,
      requester_id,
      mode,
      status,
      quoted_price_paise,
      quoted_deposit_paise,
      start_date,
      end_date,
      rental_days,
      pickup_zone,
      requester_note,
      version,
      created_at,
      updated_at,
      listings (
        id,
        title,
        mode,
        price_paise,
        deposit_paise,
        pickup_zone,
        version,
        listing_media (
          storage_path
        )
      )
    `)
    .or(`owner_id.eq.${userId},requester_id.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load exchanges: ${error.message}`);
  }

  // Transform listings and media
  return ((data as unknown as RawTransactionRow[]) || []).map((row) => {
    const rawListing = row.listings;
    const media = rawListing?.listing_media || [];
    return {
      ...row,
      listing: rawListing
        ? {
            id: rawListing.id,
            title: rawListing.title,
            mode: rawListing.mode,
            price_paise: rawListing.price_paise,
            deposit_paise: rawListing.deposit_paise,
            pickup_zone: rawListing.pickup_zone,
            version: rawListing.version,
            media,
          }
        : undefined,
    } as unknown as TransactionItem;
  });
}

/**
 * Fetches a single transaction with its listing, payment proofs, and acknowledgements.
 */
export async function getTransactionById(transactionId: string): Promise<TransactionItem> {
  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .select(`
      id,
      listing_id,
      asset_id,
      campus_id,
      owner_id,
      requester_id,
      mode,
      status,
      quoted_price_paise,
      quoted_deposit_paise,
      start_date,
      end_date,
      rental_days,
      pickup_zone,
      requester_note,
      version,
      created_at,
      updated_at,
      listings (
        id,
        title,
        mode,
        price_paise,
        deposit_paise,
        pickup_zone,
        version,
        listing_media (
          storage_path
        )
      )
    `)
    .eq('id', transactionId)
    .single();

  if (txError || !tx) {
    throw new Error(`Exchange not found: ${txError?.message || ''}`);
  }

  // Fetch payment proofs
  const { data: proofs, error: proofError } = await supabase
    .from('payment_proofs')
    .select('id, transaction_id, payer_id, amount_paise, currency, storage_path, version, masked_reference, created_at')
    .eq('transaction_id', transactionId)
    .order('version', { ascending: true });

  if (proofError) {
    console.error('Error fetching proofs:', proofError);
  }

  // Fetch payment acknowledgements
  const { data: acks, error: ackError } = await supabase
    .from('payment_acknowledgements')
    .select('id, proof_id, transaction_id, payee_id, decision, reason, created_at')
    .eq('transaction_id', transactionId)
    .order('created_at', { ascending: true });

  if (ackError) {
    console.error('Error fetching acknowledgements:', ackError);
  }

  // Resolve signed URLs for payment proofs
  const enrichedProofs: PaymentProof[] = [];
  if (proofs && proofs.length > 0) {
    for (const p of proofs) {
      let signedUrl: string | undefined;
      try {
        const { data: urlData } = await supabase.storage
          .from('payment-proofs')
          .createSignedUrl(p.storage_path, 3600);
        signedUrl = urlData?.signedUrl;
      } catch (err) {
        console.warn('Could not generate signed URL for proof:', p.storage_path, err);
      }
      enrichedProofs.push({
        ...p,
        signed_url: signedUrl,
      });
    }
  }

  const rawRow = tx as unknown as RawTransactionRow;
  const rawListing = rawRow.listings;
  const media = rawListing?.listing_media || [];

  return {
    ...rawRow,
    listing: rawListing
      ? {
          id: rawListing.id,
          title: rawListing.title,
          mode: rawListing.mode,
          price_paise: rawListing.price_paise,
          deposit_paise: rawListing.deposit_paise,
          pickup_zone: rawListing.pickup_zone,
          version: rawListing.version,
          media,
        }
      : undefined,
    payment_proofs: enrichedProofs,
    payment_acknowledgements: (acks || []) as PaymentAcknowledgement[],
  } as unknown as TransactionItem;
}
