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
  updateCartItemRentalDuration: (id: string, newPeriod: string) => void;
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
        // Only set if it's a valid array, otherwise keep empty
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
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
      // Check for existing item by bookId instead of exact id match
      const existingItem = prev.find(cartItem => cartItem.bookId === item.bookId);
      if (existingItem) {
        // Update existing item properties but keep quantity as 1
        return prev.map(cartItem =>
          cartItem.bookId === item.bookId
            ? { 
                ...cartItem, 
                rentalDuration: item.rentalDuration || cartItem.rentalDuration,
                rentalPeriodLabel: item.rentalPeriodLabel || cartItem.rentalPeriodLabel,
                quantity: 1 // Always set to 1, don't increment
              }
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
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const updateCartItemRentalDuration = (id: string, newPeriod: string) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          let periodWeeks: number;
          let periodLabel: string;
          let discount = 0;

          switch (newPeriod) {
            case '1 Month':
              periodWeeks = 4;
              periodLabel = '1 Month';
              discount = 0;
              break;
            case '2 Months (10% off)':
              periodWeeks = 8;
              periodLabel = '2 Months';
              discount = 0.1;
              break;
            default: // Default to 1 week if something unexpected happens
              periodWeeks = 1;
              periodLabel = '1 Week';
              discount = 0;
          }

          const basePrice = item.price; // Assuming item.price is the price for 1 week
          const discountedPrice = basePrice * (1 - discount);

          return {
            ...item,
            rentalDuration: periodWeeks,
            rentalPeriodLabel: periodLabel, // Set the label
            price: discountedPrice // Update price based on discount
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