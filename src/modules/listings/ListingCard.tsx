import React from 'react';
import { Link } from 'react-router-dom';
import type { ListingItem } from './types';
import { ItemIllustration } from '../../shared/components';

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

  const getModeBadgeStyle = () => {
    switch (listing.mode) {
      case 'sale':
        return { bg: 'color-mix(in srgb, var(--color-accent) 15%, var(--color-surface))', color: 'var(--color-accent)', border: 'var(--color-accent)' };
      case 'free_loan':
        return { bg: 'color-mix(in srgb, var(--color-success) 15%, var(--color-surface))', color: 'var(--color-success)', border: 'var(--color-success)' };
      case 'rental':
        return { bg: 'color-mix(in srgb, var(--color-warning) 15%, var(--color-surface))', color: 'var(--color-warning)', border: 'var(--color-warning)' };
    }
  };

  const badgeStyle = getModeBadgeStyle();

  return (
    <Link
      to={`/listings/${listing.id}`}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card, 12px)',
        overflow: 'hidden',
      }}
      className="interactive-card listing-card"
    >
      {/* Thumbnail */}
      <div
        style={{
          width: '100%',
          height: '190px',
          backgroundColor: 'var(--color-bg)',
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
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        ) : (
          <ItemIllustration title={listing.title} category={listing.category} height="100%" />
        )}

        {/* Floating Mode Tag */}
        <span
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: badgeStyle.bg,
            color: badgeStyle.color,
            border: `1px solid ${badgeStyle.border}`,
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: '9999px',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          }}
        >
          {getModeLabel()}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: 'var(--color-accent)',
              textTransform: 'uppercase',
            }}
          >
            {formatCategory(listing.category)}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'capitalize',
              color: 'var(--color-text-muted)',
              backgroundColor: 'var(--color-bg)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid var(--color-border)',
            }}
          >
            {listing.condition.replace('_', ' ')}
          </span>
        </div>

        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            marginBottom: '8px',
            lineHeight: 1.35,
            color: 'var(--color-text)',
          }}
        >
          {listing.title}
        </h3>

        <p
          style={{
            fontSize: '0.825rem',
            color: 'var(--color-text-muted)',
            marginBottom: '14px',
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 500,
          }}
        >
          <span>📍</span>
          <span>{listing.pickup_zone || 'HITAM Campus Pickup'}</span>
        </p>

        {/* Exchange Strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '12px',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <span
            style={{
              fontWeight: 800,
              fontSize: '1.15rem',
              color: 'var(--color-accent)',
            }}
          >
            {formatPrice()}
          </span>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--color-success)',
              backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, transparent)',
              padding: '2px 8px',
              borderRadius: '9999px',
              border: '1px solid var(--color-success)',
            }}
          >
            ● Available
          </span>
        </div>
      </div>
    </Link>
  );
};
