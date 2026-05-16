import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import photosData from '../data/photos.json';
import { imageUrl } from '../utils/imageUrl.js';
import './PhotoDetail.css';

export default function PhotoDetail() {
  const { id } = useParams();
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);

  const photo = photosData.find((p) => p.id === id);
  const currentIndex = photosData.findIndex((p) => p.id === id);
  const prevPhoto = currentIndex > 0 ? photosData[currentIndex - 1] : null;
  const nextPhoto =
    currentIndex < photosData.length - 1
      ? photosData[currentIndex + 1]
      : null;

  useEffect(() => {
    setLoaded(false);
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 50);
    window.scrollTo(0, 0);
    return () => clearTimeout(timer);
  }, [id]);

  if (!photo) {
    return (
      <main className="photo-detail__not-found">
        <div className="container">
          <h1>404 — 作品未找到</h1>
          <Link to="/" className="photo-detail__back-link">
            ← 返回作品集
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`photo-detail ${visible ? 'photo-detail--visible' : ''}`}
    >
      {/* Top navigation bar */}
      <div className="photo-detail__nav-bar">
        <div className="container photo-detail__nav-inner">
          <Link to="/" className="photo-detail__back">
            <span className="photo-detail__back-arrow">←</span>
            <span className="photo-detail__back-text">返回</span>
          </Link>

          <span className="photo-detail__counter">
            {String(currentIndex + 1).padStart(2, '0')}/
            {String(photosData.length).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Image section */}
      <section className="photo-detail__image-section">
        <div className="container">
          <div className="photo-detail__image-wrap">
            {!loaded && <div className="photo-detail__placeholder image-loading" />}
            <img
              src={imageUrl(photo.image)}
              alt={photo.title}
              className={`photo-detail__image ${
                loaded ? 'photo-detail__image--loaded' : ''
              }`}
              onLoad={() => setLoaded(true)}
            />
          </div>
        </div>
      </section>

      {/* Metadata section */}
      <section className="photo-detail__meta-section">
        <div className="container">
          <div className="photo-detail__meta-grid">
            <div className="photo-detail__meta-primary">
              <h1 className="photo-detail__title">{photo.title}</h1>
              <p className="photo-detail__artist">
                <span className="photo-detail__label">PHOTOGRAPHER</span>
                {photo.artist}
              </p>
            </div>

            <div className="photo-detail__meta-secondary">
              <div className="photo-detail__meta-item">
                <span className="photo-detail__label">主题</span>
                <span className="photo-detail__value">{photo.theme}</span>
              </div>
              <div className="photo-detail__meta-item">
                <span className="photo-detail__label">分类</span>
                <span className="photo-detail__value">{photo.category}</span>
              </div>
              <div className="photo-detail__meta-item">
                <span className="photo-detail__label">日期</span>
                <span className="photo-detail__value">{photo.date}</span>
              </div>
            </div>

            {photo.description && (
              <div className="photo-detail__description">
                <div className="photo-detail__label">笔记</div>
                <p>{photo.description}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Navigation between photos */}
      <section className="photo-detail__nav-section">
        <div className="container">
          <div className="photo-detail__nav-grid">
            {prevPhoto ? (
              <Link
                to={`/photo/${prevPhoto.id}`}
                className="photo-detail__nav-card photo-detail__nav-card--prev"
              >
                <span className="photo-detail__nav-direction">← 前一张</span>
                <span className="photo-detail__nav-artist">
                  {prevPhoto.artist}
                </span>
                <span className="photo-detail__nav-title">
                  {prevPhoto.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {nextPhoto ? (
              <Link
                to={`/photo/${nextPhoto.id}`}
                className="photo-detail__nav-card photo-detail__nav-card--next"
              >
                <span className="photo-detail__nav-direction">后一张 →</span>
                <span className="photo-detail__nav-artist">
                  {nextPhoto.artist}
                </span>
                <span className="photo-detail__nav-title">
                  {nextPhoto.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="photo-detail__footer">
        <div className="container">
          <div className="brutal-divider" />
          <Link to="/" className="photo-detail__footer-link">
            ← 全部作品
          </Link>
        </div>
      </footer>
    </main>
  );
}
