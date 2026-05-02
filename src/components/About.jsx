import './About.css';

export default function About() {
  return (
    <main className="about">
      <section className="about__hero container">
        <h1 className="about__title">
          <span className="about__title-line">关于</span>
          <span className="about__title-line about__title-line--accent">
            这个项目
          </span>
        </h1>
      </section>

      <section className="about__content container">
        <div className="about__grid">
          <div className="about__text">
            <p>
              这是一个用 35mm 胶片记录人与空间的摄影项目。每一帧都经过手工冲洗和扫描，
              保留了银盐颗粒最原始的质感。
            </p>
            <p>
              我不追求技术上的完美。曝光失误、颗粒粗糙、边缘漏光——这些"瑕疵"恰恰是胶片
              摄影最诚实的语言。它们证明了这张照片是在某个真实的瞬间、真实的空间中产生的，
              而非数字算法的虚构。
            </p>
            <p>
              我拍摄那些在过渡状态中的人：等车的人、抽烟的人、发呆的人、拥抱的人。
              在等待与行动之间，人们卸下了表演，露出了更真实的样子。
            </p>
          </div>

          <div className="about__specs">
            <h2 className="about__specs-title">设备与工艺</h2>
            <ul className="about__specs-list">
              <li>
                <span className="about__specs-key">相机</span>
                <span className="about__specs-val">Nikon FM2 / Leica M6</span>
              </li>
              <li>
                <span className="about__specs-key">胶卷</span>
                <span className="about__specs-val">Kodak Portra 400 / Tri-X 400 / Fuji Superia</span>
              </li>
              <li>
                <span className="about__specs-key">冲洗</span>
                <span className="about__specs-val">C-41 标准工艺 / 自冲</span>
              </li>
              <li>
                <span className="about__specs-key">扫描</span>
                <span className="about__specs-val">Noritsu HS-1800 / Epson V850</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="about__approach">
          <div className="brutal-divider" />
          <p className="about__approach-text">
            "照片是时间的切片。胶片是时间的容器。"
          </p>
        </div>
      </section>

      <footer className="about__footer">
        <div className="container">
          <div className="brutal-divider" />
          <p className="about__footer-text">
            © {new Date().getFullYear()} RAW GRAIN · ALL RIGHTS RESERVED
          </p>
        </div>
      </footer>
    </main>
  );
}
