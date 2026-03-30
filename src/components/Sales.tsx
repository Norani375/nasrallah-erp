import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Plus, Trash2, FileText, Eye, X, Loader2, Printer } from 'lucide-react';
import { getProducts, getSales, getSaleItems, createSale } from '../utils/db';
import { formatNumber, formatCurrency } from '../utils/helpers';
import { Product, Sale, SaleItem } from '../types';

interface CartItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  max_qty: number;
}

export const Sales = () => {
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

  function handlePrint() {
    setTimeout(() => {
      if (printRef.current) {
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (printWindow) {
          printWindow.document.write(`<!DOCTYPE html><html dir="rtl" lang="fa"><head>
            <meta charset="utf-8"><meta name="viewport" content="width=device-width">
            <title>فاکتور #${viewSaleId}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700;900&display=swap');
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
  const availableProducts = products.filter((p) => p.quantity > 0 && (p.price || 0) > 0 && !cart.find((c) => c.product_id === p.id));

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-colors" onClick={() => setShowNewSale(!showNewSale)}>
          <Plus size={16} /> فاکتور جدید
        </button>
        <span className="px-3 py-1.5 bg-gray-800 rounded-lg text-sm font-bold text-gray-200">
          مجموع فروش: {formatCurrency(sales.reduce((s, sl) => s + sl.total_amount, 0))}
        </span>
      </div>

      {/* New Sale */}
      {showNewSale && (
        <div className="p-4 rounded-xl bg-gray-800/50 space-y-3">
          <p className="text-sm font-bold text-gray-200 flex items-center gap-2"><FileText size={16} /> فاکتور جدید</p>
          <input className="w-full max-w-sm px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 placeholder-gray-500" placeholder="نام مشتری" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <div className="flex flex-wrap items-center gap-2">
            <select className="flex-1 min-w-48 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200" value={selectedProductId} onChange={(e) => setSelectedProductId(parseInt(e.target.value))}>
              <option value={0}>انتخاب محصول...</option>
              {availableProducts.map((p) => <option key={p.id} value={p.id}>{p.name} ({formatNumber(p.quantity)}) - {formatCurrency(p.price)}</option>)}
            </select>
            <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm text-white transition-colors" onClick={addToCart} disabled={selectedProductId === 0}><Plus size={14} /></button>
          </div>

          {cart.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-700">
                  <th className="text-right py-2 px-3 text-gray-400 font-medium text-xs">محصول</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium text-xs">تعداد</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium text-xs">قیمت</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium text-xs">جمع</th>
                  <th></th>
                </tr></thead>
                <tbody>
                  {cart.map((c) => (
                    <tr key={c.product_id} className="border-b border-gray-700/50">
                      <td className="py-2 px-3 text-gray-200">{c.product_name}</td>
                      <td className="py-2 px-3"><input type="number" className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200" value={c.quantity} min={1} max={c.max_qty} onChange={(e) => updateCartQty(c.product_id, parseInt(e.target.value) || 1)} /></td>
                      <td className="py-2 px-3 text-gray-300">{formatCurrency(c.unit_price)}</td>
                      <td className="py-2 px-3 font-bold text-gray-200">{formatCurrency(c.quantity * c.unit_price)}</td>
                      <td className="py-2 px-1"><button className="p-1 text-red-400 hover:text-red-300" onClick={() => removeFromCart(c.product_id)}><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                  <tr><td colSpan={3} className="py-2 px-3 font-bold text-gray-200">جمع کل:</td><td className="py-2 px-3 font-bold text-emerald-400">{formatCurrency(cartTotal)}</td><td></td></tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-colors disabled:opacity-40" onClick={handleSubmitSale} disabled={!customerName.trim() || cart.length === 0}>
              <ShoppingCart size={14} /> ثبت فاکتور
            </button>
            <button className="px-4 py-2 text-gray-400 hover:text-gray-200 text-sm transition-colors" onClick={() => { setShowNewSale(false); setCart([]); setCustomerName(''); }}>لغو</button>
          </div>
        </div>
      )}

      {/* Invoice Detail */}
      {viewSaleId !== null && viewSale && (
        <div className="p-4 rounded-xl bg-gray-800/50 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold text-gray-200">فاکتور #{viewSaleId} — {viewSale.customer_name}</p>
            <div className="flex gap-1">
              <button className="px-2 py-1 rounded-lg text-emerald-400 hover:bg-gray-700 text-sm flex items-center gap-1 transition-colors" onClick={handlePrint}><Printer size={14} /> چاپ</button>
              <button className="p-1 text-gray-500 hover:text-gray-300 transition-colors" onClick={() => { setViewSaleId(null); setViewSale(null); }}><X size={14} /></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-700">
                <th className="text-right py-2 px-3 text-gray-400 font-medium text-xs">محصول</th>
                <th className="text-right py-2 px-3 text-gray-400 font-medium text-xs">تعداد</th>
                <th className="text-right py-2 px-3 text-gray-400 font-medium text-xs">قیمت واحد</th>
                <th className="text-right py-2 px-3 text-gray-400 font-medium text-xs">جمع</th>
              </tr></thead>
              <tbody>
                {viewItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-700/50">
                    <td className="py-2 px-3 text-gray-200">{item.product_name}</td>
                    <td className="py-2 px-3 text-gray-300">{formatNumber(item.quantity)}</td>
                    <td className="py-2 px-3 text-gray-300">{formatCurrency(item.unit_price)}</td>
                    <td className="py-2 px-3 font-bold text-gray-200">{formatCurrency(item.total_price)}</td>
                  </tr>
                ))}
                <tr><td colSpan={3} className="py-2 px-3 font-bold text-gray-200">جمع کل:</td><td className="py-2 px-3 font-bold text-emerald-400">{formatCurrency(viewSale.total_amount)}</td></tr>
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
                      <td>{item.unit_price?.toLocaleString('fa-AF')}</td>
                      <td>{item.total_price?.toLocaleString('fa-AF')}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td colSpan={3}>جمع کل:</td>
                    <td>{viewSale.total_amount?.toLocaleString('fa-AF')} افغانی</td>
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
      <div className="p-4 rounded-xl bg-gray-800/50 space-y-3">
        <p className="text-sm font-bold text-gray-200 flex items-center gap-2"><ShoppingCart size={16} /> لیست فروش‌ها</p>
        {sales.length === 0 ? (
          <p className="text-gray-500 text-center py-6 text-sm">هنوز فروشی ثبت نشده</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-700">
                <th className="text-right py-2 px-3 text-gray-400 font-medium text-xs">#</th>
                <th className="text-right py-2 px-3 text-gray-400 font-medium text-xs">مشتری</th>
                <th className="text-right py-2 px-3 text-gray-400 font-medium text-xs">مبلغ</th>
                <th className="text-right py-2 px-3 text-gray-400 font-medium text-xs">تاریخ</th>
                <th></th>
              </tr></thead>
              <tbody>
                {sales.map((s, idx) => (
                  <tr key={s.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                    <td className="py-2 px-3 text-gray-500">{idx + 1}</td>
                    <td className="py-2 px-3 text-gray-200">{s.customer_name}</td>
                    <td className="py-2 px-3 font-bold text-gray-200">{formatCurrency(s.total_amount)}</td>
                    <td className="py-2 px-3 text-xs text-gray-500">{s.created_at}</td>
                    <td className="py-2 px-1">
                      <button className="p-1 text-gray-500 hover:text-gray-300 transition-colors" onClick={() => viewSaleDetails(s)}><Eye size={14} /></button>
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
