import { useState, useEffect } from 'react';
import { Menu, RefreshCw, Loader2 } from 'lucide-react';
import { Page } from './types';
import { initDatabase } from './utils/db';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { RawMaterials } from './components/RawMaterials';
import { Products } from './components/Products';
import { Hardware } from './components/Hardware';
import { Production } from './components/Production';
import { Sales } from './components/Sales';

const pageLabels: Record<Page, string> = {
  'dashboard': 'داشبورد',
  'raw-materials': 'مواد اولیه',
  'products': 'محصولات',
  'hardware': 'اجناس خورد',
  'production': 'تولید',
  'sales': 'فروش',
};

function App() {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('erp_logged_in') === 'true');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState('');

  useEffect(() => {
    if (loggedIn) {
      initDatabase()
        .then(() => setDbReady(true))
        .catch((err) => setDbError(err.message || 'خطا در اتصال به دیتابیس'));
    }
  }, [loggedIn]);

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  if (dbError) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-100">
        <div className="card bg-error/10 border border-error/30 p-8 text-center max-w-md">
          <p className="text-error font-bold mb-2">خطا در اتصال به دیتابیس</p>
          <p className="text-sm text-base-content/70 mb-4">{dbError}</p>
          <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>تلاش مجدد</button>
        </div>
      </div>
    );
  }

  if (!dbReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-100">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-3 text-primary" size={40} />
          <p className="text-base-content/60">در حال اتصال به دیتابیس...</p>
        </div>
      </div>
    );
  }

  function handleLogout() {
    localStorage.removeItem('erp_logged_in');
    setLoggedIn(false);
  }

  function renderPage() {
    switch (currentPage) {
      case 'dashboard': return <Dashboard key={refreshKey} />;
      case 'raw-materials': return <RawMaterials key={refreshKey} />;
      case 'products': return <Products key={refreshKey} />;
      case 'hardware': return <Hardware key={refreshKey} />;
      case 'production': return <Production key={refreshKey} />;
      case 'sales': return <Sales key={refreshKey} />;
      default: return <Dashboard key={refreshKey} />;
    }
  }

  return (
    <div className="flex h-screen bg-base-100 overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => { setCurrentPage(page); setRefreshKey(k => k + 1); }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-3 p-3 border-b border-base-300 bg-base-200">
          <button className="btn btn-ghost btn-sm lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-bold flex-1">{pageLabels[currentPage]}</h1>
          <button className="btn btn-ghost btn-xs" onClick={() => setRefreshKey(k => k + 1)}>
            <RefreshCw size={14} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;
