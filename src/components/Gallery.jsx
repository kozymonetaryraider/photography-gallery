import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  /*  0 ATM Hanson  */ { type: 'left',             r: -0.8, w: 0.62 },
  /*  1 Afircakid   */ { type: 'right',            r: 0.7,  w: 0.58 },
  /*  2 Billionhappy*/ { type: 'full',             r: 0,    w: 1    },
  /*  3 Bloodzboi   */ { type: 'right',            r: 0.7,  w: 0.58 },
  /*  4 CashTrippy  */ { type: 'left',             r: -0.8, w: 0.62 },
  /*  5 ChalkyWong  */ { type: 'full',             r: 0,    w: 1    },
  /*  6 DJ YIDA     */ { type: 'right',            r: 0.7,  w: 0.58 },
  /*  7 Haysen Cheng*/ { type: 'left',             r: -0.8, w: 0.62 },
  /*  8 Lil Asian   */ { type: 'full',             r: 0,    w: 1    },
  /*  9 SKYOCEAN    */ { type: 'portrait-contain', r: 0,    w: 1    },
  /* 10 Sebii       */ { type: 'right',            r: 0.7,  w: 0.58 },
  /* 11 THOME       */ { type: 'portrait-contain', r: 0,    w: 1    },
  /* 12 TOYOKI      */ { type: 'full',             r: 0,    w: 1    },
  /* 13 Vansdaddy   */ { type: 'full',             r: 0,    w: 1    },
  /* 14 YHL         */ { type: 'full',             r: 0,    w: 1    },
  /* 15 王齐铭WatchMe*/ { type: 'left',            r: -0.8, w: 0.62 },
];

export default function Gallery() {
  const trackRef = useRef(null);
  const [page, setPage] = useState(0);
  const [ready, setReady] = useState(false);
  const autoRef = useRef({ paused: false, timer: null, resumeTimer: null });

  /* ── Randomize photo order on each page load ── */
  const shuffledOrder = useMemo(() => {
    const indices = Array.from({ length: heroPhotos.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, []);

  /* ── Horizontal wheel-to-scroll (window level) ── */
  useEffect(() => {
    const handleWheel = (e) => {
      if (!document.body.classList.contains('gallery-active')) return;
      e.preventDefault();
      if (trackRef.current) {
        trackRef.current.scrollLeft += e.deltaY + e.deltaX;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  /* ── Keyboard arrow key navigation ── */
  useEffect(() => {
    const handleKey = (e) => {
      if (!document.body.classList.contains('gallery-active')) return;
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
    window.addEventListener('wheel', interact, { passive: true });
    window.addEventListener('keydown', interact);
    window.addEventListener('touchstart', interact, { passive: true });
    window.addEventListener('mousedown', interact);

    return () => {
      const a = autoRef.current;
      if (a.timer) clearInterval(a.timer);
      if (a.resumeTimer) clearTimeout(a.resumeTimer);
      window.removeEventListener('wheel', interact);
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
      {/* ── Horizontal scroll track ── */}
      <div className="gallery__track" ref={trackRef}>
        {shuffledOrder.map((idx, i) => {
          const photo = heroPhotos[idx];
          const cfg = LAYOUTS[idx];
          return (
            <Link
              key={photo.id}
              to={`/photo/${photo.id}`}
              className={`gallery__spread gallery__spread--${cfg.type}`}
              style={{ '--r': cfg.r, '--w': cfg.w }}
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
                <h2 className="gallery__spread-title">{photo.title}</h2>
                <div className="gallery__spread-meta">
                  <span className="gallery__spread-artist">{photo.artist}</span>
                  <span className="gallery__spread-dot">·</span>
                  <span className="gallery__spread-category">{photo.category}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Page indicator + auto-scroll badge ── */}
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
    </main>
  );
}
