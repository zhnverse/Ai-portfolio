import React from 'react';
import { motion } from 'framer-motion';

const About = ({ config }) => {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">About Me</h2>
          <div className="w-20 h-1 bg-brand mx-auto rounded-full"></div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm"
          >
            <p className="text-lg text-slate-300 leading-relaxed mb-6">
              {config.bio}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-400">
              {config.location && <p><strong className="text-white">Location:</strong> {config.location}</p>}
              {config.mobile && <p><strong className="text-white">Mobile:</strong> <span className="blur-sm select-none">{config.mobile}</span></p>}
              {config.email && <p><strong className="text-white">Email:</strong> <span className="blur-sm select-none">{config.email}</span></p>}
              {config.github && <p><strong className="text-white">GitHub:</strong> <span className="blur-sm select-none">{config.github.replace('https://', '')}</span></p>}
              {config.linkedin && <p><strong className="text-white">LinkedIn:</strong> <span className="blur-sm select-none">{config.linkedin.replace('https://', '')}</span></p>}
              {config.languages && config.languages.length > 0 && <p className="col-span-1 md:col-span-2"><strong className="text-white">Languages:</strong> {config.languages.join(', ')}</p>}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
