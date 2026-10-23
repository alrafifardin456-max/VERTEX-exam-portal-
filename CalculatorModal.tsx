import React, { useState } from 'react';
import { X, Delete, RotateCcw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [isNewNumber, setIsNewNumber] = useState(true);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (isNewNumber || display === '0') {
      setDisplay(digit);
      setIsNewNumber(false);
    } else {
      if (display.length < 14) {
        setDisplay(display + digit);
      }
    }
  };

  const handleDecimal = () => {
    if (isNewNumber) {
      setDisplay('0.');
      setIsNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setIsNewNumber(true);
  };

  const handleBackspace = () => {
    if (isNewNumber || display.length <= 1) {
      setDisplay('0');
      setIsNewNumber(true);
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const handleOp = (op: string) => {
    setExpression(`${display} ${op} `);
    setIsNewNumber(true);
  };

  const handleEqual = () => {
    try {
      if (!expression) return;
      const fullExpr = (expression + display).replace(/×/g, '*').replace(/÷/g, '/');
      // Simple safe math evaluation
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${fullExpr})`)();
      const formatted = Number.isInteger(result) ? result.toString() : Number(result.toFixed(6)).toString();
      setDisplay(formatted);
      setExpression('');
      setIsNewNumber(true);
    } catch (e) {
      setDisplay('Error');
      setIsNewNumber(true);
    }
  };

  const handleFunc = (func: string) => {
    const val = parseFloat(display);
    if (isNaN(val)) return;

    let res = 0;
    switch (func) {
      case 'sqrt':
        res = Math.sqrt(val);
        break;
      case 'sqr':
        res = val * val;
        break;
      case 'inv':
        res = val !== 0 ? 1 / val : 0;
        break;
      case 'sin':
        res = Math.sin((val * Math.PI) / 180);
        break;
      case 'cos':
        res = Math.cos((val * Math.PI) / 180);
        break;
      case 'tan':
        res = Math.tan((val * Math.PI) / 180);
        break;
      case 'log':
        res = val > 0 ? Math.log10(val) : 0;
        break;
      case 'ln':
        res = val > 0 ? Math.log(val) : 0;
        break;
      case 'neg':
        res = -val;
        break;
    }
    const formatted = Number.isInteger(res) ? res.toString() : Number(res.toFixed(6)).toString();
    setDisplay(formatted);
    setIsNewNumber(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl glass-panel-elevated neon-border-violet shadow-2xl p-5 text-white overflow-hidden">
        {/* Top vibrant accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-cyan-400 via-fuchsia-500 to-emerald-400" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-violet-500/20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse" />
            <h3 className="font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-200 to-white text-sm">
              ভর্তি পরীক্ষা ক্যালকুলেটর
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display */}
        <div className="my-4 p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 text-right shadow-inner">
          <div className="text-xs text-cyan-300/70 h-5 font-mono overflow-hidden">
            {expression || '\u00A0'}
          </div>
          <div className="text-3xl font-mono-digits font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-300 via-teal-300 to-emerald-300 truncate tracking-wider">
            {display}
          </div>
        </div>

        {/* Scientific / Special buttons */}
        <div className="grid grid-cols-4 gap-2 mb-2 text-xs font-semibold">
          <button
            onClick={() => handleFunc('sin')}
            className="py-2 rounded-xl glass-panel text-cyan-300 hover:text-white border-violet-500/30 hover:border-cyan-400/50 transition-colors cursor-pointer"
          >
            sin
          </button>
          <button
            onClick={() => handleFunc('cos')}
            className="py-2 rounded-xl glass-panel text-cyan-300 hover:text-white border-violet-500/30 hover:border-cyan-400/50 transition-colors cursor-pointer"
          >
            cos
          </button>
          <button
            onClick={() => handleFunc('tan')}
            className="py-2 rounded-xl glass-panel text-cyan-300 hover:text-white border-violet-500/30 hover:border-cyan-400/50 transition-colors cursor-pointer"
          >
            tan
          </button>
          <button
            onClick={() => handleFunc('sqrt')}
            className="py-2 rounded-xl glass-panel text-emerald-400 hover:text-emerald-300 border-emerald-500/30 hover:border-emerald-400/60 transition-colors font-mono cursor-pointer"
          >
            √x
          </button>
          <button
            onClick={() => handleFunc('sqr')}
            className="py-2 rounded-xl glass-panel text-slate-300 hover:text-white border-violet-500/30 hover:border-cyan-400/50 transition-colors font-mono cursor-pointer"
          >
            x²
          </button>
          <button
            onClick={() => handleFunc('inv')}
            className="py-2 rounded-xl glass-panel text-slate-300 hover:text-white border-violet-500/30 hover:border-cyan-400/50 transition-colors font-mono cursor-pointer"
          >
            1/x
          </button>
          <button
            onClick={() => handleFunc('log')}
            className="py-2 rounded-xl glass-panel text-slate-300 hover:text-white border-violet-500/30 hover:border-cyan-400/50 transition-colors font-mono cursor-pointer"
          >
            log
          </button>
          <button
            onClick={() => handleFunc('ln')}
            className="py-2 rounded-xl glass-panel text-slate-300 hover:text-white border-violet-500/30 hover:border-cyan-400/50 transition-colors font-mono cursor-pointer"
          >
            ln
          </button>
        </div>

        {/* Main Keypad */}
        <div className="grid grid-cols-4 gap-2 font-mono-digits">
          <button
            onClick={handleClear}
            className="py-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> C
          </button>
          <button
            onClick={handleBackspace}
            className="py-3 rounded-xl glass-panel text-slate-300 hover:text-white border-violet-500/30 hover:border-cyan-400/40 transition-colors flex items-center justify-center cursor-pointer"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleFunc('neg')}
            className="py-3 rounded-xl glass-panel text-slate-300 hover:text-white border-violet-500/30 hover:border-cyan-400/40 transition-colors font-bold cursor-pointer"
          >
            ±
          </button>
          <button
            onClick={() => handleOp('÷')}
            className="py-3 rounded-xl bg-violet-600/30 text-cyan-300 border border-violet-500/40 hover:bg-violet-600/50 hover:border-cyan-400 text-lg font-bold transition-colors cursor-pointer"
          >
            ÷
          </button>

          {['7', '8', '9'].map(d => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="py-3 rounded-xl glass-panel text-slate-100 hover:text-cyan-200 border-violet-500/20 hover:border-cyan-400/40 text-lg font-semibold transition-colors cursor-pointer"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => handleOp('×')}
            className="py-3 rounded-xl bg-violet-600/30 text-cyan-300 border border-violet-500/40 hover:bg-violet-600/50 hover:border-cyan-400 text-lg font-bold transition-colors cursor-pointer"
          >
            ×
          </button>

          {['4', '5', '6'].map(d => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="py-3 rounded-xl glass-panel text-slate-100 hover:text-cyan-200 border-violet-500/20 hover:border-cyan-400/40 text-lg font-semibold transition-colors cursor-pointer"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => handleOp('-')}
            className="py-3 rounded-xl bg-violet-600/30 text-cyan-300 border border-violet-500/40 hover:bg-violet-600/50 hover:border-cyan-400 text-lg font-bold transition-colors cursor-pointer"
          >
            -
          </button>

          {['1', '2', '3'].map(d => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="py-3 rounded-xl glass-panel text-slate-100 hover:text-cyan-200 border-violet-500/20 hover:border-cyan-400/40 text-lg font-semibold transition-colors cursor-pointer"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => handleOp('+')}
            className="py-3 rounded-xl bg-violet-600/30 text-cyan-300 border border-violet-500/40 hover:bg-violet-600/50 hover:border-cyan-400 text-lg font-bold transition-colors cursor-pointer"
          >
            +
          </button>

          <button
            onClick={() => handleDigit('0')}
            className="col-span-2 py-3 rounded-xl glass-panel text-slate-100 hover:text-cyan-200 border-violet-500/20 hover:border-cyan-400/40 text-lg font-semibold transition-colors cursor-pointer"
          >
            0
          </button>
          <button
            onClick={handleDecimal}
            className="py-3 rounded-xl glass-panel text-slate-100 hover:text-cyan-200 border-violet-500/20 hover:border-cyan-400/40 text-lg font-semibold transition-colors cursor-pointer"
          >
            .
          </button>
          <button
            onClick={handleEqual}
            className="py-3 rounded-xl bg-linear-to-r from-emerald-400 to-teal-400 text-slate-950 hover:brightness-110 text-xl font-black transition-all shadow-lg shadow-emerald-500/30 cursor-pointer"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};
