import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import apiService from '../../services/api';
import './PromoBanner.css';

// ────────────────────────────────────────────────────────────────────────────────
// PromoBanner — Promotional poster component for the home page
// Fetches active promotions from the DB.
// If no promotions exist or videoUrl is null, renders nothing.
// Supports video background with auto-play, image fallback, tags, CTA buttons,
// and a carousel with indicator dots when multiple promos are active.
// ────────────────────────────────────────────────────────────────────────────────

const PromoBanner = ({ placement = 'home', onNavigate, onOpenCreateModal, onShowAuthModal }) => {
  const { isLoggedIn } = useSelector((state) => state.auth);
  const [promotions, setPromotions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const videoRef = useRef(null);
  const intervalRef = useRef(null);

  // Fetch promotions on mount
  useEffect(() => {
    let cancelled = false;
    apiService.community.getPromotions(placement)
      .then(({ data }) => {
        if (!cancelled && data.success && data.data?.length > 0) {
          setPromotions(data.data);
          setLoaded(true);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [placement]);

  // Auto-cycle carousel
  useEffect(() => {
    if (promotions.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % promotions.length);
    }, 8000);
    return () => clearInterval(intervalRef.current);
  }, [promotions.length]);

  // Handle manual slide change
  const goToSlide = useCallback((index) => {
    setActiveIndex(index);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % promotions.length);
      }, 8000);
    }
  }, [promotions.length]);

  // Handle CTA clicks
  const handleCtaClick = useCallback((link) => {
    if (!link) return;
    if (link === 'generation-modal') {
      if (!isLoggedIn) {
        if (onShowAuthModal) {
          onShowAuthModal('login');
        }
        return;
      }
      if (onOpenCreateModal) {
        onOpenCreateModal({ type: 'video', model: 'bytedance-seedance-2-0-fast-text-to-video' });
      }
    } else if (link.startsWith('http')) {
      window.open(link, '_blank', 'noopener');
    } else if (onNavigate) {
      onNavigate(link);
    }
  }, [onNavigate, onOpenCreateModal, isLoggedIn, onShowAuthModal]);

  // Don't render if no promotions
  if (!loaded || promotions.length === 0) return null;

  const promo = promotions[activeIndex];
  if (!promo) return null;

  // Check if the promo has any media at all
  const hasVideo = promo.videoUrl && promo.videoUrl.trim() !== '';
  const hasImage = promo.imageUrl && promo.imageUrl.trim() !== '';

  // If neither video nor image, don't show the banner
  if (!hasVideo && !hasImage) return null;

  return (
    <div className="promo-banner" id="promo-banner">
      {/* Background media */}
      <div className="promo-banner__media">
        {hasVideo ? (
          <video
            ref={videoRef}
            key={promo.videoUrl}
            className="promo-banner__video"
            src={promo.videoUrl}
            poster={promo.thumbnailUrl || promo.imageUrl || undefined}
            autoPlay
            loop
            muted
            playsInline
          />
        ) : hasImage ? (
          <img
            className="promo-banner__image"
            src={promo.imageUrl}
            alt={promo.title}
            loading="lazy"
          />
        ) : null}

        {/* Gradient overlays */}
        <div className="promo-banner__overlay promo-banner__overlay--bottom" />
        <div className="promo-banner__overlay promo-banner__overlay--left" />
      </div>

      {/* Content */}
      <div className="promo-banner__content">
        {/* Tags */}
        {promo.tags && promo.tags.length > 0 && (
          <div className="promo-banner__tags">
            {promo.tags.map((tag, i) => (
              <span
                key={i}
                className={`promo-banner__tag ${i === 0 ? 'promo-banner__tag--primary' : ''}`}
              >
                {i === 0 && <span className="promo-banner__tag-dot" />}
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className="promo-banner__title">{promo.title}</h2>

        {/* Description */}
        {promo.description && (
          <p className="promo-banner__desc">{promo.description}</p>
        )}

        {/* CTA buttons */}
        <div className="promo-banner__actions">
          {promo.ctaText && (
            <button
              className="promo-banner__cta promo-banner__cta--primary"
              onClick={() => handleCtaClick(promo.ctaLink)}
            >
              {promo.ctaText}
            </button>
          )}
          {promo.ctaSecondary && (
            <button
              className="promo-banner__cta promo-banner__cta--secondary"
              onClick={() => handleCtaClick(promo.ctaSecondaryLink)}
            >
              {promo.ctaSecondary}
            </button>
          )}
        </div>
      </div>

      {/* Carousel indicators */}
      {promotions.length > 1 && (
        <div className="promo-banner__indicators">
          {promotions.map((_, i) => (
            <button
              key={i}
              className={`promo-banner__dot ${i === activeIndex ? 'promo-banner__dot--active' : ''}`}
              onClick={() => goToSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PromoBanner;
