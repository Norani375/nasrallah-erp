import { useState } from 'react';
import { Search, Plus, Save, X, Pencil, DollarSign } from 'lucide-react';
import { getProducts, updateProduct, addProduct } from '../utils/db';
import { formatNumber, formatCurrency } from '../utils/helpers';

export const Products: React.FC = () => {
  const [, setTick] = useState(0);
  const refresh = () => setTick(t => t + 1);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [editId, setEditId] = useState<number | null>(null);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: 'الماری', quantity: 0, price: 0 });

  const items = getProducts();

  function handleSaveEdit() {
    if (editId !== null) {
      updateProduct(editId, editField, parseFloat(editValue) || 0);
      setEditId(null);
      refresh();
    }
  }

  function handleAdd() {
    addProduct(newItem.name, newItem.category, newItem.quantity, newItem.price);
    setShowAdd(false);
    setNewItem({ name: '', category: 'الماری', quantity: 0, price: 0 });
    refresh();
  }

  const categories = ['all', ...Array.from(new Set(items.map(i => i.category)))];
  const filtered = items.filter(i => {
    const matchSearch = i.name.includes(search);
    const matchCat = filterCat === 'all' || i.category === filterCat;
    return matchSearch && matchCat;
  });
  const totalValue = items.reduce((s, i) => s + (i.quantity || 0) * (i.price || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="input input-bordered flex items-center gap-2 flex-1 min-w-48">
          <Search className="h-[1em] opacity-50" />
          <input type="search" className="grow" placeholder="جستجوی محصول..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <select className="select select-bordered select-sm" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'همه دسته‌ها' : c}</option>)}
        </select>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={16} /> افزودن</button>
        <div className="badge badge-primary badge-lg">مجموع: {formatCurrency(totalValue)}</div>
      </div>

      {showAdd && (
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <h3 className="card-title text-sm mb-3">افزودن محصول جدید</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input className="input input-bordered input-sm" placeholder="نام محصول" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
              <select className="select select-bordered select-sm" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
                <option>تخت خواب</option><option>میز آرایش</option><option>الماری</option>
              </select>
              <input type="number" className="input input-bordered input-sm" placeholder="تعداد" value={newItem.quantity || ''} onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })} />
              <input type="number" className="input input-bordered input-sm" placeholder="قیمت" value={newItem.price || ''} onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })} />
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
          <thead><tr><th>#</th><th>نام محصول</th><th>دسته‌بندی</th><th>موجودی</th><th>قیمت</th><th>ارزش کل</th><th>عملیات</th></tr></thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={item.id}>
                <td className="text-base-content/60">{idx + 1}</td>
                <td className="font-medium">{item.name}</td>
                <td><span className="badge badge-sm">{item.category}</span></td>
                <td>
                  {editId === item.id && editField === 'quantity' ? (
                    <div className="flex items-center gap-1">
                      <input type="number" className="input input-bordered input-xs w-20" value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()} />
                      <button className="btn btn-xs btn-primary" onClick={handleSaveEdit}><Save size={12} /></button>
                      <button className="btn btn-xs btn-ghost" onClick={() => setEditId(null)}><X size={12} /></button>
                    </div>
                  ) : (
                    <span className={!item.quantity ? 'text-error font-bold' : ''}>{formatNumber(item.quantity || 0)} {item.unit}</span>
                  )}
                </td>
                <td>
                  {editId === item.id && editField === 'price' ? (
                    <div className="flex items-center gap-1">
                      <input type="number" className="input input-bordered input-xs w-24" value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()} />
                      <button className="btn btn-xs btn-primary" onClick={handleSaveEdit}><Save size={12} /></button>
                      <button className="btn btn-xs btn-ghost" onClick={() => setEditId(null)}><X size={12} /></button>
                    </div>
                  ) : (
                    <span className={!item.price ? 'text-error font-bold' : ''}>
                      {!item.price ? '⚠️ نامشخص' : formatCurrency(item.price)}
                    </span>
                  )}
                </td>
                <td>{!item.price ? <span className="text-error">—</span> : formatCurrency((item.quantity || 0) * (item.price || 0))}</td>
                <td>
                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-xs" onClick={() => { setEditId(item.id); setEditField('quantity'); setEditValue(String(item.quantity)); }}><Pencil size={12} /></button>
                    <button className="btn btn-ghost btn-xs" onClick={() => { setEditId(item.id); setEditField('price'); setEditValue(String(item.price || 0)); }}><DollarSign size={12} /></button>
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
