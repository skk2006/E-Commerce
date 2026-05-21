import React from 'react';
import { Product, CartItem, OperationType } from '../types';
import { Plus, ShoppingCart, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { handleFirestoreError } from '../lib/error-handler';
import toast from 'react-hot-toast';

export default function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = React.useState(false);

  const addToCart = async () => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    setIsAdding(true);
    const cartItemRef = doc(db, 'users', user.uid, 'cart', product.id);
    
    try {
      const snap = await getDoc(cartItemRef);
      if (snap.exists()) {
        await updateDoc(cartItemRef, {
          quantity: increment(1)
        });
      } else {
        const item: CartItem = {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          imageUrl: product.imageUrl
        };
        await setDoc(cartItemRef, item);
      }
      toast.success('Added to cart');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/cart/${product.id}`);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col group hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300">
      <div className="aspect-square bg-slate-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        {product.stock < 10 && (
          <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded">LOW STOCK</span>
        )}
      </div>
      
      <div className="flex flex-col flex-1">
        <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight mb-1">
          {product.name}
        </h4>
        <p className="text-xs text-slate-400 mb-4 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
          <span className="text-lg font-bold text-slate-900 font-mono">${product.price.toFixed(2)}</span>
          <button 
            onClick={addToCart}
            disabled={isAdding}
            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
