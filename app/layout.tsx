import "./globals.css";
import type { Metadata } from "next";

import { CartProvider } from "@/context/CartContext";
import { ProductProvider } from "@/context/ProductContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "JJ Luxe Collective",
  description: "Premium fashion and modern lifestyle pieces.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ProductProvider>
          <CartProvider>
            <Navbar />
            {children}
          </CartProvider>
        </ProductProvider>
      </body>
    </html>
  );
}
