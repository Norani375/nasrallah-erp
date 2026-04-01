import React, { useEffect, useState } from 'react';
import { Search, Plus, Save, X, Pencil, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { getProducts, addProduct, deleteProduct, editProduct } from '../utils/db';
import { formatNumber, formatCurrency } from '../utils/helpers';

export const Products: React.FC = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: 'الماری', quantity: 0, price: 0 });
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ name: '', category: '', quantity: 0, price: 0 });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const data = await getProducts();
    setItems(data);
    setLoading(false);
  }

  async function handleAdd() {
    if (!newItem.name) return;
    await addProduct(newItem.name, newItem.category, newItem.quantity, newItem.price);
    setShowAdd(false);
    setNewItem({ name: '', category: 'الماری', quantity: 0, price: 0 });
    loadData();
  }

  function startEdit(item: Product) {
    setEditId(item.id);
    setEditData({ name: item.name, category: item.category, quantity: item.quantity || 0, price: item.price || 0 });
  }

  async function handleSaveEdit() {
    if (editId === null) return;
    await editProduct(editId, editData.name, editData.category, editData.quantity, editData.price);
    setEditId(null);
    loadData();
  }

  async function handleDelete(id: number) {
    await deleteProduct(id);
    setDeleteConfirm(null);
    loadData();
  }

  const categories = ['all', ...Array.from(new Set(items.map((i) => i.category)))];
  const filtered = items.filter((i) => {
    const matchSearch = i.name.includes(search);
    const matchCat = filterCat === 'all' || i.category === filterCat;
    return matchSearch && matchCat;
  });
  const totalValue = items.reduce((s, i) => s + (i.quantity || 0) * (i.price || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><span className="loading loading-spinner loading-lg text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="input input-bordered flex items-center gap-2 flex-1 min-w-48">
          <Search className="h-[1em] opacity-50" />
          <input type="search" className="grow" placeholder="جستجوی محصول..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <select className="select select-bordered select-sm" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          {categories.map((c) => (<option key={c} value={c}>{c === 'all' ? 'همه دسته‌ها' : c}</option>))}
        </select>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> افزودن
        </button>
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

      {deleteConfirm !== null && (
        <div className="alert alert-warning">
          <span>آیا مطمئن هستید که می‌خواهید «{items.find(i => i.id === deleteConfirm)?.name}» را حذف کنید؟</span>
          <div className="flex gap-2">
            <button className="btn btn-error btn-sm" onClick={() => handleDelete(deleteConfirm)}>بله، حذف شود</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>لغو</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="table table-zebra table-sm">
          <thead>
            <tr><th>#</th><th>نام محصول</th><th>دسته‌بندی</th><th>موجودی</th><th>قیمت</th><th>ارزش کل</th><th>عملیات</th></tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              editId === item.id ? (
                <tr key={item.id} className="bg-base-200">
                  <td>{idx + 1}</td>
                  <td><input className="input input-bordered input-xs w-full" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} /></td>
                  <td>
                    <select className="select select-bordered select-xs" value={editData.category} onChange={(e) => setEditData({...editData, category: e.target.value})}>
                      <option>تخت خواب</option><option>میز آرایش</option><option>الماری</option>
                    </select>
                  </td>
                  <td><input type="number" className="input input-bordered input-xs w-20" value={editData.quantity} onChange={(e) => setEditData({...editData, quantity: parseInt(e.target.value) || 0})} /></td>
                  <td><input type="number" className="input input-bordered input-xs w-24" value={editData.price} onChange={(e) => setEditData({...editData, price: parseFloat(e.target.value) || 0})} /></td>
                  <td>{formatCurrency(editData.quantity * editData.price)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-primary btn-xs" onClick={handleSaveEdit}><Save size={12} /></button>
                      <button className="btn btn-ghost btn-xs" onClick={() => setEditId(null)}><X size={12} /></button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={item.id}>
                  <td className="text-base-content/60">{idx + 1}</td>
                  <td className="font-medium">{item.name}</td>
                  <td><span className="badge badge-sm">{item.category}</span></td>
                  <td><span className={!item.quantity ? 'text-error font-bold' : ''}>{formatNumber(item.quantity || 0)} {item.unit}</span></td>
                  <td><span className={!item.price ? 'text-error font-bold' : ''}>{!item.price ? '⚠️ نامشخص' : formatCurrency(item.price)}</span></td>
                  <td>{!item.price ? <span className="text-error">—</span> : formatCurrency((item.quantity || 0) * (item.price || 0))}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-xs" title="ویرایش" onClick={() => startEdit(item)}><Pencil size={12} /></button>
                      <button className="btn btn-ghost btn-xs text-error" title="حذف" onClick={() => setDeleteConfirm(item.id)}><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
