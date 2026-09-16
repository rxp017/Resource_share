// src/modules/listings/ListingCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { ListingItem } from './types';

interface ListingCardProps {
  listing: ListingItem;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const photoUrl = listing.media?.[0]?.signed_url;

  const formatPrice = () => {
    if (listing.mode === 'free_loan') {
      const dep = listing.deposit_paise > 0 ? ` (Dep: ₹${(listing.deposit_paise / 100).toFixed(0)})` : ' (No deposit)';
      return `Free Loan${dep}`;
    }
    const amount = (listing.price_paise / 100).toLocaleString('en-IN');
    if (listing.mode === 'sale') {
      return `₹${amount}`;
    }
    return `₹${amount}/day`;
  };

  const getModeLabel = () => {
    switch (listing.mode) {
      case 'sale':
        return 'Sale';
      case 'free_loan':
        return 'Free Loan';
      case 'rental':
        return 'Rental';
    }
  };

  const formatCategory = (cat: string) => {
    return cat.replace('_', ' ').toUpperCase();
  };

  return (
    <Link
      to={`/listings/${listing.id}`}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-surface, #fff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: 'var(--radius-card, 8px)',
        overflow: 'hidden',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      className="listing-card"
    >
      {/* Thumbnail */}
      <div
        style={{
          width: '100%',
          height: '180px',
          backgroundColor: 'var(--color-bg, #f8fafc)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={listing.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: 'var(--color-text-muted, #94a3b8)',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ fontSize: '2rem', marginBottom: '4px' }}>📦</span>
            <span>No image attached</span>
          </div>
        )}

        {/* Mode Tag */}
        <span
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(32, 26, 23, 0.85)',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '4px',
            backdropFilter: 'blur(4px)',
          }}
        >
          {getModeLabel()}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: 'var(--color-accent, #0F766E)',
            }}
          >
            {formatCategory(listing.category)}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'capitalize',
              color: 'var(--color-text-muted, #64748b)',
            }}
          >
            {listing.condition.replace('_', ' ')}
          </span>
        </div>

        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            marginBottom: '6px',
            lineHeight: 1.3,
            color: 'var(--color-text)',
          }}
        >
          {listing.title}
        </h3>

        <p
          style={{
            fontSize: '0.825rem',
            color: 'var(--color-text-muted)',
            marginBottom: '12px',
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>📍</span>
          <span>{listing.pickup_zone || 'HITAM Campus'}</span>
        </p>

        {/* Exchange Strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '10px',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <span
            style={{
              fontWeight: 800,
              fontSize: '1.05rem',
              color: 'var(--color-accent)',
            }}
          >
            {formatPrice()}
          </span>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-success)',
            }}
          >
            Available
          </span>
        </div>
      </div>
    </Link>
  );
};
