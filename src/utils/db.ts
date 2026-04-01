import { RawMaterial, Product, HardwareItem, ProductionFormula, Sale, SaleItem, CapitalSetting, CapitalAdjustment } from '../types';

// ===== API Helper =====
async function apiCall(action: string, params?: any): Promise<any> {
  const res = await fetch('/api/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, params }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Server error' }));
    throw new Error(err.error || 'Server error');
  }
  return res.json();
}

// ===== Init =====
export async function initDatabase(): Promise<void> {
  await apiCall('init');
}

// ===== Raw Materials =====
export async function getRawMaterials(): Promise<RawMaterial[]> {
  return apiCall('getRawMaterials');
}
export async function updateRawMaterial(id: number, field: string, value: number): Promise<void> {
  await apiCall('updateRawMaterial', { id, field, value });
}
export async function addRawMaterial(name: string, dimensions: string, unit: string, quantity: number, price: number): Promise<void> {
  await apiCall('addRawMaterial', { name, dimensions, unit, quantity, price });
}

// ===== Products =====
export async function getProducts(): Promise<Product[]> {
  return apiCall('getProducts');
}
export async function updateProduct(id: number, field: string, value: number): Promise<void> {
  await apiCall('updateProduct', { id, field, value });
}
export async function addProduct(name: string, category: string, quantity: number, price: number): Promise<void> {
  await apiCall('addProduct', { name, category, quantity, price });
}

// ===== Hardware =====
export async function getHardware(): Promise<HardwareItem[]> {
  return apiCall('getHardware');
}
export async function updateHardwareItem(id: number, field: string, value: number): Promise<void> {
  await apiCall('updateHardwareItem', { id, field, value });
}
export async function addHardwareItem(name: string, unit: string, quantity: number, price: number): Promise<void> {
  await apiCall('addHardwareItem', { name, unit, quantity, price });
}

// ===== Delete items =====
export async function deleteRawMaterial(id: number): Promise<void> {
  await apiCall('deleteRawMaterial', { id });
}
export async function deleteProduct(id: number): Promise<void> {
  await apiCall('deleteProduct', { id });
}
export async function deleteHardwareItem(id: number): Promise<void> {
  await apiCall('deleteHardwareItem', { id });
}
export async function deleteSale(id: number): Promise<void> {
  await apiCall('deleteSale', { id });
}

// ===== Full edit items =====
export async function editRawMaterial(id: number, name: string, dimensions: string, unit: string, quantity: number, price: number): Promise<void> {
  await apiCall('editRawMaterial', { id, name, dimensions, unit, quantity, price });
}
export async function editProduct(id: number, name: string, category: string, quantity: number, price: number): Promise<void> {
  await apiCall('editProduct', { id, name, category, quantity, price });
}
export async function editHardwareItem(id: number, name: string, unit: string, quantity: number, price: number): Promise<void> {
  await apiCall('editHardwareItem', { id, name, unit, quantity, price });
}

// ===== Sales =====
export async function getSales(): Promise<Sale[]> {
  return apiCall('getSales');
}
export async function getSaleItems(saleId: number): Promise<SaleItem[]> {
  return apiCall('getSaleItems', { saleId });
}
export async function createSale(customerName: string, items: { product_id: number; product_name: string; quantity: number; unit_price: number }[]): Promise<void> {
  await apiCall('createSale', { customerName, items });
}

// ===== Production =====
export async function getFormulas(productId: number): Promise<ProductionFormula[]> {
  return apiCall('getFormulas', { productId });
}
export async function addProductionFormula(productId: number, materialType: string, materialId: number, qty: number): Promise<void> {
  await apiCall('addFormula', { productId, materialType, materialId, qty });
}
export async function deleteFormula(id: number): Promise<void> {
  await apiCall('deleteFormula', { id });
}
export async function produceProduct(productId: number, quantity: number): Promise<{ success: boolean; error?: string }> {
  return apiCall('produceProduct', { productId, quantity });
}

// ===== Capital =====
export async function getCapitalSettings(): Promise<CapitalSetting | null> {
  return apiCall('getCapitalSettings');
}
export async function freezeCapital(amount: number, notes: string = ''): Promise<void> {
  await apiCall('freezeCapital', { amount, notes });
}
export async function getCapitalAdjustments(): Promise<CapitalAdjustment[]> {
  return apiCall('getCapitalAdjustments');
}
export async function addCapitalAdjustment(amount: number, type: string, description: string): Promise<void> {
  await apiCall('addCapitalAdjustment', { amount, type, description });
}
export async function mergeAdjustmentToCapital(adjId: number): Promise<void> {
  await apiCall('mergeAdjustmentToCapital', { adjId });
}
