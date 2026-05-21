import React from 'react';
import { ShoppingCart, User, LogOut, Menu, X, Package, ShieldCheck } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar({ onCartClick, currentPath }: { onCartClick: () => void, currentPath: string }) {
  const { user, profile, cartCount } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold">V</span>
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">VELOCITY STORE</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <a href="/" className={`pb-5 pt-5 border-b-2 transition-all ${currentPath === '/' ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-slate-800'}`}>Catalog</a>
            {user && <a href="/orders" className={`pb-5 pt-5 border-b-2 transition-all ${currentPath === '/orders' ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-slate-800'}`}>Orders</a>}
            {profile?.role === 'admin' && (
              <a href="/admin" className={`pb-5 pt-5 border-b-2 transition-all ${currentPath === '/admin' ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-slate-800'}`}>Dashboard</a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button 
            onClick={onCartClick}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative"
          >
            <ShoppingCart className="w-5 h-5 text-slate-600" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-3 pl-5 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-xs font-semibold overflow-hidden">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button 
                onClick={() => signOut(auth)}
                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={login}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all active:scale-95"
            >
              Sign In
            </button>
          )}

          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-100 p-4 space-y-4 shadow-lg"
          >
            <a href="/" className={`block py-2 font-medium ${currentPath === '/' ? 'text-indigo-600' : 'text-gray-600'}`}>Shop</a>
            {user && <a href="/orders" className={`block py-2 font-medium ${currentPath === '/orders' ? 'text-indigo-600' : 'text-gray-600'}`}>Orders</a>}
            {profile?.role === 'admin' && <a href="/admin" className={`block py-2 font-bold ${currentPath === '/admin' ? 'text-indigo-600' : 'text-gray-600'}`}>Admin Dashboard</a>}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
