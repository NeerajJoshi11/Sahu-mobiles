"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Product {
  id: string;
  name: string;
  price: number;
  mrp?: number | null;
  description: string;
  image: string;
  screen: string;
  processor: string;
  ram: string;
  storage: string;
  colors?: string[];
  colorName?: string | null;
  colorCode?: string | null;
  hasVariants?: boolean;
  variants?: any[];
  selectedColor?: string;
  selectedVariant?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string, selectedColor?: string, selectedVariant?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedColor?: string, selectedVariant?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  appliedCoupon: string | null;
  discountAmount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("sahu_mobiles_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart from local storage", error);
      }
    }
  }, []);

  // Save cart to local storage on change
  useEffect(() => {
    localStorage.setItem("sahu_mobiles_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => 
        item.id === product.id && 
        item.selectedColor === product.selectedColor && 
        item.selectedVariant === product.selectedVariant
      );
      
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id && 
          item.selectedColor === product.selectedColor && 
          item.selectedVariant === product.selectedVariant
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, selectedColor?: string, selectedVariant?: string) => {
    setItems((prevItems) => prevItems.filter((item) => 
      !(item.id === productId && 
        item.selectedColor === selectedColor && 
        item.selectedVariant === selectedVariant)
    ));
  };

  const updateQuantity = (productId: string, quantity: number, selectedColor?: string, selectedVariant?: string) => {
    if (quantity < 1) {
      removeFromCart(productId, selectedColor, selectedVariant);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId && 
        item.selectedColor === selectedColor && 
        item.selectedVariant === selectedVariant
          ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, cartTotal })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setAppliedCoupon(data.code);
        setDiscountAmount(data.discountAmount);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error || "Invalid coupon" };
      }
    } catch (error) {
      return { success: false, message: "Server error" };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  // Recalculate discount if cart total changes
  useEffect(() => {
    const syncDiscount = async () => {
      if (appliedCoupon) {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: appliedCoupon, cartTotal })
        });
        const data = await res.json();
        if (res.ok) {
          setDiscountAmount(data.discountAmount);
        } else {
          // If coupon becomes invalid (e.g. min amount not met), remove it
          removeCoupon();
        }
      }
    };
    syncDiscount();
  }, [cartTotal, appliedCoupon]);

  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        appliedCoupon,
        discountAmount,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
