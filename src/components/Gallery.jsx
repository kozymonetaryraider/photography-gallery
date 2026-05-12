import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import photosData from '../data/photos.json';
import HERO_PHOTO_IDS from '../data/hero-photos.js';
import './Gallery.css';

const AUTO_INTERVAL = 4000; // ms per page
const RESUME_DELAY = 8000;  // ms of inactivity before auto-scroll resumes

/* ── Filter down to one hero photo per artist ── */
const heroPhotos = HERO_PHOTO_IDS
  .map((id) => photosData.find((p) => p.id === id))
  .filter(Boolean);

/**
 * Each photo is permanently paired with its layout by index:
 *   LAYOUTS[i] ←→ heroPhotos[i]
 *
 * When shuffled, the shuffled indices keep each photo + layout
 * paired together — so every photo always gets its correct layout.
 */
const LAYOUTS = [
  /*  0 ATM Hanson  */ { type: 'full',             r: 0,    w: 1    },
  /*  1 Afircakid   */ { type: 'portrait-contain', r: -1.5, w: 1, ox: 'left',   oy: 'center' },
  /*  2 Asen        */ { type: 'full',             r: 0,    w: 1    },
  /*  3 Billionhappy*/ { type: 'full',             r: 0,    w: 1    },
  /*  4 Bloodzboi   */ { type: 'right',            r: 0.7,  w: 0.58 },
  /*  5 CashTrippy  */ { type: 'left',             r: -0.8, w: 0.62 },
  /*  6 ChalkyWong  */ { type: 'full',             r: 0,    w: 1    },
  /*  7 DJ YIDA     */ { type: 'full',             r: 0,    w: 1    },
  /*  8 Haysen Cheng*/ { type: 'left',             r: -0.8, w: 0.62 },
  /*  9 Lil Asian   */ { type: 'portrait-contain', r: 0.8,  w: 1, ox: 'right',  oy: 'center' },
  /* 10 SKYOCEAN    */ { type: 'portrait-contain', r: 0,    w: 1, ox: 'center', oy: 'center' },
  /* 11 Sebii       */ { type: 'full',             r: 0,    w: 1    },
  /* 12 THOME       */ { type: 'portrait-contain', r: -1.2, w: 1, ox: 'center', oy: 'top'    },
  /* 13 TOYOKI      */ { type: 'portrait-contain', r: 1.5,  w: 1, ox: 'right',  oy: 'bottom' },
  /* 14 Vansdaddy   */ { type: 'portrait-contain', r: -0.8, w: 1, ox: 'left',   oy: 'bottom' },
  /* 15 YHL         */ { type: 'full',             r: 0,    w: 1    },
  /* 16 王齐铭WatchMe*/ { type: 'left',            r: -0.8, w: 0.62 },
];

/* ── Group all photos by artist, preserving HERO_PHOTO_IDS order ── */
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
  const seen = new Set();
  for (const id of HERO_PHOTO_IDS) {
    const p = photosData.find((ph) => ph.id === id);
    if (p && !seen.has(p.artist)) {
      seen.add(p.artist);
      order.push({
        name: p.artist,
        themes: [...groups.get(p.artist).themes].filter(Boolean),
        photos: groups.get(p.artist).photos,
      });
    }
  }
  return order;
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

  /* ── Randomize photo order on each page load ── */
  const shuffledOrder = useMemo(() => {
    const indices = Array.from({ length: heroPhotos.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
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
          {shuffledOrder.map((idx, i) => {
            const photo = heroPhotos[idx];
            const cfg = LAYOUTS[idx];
            return (
              <button
                key={photo.id}
                onClick={() => handleSpreadClick(photo.artist)}
                className={`gallery__spread gallery__spread--${cfg.type}`}
                style={{ '--r': cfg.r, '--w': cfg.w, '--ox': cfg.ox || 'center', '--oy': cfg.oy || 'center' }}
              >
                <div className="gallery__spread-image-wrap">
                  <img
                    src={photo.image}
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
                            src={photo.image}
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
            src={lightboxPhoto.image}
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
