import { useEffect, useState } from 'react';
import { AdminDashboard } from './AdminDashboard';
import App from './App';

function getRoute(): 'admin' | 'home' {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  return path === '/admin' ? 'admin' : 'home';
}

export function Router() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onNavigate = () => setRoute(getRoute());
    window.addEventListener('popstate', onNavigate);
    return () => window.removeEventListener('popstate', onNavigate);
  }, []);

  if (route === 'admin') return <AdminDashboard />;
  return <App />;
}
