// Productos
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  priceWithIVA?: number;
  compareAtPriceWithIVA?: number;
  brand?: string;
  sku?: string;
  image?: string;
  images?: string[];
  category?: string;
  problemType?: string;
  productType?: string;
  ingredients?: string[];
  instructions?: string;
  presentation?: string;
  inStock: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  type: 'problem' | 'type' | 'brand';
  displayOrder: number;
}

// Carrito
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  sessionId: string;
  userId?: string;
  items: CartItem[];
  expiresAt: string;
}

// Órdenes
export interface Address {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  email: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  shippingAddress: Address;
  billingAddress: Address;
  items: OrderItem[];
  paymentMethodId?: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// Usuarios
export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: 'customer' | 'admin';
  addresses?: Address[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Reseñas
export interface Review {
  id: string;
  productId: string;
  userId?: string;
  authorName: string;
  authorEmail: string;
  rating: number;
  title?: string;
  content?: string;
  helpful: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

// Cupones
export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  minOrderAmount?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

// Contenido
export interface Content {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  type: 'blog' | 'page' | 'faq';
  author?: string;
  featured: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
