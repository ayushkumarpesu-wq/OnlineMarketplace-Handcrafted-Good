import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

const safeReadCart = () => {
  if (typeof window === 'undefined') return [];

  try {
    const saved = localStorage.getItem('cart');
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(safeReadCart);

  const persistCart = (nextCart) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(nextCart));
    }
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item._id === product._id);
      let newCart;

      if (existing) {
        newCart = prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: Number(item.quantity || 0) + 1 } : item
        );
      } else {
        newCart = [...prevCart, { ...product, quantity: 1 }];
      }

      persistCart(newCart);
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item._id !== productId);
      persistCart(newCart);
      return newCart;
    });
  };

  const updateQuantity = (productId, quantity) => {
    const nextQuantity = Number(quantity);

    if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) => {
      const newCart = prevCart.map((item) =>
        item._id === productId ? { ...item, quantity: nextQuantity } : item
      );
      persistCart(newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart');
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
