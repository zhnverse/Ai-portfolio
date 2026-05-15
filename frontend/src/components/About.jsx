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
              {config.dob && <p><strong className="text-white">Date of Birth:</strong> {config.dob}</p>}
              {config.mobile && <p><strong className="text-white">Mobile:</strong> {config.mobile}</p>}
              {config.email && <p><strong className="text-white">Email:</strong> <a href={`mailto:${config.email}`} className="text-brand hover:underline">{config.email}</a></p>}
              {config.github && <p><strong className="text-white">GitHub:</strong> <a href={config.github} target="_blank" rel="noreferrer" className="text-brand hover:underline">{config.github.replace('https://', '')}</a></p>}
              {config.linkedin && <p><strong className="text-white">LinkedIn:</strong> <a href={config.linkedin} target="_blank" rel="noreferrer" className="text-brand hover:underline">{config.linkedin.replace('https://', '')}</a></p>}
              {config.languages && config.languages.length > 0 && <p className="col-span-1 md:col-span-2"><strong className="text-white">Languages:</strong> {config.languages.join(', ')}</p>}
            </div>

            {config.education && config.education.length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-700/50 text-left">
                <h3 className="text-xl font-semibold text-white mb-4">Education</h3>
                <div className="space-y-4">
                  {config.education.map((edu, idx) => (
                    <div key={idx} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                      <h4 className="text-brand font-medium text-lg">{edu.exam} Examination ({edu.year})</h4>
                      <p className="text-slate-300 mt-1">{edu.institution}</p>
                      <p className="text-slate-400 text-sm mt-1">Board: <span className="text-slate-300">{edu.board}</span> | Result: <span className="text-slate-300">{edu.result}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
