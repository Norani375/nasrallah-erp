import { RawMaterial, Product, HardwareItem, ProductionFormula, Sale, SaleItem, CapitalSetting, CapitalAdjustment } from '../types';

// ===== localStorage helper =====
function getStore<T>(key: string, fallback: T[]): T[] {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}
function setStore<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}
function nextId<T extends { id: number }>(arr: T[]): number {
  return arr.length === 0 ? 1 : Math.max(...arr.map(i => i.id)) + 1;
}

// ===== Seed Data =====
const SEED_RAW: RawMaterial[] = [
  { id:1, name:'تخته لمونشین ۱.۸۳×۲.۴۴', dimensions:'', unit:'دانه', quantity:63, price_per_unit:2200 },
  { id:2, name:'تخته لمونشین ۱.۸۳×۳.۶۶', dimensions:'', unit:'دانه', quantity:420, price_per_unit:3200 },
  { id:3, name:'تخته کاک ۳ملی', dimensions:'', unit:'دانه', quantity:1178, price_per_unit:650 },
  { id:4, name:'تخته لاسانی ۱.۸۳×۳.۶۶', dimensions:'', unit:'دانه', quantity:12, price_per_unit:4300 },
  { id:5, name:'تخته اکلاس ۲.۴۴×۱.۲۲', dimensions:'', unit:'دانه', quantity:12, price_per_unit:3200 },
  { id:6, name:'تخته اشپم پلیت خورد ۱.۸۳×۳.۶۶', dimensions:'', unit:'دانه', quantity:4, price_per_unit:1450 },
  { id:7, name:'تخته اشپم پلیت کلان ۱.۸۳×۲.۴۴', dimensions:'', unit:'دانه', quantity:2, price_per_unit:2500 },
  { id:8, name:'شیشه ۲.۴۰×۱.۸', dimensions:'', unit:'دانه', quantity:25, price_per_unit:1100 },
  { id:9, name:'شیشه ۲.۲۵×۱.۶۰', dimensions:'', unit:'دانه', quantity:14, price_per_unit:1420 },
  { id:10, name:'پوم ۱.۵۰×۱', dimensions:'', unit:'دانه', quantity:30, price_per_unit:450 },
  { id:11, name:'پوم ۸ملی', dimensions:'', unit:'لوله', quantity:1, price_per_unit:3000 },
  { id:12, name:'بخمل', dimensions:'', unit:'توپ', quantity:45, price_per_unit:13333 },
];

const SEED_PRODUCTS: Product[] = [
  { id:1, name:'تخت خواب ۱.۵۰', category:'تخت خواب', unit:'دانه', quantity:19, price:4500 },
  { id:2, name:'تخت خواب بف ۱.۲۰', category:'تخت خواب', unit:'دانه', quantity:7, price:null },
  { id:3, name:'تخت خواب بف ۱.۵۰', category:'تخت خواب', unit:'دانه', quantity:5, price:4000 },
  { id:4, name:'تخت خواب چگدار ۱.۸۰', category:'تخت خواب', unit:'دانه', quantity:2, price:18000 },
  { id:5, name:'میزآرایش کلان فرنیچردار', category:'میز آرایش', unit:'دانه', quantity:2, price:null },
  { id:6, name:'الماری دومتره', category:'الماری', unit:'دانه', quantity:3, price:7000 },
  { id:7, name:'میز آرایش خورد', category:'میز آرایش', unit:'دانه', quantity:20, price:1100 },
  { id:8, name:'میز آرایش رفکدار', category:'میز آرایش', unit:'دانه', quantity:39, price:1550 },
  { id:9, name:'میزآرایش کلان', category:'میز آرایش', unit:'دانه', quantity:2, price:1550 },
  { id:10, name:'الماری فلیکلس ۲.۴۰×۲.۴۰', category:'الماری', unit:'دانه', quantity:4, price:13000 },
  { id:11, name:'الماری فلیکلس ۱.۲۰', category:'الماری', unit:'دانه', quantity:3, price:4500 },
  { id:12, name:'الماری چهارپله ۱.۲۰', category:'الماری', unit:'دانه', quantity:22, price:4200 },
  { id:13, name:'الماری ۱.۵۰', category:'الماری', unit:'دانه', quantity:3, price:5200 },
  { id:14, name:'الماری ۱.۸۰ سه پله', category:'الماری', unit:'دانه', quantity:6, price:7000 },
  { id:15, name:'الماری ۲.۴۰×۴.۴۰', category:'الماری', unit:'دانه', quantity:2, price:null },
  { id:16, name:'الماری چقریدار ۳۵', category:'الماری', unit:'دانه', quantity:2, price:11000 },
  { id:17, name:'الماری ۱.۷۰', category:'الماری', unit:'دانه', quantity:6, price:3200 },
  { id:18, name:'الماری ۲×۲.۵', category:'الماری', unit:'دانه', quantity:1, price:8500 },
  { id:19, name:'الماری لباس ۲.۸۰×۲', category:'الماری', unit:'دانه', quantity:1, price:20000 },
];

