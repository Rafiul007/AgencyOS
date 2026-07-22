import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { LandingPage } from '@/features/landing/LandingPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppShell } from '@/features/dashboard/components/AppShell';

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
const ContactsPage = lazy(() =>
  import('@/features/contacts/ContactsPage').then((m) => ({ default: m.ContactsPage })),
);
const ContactsBoardPage = lazy(() =>
  import('@/features/contacts/ContactsBoardPage').then((m) => ({ default: m.ContactsBoardPage })),
);
const QuotationsListPage = lazy(() =>
  import('@/features/quotations/QuotationsListPage').then((m) => ({
    default: m.QuotationsListPage,
  })),
);
const QuoteBuilderPage = lazy(() =>
  import('@/features/quotations/QuoteBuilderPage').then((m) => ({ default: m.QuoteBuilderPage })),
);
const TemplatesPage = lazy(() =>
  import('@/features/quotations/TemplatesPage').then((m) => ({ default: m.TemplatesPage })),
);
const QuoteDetailPage = lazy(() =>
  import('@/features/quotations/QuoteDetailPage').then((m) => ({ default: m.QuoteDetailPage })),
);
const PublicQuotePage = lazy(() =>
  import('@/features/quotations/PublicQuotePage').then((m) => ({ default: m.PublicQuotePage })),
);
const InvoicesListPage = lazy(() =>
  import('@/features/invoices/InvoicesListPage').then((m) => ({ default: m.InvoicesListPage })),
);
const InvoiceBuilderPage = lazy(() =>
  import('@/features/invoices/InvoiceBuilderPage').then((m) => ({ default: m.InvoiceBuilderPage })),
);
const InvoiceDetailPage = lazy(() =>
  import('@/features/invoices/InvoiceDetailPage').then((m) => ({ default: m.InvoiceDetailPage })),
);
const PublicInvoicePage = lazy(() =>
  import('@/features/invoices/PublicInvoicePage').then((m) => ({ default: m.PublicInvoicePage })),
);
const TeamPage = lazy(() =>
  import('@/features/team/TeamPage').then((m) => ({ default: m.TeamPage })),
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
        {/* Public, no-login client links */}
        <Route path="/q/:token" element={<PublicQuotePage />} />
        <Route path="/i/:token" element={<PublicInvoicePage />} />
        <Route element={<ProtectedRoute />}>
          {/* Onboarding is a standalone full-screen wizard (no dashboard shell). */}
          <Route path="/onboarding" element={<OnboardingPage />} />
          {/* Everything else shares the persistent shell — no flicker between pages. */}
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/contacts/board" element={<ContactsBoardPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/quotations" element={<QuotationsListPage />} />
            <Route path="/quotations/templates" element={<TemplatesPage />} />
            <Route path="/quotations/new" element={<QuoteBuilderPage />} />
            <Route path="/quotations/:id" element={<QuoteDetailPage />} />
            <Route path="/quotations/:id/edit" element={<QuoteBuilderPage />} />
            <Route path="/invoices" element={<InvoicesListPage />} />
            <Route path="/invoices/new" element={<InvoiceBuilderPage />} />
            <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="/invoices/:id/edit" element={<InvoiceBuilderPage />} />
            <Route path="/settings/team" element={<TeamPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
