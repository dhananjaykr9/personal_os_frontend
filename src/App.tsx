import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Learning from './pages/Learning';
import Roadmap from './pages/Roadmap';
import Habits from './pages/Habits';
import Notes from './pages/Notes';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Terminal from './pages/Terminal';
import Music from './pages/Music';
import OrinHUD from './components/OrinHUD';
import OrinSplash from './components/OrinSplash';
import OrinInterface from './components/OrinInterface';

const PointerGlow = () => {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return <div className="interactive-mesh" />;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <BrowserRouter>
      {showSplash && <OrinSplash onComplete={() => setShowSplash(false)} />}
      <PointerGlow />
      <OrinHUD />
      <OrinInterface />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/terminal" element={<Terminal />} />
          <Route path="/music" element={<Music />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
