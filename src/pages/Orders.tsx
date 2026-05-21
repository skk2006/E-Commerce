import React from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Order, OperationType } from '../types';
import { handleFirestoreError } from '../lib/error-handler';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ChevronRight, Package, Truck, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return unsubscribe;
  }, [user]);

  if (!user) {
    return (
      <div className="pt-32 text-center py-24">
        <h1 className="text-xl font-bold text-gray-900">Please sign in to view your orders</h1>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-sans font-bold tracking-tight uppercase text-slate-800">My Orders</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Tracking {orders.length} shipments</p>
        </div>
        <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
          <ShoppingBag className="w-8 h-8 text-indigo-100" />
        </div>
      </div>

      <div className="space-y-10">
        {loading ? (
          [1,2,3].map(n => <div key={n} className="h-44 bg-slate-100 animate-pulse rounded-3xl" />)
        ) : orders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-4">
            <Package className="w-16 h-16 text-slate-100 mx-auto" />
            <p className="font-bold uppercase tracking-[0.2em] text-[10px] text-slate-400 italic">No historical data available</p>
          </div>
        ) : (
          orders.map((order) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={order.id} 
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-100/20 transition-all"
            >
              <div className="p-8 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <Package className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">REF #{order.id.slice(-6)}</span>
                    <h3 className="text-lg font-bold text-slate-800 mt-0.5">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                   <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Status</span>
                    <div className="flex items-center gap-2 text-indigo-600">
                      {order.status === 'pending' && <Package className="w-4 h-4 opacity-50" />}
                      {order.status === 'shipped' && <Truck className="w-4 h-4" />}
                      {order.status === 'delivered' && <CheckCircle2 className="w-4 h-4" />}
                      <span className="text-sm font-bold uppercase tracking-widest">{order.status}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-200" />
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-50">
                      <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-white shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate text-sm">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-sm tracking-tighter">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">Shipping Profile</p>
                      <p className="text-xs text-slate-600 font-medium">{order.shippingAddress}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">Transaction Total</p>
                    <p className="text-4xl font-bold font-mono text-slate-900 tracking-tighter">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
