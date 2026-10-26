import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';
import { cantidadValida } from '@/lib/carrito';

export interface CartItem extends Product {
  cartQuantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);
          
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, cartQuantity: cantidadValida(item.cartQuantity + quantity) }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { ...product, cartQuantity: cantidadValida(quantity) }],
          };
        });
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, cartQuantity: cantidadValida(quantity) } : item
          ),
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.cartQuantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + (item.priceWithIVA || Math.round(item.price * 1.16)) * item.cartQuantity,
          0
        );
      },
    }),
    {
      name: 'skinworld-cart',
      // Un carrito guardado antes de existir el tope puede traer más piezas de
      // las que el pago acepta; se recorta al cargarlo.
      merge: (persisted, current) => {
        const items = (persisted as Partial<CartStore> | undefined)?.items ?? [];
        return {
          ...current,
          items: items.map((item) => ({ ...item, cartQuantity: cantidadValida(item.cartQuantity) })),
        };
      },
    }
  )
);
