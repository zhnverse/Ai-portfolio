import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';
import ChatWidget from './components/ChatWidget';
import { motion } from 'framer-motion';

function App() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/portfolio-data');
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio data');
        }
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        console.error("Error fetching config:", err);
        setError("Failed to load portfolio data. Please make sure the backend server is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center text-white">
        <h2 className="text-2xl font-bold text-red-400 mb-2">Oops! Something went wrong.</h2>
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }
  if (!config) return null;

  const renderContent = () => {
    switch(activeTab) {
      case 'home': return <Hero config={config} setActiveTab={setActiveTab} />;
      case 'about': return <About config={config} />;
      case 'projects': return <Projects config={config} />;
      case 'skills': return <Skills config={config} />;
      case 'contact': return <Contact config={config} />;
      default: return <Hero config={config} setActiveTab={setActiveTab} />;
    }
  };

  const NavLink = ({ tab, label }) => (
    <button 
      onClick={() => setActiveTab(tab)} 
      className={`transition-colors ${activeTab === tab ? 'text-brand border-b-2 border-brand pb-1' : 'hover:text-brand'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-brand selection:text-white flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="font-bold text-xl tracking-tighter cursor-pointer"
            onClick={() => setActiveTab('home')}
          >
            {config.name.toUpperCase().startsWith('MD ') ? config.name.split(' ')[1] : config.name.split(' ')[0]}<span className="text-brand">.</span>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium items-center">
            <NavLink tab="home" label="Home" />
            <NavLink tab="about" label="About" />
            <NavLink tab="projects" label="Projects" />
            <NavLink tab="skills" label="Skills" />
            <NavLink tab="contact" label="Contact" />
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-16">
        {renderContent()}
      </main>

      <footer className="py-8 text-center text-slate-500 border-t border-slate-800">
        <p>© {new Date().getFullYear()} {config.name}. Built with AI & React.</p>
      </footer>

      <ChatWidget />
    </div>
  );
}

export default App;
