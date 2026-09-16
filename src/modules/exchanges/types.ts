// src/modules/exchanges/types.ts

export type TransactionStatus =
  | 'requested'
  | 'accepted'
  | 'declined'
  | 'withdrawn'
  | 'expired'
  | 'proof_submitted'
  | 'seller_acknowledged'
  | 'seller_disputed'
  | 'in_progress'
  | 'completed'
  | 'canceled';

export type TransactionMode = 'sale' | 'free_loan' | 'rental';

export interface PaymentProof {
  id: string;
  transaction_id: string;
  payer_id: string;
  amount_paise: number;
  currency: string;
  storage_path: string;
  version: number;
  masked_reference: string | null;
  created_at: string;
  signed_url?: string;
}

export interface PaymentAcknowledgement {
  id: string;
  proof_id: string;
  transaction_id: string;
  payee_id: string;
  decision: 'acknowledged' | 'disputed';
  reason: string;
  created_at: string;
}

export interface TransactionListing {
  id: string;
  title: string;
  mode: TransactionMode;
  price_paise: number;
  deposit_paise: number;
  pickup_zone: string;
  version: number;
  media?: {
    storage_path: string;
    signed_url?: string;
  }[];
}

export interface TransactionItem {
  id: string;
  listing_id: string;
  asset_id: string;
  campus_id: string;
  owner_id: string;
  requester_id: string;
  mode: TransactionMode;
  status: TransactionStatus;
  quoted_price_paise: number;
  quoted_deposit_paise: number;
  start_date: string | null;
  end_date: string | null;
  rental_days: number;
  pickup_zone: string;
  requester_note: string;
  version: number;
  created_at: string;
  updated_at: string;
  listing?: TransactionListing;
  payment_proofs?: PaymentProof[];
  payment_acknowledgements?: PaymentAcknowledgement[];
}

export interface CreateExchangeRequestPayload {
  listingId: string;
  startDate?: string | null;
  endDate?: string | null;
  note?: string;
  expectedListingVersion?: number;
  idempotencyKey?: string;
}