const SEED_HARDWARE: HardwareItem[] = [
  { id:1, name:'فیته دبل ۴سانتی', unit:'دانه', quantity:25, price_per_unit:380 },
  { id:2, name:'فیته نازک ۲سانتی', unit:'دانه', quantity:104, price_per_unit:180 },
  { id:3, name:'دستگیر ۱۵سانتی بندکدار', unit:'قوتی', quantity:16, price_per_unit:15 },
  { id:4, name:'الکوپان طلایی', unit:'دانه', quantity:12, price_per_unit:190 },
  { id:5, name:'میخ یک اینج', unit:'کارتن', quantity:2, price_per_unit:2400 },
  { id:6, name:'دستگیر پلاستکی', unit:'کارتن', quantity:6, price_per_unit:750 },
  { id:7, name:'کچگ', unit:'قوتی', quantity:1, price_per_unit:70 },
  { id:8, name:'انجامه کلان', unit:'سیت', quantity:25, price_per_unit:140 },
  { id:9, name:'انجامه خورد', unit:'سیت', quantity:43, price_per_unit:80 },
  { id:10, name:'چپ راست چگدار', unit:'کارتن', quantity:3, price_per_unit:3200 },
  { id:11, name:'چپ راست ساده', unit:'کارتن', quantity:4, price_per_unit:1600 },
  { id:12, name:'چپ راست شیشه', unit:'قوتی', quantity:3, price_per_unit:40 },
  { id:13, name:'قلف', unit:'کارتن', quantity:5, price_per_unit:3700 },
  { id:14, name:'خرپیچ ۵۰', unit:'کارتن', quantity:1.5, price_per_unit:2200 },
  { id:15, name:'خرپیچ ۳۲', unit:'قوتی', quantity:17, price_per_unit:110 },
  { id:16, name:'خرپیچ ۲۸', unit:'قوتی', quantity:5, price_per_unit:110 },
  { id:17, name:'خرپیچ ۱۹', unit:'قوتی', quantity:5, price_per_unit:110 },
  { id:18, name:'مرمی استپلر', unit:'قوتی', quantity:50, price_per_unit:80 },
  { id:19, name:'چینل ۳۰', unit:'دانه', quantity:37, price_per_unit:70 },
  { id:20, name:'چینل ۳۲', unit:'دانه', quantity:44, price_per_unit:70 },
  { id:21, name:'چگ بله', unit:'قوتی', quantity:2, price_per_unit:700 },
  { id:22, name:'دستگیر ۱۵سانتی فولادی', unit:'قوتی', quantity:14, price_per_unit:11 },
  { id:23, name:'دستگیر ۲۵سانتی طلایی', unit:'قوتی', quantity:8, price_per_unit:20 },
  { id:24, name:'قیتک اتومات', unit:'پاکت', quantity:15, price_per_unit:650 },
  { id:25, name:'لاتو', unit:'قوتی', quantity:3, price_per_unit:750 },
  { id:26, name:'خرپیچ ۵۰ سفید', unit:'قوتی', quantity:15, price_per_unit:110 },
  { id:27, name:'شیرش دلتا آهن', unit:'کارتن', quantity:10, price_per_unit:3500 },
  { id:28, name:'شیرش PVC', unit:'کارتن', quantity:20, price_per_unit:1600 },
  { id:29, name:'چسپ دلتا', unit:'کارتن', quantity:9, price_per_unit:1600 },
  { id:30, name:'کندکسر', unit:'دانه', quantity:83, price_per_unit:25 },
  { id:31, name:'شیرش توفنگچه', unit:'دانه', quantity:334, price_per_unit:90 },
  { id:32, name:'شیرش اسپری', unit:'کارتن', quantity:19, price_per_unit:3500 },
  { id:33, name:'شیرش اسپری دلتا', unit:'کارتن', quantity:17, price_per_unit:3500 },
  { id:34, name:'دیزان سینسی', unit:'کارتن', quantity:1, price_per_unit:15000 },
];

