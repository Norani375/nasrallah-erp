import { useState, useEffect } from 'react';
import { Search, Plus, Save, X, Pencil, DollarSign, Loader2 } from 'lucide-react';
import { getHardware, updateHardwareItem, addHardwareItem } from '../utils/db';
import { formatNumber, formatCurrency } from '../utils/helpers';
import { HardwareItem } from '../types';

export const Hardware: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<HardwareItem[]>([]);
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', unit: 'دانه', quantity: 0, price: 0 });

  async function loadData() {
    setLoading(true);
    try { setItems(await getHardware()); } catch (e) { console.error(e); }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function handleSaveEdit() {
    if (editId !== null) {
      await updateHardwareItem(editId, editField, parseFloat(editValue) || 0);
      setEditId(null);
      loadData();
    }
  }

  async function handleAdd() {
    await addHardwareItem(newItem.name, newItem.unit, newItem.quantity, newItem.price);
    setShowAdd(false);
    setNewItem({ name: '', unit: 'دانه', quantity: 0, price: 0 });
    loadData();
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  const filtered = items.filter(i => i.name.includes(search));
  const totalValue = items.reduce((s, i) => s + (i.quantity || 0) * (i.price_per_unit || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="input input-bordered flex items-center gap-2 flex-1 min-w-48">
          <Search className="h-[1em] opacity-50" />
          <input type="search" className="grow" placeholder="جستجوی اجناس خورد..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={16} /> افزودن</button>
        <div className="badge badge-primary badge-lg">مجموع: {formatCurrency(totalValue)}</div>
      </div>

      {showAdd && (
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <h3 className="card-title text-sm mb-3">افزودن جنس خورد جدید</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input className="input input-bordered input-sm" placeholder="نام" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
              <select className="select select-bordered select-sm" value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}>
                <option>دانه</option><option>پاکت</option><option>کارتن</option><option>قوتی</option><option>متر</option><option>کیلو</option><option>سیت</option><option>لوله</option>
              </select>
              <input type="number" className="input input-bordered input-sm" placeholder="تعداد" value={newItem.quantity || ''} onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })} />
              <input type="number" className="input input-bordered input-sm" placeholder="قیمت واحد" value={newItem.price || ''} onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="flex gap-2 mt-3">
              <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={!newItem.name}><Save size={14} /> ذخیره</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}><X size={14} /> لغو</button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="table table-zebra table-sm">
          <thead><tr><th>#</th><th>نام</th><th>واحد</th><th>موجودی</th><th>قیمت واحد</th><th>ارزش کل</th><th>عملیات</th></tr></thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={item.id}>
                <td className="text-base-content/60">{idx + 1}</td>
                <td className="font-medium">{item.name}</td>
                <td>{item.unit}</td>
                <td>
                  {editId === item.id && editField === 'quantity' ? (
                    <div className="flex items-center gap-1">
                      <input type="number" className="input input-bordered input-xs w-20" value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()} />
                      <button className="btn btn-xs btn-primary" onClick={handleSaveEdit}><Save size={12} /></button>
                      <button className="btn btn-xs btn-ghost" onClick={() => setEditId(null)}><X size={12} /></button>
                    </div>
                  ) : (
                    <span className={item.quantity <= 10 ? 'text-warning font-bold' : ''}>{formatNumber(item.quantity)}</span>
                  )}
                </td>
                <td>
                  {editId === item.id && editField === 'price_per_unit' ? (
                    <div className="flex items-center gap-1">
                      <input type="number" className="input input-bordered input-xs w-24" value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()} />
                      <button className="btn btn-xs btn-primary" onClick={handleSaveEdit}><Save size={12} /></button>
                      <button className="btn btn-xs btn-ghost" onClick={() => setEditId(null)}><X size={12} /></button>
                    </div>
                  ) : (
                    <span className={item.price_per_unit === 0 ? 'text-error' : ''}>{item.price_per_unit === 0 ? 'نامشخص' : formatCurrency(item.price_per_unit)}</span>
                  )}
                </td>
                <td>{formatCurrency((item.quantity || 0) * (item.price_per_unit || 0))}</td>
                <td>
                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-xs" onClick={() => { setEditId(item.id); setEditField('quantity'); setEditValue(String(item.quantity)); }}><Pencil size={12} /></button>
                    <button className="btn btn-ghost btn-xs" onClick={() => { setEditId(item.id); setEditField('price_per_unit'); setEditValue(String(item.price_per_unit)); }}><DollarSign size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
