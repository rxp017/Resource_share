import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPublishedListings } from './api';
import type { ListingItem, ListingCategory } from './types';
import { ListingCard } from './ListingCard';
import { Skeleton } from '../../shared/components/Skeleton';
import { EmptyState } from '../../shared/components/EmptyState';
import { ErrorState } from '../../shared/components/ErrorState';

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All Items' },
  { id: 'textbooks', label: '📚 Textbooks' },
  { id: 'electronics', label: '💻 Electronics' },
  { id: 'lab_gear', label: '🔬 Lab Gear' },
  { id: 'stationery', label: '✏️ Stationery' },
  { id: 'sports', label: '⚽ Sports' },
  { id: 'musical', label: '🎸 Musical' },
  { id: 'uniforms', label: '👔 Uniforms' },
  { id: 'other', label: '📦 Other' },
];

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [maxSalePriceRupees, setMaxSalePriceRupees] = useState<string>('');
  const [maxRentalDailyRupees, setMaxRentalDailyRupees] = useState<string>('');
  const [fetchTrigger, setFetchTrigger] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const filters = {
          query: searchQuery,
          category: selectedCategory !== 'all' ? (selectedCategory as ListingCategory) : undefined,
          mode: selectedMode !== 'all' ? selectedMode : undefined,
          maxPricePaise:
            selectedMode === 'sale' && maxSalePriceRupees
              ? Math.round(Number(maxSalePriceRupees) * 100)
              : undefined,
        };

        const data = await fetchPublishedListings(filters);

        let filtered = data;
        if (maxRentalDailyRupees && Number(maxRentalDailyRupees) > 0) {
          const maxDailyPaise = Math.round(Number(maxRentalDailyRupees) * 100);
          filtered = filtered.filter((item) => {
            if (item.mode === 'rental') {
              return item.price_paise <= maxDailyPaise;
            }
            return true;
          });
        }

        if (isMounted) {
          setListings(filtered);
          setErrorMessage(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed loading marketplace listings.';
          setErrorMessage(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, selectedMode, maxRentalDailyRupees, maxSalePriceRupees, searchQuery, fetchTrigger]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFetchTrigger((t) => t + 1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedMode('all');
    setMaxSalePriceRupees('');
    setMaxRentalDailyRupees('');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Top Banner / Hero */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '4px' }}>
            HITAM Campus Marketplace
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Verified student peer sharing: buy, borrow, or rent physical academic resources.
          </p>
        </div>

        <Link
          to="/listings/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accent-contrast)',
            textDecoration: 'none',
            padding: '10px 20px',
            borderRadius: 'var(--radius-btn, 6px)',
            fontWeight: 700,
            fontSize: '0.95rem',
            minHeight: '44px',
          }}
        >
          <span>➕</span>
          <span>List an item</span>
        </Link>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="search"
            placeholder="Search textbooks, calculators, lab coats, drafters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              minHeight: '44px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-btn, 6px)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '1rem',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '8px 24px',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-contrast)',
              border: 'none',
              borderRadius: 'var(--radius-btn, 6px)',
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            Search
          </button>
        </div>
      </form>

      {/* Category Pills (Horizontal Scroll) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '20px',
          scrollbarWidth: 'thin',
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              whiteSpace: 'nowrap',
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid var(--color-border)',
              backgroundColor:
                selectedCategory === cat.id ? 'var(--color-accent)' : 'var(--color-surface)',
              color:
                selectedCategory === cat.id ? 'var(--color-accent-contrast)' : 'var(--color-text)',
              fontWeight: selectedCategory === cat.id ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Advanced Mode & Price Filters */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card, 8px)',
          padding: '16px',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          alignItems: 'center',
        }}
      >
        {/* Mode Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Type:</span>
          {(['all', 'sale', 'rental', 'free_loan'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMode(m)}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-btn, 6px)',
                border: selectedMode === m ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                backgroundColor: selectedMode === m ? 'var(--color-bg)' : 'transparent',
                color: 'var(--color-text)',
                fontWeight: selectedMode === m ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                minHeight: '44px',
                textTransform: 'capitalize',
              }}
            >
              {m === 'free_loan' ? 'Free Loan' : m}
            </button>
          ))}
        </div>

        {/* Separate Sale Price Filter */}
        {(selectedMode === 'all' || selectedMode === 'sale') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="max-sale-price" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Max Sale (₹):
            </label>
            <input
              id="max-sale-price"
              type="number"
              min="0"
              placeholder="e.g. 1000"
              value={maxSalePriceRupees}
              onChange={(e) => setMaxSalePriceRupees(e.target.value)}
              style={{
                width: '110px',
                minHeight: '44px',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
              }}
            />
          </div>
        )}

        {/* Separate Rental Daily Filter */}
        {(selectedMode === 'all' || selectedMode === 'rental') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="max-rental-rate" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Max Rent/day (₹):
            </label>
            <input
              id="max-rental-rate"
              type="number"
              min="0"
              placeholder="e.g. 50"
              value={maxRentalDailyRupees}
              onChange={(e) => setMaxRentalDailyRupees(e.target.value)}
              style={{
                width: '110px',
                minHeight: '44px',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
              }}
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            setFetchTrigger((t) => t + 1);
          }}
          style={{
            padding: '4px 16px',
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-accent-contrast)',
            border: 'none',
            borderRadius: 'var(--radius-btn, 6px)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            minHeight: '44px',
            marginLeft: 'auto',
          }}
        >
          Apply Filters
        </button>

        {(searchQuery || selectedCategory !== 'all' || selectedMode !== 'all' || maxSalePriceRupees || maxRentalDailyRupees) && (
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              minHeight: '44px',
            }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Main Grid / States */}
      {isLoading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card, 8px)',
                padding: '16px',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <Skeleton height="180px" borderRadius="6px" />
              <div style={{ marginTop: '12px' }}>
                <Skeleton width="40%" height="16px" borderRadius="4px" />
              </div>
              <div style={{ marginTop: '8px' }}>
                <Skeleton width="85%" height="22px" borderRadius="4px" />
              </div>
              <div style={{ marginTop: '16px' }}>
                <Skeleton width="60%" height="20px" borderRadius="4px" />
              </div>
            </div>
          ))}
        </div>
      ) : errorMessage ? (
        <ErrorState
          title="Could not load listings"
          message={errorMessage}
          onRetry={() => {
            setIsLoading(true);
            setFetchTrigger((t) => t + 1);
          }}
        />
      ) : listings.length === 0 ? (
        <EmptyState
          title="No listings found"
          message="No published items currently match your chosen search or filters. Be the first to share an item on campus!"
          actionText="Create a Listing"
          onAction={() => navigate('/listings/new')}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {listings.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      )}
    </div>
  );
};
