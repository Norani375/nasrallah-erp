import { useState } from 'react';
import { ShoppingCart, Plus, Trash2, FileText, Eye, X } from 'lucide-react';
import { getProducts, getSales, getSaleItems, createSale } from '../utils/db';
import { formatNumber, formatCurrency } from '../utils/helpers';

interface CartItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  max_qty: number;
}

export const Sales: React.FC = () => {
  const [, setTick] = useState(0);
  const refresh = () => setTick(t => t + 1);
  const [customerName, setCustomerName] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState(0);
  const [viewSaleId, setViewSaleId] = useState<number | null>(null);
  const [showNewSale, setShowNewSale] = useState(false);

  const products = getProducts();
  const sales = getSales();
  const viewItems = viewSaleId ? getSaleItems(viewSaleId) : [];

  function addToCart() {
    if (selectedProductId === 0) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product || product.quantity <= 0) return;
    if (cart.find(c => c.product_id === selectedProductId)) return;
    setCart([...cart, {
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      unit_price: product.price || 0,
      max_qty: product.quantity,
    }]);
    setSelectedProductId(0);
  }

  function updateCartQty(productId: number, qty: number) {
    setCart(prev => prev.map(c => c.product_id === productId ? { ...c, quantity: Math.min(Math.max(1, qty), c.max_qty) } : c));
  }

  function removeFromCart(productId: number) {
    setCart(prev => prev.filter(c => c.product_id !== productId));
  }

  function handleSubmitSale() {
    if (!customerName.trim() || cart.length === 0) return;
    createSale(customerName, cart);
    setCustomerName('');
    setCart([]);
    setShowNewSale(false);
    refresh();
  }

  const cartTotal = cart.reduce((s, c) => s + c.quantity * c.unit_price, 0);
  const availableProducts = products.filter(p => p.quantity > 0 && p.price && !cart.find(c => c.product_id === p.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button className="btn btn-primary btn-sm" onClick={() => setShowNewSale(!showNewSale)}><Plus size={16} /> فاکتور جدید</button>
        <div className="badge badge-primary badge-lg">مجموع فروش: {formatCurrency(sales.reduce((s, sl) => s + sl.total_amount, 0))}</div>
      </div>

      {showNewSale && (
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <h3 className="card-title text-sm mb-3"><FileText size={18} /> صدور فاکتور جدید</h3>
            <input className="input input-bordered input-sm w-full max-w-sm mb-3" placeholder="نام مشتری" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <select className="select select-bordered select-sm flex-1 min-w-48" value={selectedProductId} onChange={(e) => setSelectedProductId(parseInt(e.target.value))}>
                <option value={0}>انتخاب محصول...</option>
                {availableProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (موجودی: {formatNumber(p.quantity)}) - {formatCurrency(p.price)}</option>
                ))}
              </select>
              <button className="btn btn-secondary btn-sm" onClick={addToCart} disabled={selectedProductId === 0}><Plus size={14} /> افزودن</button>
            </div>
            {cart.length > 0 && (
              <div className="overflow-x-auto mb-3">
                <table className="table table-sm">
                  <thead><tr><th>محصول</th><th>تعداد</th><th>قیمت واحد</th><th>جمع</th><th></th></tr></thead>
                  <tbody>
                    {cart.map(c => (
                      <tr key={c.product_id}>
                        <td>{c.product_name}</td>
                        <td><input type="number" className="input input-bordered input-xs w-20" value={c.quantity} min={1} max={c.max_qty} onChange={(e) => updateCartQty(c.product_id, parseInt(e.target.value) || 1)} /></td>
                        <td>{formatCurrency(c.unit_price)}</td>
                        <td className="font-bold">{formatCurrency(c.quantity * c.unit_price)}</td>
                        <td><button className="btn btn-ghost btn-xs text-error" onClick={() => removeFromCart(c.product_id)}><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3} className="font-bold text-left">جمع کل:</td>
                      <td className="font-bold text-primary">{formatCurrency(cartTotal)}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex gap-2">
              <button className="btn btn-primary btn-sm" onClick={handleSubmitSale} disabled={!customerName.trim() || cart.length === 0}>
                <ShoppingCart size={14} /> ثبت فاکتور
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowNewSale(false); setCart([]); setCustomerName(''); }}>لغو</button>
            </div>
          </div>
        </div>
      )}

      {viewSaleId !== null && (
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="card-title text-sm">جزئیات فاکتور #{viewSaleId}</h3>
              <button className="btn btn-ghost btn-xs" onClick={() => setViewSaleId(null)}><X size={14} /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead><tr><th>محصول</th><th>تعداد</th><th>قیمت واحد</th><th>جمع</th></tr></thead>
                <tbody>
                  {viewItems.map(item => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>{formatNumber(item.quantity)}</td>
                      <td>{formatCurrency(item.unit_price)}</td>
                      <td>{formatCurrency(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="card-title text-sm mb-3"><ShoppingCart size={18} /> لیست فروش‌ها</h3>
          {sales.length === 0 ? (
            <p className="text-base-content/60 text-center py-8">هنوز فروشی ثبت نشده است</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm">
                <thead><tr><th>#</th><th>مشتری</th><th>مبلغ کل</th><th>تاریخ</th><th>عملیات</th></tr></thead>
                <tbody>
                  {sales.map((s, idx) => (
                    <tr key={s.id}>
                      <td className="text-base-content/60">{idx + 1}</td>
                      <td className="font-medium">{s.customer_name}</td>
                      <td>{formatCurrency(s.total_amount)}</td>
                      <td className="text-xs text-base-content/60">{s.created_at}</td>
                      <td><button className="btn btn-ghost btn-xs" onClick={() => setViewSaleId(s.id)}><Eye size={14} /> جزئیات</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
