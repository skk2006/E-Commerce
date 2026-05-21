import React from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Product, OperationType } from '../types';
import { handleFirestoreError } from '../lib/error-handler';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('All');

  React.useEffect(() => {
    // Remove orderBy to ensure results show even without an index or missing createdAt
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const p = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      // Sort in memory instead
      p.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setProducts(p);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Listen Error:", error);
      setLoading(false);
      // We don't throw here to allow the UI to at least show the empty state/samples
    });
    return unsubscribe;
  }, []);

  const SAMPLE_PRODUCTS: Product[] = [
    {
      id: 'sample-1',
      name: "Lumina Series 7 Watch",
      description: "Seamless health tracking & high-definition OLED display.",
      price: 349.00,
      category: "Accessories",
      stock: 45,
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-2',
      name: "Studio X1 Headphones",
      description: "Active Noise Canceling with crystal clear spatial audio.",
      price: 299.00,
      category: "Audio",
      stock: 20,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-3',
      name: "Ergo-Keyboard Pro",
      description: "Mechanical split-design for maximum ergonomic comfort.",
      price: 189.50,
      category: "Electronics",
      stock: 30,
      imageUrl: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800",
      createdAt: new Date().toISOString()
    }
  ];

  const categories = ['All', ...Array.from(new Set([...products, ...SAMPLE_PRODUCTS].map(p => p.category)))];
  
  const displayProducts = products.length > 0 ? products : SAMPLE_PRODUCTS;

  const filteredProducts = displayProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-16 flex">
      {/* Sidebar Filters */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 p-8 flex-col gap-10 shrink-0 sticky top-16 h-[calc(100vh-64px)]">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Categories</h3>
          <ul className="space-y-4 text-sm text-slate-600 font-medium">
            {categories.map(cat => (
              <li 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center justify-between cursor-pointer transition-colors group ${activeCategory === cat ? 'text-indigo-600 font-bold' : 'hover:text-indigo-600'}`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded transition-colors ${activeCategory === cat ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                  {cat === 'All' ? products.length : products.filter(p => p.category === cat).length}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Price Filter</h3>
          <div className="h-1 bg-slate-100 rounded-full relative mb-4">
            <div className="absolute h-1 bg-indigo-600 left-0 right-0 rounded-full"></div>
            <div className="absolute w-3 h-3 bg-white border-2 border-indigo-600 rounded-full -top-1 left-0 shadow-sm"></div>
            <div className="absolute w-3 h-3 bg-white border-2 border-indigo-600 rounded-full -top-1 right-0 shadow-sm"></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
            <span>$0</span>
            <span>$10,000+</span>
          </div>
        </div>

        <div className="mt-auto bg-slate-900 rounded-2xl p-5 text-white shadow-xl shadow-slate-200">
          <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest mb-1">Status</p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold">Store Online</span>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
          </div>
          <button className="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">
            Contact Support
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="flex-1 p-8 overflow-hidden">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Premium Catalog</h2>
            <p className="text-xs text-slate-400 font-medium">Discover curated minimalist essentials</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search catalog..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-64 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300"
              />
            </div>
            <button className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all">Sort: Featured</button>
          </div>
        </div>

        {/* Mobile categories (hidden on lg) */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${
                activeCategory === cat 
                ? 'bg-indigo-600 text-white border-indigo-600' 
                : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(n => (
              <div key={n} className="animate-pulse bg-slate-200 aspect-square rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            {products.length === 0 && (
              <div className="mb-8 p-6 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-amber-800 text-sm">Demo Mode Active</h4>
                  <p className="text-amber-600 text-xs mt-0.5">Showing sample products. Sign in as admin to save them to your database.</p>
                </div>
                <a href="/admin" className="px-4 py-2 bg-amber-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-amber-700 transition-colors">
                  Go to Admin
                </a>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-slate-300">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-[0.2em] text-[10px]">No products in catalog</p>
          </div>
        )}
      </section>
    </div>
  );
}

function PackageCheck(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-package-check"><path d="m16 16 2 2 4-4"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><path d="M3.29 7.7 12 12.6l8.71-4.9"/><path d="M12 22.5V12.5"/>
    </svg>
  );
}
