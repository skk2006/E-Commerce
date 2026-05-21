import React from 'react';
import { X, ShoppingBag, Trash2, ChevronRight, PackageCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, deleteDoc, updateDoc, collection, addDoc, serverTimestamp, getDocs, writeBatch } from 'firebase/firestore';
import { handleFirestoreError } from '../lib/error-handler';
import { OperationType, Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export default function CartSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, cart } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const removeItem = async (productId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'cart', productId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/cart/${productId}`);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user || quantity < 1) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'cart', productId), { quantity });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/cart/${productId}`);
    }
  };

  const checkout = async () => {
    if (!user || cart.length === 0) return;
    setIsCheckingOut(true);
    
    try {
      const orderRef = collection(db, 'orders');
      const orderData = {
        userId: user.uid,
        items: cart,
        total,
        status: 'pending',
        shippingAddress: '123 Elite St, Commerce City, EC 10101', // Example
        createdAt: serverTimestamp()
      };
      
      const newOrder = await addDoc(orderRef, orderData);
      
      // Clear cart
      const batch = writeBatch(db);
      const cartSnap = await getDocs(collection(db, 'users', user.uid, 'cart'));
      cartSnap.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      
      toast.success('Order placed successfully!');
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'orders');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                   <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-bold text-xl text-slate-800 tracking-tight">Shopping Bag</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
                  <ShoppingBag className="w-20 h-20 opacity-10" />
                  <p className="font-bold uppercase tracking-[0.2em] text-[10px]">Your bag is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="flex gap-5">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-24 h-24 object-cover rounded-2xl bg-slate-50 border border-slate-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 flex flex-col pt-1">
                      <h4 className="font-bold text-slate-800 truncate">{item.name}</h4>
                      <p className="font-mono text-indigo-600 font-bold text-lg">${item.price.toFixed(2)}</p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-1.5 border border-slate-100">
                          <button 
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-lg shadow-sm transition-all text-slate-600"
                          >-</button>
                          <span className="w-6 text-center text-xs font-bold font-mono">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-lg shadow-sm transition-all text-slate-600"
                          >+</button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.productId)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between mb-8">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Estimated Total</span>
                <span className="text-3xl font-bold text-slate-900 font-mono">${total.toFixed(2)}</span>
              </div>
              
              <button 
                onClick={checkout}
                disabled={cart.length === 0 || isCheckingOut}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Proceed to Checkout
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-6 font-bold uppercase tracking-[0.2em]">Secure Checkout Powered by EliteCommerce</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
