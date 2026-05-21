import React from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy, onSnapshot, writeBatch } from 'firebase/firestore';
import { Product, Order, OperationType } from '../types';
import { handleFirestoreError } from '../lib/error-handler';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Package, ShoppingBag, Loader2, RefreshCcw, LayoutDashboard, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const SEED_PRODUCTS = [
  {
    name: "Lumina Series 7 Watch",
    description: "Seamless health tracking & high-definition OLED display. Premium stainless steel casing with a breathable silicone strap.",
    price: 349.00,
    category: "Accessories",
    stock: 45,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Studio X1 Headphones",
    description: "Active Noise Canceling, 40h battery life, and crystal clear spatial audio. Designed for professional creators.",
    price: 299.00,
    category: "Audio",
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Ergo-Keyboard Pro",
    description: "Multi-device mechanical keyboard with a split-design for maximum comfort. RGB backlit with custom switches.",
    price: 189.50,
    category: "Electronics",
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Minimalist LED Lamp",
    description: "Ultra-thin aluminum desk lamp with touch-control brightness and adjustable color temperatures.",
    price: 89.00,
    category: "Office",
    stock: 60,
    imageUrl: "https://images.unsplash.com/photo-1534073828943-f801091bb270?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Walnut Laptop Stand",
    description: "Hand-crafted from solid walnut wood. Ergonomically designed to raise your screen to eye level.",
    price: 124.00,
    category: "Office",
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Obsidian Desk Mat",
    description: "Premium vegan leather desk mat with anti-slip base and waterproof surface. Large size for full coverage.",
    price: 49.00,
    category: "Accessories",
    stock: 120,
    imageUrl: "https://images.unsplash.com/photo-1593642532400-2682810df593?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Smart Water Bottle",
    description: "Tracks your hydration goals and syncs with your fitness apps. Keeps drinks cold for 24 hours.",
    price: 45.00,
    category: "Lifestyle",
    stock: 85,
    imageUrl: "https://images.unsplash.com/photo-1602143307185-84e67241782e?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Portable SSD 2TB",
    description: "Rugged, water-resistant external SSD with lightning-fast 1050MB/s read speeds. USB-C 3.2 Gen 2.",
    price: 199.99,
    category: "Electronics",
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1597334282384-25e40e676161?auto=format&fit=crop&q=80&w=800"
  }
];

export default function Admin() {
  const { profile } = useAuth();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isSeeding, setIsSeeding] = React.useState(false);
  const [view, setView] = React.useState<'products' | 'orders'>('products');

  // New Product Form State
  const [newProduct, setNewProduct] = React.useState({
    name: '',
    description: '',
    price: '',
    category: 'General',
    stock: '',
    imageUrl: ''
  });

  React.useEffect(() => {
    if (profile?.role !== 'admin') return;

    const unsubProducts = onSnapshot(query(collection(db, 'products'), orderBy('createdAt', 'desc')), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });

    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snap) => {
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    });

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, [profile]);

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        createdAt: serverTimestamp()
      });
      setNewProduct({ name: '', description: '', price: '', category: 'General', stock: '', imageUrl: '' });
      toast.success('Product added!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const seedData = async () => {
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      SEED_PRODUCTS.forEach(p => {
        const ref = doc(collection(db, 'products'));
        batch.set(ref, { ...p, createdAt: serverTimestamp() });
      });
      await batch.commit();
      toast.success('Products seeded!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to seed');
    } finally {
      setIsSeeding(false);
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="pt-32 text-center">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="text-gray-500">Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-sans font-bold tracking-tight uppercase text-slate-800">Admin Console</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Management Hub</p>
          </div>

          <div className="flex items-center gap-2 p-1 bg-slate-200/50 rounded-2xl">
            <button 
              onClick={() => setView('products')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                view === 'products' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Products
            </button>
            <button 
              onClick={() => setView('orders')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                view === 'orders' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              Orders
            </button>
          </div>
        </div>

        {view === 'products' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(p => (
              <motion.div 
                layout
                key={p.id} 
                className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-5 group hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-100/30 transition-all"
              >
                <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-xl object-cover bg-slate-50" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 truncate">{p.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.category} • ${p.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">STOCK</p>
                  <p className={`font-mono font-bold text-sm ${p.stock < 10 ? 'text-red-500' : 'text-slate-900'}`}>{p.stock}</p>
                </div>
                <button 
                  onClick={() => deleteProduct(p.id)}
                  className="p-2.5 text-slate-200 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(o => (
              <div key={o.id} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Order #{o.id.slice(-6)}</span>
                      <h3 className="text-sm font-bold text-slate-800">{new Date(o.createdAt).toLocaleDateString()}</h3>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    o.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                  }`}>
                    {o.status}
                  </span>
                </div>
                
                <div className="space-y-4 pt-6 border-t border-slate-50">
                  {o.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm font-medium">
                      <span className="text-slate-600">{item.name} <span className="text-slate-300">x{item.quantity}</span></span>
                      <span className="font-mono text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-8 bg-slate-50/50 -mx-8 -mb-8 p-8 rounded-b-3xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <p className="mb-1 opacity-50">SHIPPING DESTINATION</p>
                    <p className="text-slate-600 leading-relaxed">{o.shippingAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">TOTAL TRANSACTION</p>
                    <p className="text-3xl font-bold text-indigo-600 font-mono tracking-tighter">${o.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <aside className="w-full md:w-96 shrink-0 lg:sticky lg:top-28 lg:h-fit">
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl shadow-slate-200">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            Create Entry
          </h2>
          <form onSubmit={addProduct} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Product Title</label>
              <input 
                 required
                 placeholder="e.g. Minimalist Lamp"
                 value={newProduct.name}
                 onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                 className="w-full bg-slate-800 p-4 rounded-2xl border-none text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all placeholder:text-slate-600"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Detailed Description</label>
              <textarea 
                 required
                 placeholder="Hardware features, dimensions..."
                 value={newProduct.description}
                 onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                 className="w-full bg-slate-800 p-4 rounded-2xl border-none text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all h-28 placeholder:text-slate-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Unit Price</label>
                <input 
                   required
                   type="number"
                   placeholder="0.00"
                   value={newProduct.price}
                   onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                   className="w-full bg-slate-800 p-4 rounded-2xl border-none text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Inventory</label>
                <input 
                   required
                   type="number"
                   placeholder="Qnty"
                   value={newProduct.stock}
                   onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                   className="w-full bg-slate-800 p-4 rounded-2xl border-none text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Hero Asset URL</label>
              <input 
                 required
                 placeholder="https://images..."
                 value={newProduct.imageUrl}
                 onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})}
                 className="w-full bg-slate-800 p-4 rounded-2xl border-none text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all placeholder:text-slate-600"
              />
            </div>

            <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 mt-4">
              Push to Catalog
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-800">
            <button 
              onClick={seedData} 
              className="w-full border border-slate-800 text-slate-500 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 hover:text-slate-300 transition-all"
              disabled={isSeeding}
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
              Import Master Catalog
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
