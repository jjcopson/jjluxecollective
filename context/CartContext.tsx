"use client";

import React, { createContext, useContext, useState } from "react";
import { Product } from "@/data/products";

export type CartItem = Product & {
  selectedSize: string;
  selectedColor: string;
  cartQuantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: string) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  total: number;
};

const CartContext = createContext<CartContextType | null>(null);

function keyOf(item: any) {
  return item._id || String(item.id);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  function addToCart(product: Product, size: string, color: string) {
    setCart((current) => {
      const existing = current.find(
        (item) =>
          keyOf(item) === keyOf(product) &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existing) {
        return current.map((item) =>
          keyOf(item) === keyOf(product) &&
          item.selectedSize === size &&
          item.selectedColor === color
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      }

      return [
        ...current,
        {
          ...product,
          selectedSize: size,
          selectedColor: color,
          cartQuantity: 1,
        },
      ];
    });
  }

  function removeFromCart(key: string) {
    setCart((current) => current.filter((item) => keyOf(item) !== key));
  }

  function clearCart() {
    setCart([]);
  }

  function updateQuantity(id: string, quantity: number) {
    setCart((current) =>
      current.map((item) =>
        keyOf(item) === id
          ? { ...item, cartQuantity: Math.max(1, quantity) }
          : item
      )
    );
  }

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.cartQuantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
