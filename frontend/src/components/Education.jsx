import React from 'react';
import { motion } from 'framer-motion';

const Education = ({ config }) => {
  if (!config.education || config.education.length === 0) return null;

  return (
    <section id="education" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Education</h2>
          <div className="w-20 h-1 bg-brand mx-auto rounded-full"></div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {config.education.map((edu, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm hover:border-brand/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {edu.exam} Examination
                    </h3>
                    <h4 className="text-lg text-brand font-medium mb-2">
                      {edu.institution}
                    </h4>
                    {edu.board && (
                      <p className="text-slate-300">
                        Board: <span className="text-white font-medium">{edu.board}</span>
                      </p>
                    )}
                    {edu.result && (
                      <p className="text-slate-300">
                        Result: <span className="text-white font-medium">{edu.result}</span>
                      </p>
                    )}
                  </div>
                  <div className="bg-brand/20 text-brand px-4 py-2 rounded-full font-bold self-start shrink-0">
                    {edu.year}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Education;
