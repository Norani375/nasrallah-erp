import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Boxes, ShoppingCart, Lock, Plus, Check, RefreshCw, Loader2 } from 'lucide-react';
import { getRawMaterials, getProducts, getHardware, getSales, getCapitalSettings, freezeCapital, getCapitalAdjustments, addCapitalAdjustment, mergeAdjustmentToCapital } from '../utils/db';
import { formatCurrency, formatNumber } from '../utils/helpers';
import { RawMaterial, Product, HardwareItem, Sale, CapitalSetting, CapitalAdjustment } from '../types';

export const Dashboard: React.FC = () => {
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

  async function loadData() {
    setLoading(true);
    try {
      const [rm, pr, hw, sl, cap, adj] = await Promise.all([
        getRawMaterials(), getProducts(), getHardware(), getSales(), getCapitalSettings(), getCapitalAdjustments()
      ]);
      setRawMaterials(rm); setProducts(pr); setHardware(hw); setSales(sl); setCapitalSetting(cap); setAdjustments(adj);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;

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
    loadData();
  }

  async function handleAddAdj() {
    const amt = parseFloat(adjAmount);
    if (!amt || amt <= 0) return;
    const finalAmt = adjType === 'loss' ? -amt : amt;
    await addCapitalAdjustment(finalAmt, adjType, adjDesc || (adjType === 'profit' ? 'سود' : 'زیان'));
    setAdjAmount(''); setAdjDesc(''); setShowAdjForm(false);
    loadData();
  }

  async function handleMerge(adjId: number) {
    if (!confirm('آیا مطمئنید که می‌خواهید این مبلغ را به سرمایه اولیه اضافه کنید؟')) return;
    await mergeAdjustmentToCapital(adjId);
    loadData();
  }

  return (
    <div className="space-y-6">
      {!capitalSetting ? (
        <div className="card bg-gradient-to-l from-primary/20 to-primary/5 border border-primary/30">
          <div className="card-body p-5">
            <h3 className="card-title text-base mb-2"><Lock size={20} /> ثبت سرمایه اولیه</h3>
            <p className="text-sm text-base-content/70 mb-3">
              ارزش فعلی انبار و محصولات شما <span className="font-bold text-primary">{formatCurrency(currentValue)}</span> است.
              با فریز کردن، این مبلغ به عنوان سرمایه اولیه ثبت می‌شود.
            </p>
            <button className="btn btn-primary btn-sm w-fit" onClick={handleFreeze}>
              <Lock size={16} /> فریز سرمایه اولیه
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="card bg-base-200 border-r-4 border-primary">
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/20"><Lock className="text-primary" size={24} /></div>
                <div>
                  <p className="text-xs text-base-content/60">سرمایه اولیه (فریز شده)</p>
                  <p className="text-lg font-bold">{formatCurrency(initialCapital)}</p>
                  <p className="text-[10px] text-base-content/40">{capitalSetting.frozen_at}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card bg-base-200 border-r-4 border-info">
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-info/20"><DollarSign className="text-info" size={24} /></div>
                <div>
                  <p className="text-xs text-base-content/60">ارزش فعلی انبار</p>
                  <p className="text-lg font-bold">{formatCurrency(currentValue)}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card bg-base-200 border-r-4 border-success">
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-success/20"><ShoppingCart className="text-success" size={24} /></div>
                <div>
                  <p className="text-xs text-base-content/60">مجموع فروش</p>
                  <p className="text-lg font-bold">{formatCurrency(totalSales)}</p>
                </div>
              </div>
            </div>
          </div>
          <div className={`card bg-base-200 border-r-4 ${netChange >= 0 ? 'border-success' : 'border-error'}`}>
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${netChange >= 0 ? 'bg-success/20' : 'bg-error/20'}`}>
                  {netChange >= 0 ? <TrendingUp className="text-success" size={24} /> : <TrendingDown className="text-error" size={24} />}
                </div>
                <div>
                  <p className="text-xs text-base-content/60">سود / زیان کل</p>
                  <p className={`text-lg font-bold ${netChange >= 0 ? 'text-success' : 'text-error'}`}>
                    {netChange >= 0 ? '+' : ''}{formatCurrency(netChange)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="card-title text-sm mb-3"><Boxes size={18} /> تفکیک ارزش انبار</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-base-300 rounded-lg">
              <p className="text-xs text-base-content/60">مواد اولیه</p>
              <p className="font-bold">{formatCurrency(rmCapital)}</p>
            </div>
            <div className="p-3 bg-base-300 rounded-lg">
              <p className="text-xs text-base-content/60">محصولات</p>
              <p className="font-bold">{formatCurrency(prCapital)}</p>
            </div>
            <div className="p-3 bg-base-300 rounded-lg">
              <p className="text-xs text-base-content/60">اجناس خورد</p>
              <p className="font-bold">{formatCurrency(hwCapital)}</p>
            </div>
          </div>
        </div>
      </div>

      {capitalSetting && (
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="card-title text-sm"><TrendingUp size={18} /> سود و زیان</h3>
              <button className="btn btn-sm btn-outline btn-primary" onClick={() => setShowAdjForm(!showAdjForm)}>
                <Plus size={14} /> ثبت سود/زیان
              </button>
            </div>
            {showAdjForm && (
              <div className="bg-base-300 p-4 rounded-lg mb-4 space-y-3">
                <div className="flex gap-2">
                  <button className={`btn btn-sm flex-1 ${adjType === 'profit' ? 'btn-success' : 'btn-ghost'}`} onClick={() => setAdjType('profit')}>
                    <TrendingUp size={14} /> سود
                  </button>
                  <button className={`btn btn-sm flex-1 ${adjType === 'loss' ? 'btn-error' : 'btn-ghost'}`} onClick={() => setAdjType('loss')}>
                    <TrendingDown size={14} /> زیان
                  </button>
                </div>
                <input type="number" className="input input-bordered input-sm w-full" placeholder="مبلغ (افغانی)" value={adjAmount} onChange={(e) => setAdjAmount(e.target.value)} />
                <input type="text" className="input input-bordered input-sm w-full" placeholder="توضیحات (اختیاری)" value={adjDesc} onChange={(e) => setAdjDesc(e.target.value)} />
                <button className="btn btn-sm btn-primary w-full" onClick={handleAddAdj}><Check size={14} /> ثبت</button>
              </div>
            )}
            {adjustments.length > 0 ? (
              <div className="space-y-2">
                {adjustments.map((a) => (
                  <div key={a.id} className={`flex items-center justify-between p-3 rounded-lg border ${a.amount >= 0 ? 'bg-success/5 border-success/20' : 'bg-error/5 border-error/20'}`}>
                    <div>
                      <p className="text-sm font-medium">{a.description}</p>
                      <p className="text-[10px] text-base-content/50">{a.created_at}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${a.amount >= 0 ? 'text-success' : 'text-error'}`}>
                        {a.amount >= 0 ? '+' : ''}{formatCurrency(a.amount)}
                      </span>
                      <button className="btn btn-xs btn-ghost tooltip" data-tip="درج در سرمایه اولیه" onClick={() => handleMerge(a.id)}>
                        <RefreshCw size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="p-2 bg-base-300 rounded-lg text-center">
                  <span className="text-xs text-base-content/60">مجموع تنظیمات: </span>
                  <span className={`font-bold text-sm ${totalAdjustments >= 0 ? 'text-success' : 'text-error'}`}>
                    {totalAdjustments >= 0 ? '+' : ''}{formatCurrency(totalAdjustments)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-base-content/50 text-center py-4">هنوز سود یا زیانی ثبت نشده</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {noPriceProducts.length > 0 && (
          <div className="card bg-base-200">
            <div className="card-body p-4">
              <h3 className="card-title text-sm text-error mb-3"><AlertTriangle size={18} /> محصولات بدون قیمت ({noPriceProducts.length})</h3>
              <div className="space-y-2">
                {noPriceProducts.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-2 bg-error/10 rounded-lg border border-error/20">
                    <span className="text-sm">{p.name}</span>
                    <span className="badge badge-error badge-sm">بدون قیمت</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {(lowStockRaw.length > 0 || lowStockHw.length > 0) && (
          <div className="card bg-base-200">
            <div className="card-body p-4">
              <h3 className="card-title text-sm text-warning mb-3"><AlertTriangle size={18} /> هشدار کمبود موجودی</h3>
              <div className="space-y-2">
                {lowStockRaw.map((r) => (
                  <div key={'r' + r.id} className="flex justify-between items-center p-2 bg-warning/10 rounded-lg border border-warning/20">
                    <span className="text-sm">{r.name}</span>
                    <span className="badge badge-warning badge-sm">{formatNumber(r.quantity)} {r.unit}</span>
                  </div>
                ))}
                {lowStockHw.map((h) => (
                  <div key={'h' + h.id} className="flex justify-between items-center p-2 bg-warning/10 rounded-lg border border-warning/20">
                    <span className="text-sm">{h.name}</span>
                    <span className="badge badge-warning badge-sm">{formatNumber(h.quantity)} {h.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {sales.length > 0 && (
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <h3 className="card-title text-sm mb-3"><ShoppingCart size={18} /> آخرین فروش‌ها</h3>
            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm">
                <thead><tr><th>مشتری</th><th>مبلغ</th><th>تاریخ</th></tr></thead>
                <tbody>
                  {sales.slice(0, 5).map((s) => (
                    <tr key={s.id}>
                      <td>{s.customer_name}</td>
                      <td>{formatCurrency(s.total_amount)}</td>
                      <td className="text-xs text-base-content/60">{s.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