// ===== Init =====
export function initDatabase() {
  if (!localStorage.getItem('erp_raw_materials')) setStore('erp_raw_materials', SEED_RAW);
  if (!localStorage.getItem('erp_products')) setStore('erp_products', SEED_PRODUCTS);
  if (!localStorage.getItem('erp_hardware')) setStore('erp_hardware', SEED_HARDWARE);
  if (!localStorage.getItem('erp_formulas')) setStore('erp_formulas', [] as ProductionFormula[]);
  if (!localStorage.getItem('erp_sales')) setStore('erp_sales', [] as Sale[]);
  if (!localStorage.getItem('erp_sale_items')) setStore('erp_sale_items', [] as SaleItem[]);
  if (!localStorage.getItem('erp_capital_settings')) localStorage.setItem('erp_capital_settings', 'null');
  if (!localStorage.getItem('erp_capital_adjustments')) setStore('erp_capital_adjustments', [] as CapitalAdjustment[]);
}

// ===== Raw Materials =====
export function getRawMaterials(): RawMaterial[] { return getStore<RawMaterial>('erp_raw_materials', []); }
export function updateRawMaterial(id: number, field: string, value: number) {
  const items = getRawMaterials();
  const idx = items.findIndex(i => i.id === id);
  if (idx >= 0) { (items[idx] as any)[field] = value; setStore('erp_raw_materials', items); }
}
export function addRawMaterial(name: string, dimensions: string, unit: string, quantity: number, price: number) {
  const items = getRawMaterials();
  items.push({ id: nextId(items), name, dimensions, unit, quantity, price_per_unit: price });
  setStore('erp_raw_materials', items);
}

// ===== Products =====
export function getProducts(): Product[] { return getStore<Product>('erp_products', []); }
export function updateProduct(id: number, field: string, value: number) {
  const items = getProducts();
  const idx = items.findIndex(i => i.id === id);
  if (idx >= 0) { (items[idx] as any)[field] = value; setStore('erp_products', items); }
}
export function addProduct(name: string, category: string, quantity: number, price: number) {
  const items = getProducts();
  items.push({ id: nextId(items), name, category, unit: 'دانه', quantity, price });
  setStore('erp_products', items);
}

// ===== Hardware =====
export function getHardware(): HardwareItem[] { return getStore<HardwareItem>('erp_hardware', []); }
export function updateHardwareItem(id: number, field: string, value: number) {
  const items = getHardware();
  const idx = items.findIndex(i => i.id === id);
  if (idx >= 0) { (items[idx] as any)[field] = value; setStore('erp_hardware', items); }
}
export function addHardwareItem(name: string, unit: string, quantity: number, price: number) {
  const items = getHardware();
  items.push({ id: nextId(items), name, unit, quantity, price_per_unit: price });
  setStore('erp_hardware', items);
}

// ===== Sales =====
export function getSales(): Sale[] { return getStore<Sale>('erp_sales', []).sort((a, b) => b.id - a.id); }
export function getSaleItems(saleId: number): SaleItem[] {
  return getStore<SaleItem>('erp_sale_items', []).filter(i => i.sale_id === saleId);
}
export function createSale(customerName: string, items: { product_id: number; product_name: string; quantity: number; unit_price: number }[]) {
  const sales = getStore<Sale>('erp_sales', []);
  const saleItems = getStore<SaleItem>('erp_sale_items', []);
  const products = getProducts();
  let total = 0;
  for (const item of items) total += item.quantity * item.unit_price;
  const saleId = nextId(sales);
  sales.push({ id: saleId, customer_name: customerName, total_amount: total, created_at: new Date().toLocaleString('fa-AF') });
  for (const item of items) {
    const tp = item.quantity * item.unit_price;
    saleItems.push({ id: nextId(saleItems), sale_id: saleId, product_id: item.product_id, product_name: item.product_name, quantity: item.quantity, unit_price: item.unit_price, total_price: tp });
    const pIdx = products.findIndex(p => p.id === item.product_id);
    if (pIdx >= 0) products[pIdx].quantity -= item.quantity;
  }
  setStore('erp_sales', sales);
  setStore('erp_sale_items', saleItems);
  setStore('erp_products', products);
}

