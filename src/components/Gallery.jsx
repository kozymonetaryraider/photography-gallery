import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PhotoCard from './PhotoCard';
import photosData from '../data/photos.json';
import './Gallery.css';

export default function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';

  const categories = useMemo(() => {
    const cats = [...new Set(photosData.map((p) => p.category))];
    return ['all', ...cats];
  }, []);

  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'all') return photosData;
    return photosData.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className={`gallery ${visible ? 'gallery--visible' : ''}`}>
      {/* Hero section */}
      <section className="gallery__hero container">
        <h1 className="gallery__title">
          <span className="gallery__title-line">胶片摄影</span>
          <span className="gallery__title-line gallery__title-line--accent">
            作品集
          </span>
        </h1>
        <p className="gallery__subtitle">
          {photosData.length} 帧 · 全部由 35mm 胶片拍摄
        </p>
      </section>

      {/* Category filter bar */}
      <div className="gallery__filter-bar">
        <div className="container">
          <div className="gallery__filter-inner">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`gallery__filter-btn ${
                  activeCategory === cat ? 'gallery__filter-btn--active' : ''
                }`}
                onClick={() => {
                  if (cat === 'all') {
                    setSearchParams({});
                  } else {
                    setSearchParams({ category: cat });
                  }
                }}
              >
                <span className="gallery__filter-bracket">[</span>
                {cat === 'all' ? '全部' : cat}
                <span className="gallery__filter-bracket">]</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Masonry waterfall */}
      <div className="gallery__masonry">
        <div className="container">
          <div className="gallery__columns">
            {filteredPhotos.map((photo, index) => (
              <Link
                key={photo.id}
                to={`/photo/${photo.id}`}
                className="gallery__col-item"
                style={{ '--index': index }}
              >
                <PhotoCard photo={photo} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <footer className="gallery__footer">
        <div className="container">
          <div className="gallery__footer-divider brutal-divider" />
          <p className="gallery__footer-text">
            ALL IMAGES SHOT ON FILM · DIGITALIZED WITH CARE
          </p>
        </div>
      </footer>
    </main>
  );
}
