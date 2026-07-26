import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Gallery from './components/Gallery';
import PhotoDetail from './components/PhotoDetail';
import About from './components/About';
import Lifestyle from './components/Lifestyle';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Gallery />} />
          <Route path="/photo/:id" element={<PhotoDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/lifestyle" element={<Lifestyle />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
