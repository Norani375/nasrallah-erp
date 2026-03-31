import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Boxes, ShoppingCart, Lock, Plus, Check, RefreshCw, Loader2, Package, Wrench, Archive } from 'lucide-react';
import { getRawMaterials, getProducts, getHardware, getSales, getCapitalSettings, freezeCapital, getCapitalAdjustments, addCapitalAdjustment, mergeAdjustmentToCapital } from '../utils/db';
import { formatCurrency, formatNumber } from '../utils/helpers';
import { RawMaterial, Product, HardwareItem, Sale, CapitalSetting, CapitalAdjustment } from '../types';

export const Dashboard = () => {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [hardware, setHardware] = useState<HardwareItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [capitalSetting, setCapitalSetting] = useState<any>(null);
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdjForm, setShowAdjForm] = useState(false);
  const [adjAmount, setAdjAmount] = useState('');
  const [adjType, setAdjType] = useState<'profit' | 'loss'>('profit');
  const [adjDesc, setAdjDesc] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [rm, pr, hw, sl, cap, adj] = await Promise.all([
        getRawMaterials(), getProducts(), getHardware(), getSales(),
        getCapitalSettings(), getCapitalAdjustments()
      ]);
      setRawMaterials(rm || []);
      setProducts(pr || []);
      setHardware(hw || []);
      setSales(sl || []);
      setCapitalSetting(cap || null);
      setAdjustments(adj || []);
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm text-gray-400">در حال بارگذاری داشبورد...</p>
      </div>
    );
  }

  const rmCapital = rawMaterials.reduce((s, r) => s + ((r.quantity || 0) * (r.price_per_unit || 0)), 0);
  const prCapital = products.reduce((s, p) => s + ((p.quantity || 0) * (p.price || 0)), 0);
  const hwCapital = hardware.reduce((s, h) => s + ((h.quantity || 0) * (h.price_per_unit || 0)), 0);
  const currentValue = rmCapital + prCapital + hwCapital;
  const totalSales = sales.reduce((s, sl) => s + (sl.total_amount || 0), 0);
  const noPriceProducts = products.filter((p) => p.price === null || p.price === undefined);
  const lowStockRaw = rawMaterials.filter((r) => (r.quantity || 0) <= 5);
  const lowStockHw = hardware.filter((h) => (h.quantity || 0) <= 10);

  const initialCapital = capitalSetting?.initial_capital || 0;
  const totalAdjustments = adjustments.reduce((s: number, a: any) => s + (a.amount || 0), 0);
  const netChange = currentValue - initialCapital + totalSales;

  async function handleFreeze() {
    await freezeCapital(currentValue, 'فریز اولیه');
    await loadData();
  }

  async function handleAddAdj() {
    const amt = parseFloat(adjAmount);
    if (!amt || amt <= 0) return;
    const finalAmt = adjType === 'loss' ? -amt : amt;
    await addCapitalAdjustment(finalAmt, adjType, adjDesc || (adjType === 'profit' ? 'سود' : 'زیان'));
    setAdjAmount(''); setAdjDesc(''); setShowAdjForm(false);
    await loadData();
  }

  async function handleMerge(adjId: number) {
    await mergeAdjustmentToCapital(adjId);
    await loadData();
  }

  const alerts = noPriceProducts.length + lowStockRaw.length + lowStockHw.length;

  return (
    <div className="space-y-5">
      {/* Freeze Capital Banner */}
      {!capitalSetting && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Lock size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900">ثبت سرمایه اولیه</p>
            <p className="text-xs text-blue-700 mt-0.5">ارزش فعلی: <span className="font-bold">{formatCurrency(currentValue)}</span></p>
          </div>
          <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium flex items-center gap-1 hover:bg-blue-700" onClick={handleFreeze}><Lock size={14} /> فریز</button>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-gray-50 border-r-4 border-blue-500">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={18} className="text-blue-500" />
            <span className="text-[10px] text-gray-400">سرمایه اولیه</span>
          </div>
          <p className="text-sm font-bold truncate">{formatCurrency(initialCapital)}</p>
          {capitalSetting?.frozen_at && <p className="text-[9px] text-gray-300 mt-0.5">{capitalSetting.frozen_at}</p>}
        </div>

        <div className="p-3 rounded-xl bg-gray-50 border-r-4 border-cyan-500">
          <div className="flex items-center gap-2 mb-1">
            <Boxes size={18} className="text-cyan-500" />
            <span className="text-[10px] text-gray-400">ارزش انبار</span>
          </div>
          <p className="text-sm font-bold truncate">{formatCurrency(currentValue)}</p>
        </div>

        <div className="p-3 rounded-xl bg-gray-50 border-r-4 border-green-500">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart size={18} className="text-green-500" />
            <span className="text-[10px] text-gray-400">مجموع فروش</span>
          </div>
          <p className="text-sm font-bold truncate">{formatCurrency(totalSales)}</p>
        </div>

        <div className={`p-3 rounded-xl bg-gray-50 border-r-4 ${netChange >= 0 ? 'border-green-500' : 'border-red-500'}`}>
          <div className="flex items-center gap-2 mb-1">
            {netChange >= 0 ? <TrendingUp size={18} className="text-green-500" /> : <TrendingDown size={18} className="text-red-500" />}
            <span className="text-[10px] text-gray-400">سود / زیان</span>
          </div>
          <p className={`text-sm font-bold truncate ${netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netChange >= 0 ? '+' : ''}{formatCurrency(netChange)}
          </p>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50">
          <Package size={16} className="opacity-60" />
          <div>
            <p className="text-[10px] text-gray-400 leading-tight">محصولات</p>
            <p className="text-sm font-bold">{products.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50">
          <Archive size={16} className="opacity-60" />
          <div>
            <p className="text-[10px] text-gray-400 leading-tight">مواد اولیه</p>
            <p className="text-sm font-bold">{rawMaterials.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50">
          <Wrench size={16} className="opacity-60" />
          <div>
            <p className="text-[10px] text-gray-400 leading-tight">اجناس خورد</p>
            <p className="text-sm font-bold">{hardware.length}</p>
          </div>
        </div>
      </div>

      {/* Warehouse Breakdown */}
      <div className="p-4 rounded-xl bg-gray-50 space-y-3">
        <p className="text-xs font-semibold text-gray-500">تفکیک ارزش انبار</p>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">مواد اولیه</span>
            <span className="font-bold">{formatCurrency(rmCapital)}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full rounded-full bg-blue-500" style={{ width: `${currentValue > 0 ? Math.round((rmCapital / currentValue) * 100) : 0}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">محصولات</span>
            <span className="font-bold">{formatCurrency(prCapital)}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full rounded-full bg-cyan-500" style={{ width: `${currentValue > 0 ? Math.round((prCapital / currentValue) * 100) : 0}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">اجناس خورد</span>
            <span className="font-bold">{formatCurrency(hwCapital)}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full rounded-full bg-green-500" style={{ width: `${currentValue > 0 ? Math.round((hwCapital / currentValue) * 100) : 0}%` }} />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts > 0 && (
        <div className="p-4 rounded-xl bg-gray-50 space-y-2">
          <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            <AlertTriangle size={14} className="text-yellow-500" /> هشدارها ({alerts})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {noPriceProducts.map((p) => (
              <div key={'np' + p.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-50 text-sm">
                <span>{p.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-600">بدون قیمت</span>
              </div>
            ))}
            {lowStockRaw.map((r) => (
              <div key={'lr' + r.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-yellow-50 text-sm">
                <span>{r.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-100 text-yellow-700">{formatNumber(r.quantity)} {r.unit}</span>
              </div>
            ))}
            {lowStockHw.map((h) => (
              <div key={'lh' + h.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-yellow-50 text-sm">
                <span>{h.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-100 text-yellow-700">{formatNumber(h.quantity)} {h.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profit/Loss Section */}
      {capitalSetting && (
        <div className="p-4 rounded-xl bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">سود و زیان</p>
            <button className="px-2 py-1 rounded text-xs text-gray-500 hover:bg-gray-200 flex items-center gap-1" onClick={() => setShowAdjForm(!showAdjForm)}>
              <Plus size={12} /> ثبت
            </button>
          </div>

          {showAdjForm && (
            <div className="p-3 rounded-lg bg-gray-100 space-y-2">
              <div className="flex gap-2">
                <button className={`flex-1 px-2 py-1 rounded text-xs font-medium ${adjType === 'profit' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`} onClick={() => setAdjType('profit')}>سود</button>
                <button className={`flex-1 px-2 py-1 rounded text-xs font-medium ${adjType === 'loss' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`} onClick={() => setAdjType('loss')}>زیان</button>
              </div>
              <input type="number" className="w-full px-3 py-1.5 rounded border border-gray-300 text-sm" placeholder="مبلغ" value={adjAmount} onChange={(e) => setAdjAmount(e.target.value)} />
              <input type="text" className="w-full px-3 py-1.5 rounded border border-gray-300 text-sm" placeholder="توضیحات" value={adjDesc} onChange={(e) => setAdjDesc(e.target.value)} />
              <button className="w-full px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-medium flex items-center justify-center gap-1 hover:bg-blue-700" onClick={handleAddAdj}><Check size={12} /> ثبت</button>
            </div>
          )}

          {adjustments.length > 0 ? (
            <div className="space-y-1.5">
              {adjustments.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-100 text-sm">
                  <span className="text-gray-500">{a.description}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-xs ${(a.amount || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(a.amount || 0) >= 0 ? '+' : ''}{formatCurrency(a.amount)}
                    </span>
                    <button className="p-1 rounded hover:bg-gray-200 opacity-60" onClick={() => handleMerge(a.id)} title="ادغام در سرمایه"><RefreshCw size={10} /></button>
                  </div>
                </div>
              ))}
              <div className="text-center pt-1">
                <span className={`text-xs font-bold ${totalAdjustments >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  مجموع: {totalAdjustments >= 0 ? '+' : ''}{formatCurrency(totalAdjustments)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-300 text-center py-3">سود یا زیانی ثبت نشده</p>
          )}
        </div>
      )}

      {/* Recent Sales */}
      {sales.length > 0 && (
        <div className="p-4 rounded-xl bg-gray-50 space-y-3">
          <p className="text-xs font-semibold text-gray-500">آخرین فروش‌ها</p>
          <div className="space-y-1.5">
            {sales.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-100 text-sm">
                <span>{s.customer_name}</span>
                <span className="font-bold text-xs">{formatCurrency(s.total_amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
