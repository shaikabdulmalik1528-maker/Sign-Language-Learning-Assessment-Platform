import React from 'react';
import { Award, ShieldCheck, Download, CheckCircle, Star } from 'lucide-react';

export default function Certification() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Award className="text-rose-400" size={24} /> Skill Certification Status
        </h1>
        <p className="text-gray-400 text-sm">Automated tier verification based on rolling window alphabet mastery</p>
      </div>

      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-8 shadow-2xl space-y-6 text-center md:text-left md:flex md:items-center md:justify-between">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle size={14} /> Tier Achieved: Intermediate Practitioner
          </span>
          <h2 className="text-3xl font-extrabold text-white">ASL Alphabet Proficiency Badge</h2>
          <p className="text-xs text-gray-300 max-w-lg leading-relaxed">
            Issued to <strong className="text-white">Shaik Abdul Malik</strong> for achieving a minimum of 80% accuracy across 15+ ASL alphabets.
          </p>
        </div>

        <button 
          onClick={() => alert('Certificate PDF generated successfully!')}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-rose-600/30 text-sm mx-auto md:mx-0"
        >
          <Download size={18} /> Download Certificate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111827] border border-emerald-500/30 p-6 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-emerald-400">
            <ShieldCheck size={24} />
            <span className="text-[10px] font-bold uppercase bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">UNLOCKED</span>
          </div>
          <h3 className="text-base font-bold text-white pt-2">Novice Tier</h3>
          <p className="text-xs text-gray-400">Mastered 5 basic signs (A, B, C, D, I) with confidence &gt; 85%.</p>
        </div>

        <div className="bg-[#111827] border border-indigo-500/30 p-6 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-indigo-400">
            <Star size={24} />
            <span className="text-[10px] font-bold uppercase bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">ACTIVE</span>
          </div>
          <h3 className="text-base font-bold text-white pt-2">Intermediate Tier</h3>
          <p className="text-xs text-gray-400">Mastered 15 signs with rolling window validation.</p>
        </div>

        <div className="bg-[#111827] border border-gray-800 p-6 rounded-xl space-y-2 opacity-60">
          <div className="flex justify-between items-center text-gray-500">
            <Award size={24} />
            <span className="text-[10px] font-bold uppercase bg-black px-2 py-0.5 rounded border border-gray-800">LOCKED</span>
          </div>
          <h3 className="text-base font-bold text-white pt-2">Master Tier</h3>
          <p className="text-xs text-gray-400">Master all 26 ASL alphabets with 95%+ average confidence.</p>
        </div>
      </div>
    </div>
  );
}
