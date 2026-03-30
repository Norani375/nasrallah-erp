export interface RawMaterial {
  id: number;
  name: string;
  dimensions: string;
  unit: string;
  quantity: number;
  price_per_unit: number;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  price: number | null;
}

export interface HardwareItem {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  price_per_unit: number;
}

export interface ProductionFormula {
  id: number;
  product_id: number;
  material_type: 'raw' | 'hardware';
  material_id: number;
  quantity_needed: number;
}

export interface Sale {
  id: number;
  customer_name: string;
  total_amount: number;
  created_at: string;
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CapitalSetting {
  initial_capital: number;
  frozen_at: string;
  notes: string;
}

export interface CapitalAdjustment {
  id: number;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export type Page = 'dashboard' | 'raw-materials' | 'products' | 'hardware' | 'production' | 'sales';
