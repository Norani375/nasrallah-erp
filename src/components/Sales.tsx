import React, { useEffect, useState, useRef } from 'react';
import { ShoppingCart, Plus, Trash2, FileText, Eye, X, Printer } from 'lucide-react';
import { Product, Sale, SaleItem } from '../types';
import { getProducts, getSales, getSaleItems, createSale, deleteSale } from '../utils/db';
import { formatNumber, formatCurrency } from '../utils/helpers';

interface CartItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  max_qty: number;
}

export const Sales: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState(0);
  const [viewSaleId, setViewSaleId] = useState<number | null>(null);
  const [viewSale, setViewSale] = useState<Sale | null>(null);
  const [viewItems, setViewItems] = useState<SaleItem[]>([]);
  const [showNewSale, setShowNewSale] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [pr, sl] = await Promise.all([getProducts(), getSales()]);
    setProducts(pr); setSales(sl);
    setLoading(false);
  }

  function addToCart() {
    if (selectedProductId === 0) return;
    const product = products.find((p) => p.id === selectedProductId);
    if (!product || product.quantity <= 0) return;
    if (cart.find((c) => c.product_id === selectedProductId)) return;
    setCart([...cart, {
      product_id: product.id, product_name: product.name,
      quantity: 1, unit_price: product.price || 0, max_qty: product.quantity,
    }]);
    setSelectedProductId(0);
  }

  function updateCartQty(pid: number, qty: number) {
    setCart((p) => p.map((c) => c.product_id === pid ? { ...c, quantity: Math.min(Math.max(1, qty), c.max_qty) } : c));
  }

  function removeFromCart(pid: number) {
    setCart((p) => p.filter((c) => c.product_id !== pid));
  }

  async function handleSubmitSale() {
    if (!customerName.trim() || cart.length === 0) return;
    await createSale(customerName, cart);
    setCustomerName(''); setCart([]); setShowNewSale(false);
    await loadData();
  }

  async function viewSaleDetails(sale: Sale) {
    setViewSaleId(sale.id); setViewSale(sale);
    const items = await getSaleItems(sale.id);
    setViewItems(items);
  }

  async function handleDeleteSale(id: number) {
    await deleteSale(id);
    setDeleteConfirm(null);
    if (viewSaleId === id) { setViewSaleId(null); setViewSale(null); setViewItems([]); }
    loadData();
  }

  function handlePrint() {
    setTimeout(() => {
      if (printRef.current) {
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (printWindow) {
          printWindow.document.write(`<!DOCTYPE html><html dir="rtl" lang="fa"><head>
            <meta charset="utf-8"><meta name="viewport" content="width=device-width">
            <title>فاکتور #${viewSaleId}</title>
            <style>
              @import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css');
              *{margin:0;padding:0;box-sizing:border-box}
              body{font-family:Vazirmatn,Tahoma,sans-serif;padding:20px;font-size:13px;color:#222;direction:rtl}
              .invoice-box{max-width:360px;margin:0 auto;border:2px solid #333;padding:16px;border-radius:8px}
              .header{text-align:center;border-bottom:2px dashed #999;padding-bottom:12px;margin-bottom:12px}
              .header h1{font-size:18px;font-weight:900;margin-bottom:2px}
              .header p{font-size:11px;color:#666}
              .info{display:flex;justify-content:space-between;margin-bottom:12px;font-size:12px}
              .info span{color:#555}
              table{width:100%;border-collapse:collapse;margin-bottom:12px}
              th{background:#f0f0f0;padding:6px 8px;text-align:right;font-size:11px;border-bottom:1px solid #ccc}
              td{padding:6px 8px;border-bottom:1px solid #eee;font-size:12px}
              .total-row td{border-top:2px solid #333;font-weight:900;font-size:14px;padding-top:8px}
              .footer{text-align:center;border-top:2px dashed #999;padding-top:10px;font-size:10px;color:#888;margin-top:8px}
              @media print{body{padding:5px}.invoice-box{border:none;max-width:100%}}
            </style>
          </head><body>${printRef.current.innerHTML}
            <script>window.onload=function(){window.print();}<\/script>
          </body></html>`);
          printWindow.document.close();
        }
      }
    }, 100);
  }

  const cartTotal = cart.reduce((s, c) => s + c.quantity * c.unit_price, 0);
  const availableProducts = products.filter((p) => p.quantity > 0 && (p.price ?? 0) > 0 && !cart.find((c) => c.product_id === p.id));

  if (loading) {
    return <div className="flex items-center justify-center h-64"><span className="loading loading-spinner loading-lg text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button className="btn btn-primary btn-sm" onClick={() => setShowNewSale(!showNewSale)}>
          <Plus size={16} /> فاکتور جدید
        </button>
        <span className="badge badge-lg bg-base-200 text-base-content font-bold">
          مجموع فروش: {formatCurrency(sales.reduce((s, sl) => s + sl.total_amount, 0))}
        </span>
      </div>

      {showNewSale && (
        <div className="p-4 rounded-xl bg-base-200 space-y-3">
          <p className="text-sm font-bold flex items-center gap-2"><FileText size={16} /> فاکتور جدید</p>
          <input className="input input-bordered input-sm w-full max-w-sm" placeholder="نام مشتری" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <div className="flex flex-wrap items-center gap-2">
            <select className="select select-bordered select-sm flex-1 min-w-48" value={selectedProductId} onChange={(e) => setSelectedProductId(parseInt(e.target.value))}>
              <option value={0}>انتخاب محصول...</option>
              {availableProducts.map((p) => <option key={p.id} value={p.id}>{p.name} ({formatNumber(p.quantity)}) - {formatCurrency(p.price)}</option>)}
            </select>
            <button className="btn btn-secondary btn-sm" onClick={addToCart} disabled={selectedProductId === 0}><Plus size={14} /></button>
          </div>
          {cart.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead><tr><th>محصول</th><th>تعداد</th><th>قیمت</th><th>جمع</th><th></th></tr></thead>
                <tbody>
                  {cart.map((c) => (
                    <tr key={c.product_id}>
                      <td className="text-sm">{c.product_name}</td>
                      <td><input type="number" className="input input-bordered input-xs w-16" value={c.quantity} min={1} max={c.max_qty} onChange={(e) => updateCartQty(c.product_id, parseInt(e.target.value) || 1)} /></td>
                      <td className="text-sm">{formatCurrency(c.unit_price)}</td>
                      <td className="font-bold text-sm">{formatCurrency(c.quantity * c.unit_price)}</td>
                      <td><button className="btn btn-ghost btn-xs text-error" onClick={() => removeFromCart(c.product_id)}><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                  <tr><td colSpan={3} className="font-bold">جمع کل:</td><td className="font-bold text-primary">{formatCurrency(cartTotal)}</td><td></td></tr>
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
      )}

      {/* Delete Confirmation */}
      {deleteConfirm !== null && (
        <div className="alert alert-warning">
          <span>آیا مطمئن هستید که می‌خواهید فاکتور #{deleteConfirm} را حذف کنید؟</span>
          <div className="flex gap-2">
            <button className="btn btn-error btn-sm" onClick={() => handleDeleteSale(deleteConfirm)}>بله، حذف شود</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>لغو</button>
          </div>
        </div>
      )}

      {/* Invoice Detail + Print */}
      {viewSaleId !== null && viewSale && (
        <div className="p-4 rounded-xl bg-base-200 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold">فاکتور #{viewSaleId} — {viewSale.customer_name}</p>
            <div className="flex gap-1">
              <button className="btn btn-sm btn-ghost text-primary" onClick={handlePrint}><Printer size={14} /> چاپ</button>
              <button className="btn btn-ghost btn-xs" onClick={() => { setViewSaleId(null); setViewSale(null); }}><X size={14} /></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead><tr><th>محصول</th><th>تعداد</th><th>قیمت واحد</th><th>جمع</th></tr></thead>
              <tbody>
                {viewItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>{formatNumber(item.quantity)}</td>
                    <td>{formatCurrency(item.unit_price)}</td>
                    <td className="font-bold">{formatCurrency(item.total_price)}</td>
                  </tr>
                ))}
                <tr><td colSpan={3} className="font-bold">جمع کل:</td><td className="font-bold text-primary">{formatCurrency(viewSale.total_amount)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hidden Print Template */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={printRef}>
          {viewSaleId !== null && viewSale && (
            <div className="invoice-box">
              <div className="header">
                <h1>نصرالله فرنیچر</h1>
                <p>Nasrallah Furniture</p>
              </div>
              <div className="info">
                <span>فاکتور #{viewSaleId}</span>
                <span>{viewSale.created_at}</span>
              </div>
              <div className="info">
                <span>مشتری: <strong>{viewSale.customer_name}</strong></span>
              </div>
              <table>
                <thead><tr><th>محصول</th><th>تعداد</th><th>قیمت</th><th>جمع</th></tr></thead>
                <tbody>
                  {viewItems.map((item, i) => (
                    <tr key={i}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatNumber(item.unit_price)}</td>
                      <td>{formatNumber(item.total_price)}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td colSpan={3}>جمع کل:</td>
                    <td>{formatNumber(viewSale.total_amount)} افغانی</td>
                  </tr>
                </tbody>
              </table>
              <div className="footer">
                <p>با تشکر از خرید شما</p>
                <p>نصرالله فرنیچر — کابل، افغانستان</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sales List */}
      <div className="p-4 rounded-xl bg-base-200 space-y-3">
        <p className="text-sm font-bold flex items-center gap-2"><ShoppingCart size={16} /> لیست فروش‌ها</p>
        {sales.length === 0 ? (
          <p className="text-base-content/50 text-center py-6 text-sm">هنوز فروشی ثبت نشده</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm">
              <thead><tr><th>#</th><th>مشتری</th><th>مبلغ</th><th>تاریخ</th><th>عملیات</th></tr></thead>
              <tbody>
                {sales.map((s, idx) => (
                  <tr key={s.id}>
                    <td className="text-base-content/50">{idx + 1}</td>
                    <td>{s.customer_name}</td>
                    <td className="font-bold">{formatCurrency(s.total_amount)}</td>
                    <td className="text-xs text-base-content/50">{s.created_at}</td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-ghost btn-xs" title="مشاهده" onClick={() => viewSaleDetails(s)}><Eye size={14} /></button>
                        <button className="btn btn-ghost btn-xs text-error" title="حذف" onClick={() => setDeleteConfirm(s.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
