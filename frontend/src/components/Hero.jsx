import React from 'react';
import { motion } from 'framer-motion';

const Hero = ({ config, setActiveTab }) => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-sm uppercase tracking-widest text-brand-light font-semibold mb-4">
            Welcome to my world
          </h2>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-blue-400">{config.name}</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="mt-4 text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto">
            {config.title}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex justify-center gap-4"
        >
          <button
            onClick={() => setActiveTab('projects')}
            className="px-8 py-3 rounded-full bg-brand-dark hover:bg-brand transition-colors text-white font-medium"
          >
            View Projects
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className="px-8 py-3 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors text-white font-medium border border-slate-700"
          >
            Contact Me
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