// ===== Production Formulas =====
export function getFormulas(productId: number): ProductionFormula[] {
  return getStore<ProductionFormula>('erp_formulas', []).filter(f => f.product_id === productId);
}
export function addProductionFormula(productId: number, materialType: string, materialId: number, qty: number) {
  const formulas = getStore<ProductionFormula>('erp_formulas', []);
  formulas.push({ id: nextId(formulas), product_id: productId, material_type: materialType as 'raw' | 'hardware', material_id: materialId, quantity_needed: qty });
  setStore('erp_formulas', formulas);
}
export function deleteFormula(id: number) {
  const formulas = getStore<ProductionFormula>('erp_formulas', []).filter(f => f.id !== id);
  setStore('erp_formulas', formulas);
}
export function produceProduct(productId: number, quantity: number): { success: boolean; error?: string } {
  const formulas = getFormulas(productId);
  if (formulas.length === 0) return { success: false, error: 'فرمول تولید برای این محصول تعریف نشده است' };
  const rawMaterials = getRawMaterials();
  const hardware = getHardware();
  // Check stock
  for (const f of formulas) {
    const needed = f.quantity_needed * quantity;
    if (f.material_type === 'raw') {
      const m = rawMaterials.find(r => r.id === f.material_id);
      if (!m || m.quantity < needed) return { success: false, error: `موجودی ${m?.name || 'نامشخص'} کافی نیست (نیاز: ${needed})` };
    } else {
      const h = hardware.find(hw => hw.id === f.material_id);
      if (!h || h.quantity < needed) return { success: false, error: `موجودی ${h?.name || 'نامشخص'} کافی نیست (نیاز: ${needed})` };
    }
  }
  // Deduct
  for (const f of formulas) {
    const needed = f.quantity_needed * quantity;
    if (f.material_type === 'raw') {
      const m = rawMaterials.find(r => r.id === f.material_id);
      if (m) m.quantity -= needed;
    } else {
      const h = hardware.find(hw => hw.id === f.material_id);
      if (h) h.quantity -= needed;
    }
  }
  const products = getProducts();
  const pIdx = products.findIndex(p => p.id === productId);
  if (pIdx >= 0) products[pIdx].quantity += quantity;
  setStore('erp_raw_materials', rawMaterials);
  setStore('erp_hardware', hardware);
  setStore('erp_products', products);
  return { success: true };
}

// ===== Capital =====
export function getCapitalSettings(): CapitalSetting | null {
  const raw = localStorage.getItem('erp_capital_settings');
  if (!raw || raw === 'null') return null;
  try { return JSON.parse(raw); } catch { return null; }
}
export function freezeCapital(amount: number, notes: string = '') {
  localStorage.setItem('erp_capital_settings', JSON.stringify({ initial_capital: amount, frozen_at: new Date().toLocaleString('fa-AF'), notes }));
}
export function getCapitalAdjustments(): CapitalAdjustment[] { return getStore<CapitalAdjustment>('erp_capital_adjustments', []); }
export function addCapitalAdjustment(amount: number, type: string, description: string) {
  const adjs = getCapitalAdjustments();
  adjs.push({ id: nextId(adjs), amount, type, description, created_at: new Date().toLocaleString('fa-AF') });
  setStore('erp_capital_adjustments', adjs);
}
export function mergeAdjustmentToCapital(adjId: number) {
  const adjs = getCapitalAdjustments();
  const adj = adjs.find(a => a.id === adjId);
  if (!adj) return;
  const cap = getCapitalSettings();
  if (!cap) return;
  cap.initial_capital += adj.amount;
  localStorage.setItem('erp_capital_settings', JSON.stringify(cap));
  setStore('erp_capital_adjustments', adjs.filter(a => a.id !== adjId));
}
