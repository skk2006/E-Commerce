import React from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { UserProfile, CartItem, OperationType } from '../types';
import { handleFirestoreError } from '../lib/error-handler';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  cart: CartItem[];
  cartCount: number;
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  cart: [],
  cartCount: 0
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch or create profile
        const userRef = doc(db, 'users', user.uid);
        
        // Listen to profile
        const unsubProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Create default profile
            const role = user.email === 'cognitivebeats74@gmail.com' ? 'admin' : 'user';
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email!,
              role: role as 'admin' | 'user',
              displayName: user.displayName || 'Guest',
              createdAt: new Date().toISOString()
            };
            setDoc(userRef, {
              ...newProfile,
              createdAt: serverTimestamp()
            }).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`));
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        });

        // Listen to cart
        const cartRef = collection(db, 'users', user.uid, 'cart');
        const unsubCart = onSnapshot(cartRef, (snap) => {
          const items = snap.docs.map(doc => doc.data() as CartItem);
          setCart(items);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/cart`);
        });

        return () => {
          unsubProfile();
          unsubCart();
        };
      } else {
        setProfile(null);
        setCart([]);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AuthContext.Provider value={{ user, profile, loading, cart, cartCount }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => React.useContext(AuthContext);
