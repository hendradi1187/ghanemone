import { Routes, Route } from 'react-router-dom';

// Placeholder admin shell. Phase 8/9: provisioning queue, audit log, ops dashboards.
export default function App(): JSX.Element {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
            <h1>Ghanem.one — Admin</h1>
            <p>Admin scaffold — Phase 7. Modul user-provisioning + audit log di-port di Phase 8/9.</p>
          </main>
        }
      />
    </Routes>
  );
}
