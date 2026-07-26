import { LIFESTYLE_SERIES } from '../data/lifestyle.js';
import { imageUrl } from '../utils/imageUrl.js';
import './Lifestyle.css';

export default function Lifestyle() {
  return (
    <main className="lifestyle">
      {LIFESTYLE_SERIES.map((series) => (
        <article className="lifestyle__series" key={series.id}>
          <div className="lifestyle__cover container">
            <img
              src={imageUrl(series.cover)}
              alt={`${series.title} lookbook cover`}
              className="lifestyle__cover-image"
              fetchPriority="high"
            />
            <div className="lifestyle__cover-caption">
              <h2>{series.title}</h2>
            </div>
          </div>

          <div className="lifestyle__grid container">
            {series.photos.map((photo) => (
              <figure className="lifestyle__frame" key={photo}>
                <img
                  src={imageUrl(photo)}
                  alt={`${series.title} lifestyle photograph`}
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        </article>
      ))}
    </main>
  );
}
