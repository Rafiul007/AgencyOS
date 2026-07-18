import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { LandingPage } from '@/features/landing/LandingPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Authenticated surfaces are code-split so the public landing bundle stays small.
const LoginPage = lazy(() =>
  import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('@/features/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
const OnboardingPage = lazy(() =>
  import('@/features/onboarding/OnboardingPage').then((m) => ({ default: m.OnboardingPage })),
);
const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const CatalogPage = lazy(() =>
  import('@/features/catalog/CatalogPage').then((m) => ({ default: m.CatalogPage })),
);
const ClientsPage = lazy(() =>
  import('@/features/clients/ClientsPage').then((m) => ({ default: m.ClientsPage })),
);
const QuotationsListPage = lazy(() =>
  import('@/features/quotations/QuotationsListPage').then((m) => ({
    default: m.QuotationsListPage,
  })),
);
const QuoteBuilderPage = lazy(() =>
  import('@/features/quotations/QuoteBuilderPage').then((m) => ({ default: m.QuoteBuilderPage })),
);
const QuoteDetailPage = lazy(() =>
  import('@/features/quotations/QuoteDetailPage').then((m) => ({ default: m.QuoteDetailPage })),
);
const PublicQuotePage = lazy(() =>
  import('@/features/quotations/PublicQuotePage').then((m) => ({ default: m.PublicQuotePage })),
);

function PageFallback() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <CircularProgress />
    </Box>
  );
}

export function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Public, no-login client quote link */}
        <Route path="/q/:token" element={<PublicQuotePage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/quotations" element={<QuotationsListPage />} />
          <Route path="/quotations/new" element={<QuoteBuilderPage />} />
          <Route path="/quotations/:id" element={<QuoteDetailPage />} />
          <Route path="/quotations/:id/edit" element={<QuoteBuilderPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
