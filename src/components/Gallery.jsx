import { useState, useEffect, useRef, useCallback } from 'react';
import photosData from '../data/photos.json';
import HERO_PHOTO_IDS from '../data/hero-photos.js';
import { imageUrl } from '../utils/imageUrl.js';
import './Gallery.css';

const AUTO_INTERVAL = 4000; // ms per page
const RESUME_DELAY = 8000;  // ms of inactivity before auto-scroll resumes

/* ── Filter down to one hero photo per artist ── */
const heroPhotos = HERO_PHOTO_IDS
  .map((id) => photosData.find((p) => p.id === id))
  .filter(Boolean);

/* ── Group all photos by artist, sorted alphabetically for the index ── */
const artistEntries = (() => {
  const groups = new Map();
  for (const p of photosData) {
    if (!groups.has(p.artist)) {
      groups.set(p.artist, { photos: [], themes: new Set() });
    }
    const g = groups.get(p.artist);
    g.photos.push(p);
    if (p.theme) g.themes.add(p.theme);
  }
  const order = [];
  for (const [name, group] of groups) {
    order.push({
      name,
      themes: [...group.themes].filter(Boolean),
      photos: group.photos,
    });
  }
  return order.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
})();

export default function Gallery() {
  const trackRef = useRef(null);
  const artistsRef = useRef(null);
  const [page, setPage] = useState(0);
  const [ready, setReady] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [rotation, setRotation] = useState(0);
  const autoRef = useRef({ paused: false, timer: null, resumeTimer: null });

  /* ── Click hero spread → select artist & scroll to Index ── */
  const handleSpreadClick = useCallback((artistName) => {
    setSelectedArtist(artistName);
    setTimeout(() => {
      artistsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  /* ── Keyboard arrow key navigation (only at top of page) ── */
  useEffect(() => {
    const handleKey = (e) => {
      if (!document.body.classList.contains('gallery-active')) return;
      if (window.scrollY > 10) return;
      const track = trackRef.current;
      if (!track) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        track.scrollBy({ left: window.innerWidth, behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        track.scrollBy({ left: -window.innerWidth, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  /* ── Auto-scroll: advance every few seconds, pause on interaction ── */
  const pauseAutoScroll = useCallback(() => {
    const a = autoRef.current;
    a.paused = true;
    if (a.timer) { clearInterval(a.timer); a.timer = null; }
    if (a.resumeTimer) { clearTimeout(a.resumeTimer); }
    a.resumeTimer = setTimeout(() => {
      a.paused = false;
      a.resumeTimer = null;
      startAutoTimer();
    }, RESUME_DELAY);
    setPage((p) => p);
  }, []);

  const changeSlide = useCallback((direction) => {
    const track = trackRef.current;
    if (!track) return;

    const current = Math.round(track.scrollLeft / window.innerWidth);
    const next = (current + direction + heroPhotos.length) % heroPhotos.length;
    pauseAutoScroll();
    track.scrollTo({ left: next * window.innerWidth, behavior: 'smooth' });
  }, [pauseAutoScroll]);

  const startAutoTimer = useCallback(() => {
    const a = autoRef.current;
    if (a.timer) clearInterval(a.timer);
    a.timer = setInterval(() => {
      if (a.paused) return;
      const track = trackRef.current;
      if (!track) return;
      const total = heroPhotos.length;
      const cur = Math.round(track.scrollLeft / window.innerWidth);
      const next = (cur + 1) % total;
      track.scrollTo({ left: next * window.innerWidth, behavior: 'smooth' });
    }, AUTO_INTERVAL);
  }, []);

  useEffect(() => {
    startAutoTimer();

    const interact = () => pauseAutoScroll();
    window.addEventListener('keydown', interact);
    window.addEventListener('touchstart', interact, { passive: true });
    window.addEventListener('mousedown', interact);

    return () => {
      const a = autoRef.current;
      if (a.timer) clearInterval(a.timer);
      if (a.resumeTimer) clearTimeout(a.resumeTimer);
      window.removeEventListener('keydown', interact);
      window.removeEventListener('touchstart', interact);
      window.removeEventListener('mousedown', interact);
    };
  }, [startAutoTimer, pauseAutoScroll]);

  /* ── Track current page via scroll position ── */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onScroll = () => {
      const idx = Math.round(track.scrollLeft / window.innerWidth);
      setPage(Math.min(idx, heroPhotos.length - 1));
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Set body class so header stays transparent on gallery ── */
  useEffect(() => {
    document.body.classList.add('gallery-active');
    return () => document.body.classList.remove('gallery-active');
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className={`gallery ${ready ? 'gallery--ready' : ''}`}>
      {/* ══════════════════════════════════════════════
          HERO — Horizontal scroll photobook
          ══════════════════════════════════════════════ */}
      <section className="gallery__hero">
        <div className="gallery__track" ref={trackRef}>
          {heroPhotos.map((photo, i) => {
            return (
              <button
                key={photo.id}
                onClick={() => handleSpreadClick(photo.artist)}
                className="gallery__spread"
              >
                <div className="gallery__spread-image-wrap">
                  <img
                    src={imageUrl(photo.image)}
                    alt={photo.title}
                    className="gallery__spread-image"
                    loading={i < 2 ? 'eager' : 'lazy'}
                  />
                  <div className="gallery__spread-grain" />
                </div>

                <div className="gallery__spread-text">
                  <span className="gallery__spread-artist">·{photo.artist}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="gallery__navigation" aria-label="Portfolio navigation">
          <button
            className="gallery__nav-button gallery__nav-button--previous"
            type="button"
            aria-label="Previous artist"
            onClick={() => changeSlide(-1)}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            className="gallery__nav-button gallery__nav-button--next"
            type="button"
            aria-label="Next artist"
            onClick={() => changeSlide(1)}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>

        {/* ── Page indicator ── */}
        <div className="gallery__indicator">
          <span className={`gallery__auto-badge ${autoRef.current.paused ? '' : 'gallery__auto-badge--active'}`}>
            AUTO
          </span>
          <span className="gallery__indicator-current">
            {String(page + 1).padStart(2, '0')}
          </span>
          <span className="gallery__indicator-sep">/</span>
          <span className="gallery__indicator-total">
            {String(heroPhotos.length).padStart(2, '0')}
          </span>
        </div>
      </section>

      <section className="gallery__artists" ref={artistsRef}>
        <div className="gallery__artists-inner">
          <div className="gallery__artists-header">
            <span className="gallery__artists-header-line">═══════════════</span>
            <span className="gallery__artists-header-label">INDEX</span>
            <span className="gallery__artists-header-line">═══════════════</span>
          </div>

          <div className="gallery__artists-split">
            {/* ── Left: artist list ── */}
            <div className="gallery__artists-list">
              {artistEntries.map((artist) => (
                <button
                  key={artist.name}
                  className={`gallery__artist-btn ${selectedArtist === artist.name ? 'gallery__artist-btn--active' : ''}`}
                  onClick={() =>
                    setSelectedArtist(selectedArtist === artist.name ? null : artist.name)
                  }
                >
                  <span className="gallery__artist-name">{artist.name}</span>
                  {artist.themes.length > 0 && (
                    <span className="gallery__artist-theme">{artist.themes.join(', ')}</span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Right: photo display ── */}
            <div className="gallery__artists-display">
              {selectedArtist ? (
                <>
                  <div className="gallery__artists-display-header">
                    <span className="gallery__artists-display-name">
                      {selectedArtist}
                    </span>
                    <span className="gallery__artists-display-count">
                      {artistEntries.find((a) => a.name === selectedArtist)?.photos.length} PHOTOS
                    </span>
                  </div>
                  <div className="gallery__artist-grid">
                    {artistEntries
                      .find((a) => a.name === selectedArtist)
                      ?.photos.map((photo) => (
                        <button
                          key={photo.id}
                          className="gallery__artist-grid-item"
                          onClick={() => setLightboxPhoto(photo)}
                        >
                          <img
                            src={imageUrl(photo.image)}
                            alt={photo.artist}
                            loading="lazy"
                          />
                        </button>
                      ))}
                  </div>
                </>
              ) : (
                <div className="gallery__artists-display-empty">
                  <span>SELECT AN ARTIST</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          LIGHTBOX — fullscreen photo enlargement
          ══════════════════════════════════════════════ */}
      {lightboxPhoto && (
        <div className="gallery__lightbox" onClick={() => { setLightboxPhoto(null); setRotation(0); }}>
          <button
            className="gallery__lightbox-close"
            onClick={() => { setLightboxPhoto(null); setRotation(0); }}
          >
            ×
          </button>
          <button
            className="gallery__lightbox-rotate"
            onClick={(e) => { e.stopPropagation(); setRotation((r) => (r + 90) % 360); }}
            title="旋转"
          >
            ↻
          </button>
          <img
            className="gallery__lightbox-image"
            src={imageUrl(lightboxPhoto.image)}
            alt={lightboxPhoto.artist}
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: `rotate(${rotation}deg)`,
              ...(rotation % 180 === 90 ? { maxWidth: '90vh', maxHeight: '92vw' } : {}),
            }}
          />
        </div>
      )}
    </main>
  );
}
