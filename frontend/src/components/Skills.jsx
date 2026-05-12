import React from 'react';
import { motion } from 'framer-motion';

const Skills = ({ config }) => {
  return (
    <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Skills</h2>
          <div className="w-20 h-1 bg-brand mx-auto rounded-full"></div>
        </motion.div>

        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-4">
          {config.skills.map((skill, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="px-6 py-3 bg-slate-800/80 border border-slate-700/50 rounded-full shadow-lg backdrop-blur-sm"
            >
              <span className="text-lg font-medium text-slate-200">
                {skill}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
