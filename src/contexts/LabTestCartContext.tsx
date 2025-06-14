
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LabTest } from '@/types/supabase';
import { toast } from 'sonner';

interface LabTestCartContextType {
  cartItems: LabTest[];
  addToCart: (test: LabTest) => void;
  removeFromCart: (testId: number) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
}

const LabTestCartContext = createContext<LabTestCartContextType | undefined>(undefined);

export const LabTestCartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<LabTest[]>([]);

  const addToCart = (test: LabTest) => {
    setCartItems((prevItems) => {
      if (prevItems.find((item) => item.testid === test.testid)) {
        toast.info(`${test.testname} is already in your cart.`);
        return prevItems;
      }
      toast.success(`${test.testname} added to cart.`);
      return [...prevItems, test];
    });
  };

  const removeFromCart = (testId: number) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.testid !== testId);
      if (newItems.length < prevItems.length) {
        toast.success(`Test removed from cart.`);
      }
      return newItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
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
