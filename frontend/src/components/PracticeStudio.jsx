import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, Activity, Camera, StopCircle, Info } from 'lucide-react';
import { startCycle, processAttempt, endCycle } from '../services/api';
import { ASL_ALPHABETS } from '../data/aslGuide';

export default function PracticeStudio() {
  const [session, setSession] = useState(null);
  const [target, setTarget] = useState('D');
  const [state, setState] = useState('NOT_ATTEMPTED');
  const [telemetry, setTelemetry] = useState({ attempts: 0, correct: 0, confidence: 0 });
  const [lastFeedback, setLastFeedback] = useState('Ready to start session');
  const [summaryModal, setSummaryModal] = useState(null);

  const handleStart = async () => {
    try {
      const data = await startCycle(1);
      setSession(data.session_id);
      setTarget(data.current_recommendation.alphabet);
      setState(data.current_recommendation.current_state);
      setTelemetry({ attempts: 0, correct: 0, confidence: 0 });
      setLastFeedback('Practice session initialized!');
    } catch {
      alert('Make sure FastAPI server is running on http://127.0.0.1:8000');
    }
  };

  const handleSimulate = async (isCorrect) => {
    if (!session) return alert('Click Start Session first!');
    const predicted = isCorrect ? target : 'X';
    const conf = isCorrect ? 0.96 : 0.40;

    try {
      const res = await processAttempt({
        session_id: session,
        target_alphabet: target,
        predicted_alphabet: predicted,
        confidence: conf,
        inference_time_ms: 38.5
      });

      setTelemetry(prev => ({
        attempts: prev.attempts + 1,
        correct: prev.correct + (isCorrect ? 1 : 0),
        confidence: Math.round(((prev.confidence * prev.attempts) + (conf * 100)) / (prev.attempts + 1))
      }));

      setLastFeedback(res.feedback);
      if (res.updated_learner_state) setState(res.updated_learner_state.current_state);
      if (res.next_recommendation) setTarget(res.next_recommendation.alphabet);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnd = async () => {
    if (!session) return;
    const res = await endCycle(session);
    setSummaryModal(res.session_summary);
    setSession(null);
  };

  const guide = ASL_ALPHABETS[target] || ASL_ALPHABETS['D'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Real-Time Practice Studio</h1>
          <p className="text-gray-400 text-sm">Computer-vision assisted ASL practice</p>
        </div>
        {!session ? (
          <button onClick={handleStart} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition">
            <Play size={18} /> Start Session
          </button>
        ) : (
          <button onClick={handleEnd} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg font-medium transition">
            <StopCircle size={18} /> End Session
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-xl p-4 flex flex-col justify-between min-h-[380px] relative">
          <div className="absolute top-4 left-4 flex gap-3 text-xs bg-black/70 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-800">
            <span className="flex items-center gap-1 text-emerald-400"><Activity size={14} /> 38.5 ms</span>
            <span className="text-gray-400">30 FPS</span>
            <span className="text-indigo-400">Confidence: {telemetry.confidence}%</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center my-8 text-center space-y-2">
            <Camera size={40} className="text-indigo-400" />
            <p className="text-gray-300 font-medium text-sm">Webcam Stream / Simulation Active</p>
          </div>

          <div className="pt-4 border-t border-gray-800 flex gap-3 justify-center">
            <button onClick={() => handleSimulate(true)} className="flex items-center gap-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-600/30 transition">
              <CheckCircle size={16} /> Simulate Correct ({target})
            </button>
            <button onClick={() => handleSimulate(false)} className="flex items-center gap-2 bg-rose-600/20 text-rose-400 border border-rose-500/30 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-rose-600/30 transition">
              <XCircle size={16} /> Simulate Mistake
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111827] border border-indigo-500/30 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center text-xs text-gray-400 border-b border-gray-800 pb-2">
              <span className="font-bold uppercase tracking-wider text-indigo-400">Target Reference</span>
              <span className="text-indigo-300">Target: {target}</span>
            </div>

            <div className="p-4 bg-black/60 rounded-xl border border-indigo-500/20 text-center space-y-2">
              <div className="text-6xl font-black text-indigo-400">{target}</div>
              <div className="text-left text-xs space-y-1 pt-2 border-t border-gray-800">
                <p className="text-gray-300"><span className="text-indigo-400 font-bold">Thumb:</span> {guide.thumb}</p>
                <p className="text-gray-300"><span className="text-indigo-400 font-bold">Fingers:</span> {guide.fingers}</p>
                <p className="text-indigo-300 font-medium pt-1">💡 {guide.tip}</p>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm pt-1">
              <span className="text-gray-400">State:</span>
              <span className="font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800 text-xs">{state}</span>
            </div>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-2 text-xs">
            <h3 className="font-semibold text-gray-400 uppercase">Session Telemetry</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/40 p-2 rounded border border-gray-800">Attempts: <span className="font-bold text-white">{telemetry.attempts}</span></div>
              <div className="bg-black/40 p-2 rounded border border-gray-800">Correct: <span className="font-bold text-emerald-400">{telemetry.correct}</span></div>
            </div>
            <p className="text-gray-400 italic pt-1">{lastFeedback}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><Info size={16} className="text-indigo-400" /> 26 ASL Alphabet Reference Grid</h3>
        <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-13 gap-2">
          {Object.keys(ASL_ALPHABETS).map(l => (
            <button key={l} onClick={() => setTarget(l)} className={`p-2 rounded-lg font-bold text-xs border transition ${l === target ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-black/40 text-gray-400 border-gray-800 hover:bg-gray-800'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {summaryModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#111827] border border-indigo-500/30 p-6 rounded-xl max-w-md w-full space-y-4">
            <h2 className="text-xl font-bold text-white text-center">Session Completed</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-gray-800 py-1"><span className="text-gray-400">Attempts:</span><span className="font-bold">{summaryModal.total_attempts}</span></div>
              <div className="flex justify-between border-b border-gray-800 py-1"><span className="text-gray-400">Accuracy:</span><span className="font-bold text-emerald-400">{(summaryModal.session_accuracy * 100).toFixed(1)}%</span></div>
              <div className="flex justify-between py-1"><span className="text-gray-400">Avg Confidence:</span><span className="font-bold text-indigo-400">{(summaryModal.average_confidence * 100).toFixed(1)}%</span></div>
            </div>
            <button onClick={() => setSummaryModal(null)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-semibold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
