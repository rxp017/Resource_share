// src/modules/listings/EditListingPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { fetchListingById, updateListing, CAMPUS_PICKUP_ZONES } from './api';
import type { ListingCategory, ListingCondition, ListingMode, ListingItem } from './types';
import { Skeleton } from '../../shared/components/Skeleton';
import { ErrorState } from '../../shared/components/ErrorState';
import { PlusCircleIcon } from '../../shared/components';

const CATEGORIES: { id: ListingCategory; label: string }[] = [
  { id: 'textbooks', label: 'Textbooks & Academic Notes' },
  { id: 'electronics', label: 'Electronics & Calculators' },
  { id: 'lab_gear', label: 'Lab Coats & Practical Gear' },
  { id: 'stationery', label: 'Stationery & Drawing Tools' },
  { id: 'sports', label: 'Sports & Fitness Equipment' },
  { id: 'musical', label: 'Musical Instruments' },
  { id: 'uniforms', label: 'College Uniforms & Blazers' },
  { id: 'other', label: 'Other Academic Supplies' },
];

export const EditListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState<ListingItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ListingCategory>('textbooks');
  const [condition, setCondition] = useState<ListingCondition>('good');
  const [defects, setDefects] = useState('');
  const [mode, setMode] = useState<ListingMode>('sale');
  const [priceRupees, setPriceRupees] = useState<string>('');
  const [depositRupees, setDepositRupees] = useState<string>('');
  const [pickupZone, setPickupZone] = useState<string>(CAMPUS_PICKUP_ZONES[0]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function load() {
      try {
        const data = await fetchListingById(id!);
        if (!isMounted) return;
        if (!data) {
          setLoadError('Listing not found or was removed.');
          return;
        }
        if (user && data.owner_id !== user.id) {
          setLoadError('You are not authorized to edit this listing because you are not the owner.');
          return;
        }

        setListing(data);
        setTitle(data.title);
        setDescription(data.description || '');
        setCategory(data.category);
        setCondition(data.condition);
        setDefects(data.defects || '');
        setMode(data.mode);
        setPriceRupees(data.price_paise > 0 ? (data.price_paise / 100).toString() : '');
        setDepositRupees(data.deposit_paise > 0 ? (data.deposit_paise / 100).toString() : '');
        setPickupZone(data.pickup_zone || CAMPUS_PICKUP_ZONES[0]);
      } catch (err: unknown) {
        if (isMounted) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load listing.');
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
  }, [id, user]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

    if (newPhotos.length + selectedFiles.length > 4) {
      setErrorMessage('You can upload a maximum of 4 additional photos.');
      return;
    }

    const nextPhotos = [...newPhotos, ...selectedFiles].slice(0, 4);
    setNewPhotos(nextPhotos);

    const nextPreviews = nextPhotos.map((f) => URL.createObjectURL(f));
    setNewPhotoPreviews(nextPreviews);
  };

  const handleRemoveNewPhoto = (index: number) => {
    const nextPhotos = newPhotos.filter((_, i) => i !== index);
    setNewPhotos(nextPhotos);
    const nextPreviews = nextPhotos.map((f) => URL.createObjectURL(f));
    setNewPhotoPreviews(nextPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!id || !user) {
      setErrorMessage('Session expired or invalid listing ID.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Please enter an item title.');
      return;
    }

    if (mode === 'sale' || mode === 'rental') {
      const priceNum = Number(priceRupees);
      if (!priceRupees || isNaN(priceNum) || priceNum <= 0) {
        setErrorMessage('Please specify a valid price in Rupees greater than 0.');
        return;
      }
    }

    if (mode === 'free_loan' && depositRupees) {
      const depNum = Number(depositRupees);
      if (isNaN(depNum) || depNum < 0) {
        setErrorMessage('Deposit amount cannot be negative.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await updateListing(id, {
        title,
        description,
        category,
        condition,
        defects,
        mode,
        price_rupees: Number(priceRupees) || 0,
        deposit_rupees: Number(depositRupees) || 0,
        pickup_zone: pickupZone,
        new_photos: newPhotos,
      });

      navigate(`/listings/${id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update listing. Please try again.';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '680px', margin: '40px auto', padding: '0 20px' }}>
        <Skeleton height="32px" width="60%" style={{ marginBottom: '16px' }} />
        <Skeleton height="200px" style={{ marginBottom: '16px', borderRadius: '8px' }} />
        <Skeleton height="120px" style={{ borderRadius: '8px' }} />
      </div>
    );
  }

  if (loadError || !listing) {
    return (
      <div style={{ maxWidth: '680px', margin: '60px auto', padding: '0 20px' }}>
        <ErrorState
          title="Cannot Edit Listing"
          message={loadError || 'Listing not found or access denied.'}
          onRetry={() => navigate('/my/listings')}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px 80px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link
          to={`/listings/${id}`}
          style={{
            color: 'var(--color-accent)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '12px',
          }}
        >
          &larr; Cancel and return to listing
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px 0' }}>
          Edit Academic Listing
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', margin: 0 }}>
          Update item details, condition disclosure, pricing, or designated pickup zone.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          style={{
            backgroundColor: '#FEF2F2',
            color: '#B91C1C',
            border: '1px solid #FCA5A5',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '24px',
            fontSize: '0.9rem',
          }}
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Title */}
        <div>
          <label htmlFor="edit-title" style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
            Listing Title *
          </label>
          <input
            id="edit-title"
            type="text"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              minHeight: '44px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-btn, 8px)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '1rem',
            }}
          />
        </div>

        {/* Category & Condition */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label htmlFor="edit-category" style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
              Academic Category *
            </label>
            <select
              id="edit-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ListingCategory)}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-btn, 8px)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '0.95rem',
              }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="edit-condition" style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
              Item Condition *
            </label>
            <select
              id="edit-condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value as ListingCondition)}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-btn, 8px)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '0.95rem',
              }}
            >
              <option value="new">Brand New (Unused)</option>
              <option value="like_new">Like New (Very Minor Wear)</option>
              <option value="good">Good (Clean & Fully Functional)</option>
              <option value="fair">Fair (Noticeable Markings / Wear)</option>
            </select>
          </div>
        </div>

        {/* Mode Selector */}
        <div>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>
            Sharing Mode *
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {(
              [
                { id: 'sale', label: 'Sell Outright', desc: 'Direct UPI/cash transfer' },
                { id: 'free_loan', label: 'Free Campus Loan', desc: 'Zero daily fee' },
                { id: 'rental', label: 'Daily Rental', desc: 'Daily rate' },
              ] as const
            ).map((item) => (
              <div
                key={item.id}
                onClick={() => setMode(item.id)}
                className="interactive-card"
                style={{
                  border: mode === item.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                  backgroundColor: mode === item.id ? 'var(--color-surface-subtle, #f0fdf4)' : 'var(--color-surface)',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Inputs */}
        {mode !== 'free_loan' ? (
          <div>
            <label htmlFor="edit-price" style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
              {mode === 'sale' ? 'Sale Price (₹) *' : 'Daily Rental Fee (₹ / day) *'}
            </label>
            <input
              id="edit-price"
              type="number"
              min="1"
              step="1"
              required
              value={priceRupees}
              onChange={(e) => setPriceRupees(e.target.value)}
              placeholder="e.g. 250"
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-btn, 8px)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '1rem',
              }}
            />
          </div>
        ) : (
          <div>
            <label htmlFor="edit-deposit" style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
              Security Deposit (₹) <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(Optional, refundable)</span>
            </label>
            <input
              id="edit-deposit"
              type="number"
              min="0"
              step="1"
              value={depositRupees}
              onChange={(e) => setDepositRupees(e.target.value)}
              placeholder="0 (None)"
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-btn, 8px)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '1rem',
              }}
            />
          </div>
        )}

        {/* Pickup Zone */}
        <div>
          <label htmlFor="edit-pickup-zone" style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
            Designated Campus Pickup Location *
          </label>
          <select
            id="edit-pickup-zone"
            value={pickupZone}
            onChange={(e) => setPickupZone(e.target.value)}
            style={{
              width: '100%',
              minHeight: '44px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-btn, 8px)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '0.95rem',
            }}
          >
            {CAMPUS_PICKUP_ZONES.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>

        {/* Defects Disclosure */}
        <div>
          <label htmlFor="edit-defects" style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
            Defects or Notable Wear <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(Optional)</span>
          </label>
          <input
            id="edit-defects"
            type="text"
            value={defects}
            onChange={(e) => setDefects(e.target.value)}
            placeholder="e.g. Highlighted pages in chapter 3, minor scratches on cover"
            style={{
              width: '100%',
              minHeight: '44px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-btn, 8px)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '0.95rem',
            }}
          />
        </div>

        {/* Detailed Description */}
        <div>
          <label htmlFor="edit-description" style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
            Detailed Description
          </label>
          <textarea
            id="edit-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context on edition, semester, author, or accessories included..."
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-btn, 8px)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '0.95rem',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Additional Photos Upload */}
        <div>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
            Add Additional Photos
          </label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {newPhotoPreviews.map((src, idx) => (
              <div
                key={idx}
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid var(--color-border)',
                }}
              >
                <img src={src} alt="New upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => handleRemoveNewPhoto(idx)}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    backgroundColor: 'rgba(0,0,0,0.65)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}

            {newPhotos.length < 4 && (
              <label
                className="interactive-btn"
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '8px',
                  border: '2px dashed var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.75rem',
                }}
              >
                <PlusCircleIcon size={22} color="var(--color-text-muted)" style={{ marginBottom: '2px' }} />
                <span>Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="interactive-btn"
            style={{
              flex: 1,
              padding: '12px 24px',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-contrast)',
              border: 'none',
              borderRadius: 'var(--radius-btn, 8px)',
              fontWeight: 700,
              fontSize: '1.05rem',
              cursor: isSubmitting ? 'wait' : 'pointer',
              minHeight: '48px',
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.25)',
            }}
          >
            {isSubmitting ? 'Saving Changes...' : 'Save & Update Listing'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/listings/${id}`)}
            className="interactive-btn"
            style={{
              padding: '12px 20px',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-btn, 8px)',
              color: 'var(--color-text)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
