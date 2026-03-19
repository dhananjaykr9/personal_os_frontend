import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { clsx } from 'clsx';

import Topbar from './Topbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-hidden">
      {/* Mesh Background */}
      <div className="bg-mesh">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <Sidebar isCollapsed={isCollapsed} onToggle={setIsCollapsed} />
      
      <main className={clsx(
        "flex-1 custom-scrollbar h-screen overflow-y-auto relative transition-all duration-500 ease-[0.23, 1, 0.32, 1]",
        isCollapsed ? "ml-24" : "ml-72"
      )}>
        <Topbar />
        <div className="max-w-7xl mx-auto px-10 pb-20">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
