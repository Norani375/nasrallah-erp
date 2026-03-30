import { useState } from 'react';
import { Factory, Plus, Trash2, Play, AlertCircle, CheckCircle } from 'lucide-react';
import { RawMaterial } from '../types';
import { getProducts, getRawMaterials, getHardware, getFormulas, addProductionFormula, deleteFormula, produceProduct } from '../utils/db';
import { formatNumber } from '../utils/helpers';

export const Production: React.FC = () => {
  const [, setTick] = useState(0);
  const refresh = () => setTick(t => t + 1);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [produceQty, setProduceQty] = useState(1);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newFormula, setNewFormula] = useState({ materialType: 'raw' as 'raw' | 'hardware', materialId: 0, quantity: 0 });

  const products = getProducts();
  const rawMaterials = getRawMaterials();
  const hardware = getHardware();
  const formulas = selectedProduct ? getFormulas(selectedProduct) : [];

  function handleSelectProduct(id: number) {
    setSelectedProduct(id);
    setMessage(null);
  }

  function handleAddFormula() {
    if (!selectedProduct || newFormula.materialId === 0 || newFormula.quantity <= 0) return;
    addProductionFormula(selectedProduct, newFormula.materialType, newFormula.materialId, newFormula.quantity);
    setNewFormula({ materialType: 'raw', materialId: 0, quantity: 0 });
    refresh();
  }

  function handleDeleteFormula(id: number) {
    deleteFormula(id);
    refresh();
  }

  function handleProduce() {
    if (!selectedProduct || produceQty <= 0) return;
    const result = produceProduct(selectedProduct, produceQty);
    if (result.success) {
      setMessage({ type: 'success', text: `${produceQty} عدد با موفقیت تولید شد!` });
    } else {
      setMessage({ type: 'error', text: result.error || 'خطا در تولید' });
    }
    refresh();
  }

  function getMaterialName(type: string, id: number): string {
    if (type === 'raw') {
      const m = rawMaterials.find(r => r.id === id);
      return m ? `${m.name} ${m.dimensions ? `(${m.dimensions})` : ''}` : 'نامشخص';
    }
    const h = hardware.find(hw => hw.id === id);
    return h ? h.name : 'نامشخص';
  }

  function getMaterialUnit(type: string, id: number): string {
    if (type === 'raw') {
      const m = rawMaterials.find(r => r.id === id);
      return m?.unit || '';
    }
    const h = hardware.find(hw => hw.id === id);
    return h?.unit || '';
  }

  const currentMaterialList = newFormula.materialType === 'raw' ? rawMaterials : hardware;
  const selectedProductData = products.find(p => p.id === selectedProduct);

  return (
    <div className="space-y-4">
      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
          <button className="btn btn-ghost btn-xs" onClick={() => setMessage(null)}>✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <h3 className="card-title text-sm mb-3"><Factory size={18} /> انتخاب محصول</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {products.map(p => (
                <button
                  key={p.id}
                  className={`w-full text-right p-2 rounded-lg text-sm transition-colors ${selectedProduct === p.id ? 'bg-primary text-primary-content' : 'hover:bg-base-300'}`}
                  onClick={() => handleSelectProduct(p.id)}
                >
                  <div className="flex justify-between items-center">
                    <span>{p.name}</span>
                    <span className="badge badge-sm">{formatNumber(p.quantity)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selectedProduct && selectedProductData ? (
            <>
              <div className="card bg-base-200">
                <div className="card-body p-4">
                  <h3 className="card-title text-sm mb-3">تولید {selectedProductData.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">تعداد:</span>
                    <input type="number" className="input input-bordered input-sm w-24" value={produceQty} min={1} onChange={(e) => setProduceQty(parseInt(e.target.value) || 1)} />
                    <button className="btn btn-primary btn-sm" onClick={handleProduce} disabled={formulas.length === 0}>
                      <Play size={16} /> شروع تولید
                    </button>
                    <span className="text-xs text-base-content/60">موجودی فعلی: {formatNumber(selectedProductData.quantity)} {selectedProductData.unit}</span>
                  </div>
                  {formulas.length === 0 && <p className="text-warning text-xs mt-2">⚠️ ابتدا فرمول تولید را تعریف کنید</p>}
                </div>
              </div>

              <div className="card bg-base-200">
                <div className="card-body p-4">
                  <h3 className="card-title text-sm mb-3">فرمول تولید (مواد مورد نیاز برای هر واحد)</h3>
                  {formulas.length > 0 && (
                    <div className="overflow-x-auto mb-4">
                      <table className="table table-sm">
                        <thead><tr><th>نوع</th><th>نام ماده</th><th>مقدار</th><th>واحد</th><th></th></tr></thead>
                        <tbody>
                          {formulas.map(f => (
                            <tr key={f.id}>
                              <td><span className={`badge badge-sm ${f.material_type === 'raw' ? 'badge-primary' : 'badge-secondary'}`}>{f.material_type === 'raw' ? 'مواد اولیه' : 'اجناس خورد'}</span></td>
                              <td>{getMaterialName(f.material_type, f.material_id)}</td>
                              <td>{f.quantity_needed}</td>
                              <td>{getMaterialUnit(f.material_type, f.material_id)}</td>
                              <td><button className="btn btn-ghost btn-xs text-error" onClick={() => handleDeleteFormula(f.id)}><Trash2 size={14} /></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="p-3 bg-base-300 rounded-lg">
                    <p className="text-xs text-base-content/60 mb-2">افزودن ماده به فرمول:</p>
                    <div className="flex flex-wrap items-end gap-2">
                      <select className="select select-bordered select-sm" value={newFormula.materialType} onChange={(e) => setNewFormula({ ...newFormula, materialType: e.target.value as 'raw' | 'hardware', materialId: 0 })}>
                        <option value="raw">مواد اولیه</option>
                        <option value="hardware">اجناس خورد</option>
                      </select>
                      <select className="select select-bordered select-sm flex-1 min-w-40" value={newFormula.materialId} onChange={(e) => setNewFormula({ ...newFormula, materialId: parseInt(e.target.value) })}>
                        <option value={0}>انتخاب ماده...</option>
                        {currentMaterialList.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} {'dimensions' in m && (m as RawMaterial).dimensions ? `(${(m as RawMaterial).dimensions})` : ''}
                          </option>
                        ))}
                      </select>
                      <input type="number" className="input input-bordered input-sm w-24" placeholder="مقدار" value={newFormula.quantity || ''} onChange={(e) => setNewFormula({ ...newFormula, quantity: parseFloat(e.target.value) || 0 })} />
                      <button className="btn btn-primary btn-sm" onClick={handleAddFormula} disabled={newFormula.materialId === 0 || newFormula.quantity <= 0}>
                        <Plus size={14} /> افزودن
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card bg-base-200">
              <div className="card-body p-8 items-center text-center">
                <Factory size={48} className="opacity-20" />
                <p className="text-base-content/60">یک محصول را از لیست انتخاب کنید</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
