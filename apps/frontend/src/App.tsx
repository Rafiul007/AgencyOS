import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '@/features/landing/LandingPage';

// Feature routes will be lazy-loaded and registered here as modules are built.
export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
    </Routes>
  );
}
