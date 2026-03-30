import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Boxes, ShoppingCart, Lock, Plus, Check, RefreshCw, Loader2, Package, Wrench, Archive } from 'lucide-react';
import { getRawMaterials, getProducts, getHardware, getSales, getCapitalSettings, freezeCapital, getCapitalAdjustments, addCapitalAdjustment, mergeAdjustmentToCapital } from '../utils/db';
import { formatCurrency, formatNumber } from '../utils/helpers';
import { RawMaterial, Product, HardwareItem, Sale, CapitalSetting, CapitalAdjustment } from '../types';

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [hardware, setHardware] = useState<HardwareItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [capitalSetting, setCapitalSetting] = useState<CapitalSetting | null>(null);
  const [adjustments, setAdjustments] = useState<CapitalAdjustment[]>([]);
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
      setRawMaterials(rm); setProducts(pr); setHardware(hw); setSales(sl);
      setCapitalSetting(cap); setAdjustments(adj);
    } finally { setLoading(false); }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  const rmCapital = rawMaterials.reduce((s, r) => s + (r.quantity || 0) * (r.price_per_unit || 0), 0);
  const prCapital = products.reduce((s, p) => s + (p.quantity || 0) * (p.price || 0), 0);
  const hwCapital = hardware.reduce((s, h) => s + (h.quantity || 0) * (h.price_per_unit || 0), 0);
  const currentValue = rmCapital + prCapital + hwCapital;
  const totalSales = sales.reduce((s, sl) => s + (sl.total_amount || 0), 0);
  const noPriceProducts = products.filter((p) => !p.price);
  const lowStockRaw = rawMaterials.filter((r) => r.quantity <= 5);
  const lowStockHw = hardware.filter((h) => h.quantity <= 10);

  const initialCapital = capitalSetting?.initial_capital || 0;
  const totalAdjustments = adjustments.reduce((s, a) => s + (a.amount || 0), 0);
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
    if (!confirm('آیا مطمئنید؟')) return;
    await mergeAdjustmentToCapital(adjId);
    await loadData();
  }

  const alerts = noPriceProducts.length + lowStockRaw.length + lowStockHw.length;
  const barPct = (v: number) => currentValue > 0 ? Math.round((v / currentValue) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Freeze Capital Banner */}
      {!capitalSetting && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Lock size={20} className="text-emerald-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-200">ثبت سرمایه اولیه</p>
            <p className="text-xs text-gray-400 mt-0.5">ارزش فعلی: <span className="font-bold text-emerald-400">{formatCurrency(currentValue)}</span></p>
          </div>
          <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium text-white flex items-center gap-1.5 transition-colors" onClick={handleFreeze}>
            <Lock size={14} /> فریز
          </button>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Lock size={18} />} label="سرمایه اولیه" value={formatCurrency(initialCapital)} color="emerald" sub={capitalSetting?.frozen_at} />
        <StatCard icon={<Boxes size={18} />} label="ارزش انبار" value={formatCurrency(currentValue)} color="blue" />
        <StatCard icon={<ShoppingCart size={18} />} label="مجموع فروش" value={formatCurrency(totalSales)} color="green" />
        <StatCard icon={netChange >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />} label="سود / زیان" value={(netChange >= 0 ? '+' : '') + formatCurrency(netChange)} color={netChange >= 0 ? 'green' : 'red'} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-800/50">
          <Package size={16} className="text-gray-500" />
          <div>
            <p className="text-[10px] text-gray-500 leading-tight">محصولات</p>
            <p className="text-sm font-bold text-gray-200">{products.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-800/50">
          <Archive size={16} className="text-gray-500" />
          <div>
            <p className="text-[10px] text-gray-500 leading-tight">مواد اولیه</p>
            <p className="text-sm font-bold text-gray-200">{rawMaterials.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-800/50">
          <Wrench size={16} className="text-gray-500" />
          <div>
            <p className="text-[10px] text-gray-500 leading-tight">اجناس خورد</p>
            <p className="text-sm font-bold text-gray-200">{hardware.length}</p>
          </div>
        </div>
      </div>

      {/* Warehouse Breakdown */}
      <div className="p-4 rounded-xl bg-gray-800/50 space-y-3">
        <p className="text-xs font-semibold text-gray-400">تفکیک ارزش انبار</p>
        <BarRow label="مواد اولیه" value={rmCapital} pct={barPct(rmCapital)} color="bg-emerald-500" />
        <BarRow label="محصولات" value={prCapital} pct={barPct(prCapital)} color="bg-blue-500" />
        <BarRow label="اجناس خورد" value={hwCapital} pct={barPct(hwCapital)} color="bg-green-500" />
      </div>

      {/* Alerts */}
      {alerts > 0 && (
        <div className="p-4 rounded-xl bg-gray-800/50 space-y-2">
          <p className="text-xs font-semibold text-gray-400 flex items-center gap-1">
            <AlertTriangle size={14} className="text-amber-400" /> هشدارها ({alerts})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {noPriceProducts.map((p) => (
              <div key={'np' + p.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-500/10 text-sm text-gray-200">
                <span>{p.name}</span>
                <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">بدون قیمت</span>
              </div>
            ))}
            {lowStockRaw.map((r) => (
              <div key={'lr' + r.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/10 text-sm text-gray-200">
                <span>{r.name}</span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">{formatNumber(r.quantity)} {r.unit}</span>
              </div>
            ))}
            {lowStockHw.map((h) => (
              <div key={'lh' + h.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/10 text-sm text-gray-200">
                <span>{h.name}</span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">{formatNumber(h.quantity)} {h.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profit/Loss */}
      {capitalSetting && (
        <div className="p-4 rounded-xl bg-gray-800/50 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400">سود و زیان</p>
            <button className="px-2 py-1 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors flex items-center gap-1" onClick={() => setShowAdjForm(!showAdjForm)}>
              <Plus size={12} /> ثبت
            </button>
          </div>

          {showAdjForm && (
            <div className="p-3 rounded-lg bg-gray-700/50 space-y-2">
              <div className="flex gap-2">
                <button className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${adjType === 'profit' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-600'}`} onClick={() => setAdjType('profit')}>سود</button>
                <button className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${adjType === 'loss' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-600'}`} onClick={() => setAdjType('loss')}>زیان</button>
              </div>
              <input type="number" className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 placeholder-gray-500" placeholder="مبلغ" value={adjAmount} onChange={(e) => setAdjAmount(e.target.value)} />
              <input type="text" className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 placeholder-gray-500" placeholder="توضیحات" value={adjDesc} onChange={(e) => setAdjDesc(e.target.value)} />
              <button className="w-full px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm text-white font-medium flex items-center justify-center gap-1.5 transition-colors" onClick={handleAddAdj}><Check size={12} /> ثبت</button>
            </div>
          )}

          {adjustments.length > 0 ? (
            <div className="space-y-1.5">
              {adjustments.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-700/30 text-sm">
                  <span className="text-gray-400">{a.description}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-xs ${a.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {a.amount >= 0 ? '+' : ''}{formatCurrency(a.amount)}
                    </span>
                    <button className="p-1 rounded text-gray-500 hover:text-gray-300 transition-colors" onClick={() => handleMerge(a.id)}><RefreshCw size={10} /></button>
                  </div>
                </div>
              ))}
              <div className="text-center pt-1">
                <span className={`text-xs font-bold ${totalAdjustments >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  مجموع: {totalAdjustments >= 0 ? '+' : ''}{formatCurrency(totalAdjustments)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-3">سود یا زیانی ثبت نشده</p>
          )}
        </div>
      )}

      {/* Recent Sales */}
      {sales.length > 0 && (
        <div className="p-4 rounded-xl bg-gray-800/50 space-y-3">
          <p className="text-xs font-semibold text-gray-400">آخرین فروش‌ها</p>
          <div className="space-y-1.5">
            {sales.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-700/30 text-sm">
                <span className="text-gray-200">{s.customer_name}</span>
                <span className="font-bold text-xs text-gray-300">{formatCurrency(s.total_amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* --- Helper Components --- */

const StatCard = ({ icon, label, value, color, sub }: { icon: React.ReactNode; label: string; value: string; color: string; sub?: string }) => {
  const colorMap: Record<string, string> = {
    emerald: 'border-emerald-500 text-emerald-400',
    blue: 'border-blue-500 text-blue-400',
    green: 'border-green-500 text-green-400',
    red: 'border-red-500 text-red-400',
  };
  const c = colorMap[color] || colorMap.emerald;
  const borderColor = c.split(' ')[0];
  const textColor = c.split(' ')[1];
  return (
    <div className={`p-3 rounded-xl bg-gray-800/50 border-r-2 ${borderColor}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={textColor}>{icon}</span>
        <span className="text-[10px] text-gray-500">{label}</span>
      </div>
      <p className="text-sm font-bold text-gray-200 truncate">{value}</p>
      {sub && <p className="text-[9px] text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
};

const BarRow = ({ label, value, pct, color }: { label: string; value: number; pct: number; color: string }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-400">{label}</span>
      <span className="font-bold text-gray-200">{formatCurrency(value)}</span>
    </div>
    <div className="w-full h-1.5 rounded-full bg-gray-700 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  </div>
);
