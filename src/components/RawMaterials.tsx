import React, { useEffect, useState } from 'react';
import { Search, Plus, Save, X, Pencil, Trash2 } from 'lucide-react';
import { RawMaterial } from '../types';
import { getRawMaterials, addRawMaterial, deleteRawMaterial, editRawMaterial } from '../utils/db';
import { formatNumber, formatCurrency } from '../utils/helpers';

export const RawMaterials: React.FC = () => {
  const [items, setItems] = useState<RawMaterial[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', dimensions: '', unit: 'دانه', quantity: 0, price: 0 });
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ name: '', dimensions: '', unit: '', quantity: 0, price: 0 });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const data = await getRawMaterials();
    setItems(data);
    setLoading(false);
  }

  async function handleAdd() {
    if (!newItem.name) return;
    await addRawMaterial(newItem.name, newItem.dimensions, newItem.unit, newItem.quantity, newItem.price);
    setShowAdd(false);
    setNewItem({ name: '', dimensions: '', unit: 'دانه', quantity: 0, price: 0 });
    loadData();
  }

  function startEdit(item: RawMaterial) {
    setEditId(item.id);
    setEditData({ name: item.name, dimensions: item.dimensions || '', unit: item.unit, quantity: item.quantity, price: item.price_per_unit });
  }

  async function handleSaveEdit() {
    if (editId === null) return;
    await editRawMaterial(editId, editData.name, editData.dimensions, editData.unit, editData.quantity, editData.price);
    setEditId(null);
    loadData();
  }

  async function handleDelete(id: number) {
    await deleteRawMaterial(id);
    setDeleteConfirm(null);
    loadData();
  }

  const filtered = items.filter((i) => i.name.includes(search) || (i.dimensions || '').includes(search));
  const totalValue = items.reduce((s, i) => s + (i.quantity || 0) * (i.price_per_unit || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><span className="loading loading-spinner loading-lg text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="input input-bordered flex items-center gap-2 flex-1 min-w-48">
          <Search className="h-[1em] opacity-50" />
          <input type="search" className="grow" placeholder="جستجوی مواد اولیه..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> افزودن
        </button>
        <div className="badge badge-primary badge-lg">مجموع: {formatCurrency(totalValue)}</div>
      </div>

      {showAdd && (
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <h3 className="card-title text-sm mb-3">افزودن ماده اولیه جدید</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <input className="input input-bordered input-sm" placeholder="نام" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
              <input className="input input-bordered input-sm" placeholder="ابعاد" value={newItem.dimensions} onChange={(e) => setNewItem({ ...newItem, dimensions: e.target.value })} />
              <select className="select select-bordered select-sm" value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}>
                <option>دانه</option><option>ورق</option><option>متر</option><option>توپ</option><option>کیلو</option><option>لوله</option>
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

      {/* Delete Confirmation */}
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
            <tr>
              <th>#</th><th>نام</th><th>ابعاد</th><th>واحد</th><th>موجودی</th><th>قیمت واحد</th><th>ارزش کل</th><th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              editId === item.id ? (
                <tr key={item.id} className="bg-base-200">
                  <td>{idx + 1}</td>
                  <td><input className="input input-bordered input-xs w-full" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} /></td>
                  <td><input className="input input-bordered input-xs w-full" value={editData.dimensions} onChange={(e) => setEditData({...editData, dimensions: e.target.value})} /></td>
                  <td>
                    <select className="select select-bordered select-xs" value={editData.unit} onChange={(e) => setEditData({...editData, unit: e.target.value})}>
                      <option>دانه</option><option>ورق</option><option>متر</option><option>توپ</option><option>کیلو</option><option>لوله</option>
                    </select>
                  </td>
                  <td><input type="number" className="input input-bordered input-xs w-20" value={editData.quantity} onChange={(e) => setEditData({...editData, quantity: parseFloat(e.target.value) || 0})} /></td>
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
                  <td className="text-base-content/60">{item.dimensions || '—'}</td>
                  <td>{item.unit}</td>
                  <td><span className={item.quantity <= 5 ? 'text-warning font-bold' : ''}>{formatNumber(item.quantity)}</span></td>
                  <td><span className={item.price_per_unit === 0 ? 'text-error font-bold' : ''}>{item.price_per_unit === 0 ? 'نامشخص' : formatCurrency(item.price_per_unit)}</span></td>
                  <td>{formatCurrency((item.quantity || 0) * (item.price_per_unit || 0))}</td>
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
