// src/modules/listings/ExplorePage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPublishedListings } from './api';
import type { ListingItem, ListingCategory } from './types';
import { ListingCard } from './ListingCard';
import { Skeleton } from '../../shared/components/Skeleton';
import { EmptyState } from '../../shared/components/EmptyState';
import { ErrorState } from '../../shared/components/ErrorState';
import {
  SearchIcon,
  XIcon,
  FilterIcon,
  PlusCircleIcon,
  BookOpenIcon,
  LaptopIcon,
  FlaskConicalIcon,
  PenToolIcon,
  TrophyIcon,
  MusicIcon,
  ShirtIcon,
  PackageIcon,
} from '../../shared/components/Icons';

interface CategoryConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryConfig[] = [
  { id: 'all', label: 'All Items', icon: <PackageIcon size={16} strokeWidth={2} /> },
  { id: 'textbooks', label: 'Textbooks', icon: <BookOpenIcon size={16} strokeWidth={2} /> },
  { id: 'electronics', label: 'Electronics', icon: <LaptopIcon size={16} strokeWidth={2} /> },
  { id: 'lab_gear', label: 'Lab Gear', icon: <FlaskConicalIcon size={16} strokeWidth={2} /> },
  { id: 'stationery', label: 'Stationery', icon: <PenToolIcon size={16} strokeWidth={2} /> },
  { id: 'sports', label: 'Sports', icon: <TrophyIcon size={16} strokeWidth={2} /> },
  { id: 'musical', label: 'Musical', icon: <MusicIcon size={16} strokeWidth={2} /> },
  { id: 'uniforms', label: 'Uniforms', icon: <ShirtIcon size={16} strokeWidth={2} /> },
  { id: 'other', label: 'Other', icon: <PackageIcon size={16} strokeWidth={2} /> },
];

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [maxSalePriceRupees, setMaxSalePriceRupees] = useState<string>('');
  const [maxRentalDailyRupees, setMaxRentalDailyRupees] = useState<string>('');
  const [fetchTrigger, setFetchTrigger] = useState<number>(0);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // 300ms debounce on search input to prevent query flooding
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setIsLoading(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      try {
        const filters = {
          query: debouncedSearchQuery.trim() || undefined,
          category: selectedCategory !== 'all' ? (selectedCategory as ListingCategory) : undefined,
          mode: selectedMode !== 'all' ? selectedMode : undefined,
          maxPricePaise:
            selectedMode === 'sale' && maxSalePriceRupees
              ? Math.round(Number(maxSalePriceRupees) * 100)
              : undefined,
        };

        const data = await fetchPublishedListings(filters);

        if (isCancelled) return;

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

        if (!isCancelled) {
          setListings(filtered);
          setErrorMessage(null);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const msg = err instanceof Error ? err.message : 'Failed loading marketplace listings.';
          setErrorMessage(msg);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      isCancelled = true;
    };
  }, [selectedCategory, selectedMode, maxRentalDailyRupees, maxSalePriceRupees, debouncedSearchQuery, fetchTrigger]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setDebouncedSearchQuery(searchQuery);
    setFetchTrigger((t) => t + 1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setSelectedCategory('all');
    setSelectedMode('all');
    setMaxSalePriceRupees('');
    setMaxRentalDailyRupees('');
    setIsLoading(true);
  };

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedMode !== 'all' ? 1 : 0) +
    (maxSalePriceRupees ? 1 : 0) +
    (maxRentalDailyRupees ? 1 : 0);

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 16px 80px' }}>
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
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 1.85rem)', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.02em' }}>
            HITAM Campus Marketplace
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem' }}>
            Verified student peer sharing: buy, borrow, or rent physical academic resources.
          </p>
        </div>

        <Link
          to="/listings/new"
          className="interactive-btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            padding: '10px 20px',
            borderRadius: 'var(--radius-btn, 8px)',
            fontWeight: 700,
            fontSize: '0.925rem',
            minHeight: '44px',
          }}
        >
          <PlusCircleIcon size={18} strokeWidth={2.2} />
          <span>Post an item</span>
        </Link>
      </div>

      {/* Search Bar & Filter Toggle Toolbar */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} style={{ flex: 1 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                position: 'absolute',
                left: '14px',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              <SearchIcon size={18} strokeWidth={2} />
            </span>
            <input
              type="search"
              placeholder="Search textbooks, calculators, lab coats, drafters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                minHeight: '46px',
                padding: '8px 40px 8px 42px',
                borderRadius: 'var(--radius-btn, 10px)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '0.95rem',
                outline: 'none',
                boxShadow: 'var(--shadow-sm)',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setDebouncedSearchQuery('');
                  setIsLoading(true);
                  setFetchTrigger((t) => t + 1);
                }}
                className="interactive-btn"
                title="Clear search"
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <XIcon size={18} strokeWidth={2} />
              </button>
            )}
          </div>
        </form>

        {/* Filter Toggle Button */}
        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          className="interactive-btn"
          aria-expanded={showFilters}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            minHeight: '46px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-btn, 10px)',
            border: activeFilterCount > 0 ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
            backgroundColor: activeFilterCount > 0 ? 'color-mix(in srgb, var(--color-accent) 12%, var(--color-surface))' : 'var(--color-surface)',
            color: activeFilterCount > 0 ? 'var(--color-accent)' : 'var(--color-text)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <FilterIcon size={16} strokeWidth={2} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-contrast)',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Pills (Horizontal Scroll with Touch Optimization) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '20px',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              className="interactive-btn"
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 16px',
                borderRadius: '999px',
                border: isSelected ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-surface)',
                color: isSelected ? 'var(--color-accent-contrast)' : 'var(--color-text)',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                minHeight: '40px',
                boxShadow: isSelected ? '0 2px 8px rgba(13, 148, 136, 0.25)' : 'none',
                transition: 'all 150ms ease',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Collapsible Mode & Price Filters Panel */}
      {showFilters && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            borderRadius: 'var(--radius-card, 12px)',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '18px',
            alignItems: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Mode Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>Mode:</span>
            {(['all', 'sale', 'rental', 'free_loan'] as const).map((m) => {
              const isSelected = selectedMode === m;
              return (
                <button
                  key={m}
                  type="button"
                  className="interactive-btn"
                  onClick={() => setSelectedMode(m)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-btn, 8px)',
                    border: isSelected ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                    backgroundColor: isSelected ? 'color-mix(in srgb, var(--color-accent) 15%, var(--color-surface))' : 'var(--color-surface)',
                    color: isSelected ? 'var(--color-accent)' : 'var(--color-text)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    minHeight: '38px',
                    textTransform: 'capitalize',
                  }}
                >
                  {m === 'free_loan' ? 'Free Loan' : m}
                </button>
              );
            })}
          </div>

          {/* Sale Price Filter */}
          {(selectedMode === 'all' || selectedMode === 'sale') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="max-sale-price" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Max Sale (₹):
              </label>
              <input
                id="max-sale-price"
                type="number"
                min="0"
                placeholder="e.g. 500"
                value={maxSalePriceRupees}
                onChange={(e) => setMaxSalePriceRupees(e.target.value)}
                style={{
                  width: '100px',
                  minHeight: '38px',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-btn, 8px)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          )}

          {/* Rental Daily Filter */}
          {(selectedMode === 'all' || selectedMode === 'rental') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="max-rental-price" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Max Daily (₹):
              </label>
              <input
                id="max-rental-price"
                type="number"
                min="0"
                placeholder="e.g. 50"
                value={maxRentalDailyRupees}
                onChange={(e) => setMaxRentalDailyRupees(e.target.value)}
                style={{
                  width: '90px',
                  minHeight: '38px',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-btn, 8px)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          )}

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="interactive-btn"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-accent)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline',
                minHeight: '38px',
                marginLeft: 'auto',
              }}
            >
              Reset all filters
            </button>
          )}
        </div>
      )}

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
                borderRadius: 'var(--radius-card, 12px)',
                padding: '16px',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <Skeleton height="180px" borderRadius="8px" />
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
