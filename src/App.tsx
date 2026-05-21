import React from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Orders from './pages/Orders';
import CartSidebar from './components/CartSidebar';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);

  // Simple routing
  React.useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    
    // Intercept anchor clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.origin === window.location.origin) {
        e.preventDefault();
        window.history.pushState(null, '', anchor.pathname);
        setCurrentPath(anchor.pathname);
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  let page = <Home />;
  if (currentPath === '/admin') page = <Admin />;
  if (currentPath === '/orders') page = <Orders />;

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-indigo-100">
        <Toaster position="bottom-right" />
        <Navbar onCartClick={() => setIsCartOpen(true)} currentPath={currentPath} />
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        
        <main>
          {page}
        </main>

        <footer className="h-10 bg-slate-100 border-t border-slate-200 flex items-center justify-between px-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest shrink-0">
          <div>VELOCITY BACKEND V2.1.0 • ONLINE • © 2026</div>
          <div className="hidden md:flex gap-6 italic">
            <span>SECURE CHECKOUT ENABLED</span>
            <span>DB: CLOUD_FIRESTORE_PROD</span>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
