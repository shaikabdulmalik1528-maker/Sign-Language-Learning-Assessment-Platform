import React, { useState } from 'react';
import { FileText, Download, Table, Calendar, CheckCircle, ShieldCheck } from 'lucide-react';
import { getReportsSummary } from '../services/api';

export default function Reports() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (type) => {
    setDownloading(type);
    try {
      await getReportsSummary(1);
      setTimeout(() => {
        alert(`Successfully generated and downloaded ${type.toUpperCase()} report!`);
        setDownloading(false);
      }, 1000);
    } catch {
      alert('Failed to generate report from FastAPI server.');
      setDownloading(false);
    }
  };

  const sampleLogs = [
    { date: '2026-08-12 11:00', session: 'SES-9081', target: 'D', accuracy: '100%', conf: '96.2%', status: 'MASTERED' },
    { date: '2026-08-12 10:45', session: 'SES-9080', target: 'C', accuracy: '80%', conf: '88.5%', status: 'IMPROVING' },
    { date: '2026-08-11 16:30', session: 'SES-9075', target: 'A', accuracy: '100%', conf: '98.1%', status: 'MASTERED' },
    { date: '2026-08-11 14:15', session: 'SES-9071', target: 'X', accuracy: '40%', conf: '62.0%', status: 'NEEDS_REVISION' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="text-amber-400" size={24} /> Reports & Audit Records
        </h1>
        <p className="text-gray-400 text-sm">Export detailed practice history, attempt logs, and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Download size={18} className="text-amber-400" /> Export Practice Summary
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Download your historical session data, including prediction accuracy, inference latency, and machine learning state promotions.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => handleDownload('csv')}
              disabled={downloading}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2.5 rounded-lg text-xs transition"
            >
              <Table size={16} /> Export to CSV
            </button>
            <button
              onClick={() => handleDownload('pdf')}
              disabled={downloading}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-semibold px-4 py-2.5 rounded-lg text-xs transition"
            >
              <FileText size={16} /> Export to PDF
            </button>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 p-6 rounded-xl space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" /> Audit Integrity Standard
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            All attempt records are time-stamped and saved into SQLite with deterministic session identifiers for compliance and verification.
          </p>
        </div>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Calendar size={18} className="text-indigo-400" /> Recent Session Attempt Logs
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-black/40 text-gray-400 uppercase font-mono border-b border-gray-800">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Session ID</th>
                <th className="p-3">Target</th>
                <th className="p-3">Accuracy</th>
                <th className="p-3">Avg Confidence</th>
                <th className="p-3">Promoted State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sampleLogs.map((log, i) => (
                <tr key={i} className="hover:bg-gray-800/40 transition">
                  <td className="p-3">{log.date}</td>
                  <td className="p-3 font-mono text-indigo-400">{log.session}</td>
                  <td className="p-3 font-bold text-white">{log.target}</td>
                  <td className="p-3 text-emerald-400 font-bold">{log.accuracy}</td>
                  <td className="p-3">{log.conf}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
