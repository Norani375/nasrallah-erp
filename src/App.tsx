import { useState } from 'react';
import { Menu, RefreshCw } from 'lucide-react';
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

// Initialize database on load
initDatabase();

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

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
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
