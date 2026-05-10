import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSun, FaMoon, FaHistory, FaTrash, FaCopy, FaPaste, 
  FaPercent, FaBackspace, FaPlus, FaMinus, FaTimes, FaDivide, FaEquals,
  FaSquareRootAlt, FaSuperscript
} from 'react-icons/fa';
import { evaluate } from 'mathjs';
import './App.css';

function App() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState([]);
  const [memory, setMemory] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [angleMode, setAngleMode] = useState('deg');

  useEffect(() => {
    const savedHistory = localStorage.getItem('calc_history');
    const savedDarkMode = localStorage.getItem('calc_darkMode');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
  }, []);

  useEffect(() => {
    localStorage.setItem('calc_history', JSON.stringify(history.slice(0, 50)));
    localStorage.setItem('calc_darkMode', JSON.stringify(darkMode));
  }, [history, darkMode]);

  const appendNumber = (num) => {
    if (display === '0' && num !== '.') {
      setDisplay(num.toString());
      setExpression(num.toString());
    } else {
      setDisplay(display + num);
      setExpression(expression + num);
    }
  };

  const appendOperator = (op) => {
    if (expression && !isNaN(expression.slice(-1))) {
      setExpression(expression + op);
      setDisplay(op);
    } else if (expression && expression.slice(-1) !== op) {
      setExpression(expression.slice(0, -1) + op);
      setDisplay(op);
    }
  };

  const appendFunction = (func) => {
    setExpression(expression + func + '(');
    setDisplay(func + '(');
  };

  const calculate = () => {
    try {
      let expr = expression;
      if (angleMode === 'rad') {
        expr = expr.replace(/sin\(/g, 'sin(');
        expr = expr.replace(/cos\(/g, 'cos(');
        expr = expr.replace(/tan\(/g, 'tan(');
      }
      
      let result = evaluate(expr);
      
      if (typeof result === 'number') {
        result = Math.round(result * 1000000) / 1000000;
        const historyItem = {
          id: Date.now(),
          expression: expression,
          result: result,
          timestamp: new Date().toLocaleTimeString()
        };
        setHistory([historyItem, ...history]);
        setDisplay(result.toString());
        setExpression(result.toString());
        toast.success('Calculated!');
      }
    } catch (error) {
      toast.error('Invalid expression');
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setExpression('');
    toast.info('Cleared');
  };

  const clearLast = () => {
    if (expression.length > 0) {
      const newExpr = expression.slice(0, -1);
      setExpression(newExpr);
      setDisplay(newExpr.slice(-1) || '0');
    }
  };

  const toggleSign = () => {
    if (expression && !isNaN(parseFloat(expression))) {
      const val = parseFloat(expression) * -1;
      setDisplay(val.toString());
      setExpression(val.toString());
    }
  };

  const percentage = () => {
    if (expression && !isNaN(parseFloat(expression))) {
      const val = parseFloat(expression) / 100;
      setDisplay(val.toString());
      setExpression(val.toString());
    }
  };

  const squareRoot = () => {
    if (expression && !isNaN(parseFloat(expression))) {
      const val = Math.sqrt(parseFloat(expression));
      setDisplay(val.toString());
      setExpression(val.toString());
    }
  };

  const power = () => {
    appendOperator('^');
  };

  const memoryAdd = () => {
    if (expression && !isNaN(parseFloat(expression))) {
      setMemory(memory + parseFloat(expression));
      toast.success(`Added to memory: ${memory + parseFloat(expression)}`);
    }
  };

  const memorySubtract = () => {
    if (expression && !isNaN(parseFloat(expression))) {
      setMemory(memory - parseFloat(expression));
      toast.success(`Subtracted from memory: ${memory - parseFloat(expression)}`);
    }
  };

  const memoryRecall = () => {
    setDisplay(memory.toString());
    setExpression(memory.toString());
    toast.info(`Recalled memory: ${memory}`);
  };

  const memoryClear = () => {
    setMemory(0);
    toast.info('Memory cleared');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(display);
    toast.success('Copied!');
  };

  const pasteFromClipboard = async () => {
    const text = await navigator.clipboard.readText();
    if (!isNaN(parseFloat(text))) {
      setDisplay(text);
      setExpression(text);
      toast.success('Pasted!');
    } else {
      toast.error('Not a number');
    }
  };

  const clearHistory = () => {
    setHistory([]);
    toast.info('History cleared');
  };

  const loadFromHistory = (item) => {
    setDisplay(item.result.toString());
    setExpression(item.result.toString());
    setShowHistory(false);
    toast.success('Loaded from history');
  };

  const factorial = (n) => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  };

  const handleFactorial = () => {
    if (expression && !isNaN(parseFloat(expression))) {
      const val = factorial(Math.floor(parseFloat(expression)));
      setDisplay(val.toString());
      setExpression(val.toString());
    }
  };

  const handleTrig = (func) => {
    if (expression && !isNaN(parseFloat(expression))) {
      let val = parseFloat(expression);
      if (angleMode === 'deg') val = val * Math.PI / 180;
      
      let result;
      if (func === 'sin') result = Math.sin(val);
      else if (func === 'cos') result = Math.cos(val);
      else if (func === 'tan') result = Math.tan(val);
      
      result = Math.round(result * 1000000) / 1000000;
      setDisplay(result.toString());
      setExpression(result.toString());
    }
  };

  const buttonVariants = {
    tap: { scale: 0.95 }
  };

  return (
    <div className={`calculator-app ${darkMode ? 'dark' : 'light'}`}>
      <Toaster position="top-right" />
      
      <div className="calculator-container">
        <div className="calculator-header">
          <h1>🧮 SmartCalc</h1>
          <div className="header-buttons">
            <button onClick={() => setShowHistory(!showHistory)} className="icon-btn">
              <FaHistory size={20} />
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="icon-btn">
              {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>
          </div>
        </div>

        <div className="angle-mode">
          <button className={angleMode === 'deg' ? 'active' : ''} onClick={() => setAngleMode('deg')}>DEG</button>
          <button className={angleMode === 'rad' ? 'active' : ''} onClick={() => setAngleMode('rad')}>RAD</button>
        </div>

        <div className="calculator-display">
          <div className="expression">{expression || '0'}</div>
          <div className="result">{display}</div>
          <div className="display-actions">
            <button onClick={copyToClipboard}><FaCopy size={14} /></button>
            <button onClick={pasteFromClipboard}><FaPaste size={14} /></button>
          </div>
        </div>

        {memory !== 0 && (
          <div className="memory-bar">
            <span>M = {memory}</span>
            <button onClick={memoryClear}>Clear</button>
          </div>
        )}

        <AnimatePresence>
          {showHistory && (
            <motion.div 
              className="history-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="history-header">
                <h3>History</h3>
                <button onClick={clearHistory}><FaTrash size={14} /></button>
              </div>
              <div className="history-list">
                {history.length === 0 ? (
                  <p>No history yet</p>
                ) : (
                  history.map(item => (
                    <div key={item.id} className="history-item" onClick={() => loadFromHistory(item)}>
                      <span>{item.expression} = {item.result}</span>
                      <small>{item.timestamp}</small>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="calculator-buttons">
          <motion.button whileTap="tap" variants={buttonVariants} onClick={clearAll} className="btn clear">AC</motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={clearLast} className="btn clear"><FaBackspace size={18} /></motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={() => handleTrig('sin')} className="btn func">sin</motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={() => handleTrig('cos')} className="btn func">cos</motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={() => handleTrig('tan')} className="btn func">tan</motion.button>

          <motion.button whileTap="tap" variants={buttonVariants} onClick={() => appendNumber(7)} className="btn num">7</motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={() => appendNumber(8)} className="btn num">8</motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={() => appendNumber(9)} className="btn num">9</motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={() => appendOperator('/')} className="btn op"><FaDivide size={20} /></motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={squareRoot} className="btn func"><FaSquareRootAlt size={18} /></motion.button>

          <motion.button whileTap="tap" variants={buttonVariants} onClick={() => appendNumber(4)} className="btn num">4</motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={() => appendNumber(5)} className="btn num">5</motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={() => appendNumber(6)} className="btn num">6</motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={() => appendOperator('*')} className="btn op"><FaTimes size={20} /></motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={power} className="btn func"><FaSuperscript size={18} /></motion.button>

          <motion.button whileTap="tap" variants={buttonVariants} onClick={() => appendNumber(1)} className="btn num">1</motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={() => appendNumber(2)} className="btn num">2</motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={() => appendNumber(3)} className="btn num">3</motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={() => appendOperator('-')} className="btn op"><FaMinus size={20} /></motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={percentage} className="btn func"><FaPercent size={18} /></motion.button>

          <motion.button whileTap="tap" variants={buttonVariants} onClick={toggleSign} className="btn func">±</motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={() => appendNumber(0)} className="btn num zero">0</motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={() => appendNumber('.')} className="btn num">.</motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={() => appendOperator('+')} className="btn op"><FaPlus size={20} /></motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={calculate} className="btn equals"><FaEquals size={24} /></motion.button>

          <motion.button whileTap="tap" variants={buttonVariants} onClick={memoryAdd} className="btn mem">M+</motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={memorySubtract} className="btn mem">M-</motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={memoryRecall} className="btn mem">MR</motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={memoryClear} className="btn mem">MC</motion.button>
          <motion.button whileTap="tap" variants={buttonVariants} onClick={handleFactorial} className="btn func">n!</motion.button>
        </div>
      </div>
    </div>
  );
}

export default App;