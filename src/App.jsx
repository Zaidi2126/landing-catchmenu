import { Routes, Route } from 'react-router-dom';
import { ArProvider } from './context/ArContext';
import Landing from './pages/Landing';
import MenuPage from './pages/MenuPage';
import NotFoundPage from './pages/NotFoundPage';
import ErrorBoundary from './components/ErrorBoundary';
import './pages/error-pages.css';

export default function App() {
  return (
    <ArProvider>
      <Routes>
        <Route path="/" element={<Landing />} errorElement={<ErrorBoundary />} />
        <Route path="/:slug" element={<MenuPage />} errorElement={<ErrorBoundary />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ArProvider>
  );
}
