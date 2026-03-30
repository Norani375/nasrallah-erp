import { LayoutDashboard, Package, ShoppingCart, Factory, Wrench, Boxes, LogOut } from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'داشبورد', icon: <LayoutDashboard size={20} /> },
  { page: 'raw-materials', label: 'مواد اولیه', icon: <Boxes size={20} /> },
  { page: 'products', label: 'محصولات', icon: <Package size={20} /> },
  { page: 'hardware', label: 'اجناس خورد', icon: <Wrench size={20} /> },
  { page: 'production', label: 'تولید', icon: <Factory size={20} /> },
  { page: 'sales', label: 'فروش', icon: <ShoppingCart size={20} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isOpen, onClose, onLogout }) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-64 bg-base-200 border-l border-base-300 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-base-300">
          <h2 className="text-lg font-bold text-primary">🪵 نصرالله فرنیچر</h2>
          <p className="text-xs text-base-content/60 mt-1">سیستم مدیریت یکپارچه</p>
        </div>
        <ul className="menu p-2 gap-1 flex-1">
          {navItems.map((item) => (
            <li key={item.page}>
              <button
                className={`flex items-center gap-3 ${currentPage === item.page ? 'active' : ''}`}
                onClick={() => { onNavigate(item.page); onClose(); }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="p-2 border-t border-base-300">
          <button className="btn btn-ghost btn-sm w-full text-error" onClick={onLogout}>
            <LogOut size={16} /> خروج از سیستم
          </button>
        </div>
      </aside>
    </>
  );
};
