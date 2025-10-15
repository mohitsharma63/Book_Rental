import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: string;
  bookId: string;
  title: string;
  author: string;
  imageUrl: string;
  price: number;
  rentalDuration: number;
  rentalPeriodLabel?: string; // Added for rental period label
  quantity: number;
  available: boolean;
}

interface WishlistItem {
  id: string;
  bookId: string;
  title: string;
  author: string;
  imageUrl: string;
  available: boolean;
  price: number;
  rating: number;
  dateAdded: string;
  category: string;
}

interface StoreContextType {
  cartItems: CartItem[];
  wishlistItems: WishlistItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  updateCartItemRentalDuration: (id: string, newPeriod: string, newDuration: number) => void;
  clearCart: () => void;
  clearWishlist: () => void;
  clearAllData: () => void;
  cartCount: number;
  wishlistCount: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedWishlist = localStorage.getItem('wishlist');

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Only set if it's a valid array, and filter out items with 0 or invalid price
        if (Array.isArray(parsedCart)) {
          const validItems = parsedCart.filter(item => {
            const price = parseFloat(item.price?.toString() || '0');
            return price > 0;
          });
          setCartItems(validItems);
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        // Clear invalid localStorage data
        localStorage.removeItem('cart');
      }
    }

    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);
        // Only set if it's a valid array, otherwise keep empty
        if (Array.isArray(parsedWishlist)) {
          setWishlistItems(parsedWishlist);
        }
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error);
        // Clear invalid localStorage data
        localStorage.removeItem('wishlist');
      }
    }
  }, []);

  // Save to localStorage when cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save to localStorage when wishlist changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      // Don't add items with invalid price (0 or null/undefined)
      const price = parseFloat(item.price?.toString() || '0');
      if (price <= 0) {
        console.warn('Cannot add item with price 0 or invalid price to cart');
        return prev;
      }
      
      // Check for existing item by bookId AND rental duration
      const existingItem = prev.find(cartItem => 
        cartItem.bookId === item.bookId && 
        cartItem.rentalDuration === (item.rentalDuration || 4)
      );
      
      if (existingItem) {
        // Increment quantity of existing item
        return prev.map(cartItem =>
          cartItem.id === existingItem.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      
      // Ensure rental duration and label are properly set for new items
      return [...prev, { 
        ...item, 
        rentalDuration: item.rentalDuration || 4, 
        quantity: 1, 
        rentalPeriodLabel: item.rentalPeriodLabel || '1 Month' 
      }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return; // Don't allow quantity less than 1

    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const updateCartItemRentalDuration = (id: string, newPeriod: string, newDuration: number) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            rentalDuration: newDuration,
            rentalPeriodLabel: newPeriod
          };
        }
        return item;
      })
    );
  };

  const addToWishlist = (item: WishlistItem) => {
    setWishlistItems(prev => {
      const existingItem = prev.find(wishItem => wishItem.bookId === item.bookId);
      if (existingItem) {
        return prev; // Don't add duplicates
      }
      return [...prev, { ...item, dateAdded: new Date().toISOString() }];
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    localStorage.removeItem('wishlist');
  };

  const clearAllData = () => {
    clearCart();
    clearWishlist();
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  return (
    <StoreContext.Provider
      value={{
        cartItems,
        wishlistItems,
        addToCart,
        removeFromCart,
        addToWishlist,
        removeFromWishlist,
        updateCartQuantity,
        updateCartItemRentalDuration,
        clearCart,
        clearWishlist,
        clearAllData,
        cartCount,
        wishlistCount,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}