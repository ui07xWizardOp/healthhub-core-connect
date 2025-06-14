
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LabTest, TestPanel } from '@/types/supabase';
import { toast } from 'sonner';

export type CartItem = (LabTest & { type: 'test' }) | (TestPanel & { type: 'panel' });

interface LabTestCartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: number, itemType: 'test' | 'panel') => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
}

const LabTestCartContext = createContext<LabTestCartContextType | undefined>(undefined);

export const LabTestCartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCartItems((prevItems) => {
      const isPresent = prevItems.some((i) => {
        if (i.type === 'test' && item.type === 'test') {
          return i.testid === item.testid;
        }
        if (i.type === 'panel' && item.type === 'panel') {
          return i.panelid === item.panelid;
        }
        return false;
      });

      const name = item.type === 'test' ? item.testname : item.panelname;

      if (isPresent) {
        toast.info(`${name} is already in your cart.`);
        return prevItems;
      }
      toast.success(`${name} added to cart.`);
      return [...prevItems, item];
    });
  };

  const removeFromCart = (itemId: number, itemType: 'test' | 'panel') => {
    setCartItems((prevItems) => {
      const itemToRemove = prevItems.find(item => {
        if (item.type === itemType) {
          if (itemType === 'test' && item.testid === itemId) return true;
          if (itemType === 'panel' && item.panelid === itemId) return true;
        }
        return false;
      });

      if (itemToRemove) {
        const name = itemToRemove.type === 'test' ? itemToRemove.testname : itemToRemove.panelname;
        toast.success(`${name} removed from cart.`);
      }

      return prevItems.filter((item) => {
        if (item.type === 'test' && itemType === 'test') {
          return item.testid !== itemId;
        }
        if (item.type === 'panel' && itemType === 'panel') {
          return item.panelid !== itemId;
        }
        return true;
      });
    });
  };

  const clearCart = () => {
    setCartItems([]);
    toast.info("Cart cleared.");
  };

  const cartCount = cartItems.length;

  const totalPrice = cartItems.reduce((total, item) => total + (item.price || 0), 0);

  return (
    <LabTestCartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, cartCount, totalPrice }}>
      {children}
    </LabTestCartContext.Provider>
  );
};

export const useLabTestCart = () => {
  const context = useContext(LabTestCartContext);
  if (context === undefined) {
    throw new Error('useLabTestCart must be used within a LabTestCartProvider');
  }
  return context;
};
