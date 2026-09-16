// src/modules/listings/CreateListingPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { createListing, CAMPUS_PICKUP_ZONES } from './api';
import type { ListingCategory, ListingCondition, ListingMode } from './types';

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

export const CreateListingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ListingCategory>('textbooks');
  const [condition, setCondition] = useState<ListingCondition>('good');
  const [defects, setDefects] = useState('');
  const [mode, setMode] = useState<ListingMode>('sale');
  const [priceRupees, setPriceRupees] = useState<string>('');
  const [depositRupees, setDepositRupees] = useState<string>('');
  const [pickupZone, setPickupZone] = useState<string>(CAMPUS_PICKUP_ZONES[0]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

    if (photos.length + selectedFiles.length > 4) {
      setErrorMessage('You can upload a maximum of 4 photos per listing.');
      return;
    }

    const nextPhotos = [...photos, ...selectedFiles].slice(0, 4);
    setPhotos(nextPhotos);

    // Create object URLs for preview
    const nextPreviews = nextPhotos.map((f) => URL.createObjectURL(f));
    setPhotoPreviews(nextPreviews);
  };

  const handleRemovePhoto = (index: number) => {
    const nextPhotos = photos.filter((_, i) => i !== index);
    setPhotos(nextPhotos);
    const nextPreviews = nextPhotos.map((f) => URL.createObjectURL(f));
    setPhotoPreviews(nextPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMessage(null);

    // Validation
    if (!title.trim()) {
      setErrorMessage('Please enter a clear title for your listing.');
      return;
    }

    if (condition !== 'new' && !defects.trim()) {
      setErrorMessage('Please specify any wear, tears, or defects (or write "None" if in great condition).');
      return;
    }

    if ((mode === 'sale' || mode === 'rental') && (!priceRupees || Number(priceRupees) <= 0)) {
      setErrorMessage(`Please enter a valid price in Rupees for ${mode === 'sale' ? 'sale' : 'rental'}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createListing(user.id, {
        title,
        description,
        category,
        condition,
        defects,
        mode,
        price_rupees: Number(priceRupees) || 0,
        deposit_rupees: Number(depositRupees) || 0,
        pickup_zone: pickupZone,
        photos,
      });

      navigate(`/listings/${result.listingId}`, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish listing.';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          to="/explore"
          style={{
            color: 'var(--color-accent)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '12px',
            minHeight: '44px',
          }}
        >
          &larr; Back to Explore
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
          Create Campus Listing
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Share an academic resource with verified peers across the HITAM campus.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          style={{
            padding: '12px 16px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 'var(--radius-btn, 6px)',
            color: '#B91C1C',
            marginBottom: '24px',
            fontSize: '0.95rem',
          }}
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Title */}
        <div>
          <label htmlFor="listing-title" style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.95rem' }}>
            Listing Title *
          </label>
          <input
            id="listing-title"
            type="text"
            required
            placeholder="e.g. Higher Engineering Mathematics by B.S. Grewal (44th Ed.)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              minHeight: '44px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-btn, 6px)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '1rem',
            }}
          />
        </div>

        {/* Category & Condition Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div>
            <label htmlFor="listing-category" style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.95rem' }}>
              Category *
            </label>
            <select
              id="listing-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ListingCategory)}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-btn, 6px)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '0.95rem',
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="listing-condition" style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.95rem' }}>
              Physical Condition *
            </label>
            <select
              id="listing-condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value as ListingCondition)}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-btn, 6px)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '0.95rem',
              }}
            >
              <option value="new">Brand New (Unopened/Unused)</option>
              <option value="like_new">Like New (Very gentle use, no marks)</option>
              <option value="good">Good (Normal campus use, clean)</option>
              <option value="fair">Fair (Noticeable wear, fully functional)</option>
            </select>
          </div>
        </div>

        {/* Defects disclosure */}
        <div>
          <label htmlFor="listing-defects" style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.95rem' }}>
            Wear, Markings & Defects Disclosure {condition !== 'new' && '*'}
          </label>
          <input
            id="listing-defects"
            type="text"
            placeholder={condition === 'new' ? 'None (optional)' : 'e.g. Highlights on chapter 3, slight cover crease'}
            value={defects}
            onChange={(e) => setDefects(e.target.value)}
            style={{
              width: '100%',
              minHeight: '44px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-btn, 6px)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '0.95rem',
            }}
          />
        </div>

        {/* Mode Selector */}
        <fieldset
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card, 8px)',
            padding: '16px 20px',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <legend style={{ fontWeight: 700, padding: '0 8px', fontSize: '0.95rem' }}>Exchange Mode *</legend>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginTop: '8px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '6px',
                border: mode === 'sale' ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                backgroundColor: mode === 'sale' ? 'var(--color-bg)' : 'transparent',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              <input
                type="radio"
                name="mode"
                value="sale"
                checked={mode === 'sale'}
                onChange={() => setMode('sale')}
                style={{ width: '18px', height: '18px' }}
              />
              <strong>Sell Item</strong>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '6px',
                border: mode === 'rental' ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                backgroundColor: mode === 'rental' ? 'var(--color-bg)' : 'transparent',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              <input
                type="radio"
                name="mode"
                value="rental"
                checked={mode === 'rental'}
                onChange={() => setMode('rental')}
                style={{ width: '18px', height: '18px' }}
              />
              <strong>Rent Out</strong>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '6px',
                border: mode === 'free_loan' ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                backgroundColor: mode === 'free_loan' ? 'var(--color-bg)' : 'transparent',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              <input
                type="radio"
                name="mode"
                value="free_loan"
                checked={mode === 'free_loan'}
                onChange={() => setMode('free_loan')}
                style={{ width: '18px', height: '18px' }}
              />
              <strong>Free Loan</strong>
            </label>
          </div>
        </fieldset>

        {/* Pricing Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {mode !== 'free_loan' && (
            <div>
              <label htmlFor="listing-price" style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.95rem' }}>
                {mode === 'sale' ? 'Sale Price (₹) *' : 'Daily Rental Rate (₹/day) *'}
              </label>
              <input
                id="listing-price"
                type="number"
                min="1"
                required
                placeholder={mode === 'sale' ? 'e.g. 450' : 'e.g. 30'}
                value={priceRupees}
                onChange={(e) => setPriceRupees(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-btn, 6px)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: '1rem',
                }}
              />
            </div>
          )}

          {(mode === 'rental' || mode === 'free_loan') && (
            <div>
              <label htmlFor="listing-deposit" style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.95rem' }}>
                Refundable Security Deposit (₹) (optional)
              </label>
              <input
                id="listing-deposit"
                type="number"
                min="0"
                placeholder="e.g. 200 (0 for none)"
                value={depositRupees}
                onChange={(e) => setDepositRupees(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-btn, 6px)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: '1rem',
                }}
              />
            </div>
          )}
        </div>

        {/* Pickup Zone */}
        <div>
          <label htmlFor="listing-pickup" style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.95rem' }}>
            Campus Pickup Location *
          </label>
          <select
            id="listing-pickup"
            value={pickupZone}
            onChange={(e) => setPickupZone(e.target.value)}
            style={{
              width: '100%',
              minHeight: '44px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-btn, 6px)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '0.95rem',
            }}
          >
            {CAMPUS_PICKUP_ZONES.map((zone) => (
              <option key={zone} value={zone}>
                📍 {zone}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="listing-description" style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.95rem' }}>
            Description (optional)
          </label>
          <textarea
            id="listing-description"
            rows={4}
            placeholder="Provide any additional context, e.g. syllabus relevance, semester, accessories included..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-btn, 6px)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Photo Upload (1-4 photos, client resized, EXIF stripped) */}
        <div>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.95rem' }}>
            Photos (Up to 4 images &bull; Client compressed &bull; EXIF privacy stripped)
          </label>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
            {photoPreviews.map((url, idx) => (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  width: '100px',
                  height: '100px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                }}
              >
                <img src={url} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  aria-label={`Remove photo ${idx + 1}`}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}

            {photos.length < 4 && (
              <label
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '8px',
                  border: '2px dashed var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.75rem',
                  textAlign: 'center',
                  padding: '4px',
                }}
              >
                <span style={{ fontSize: '1.5rem', marginBottom: '2px' }}>📷</span>
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

        {/* Submit Button */}
        <div style={{ marginTop: '12px' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-contrast)',
              border: 'none',
              borderRadius: 'var(--radius-btn, 8px)',
              fontWeight: 700,
              fontSize: '1.05rem',
              cursor: isSubmitting ? 'wait' : 'pointer',
              minHeight: '48px',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? 'Compressing photos & publishing listing...' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};
