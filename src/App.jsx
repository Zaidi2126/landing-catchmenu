import { Routes, Route } from 'react-router-dom';
import { ArProvider } from './context/ArContext';
import Landing from './pages/Landing';
import MenuPage from './pages/MenuPage';

export default function App() {
  return (
    <ArProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/:slug" element={<MenuPage />} />
      </Routes>
    </ArProvider>
  );
}
