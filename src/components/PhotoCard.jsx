import { useState } from 'react';
import { imageUrl } from '../utils/imageUrl.js';
import './PhotoCard.css';

export default function PhotoCard({ photo }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <article className={`photo-card ${loaded ? 'photo-card--loaded' : ''}`}>
      <div className="photo-card__image-wrap">
        {!loaded && <div className="photo-card__placeholder image-loading" />}
        <img
          src={imageUrl(photo.image)}
          alt={photo.title}
          className={`photo-card__image ${loaded ? 'photo-card__image--visible' : ''}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />
        <div className="photo-card__overlay">
          <span className="photo-card__view">VIEW →</span>
        </div>
      </div>

      <div className="photo-card__info">
        <h2 className="photo-card__artist">{photo.artist}</h2>
        <h3 className="photo-card__title">{photo.title}</h3>
        <div className="photo-card__meta">
          <span className="photo-card__theme">主题: {photo.theme}</span>
          <span className="photo-card__sep">//</span>
          <span className="photo-card__category">{photo.category}</span>
        </div>
      </div>
    </article>
  );
}
