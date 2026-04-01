import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, params } = req.body || {};
  try {
    switch (action) {
      // ===== INIT =====
      case 'init': {
        await sql`CREATE TABLE IF NOT EXISTS raw_materials (
          id SERIAL PRIMARY KEY, name TEXT NOT NULL, dimensions TEXT DEFAULT '',
          unit TEXT NOT NULL, quantity REAL DEFAULT 0, price_per_unit REAL DEFAULT 0
        )`;
        await sql`CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY, name TEXT NOT NULL, category TEXT DEFAULT '',
          unit TEXT DEFAULT 'دانه', quantity REAL DEFAULT 0, price REAL
        )`;
        await sql`CREATE TABLE IF NOT EXISTS hardware (
          id SERIAL PRIMARY KEY, name TEXT NOT NULL, unit TEXT NOT NULL,
          quantity REAL DEFAULT 0, price_per_unit REAL DEFAULT 0
        )`;
        await sql`CREATE TABLE IF NOT EXISTS production_formulas (
          id SERIAL PRIMARY KEY, product_id INTEGER NOT NULL,
          material_type TEXT NOT NULL, material_id INTEGER NOT NULL, quantity_needed REAL NOT NULL
        )`;
        await sql`CREATE TABLE IF NOT EXISTS sales (
          id SERIAL PRIMARY KEY, customer_name TEXT NOT NULL,
          total_amount REAL DEFAULT 0, created_at TEXT DEFAULT ''
        )`;
        await sql`CREATE TABLE IF NOT EXISTS sale_items (
          id SERIAL PRIMARY KEY, sale_id INTEGER NOT NULL, product_id INTEGER NOT NULL,
          product_name TEXT DEFAULT '', quantity REAL DEFAULT 0,
          unit_price REAL DEFAULT 0, total_price REAL DEFAULT 0
        )`;
        await sql`CREATE TABLE IF NOT EXISTS capital_settings (
          id SERIAL PRIMARY KEY, initial_capital REAL DEFAULT 0,
          frozen_at TEXT DEFAULT '', notes TEXT DEFAULT ''
        )`;
        await sql`CREATE TABLE IF NOT EXISTS capital_adjustments (
          id SERIAL PRIMARY KEY, amount REAL DEFAULT 0, type TEXT DEFAULT '',
          description TEXT DEFAULT '', created_at TEXT DEFAULT ''
        )`;
        // Seed if empty
        const { rows: rmCheck } = await sql`SELECT COUNT(*) as c FROM raw_materials`;
        if (parseInt(rmCheck[0].c) === 0) {
          const rawData = [
            ['تخته لمونشین ۱.۸۳×۲.۴۴','','دانه',63,2200],
            ['تخته لمونشین ۱.۸۳×۳.۶۶','','دانه',420,3200],
            ['تخته کاک ۳ملی','','دانه',1178,650],
            ['تخته لاسانی ۱.۸۳×۳.۶۶','','دانه',12,4300],
            ['تخته اکلاس ۲.۴۴×۱.۲۲','','دانه',12,3200],
            ['تخته اشپم پلیت خورد ۱.۸۳×۳.۶۶','','دانه',4,1450],
            ['تخته اشپم پلیت کلان ۱.۸۳×۲.۴۴','','دانه',2,2500],
            ['شیشه ۲.۴۰×۱.۸','','دانه',25,1100],
            ['شیشه ۲.۲۵×۱.۶۰','','دانه',14,1420],
            ['پوم ۱.۵۰×۱','','دانه',30,450],
            ['پوم ۸ملی','','لوله',1,3000],
            ['بخمل','','توپ',45,13333],
          ];
          for (const r of rawData) {
            await sql`INSERT INTO raw_materials (name,dimensions,unit,quantity,price_per_unit) VALUES (${r[0] as string},${r[1] as string},${r[2] as string},${r[3] as number},${r[4] as number})`;
          }
        }
        const { rows: pCheck } = await sql`SELECT COUNT(*) as c FROM products`;
        if (parseInt(pCheck[0].c) === 0) {
          const prodData: [string,string,number,number|null][] = [
            ['تخت خواب ۱.۵۰','تخت خواب',19,4500],['تخت خواب بف ۱.۲۰','تخت خواب',7,null],
            ['تخت خواب بف ۱.۵۰','تخت خواب',5,4000],['تخت خواب چگدار ۱.۸۰','تخت خواب',2,18000],
            ['میزآرایش کلان فرنیچردار','میز آرایش',2,null],['الماری دومتره','الماری',3,7000],
            ['میز آرایش خورد','میز آرایش',20,1100],['میز آرایش رفکدار','میز آرایش',39,1550],
            ['میزآرایش کلان','میز آرایش',2,1550],['الماری فلیکلس ۲.۴۰×۲.۴۰','الماری',4,13000],
            ['الماری فلیکلس ۱.۲۰','الماری',3,4500],['الماری چهارپله ۱.۲۰','الماری',22,4200],
            ['الماری ۱.۵۰','الماری',3,5200],['الماری ۱.۸۰ سه پله','الماری',6,7000],
            ['الماری ۲.۴۰×۴.۴۰','الماری',2,null],['الماری چقریدار ۳۵','الماری',2,11000],
            ['الماری ۱.۷۰','الماری',6,3200],['الماری ۲×۲.۵','الماری',1,8500],
            ['الماری لباس ۲.۸۰×۲','الماری',1,20000],
          ];
          for (const p of prodData) {
            await sql`INSERT INTO products (name,category,quantity,price) VALUES (${p[0]},${p[1]},${p[2]},${p[3]})`;
          }
        }
        const { rows: hCheck } = await sql`SELECT COUNT(*) as c FROM hardware`;
        if (parseInt(hCheck[0].c) === 0) {
          const hwData: [string,string,number,number][] = [
            ['فیته دبل ۴سانتی','دانه',25,380],['فیته نازک ۲سانتی','دانه',104,180],
            ['دستگیر ۱۵سانتی بندکدار','قوتی',16,15],['الکوپان طلایی','دانه',12,190],
            ['میخ یک اینج','کارتن',2,2400],['دستگیر پلاستکی','کارتن',6,750],
            ['کچگ','قوتی',1,70],['انجامه کلان','سیت',25,140],
            ['انجامه خورد','سیت',43,80],['چپ راست چگدار','کارتن',3,3200],
            ['چپ راست ساده','کارتن',4,1600],['چپ راست شیشه','قوتی',3,40],
            ['قلف','کارتن',5,3700],['خرپیچ ۵۰','کارتن',1.5,2200],
            ['خرپیچ ۳۲','قوتی',17,110],['خرپیچ ۲۸','قوتی',5,110],
            ['خرپیچ ۱۹','قوتی',5,110],['مرمی استپلر','قوتی',50,80],
            ['چینل ۳۰','دانه',37,70],['چینل ۳۲','دانه',44,70],
            ['چگ بله','قوتی',2,700],['دستگیر ۱۵سانتی فولادی','قوتی',14,11],
            ['دستگیر ۲۵سانتی طلایی','قوتی',8,20],['قیتک اتومات','پاکت',15,650],
            ['لاتو','قوتی',3,750],['خرپیچ ۵۰ سفید','قوتی',15,110],
            ['شیرش دلتا آهن','کارتن',10,3500],['شیرش PVC','کارتن',20,1600],
            ['چسپ دلتا','کارتن',9,1600],['کندکسر','دانه',83,25],
            ['شیرش توفنگچه','دانه',334,90],['شیرش اسپری','کارتن',19,3500],
            ['شیرش اسپری دلتا','کارتن',17,3500],['دیزان سینسی','کارتن',1,15000],
          ];
          for (const h of hwData) {
            await sql`INSERT INTO hardware (name,unit,quantity,price_per_unit) VALUES (${h[0]},${h[1]},${h[2]},${h[3]})`;
          }
        }
        return res.json({ success: true });
      }

      // ===== RAW MATERIALS =====
      case 'getRawMaterials': {
        const { rows } = await sql`SELECT * FROM raw_materials ORDER BY id`;
        return res.json(rows);
      }
      case 'updateRawMaterial': {
        const { id, field, value } = params;
        if (field === 'quantity') await sql`UPDATE raw_materials SET quantity=${value} WHERE id=${id}`;
        else if (field === 'price_per_unit') await sql`UPDATE raw_materials SET price_per_unit=${value} WHERE id=${id}`;
        return res.json({ success: true });
      }
      case 'addRawMaterial': {
        const { name, dimensions, unit, quantity, price } = params;
        await sql`INSERT INTO raw_materials (name,dimensions,unit,quantity,price_per_unit) VALUES (${name},${dimensions||''},${unit},${quantity},${price})`;
        return res.json({ success: true });
      }

      // ===== PRODUCTS =====
      case 'getProducts': {
        const { rows } = await sql`SELECT * FROM products ORDER BY id`;
        return res.json(rows);
      }
      case 'updateProduct': {
        const { id, field, value } = params;
        if (field === 'quantity') await sql`UPDATE products SET quantity=${value} WHERE id=${id}`;
        else if (field === 'price') await sql`UPDATE products SET price=${value} WHERE id=${id}`;
        return res.json({ success: true });
      }
      case 'addProduct': {
        const { name, category, quantity, price } = params;
        await sql`INSERT INTO products (name,category,unit,quantity,price) VALUES (${name},${category},'دانه',${quantity},${price})`;
        return res.json({ success: true });
      }

      // ===== HARDWARE =====
      case 'getHardware': {
        const { rows } = await sql`SELECT * FROM hardware ORDER BY id`;
        return res.json(rows);
      }
      case 'updateHardwareItem': {
        const { id, field, value } = params;
        if (field === 'quantity') await sql`UPDATE hardware SET quantity=${value} WHERE id=${id}`;
        else if (field === 'price_per_unit') await sql`UPDATE hardware SET price_per_unit=${value} WHERE id=${id}`;
        return res.json({ success: true });
      }
      case 'addHardwareItem': {
        const { name, unit, quantity, price } = params;
        await sql`INSERT INTO hardware (name,unit,quantity,price_per_unit) VALUES (${name},${unit},${quantity},${price})`;
        return res.json({ success: true });
      }

      // ===== DELETE ITEMS =====
      case 'deleteRawMaterial': {
        const { id } = params;
        await sql`DELETE FROM raw_materials WHERE id=${id}`;
        return res.json({ success: true });
      }
      case 'deleteProduct': {
        const { id } = params;
        await sql`DELETE FROM products WHERE id=${id}`;
        return res.json({ success: true });
      }
      case 'deleteHardwareItem': {
        const { id } = params;
        await sql`DELETE FROM hardware WHERE id=${id}`;
        return res.json({ success: true });
      }
      case 'deleteSale': {
        const { id } = params;
        await sql`DELETE FROM sale_items WHERE sale_id=${id}`;
        await sql`DELETE FROM sales WHERE id=${id}`;
        return res.json({ success: true });
      }

      // ===== FULL EDIT ITEMS =====
      case 'editRawMaterial': {
        const { id, name, dimensions, unit, quantity, price } = params;
        await sql`UPDATE raw_materials SET name=${name},dimensions=${dimensions||''},unit=${unit},quantity=${quantity},price_per_unit=${price} WHERE id=${id}`;
        return res.json({ success: true });
      }
      case 'editProduct': {
        const { id, name, category, quantity, price } = params;
        await sql`UPDATE products SET name=${name},category=${category},quantity=${quantity},price=${price} WHERE id=${id}`;
        return res.json({ success: true });
      }
      case 'editHardwareItem': {
        const { id, name, unit, quantity, price } = params;
        await sql`UPDATE hardware SET name=${name},unit=${unit},quantity=${quantity},price_per_unit=${price} WHERE id=${id}`;
        return res.json({ success: true });
      }

      // ===== SALES =====
      case 'getSales': {
        const { rows } = await sql`SELECT * FROM sales ORDER BY id DESC`;
        return res.json(rows);
      }
      case 'getSaleItems': {
        const { saleId } = params;
        const { rows } = await sql`SELECT * FROM sale_items WHERE sale_id=${saleId}`;
        return res.json(rows);
      }
      case 'createSale': {
        const { customerName, items } = params;
        let total = 0;
        for (const item of items) total += item.quantity * item.unit_price;
        const now = new Date().toLocaleString('fa-AF');
        const { rows: saleRows } = await sql`INSERT INTO sales (customer_name,total_amount,created_at) VALUES (${customerName},${total},${now}) RETURNING id`;
        const saleId = saleRows[0].id;
        for (const item of items) {
          const tp = item.quantity * item.unit_price;
          await sql`INSERT INTO sale_items (sale_id,product_id,product_name,quantity,unit_price,total_price) VALUES (${saleId},${item.product_id},${item.product_name},${item.quantity},${item.unit_price},${tp})`;
          await sql`UPDATE products SET quantity = quantity - ${item.quantity} WHERE id=${item.product_id}`;
        }
        return res.json({ success: true });
      }

      // ===== PRODUCTION =====
      case 'getFormulas': {
        const { productId } = params;
        const { rows } = await sql`SELECT * FROM production_formulas WHERE product_id=${productId}`;
        return res.json(rows);
      }
      case 'addFormula': {
        const { productId, materialType, materialId, qty } = params;
        await sql`INSERT INTO production_formulas (product_id,material_type,material_id,quantity_needed) VALUES (${productId},${materialType},${materialId},${qty})`;
        return res.json({ success: true });
      }
      case 'deleteFormula': {
        const { id } = params;
        await sql`DELETE FROM production_formulas WHERE id=${id}`;
        return res.json({ success: true });
      }
      case 'produceProduct': {
        const { productId, quantity } = params;
        const { rows: formulas } = await sql`SELECT * FROM production_formulas WHERE product_id=${productId}`;
        if (formulas.length === 0) return res.json({ success: false, error: 'فرمول تولید برای این محصول تعریف نشده است' });
        // Check stock
        for (const f of formulas) {
          const needed = f.quantity_needed * quantity;
          if (f.material_type === 'raw') {
            const { rows } = await sql`SELECT * FROM raw_materials WHERE id=${f.material_id}`;
            if (!rows[0] || rows[0].quantity < needed) return res.json({ success: false, error: `موجودی ${rows[0]?.name || 'نامشخص'} کافی نیست (نیاز: ${needed})` });
          } else {
            const { rows } = await sql`SELECT * FROM hardware WHERE id=${f.material_id}`;
            if (!rows[0] || rows[0].quantity < needed) return res.json({ success: false, error: `موجودی ${rows[0]?.name || 'نامشخص'} کافی نیست (نیاز: ${needed})` });
          }
        }
        // Deduct materials
        for (const f of formulas) {
          const needed = f.quantity_needed * quantity;
          if (f.material_type === 'raw') {
            await sql`UPDATE raw_materials SET quantity = quantity - ${needed} WHERE id=${f.material_id}`;
          } else {
            await sql`UPDATE hardware SET quantity = quantity - ${needed} WHERE id=${f.material_id}`;
          }
        }
        await sql`UPDATE products SET quantity = quantity + ${quantity} WHERE id=${productId}`;
        return res.json({ success: true });
      }

      // ===== CAPITAL =====
      case 'getCapitalSettings': {
        const { rows } = await sql`SELECT * FROM capital_settings LIMIT 1`;
        return res.json(rows[0] || null);
      }
      case 'freezeCapital': {
        const { amount, notes } = params;
        const now = new Date().toLocaleString('fa-AF');
        await sql`DELETE FROM capital_settings`;
        await sql`INSERT INTO capital_settings (initial_capital,frozen_at,notes) VALUES (${amount},${now},${notes || ''})`;
        return res.json({ success: true });
      }
      case 'getCapitalAdjustments': {
        const { rows } = await sql`SELECT * FROM capital_adjustments ORDER BY id`;
        return res.json(rows);
      }
      case 'addCapitalAdjustment': {
        const { amount, type, description } = params;
        const now = new Date().toLocaleString('fa-AF');
        await sql`INSERT INTO capital_adjustments (amount,type,description,created_at) VALUES (${amount},${type},${description},${now})`;
        return res.json({ success: true });
      }
      case 'mergeAdjustmentToCapital': {
        const { adjId } = params;
        const { rows: adjs } = await sql`SELECT * FROM capital_adjustments WHERE id=${adjId}`;
        if (!adjs[0]) return res.json({ success: false });
        await sql`UPDATE capital_settings SET initial_capital = initial_capital + ${adjs[0].amount}`;
        await sql`DELETE FROM capital_adjustments WHERE id=${adjId}`;
        return res.json({ success: true });
      }

      default:
        return res.status(400).json({ error: 'Unknown action: ' + action });
    }
  } catch (err: any) {
    console.error('API Error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
