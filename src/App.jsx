import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './hooks/useUser.jsx';
import { AuthGuard } from './routes/AuthGuard.jsx';
import Splash from './routes/Splash.jsx';
import Landing from './routes/Landing.jsx';
import Auth, { NameSetup } from './routes/Auth.jsx';
import AppShell from './routes/AppShell.jsx';
import Dashboard from './routes/Dashboard.jsx';
import Chat from './routes/Chat.jsx';
import BeccaComingSoon from './routes/BeccaComingSoon.jsx';
import Emergency from './routes/Emergency.jsx';
import { isBeccaEnabled } from './lib/features.js';
import Phases from './routes/Phases.jsx';
import Settings from './routes/Settings.jsx';
import Payment from './routes/Payment.jsx';
import Whitepaper, { Privacy, Terms } from './routes/Legal.jsx';

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/signup/name" element={<NameSetup />} />
            <Route path="/learn" element={<Whitepaper />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            <Route
              path="/app"
              element={
                <AuthGuard>
                  <AppShell />
                </AuthGuard>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="chat" element={isBeccaEnabled() ? <Chat /> : <BeccaComingSoon />} />
              <Route path="emergency" element={<Emergency />} />
              <Route path="phases" element={<Phases />} />
              <Route path="settings" element={<Settings />} />
              <Route path="payment" element={<Payment />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
