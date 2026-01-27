<!DOCTYPE html>
<html lang="zh-HK">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="theme-color" content="#ffffff">
    <title>壽司郎計算機</title>
    
    <!-- Icon 設定 -->
    <link rel="apple-touch-icon" href="icon.png">
    <link rel="icon" type="image/png" href="icon.png">
    
    <!-- 修復樣式載入問題 -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- 使用 Cloudflare cdnjs 加速 React 載入 -->
    <script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
    <script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"></script>

    <style>
        body {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
            overscroll-behavior-y: none;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Keypad Animation */
        @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        .animate-slide-up {
            animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        /* Loading Fallback */
        #root:empty::before {
            content: '載入中...';
            display: block;
            text-align: center;
            padding-top: 50vh;
            color: #999;
        }
    </style>
</head>
<body class="bg-[#F5F5F5]">
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect, useRef, memo, useCallback } = React;

        // --- Icons ---
        const Plus = ({ size = 24, strokeWidth = 2 }) => (
            <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        );
        const Minus = ({ size = 24, strokeWidth = 2 }) => (
            <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        );
        const RemoveIcon = ({ size = 24 }) => (
            <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        );
        const TimerIcon = ({ size = 16, className }) => (
             <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        );
        const PauseIcon = ({ size = 16, className }) => (
            <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
        );
        const PlayIcon = ({ size = 16, className }) => (
            <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        );
        const StopIcon = ({ size = 16, className }) => (
            <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
        );
        const BackspaceIcon = ({ size = 24 }) => (
            <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
        );
        const UndoIcon = ({ size = 16, className }) => (
            <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
        );
        const UserIcon = ({ size = 12, className }) => (
            <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        );

        // --- Extracted Components ---
        const PlateCard = memo(({ plate, count, onUpdate }) => (
            <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm flex items-center h-24 overflow-hidden relative">
                <div className="flex-shrink-0 mr-3">
                    <img 
                        src={plate.img} 
                        alt={plate.label}
                        className="w-14 h-14 object-contain drop-shadow-sm" 
                        onError={(e) => { e.target.style.display = 'none'; }} 
                    />
                </div>
                <div className="flex-1 flex flex-col justify-between h-full py-1 min-w-0">
                    <div className="flex justify-between items-start w-full">
                        <span className={`font-black text-lg ${plate.textColor} truncate mr-1`}>{plate.label}</span>
                        <div className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-bold text-slate-600 flex-shrink-0">
                            ${plate.price}
                        </div>
                    </div>
                    <div className="flex justify-end items-center space-x-1.5 mt-auto">
                        <button onClick={() => onUpdate(plate.id, -1)} className={`w-8 h-7 flex items-center justify-center rounded-lg font-bold text-lg border transition-all active:bg-slate-100 ${count > 0 ? 'border-slate-200 text-slate-600 bg-white' : 'border-transparent text-slate-200 bg-slate-50'}`}>-</button>
                        <span className={`w-6 text-center font-black text-xl tabular-nums ${count > 0 ? 'text-slate-800' : 'text-slate-200'}`}>{count}</span>
                        <button onClick={() => onUpdate(plate.id, 1)} className="w-8 h-7 flex items-center justify-center rounded-lg font-bold text-lg bg-white text-blue-600 border border-slate-200 shadow-sm active:scale-95 active:bg-blue-50 transition-all"><Plus size={16} strokeWidth={3} /></button>
                    </div>
                </div>
            </div>
        ));

        const Keypad = memo(({ value, onChange, onAdd, onClose, onHaptic }) => {
            const handleKeypadPress = (num) => {
                if (value.length < 5) onChange(prev => prev + num);
                onHaptic();
            };
            const handleBackspace = () => {
                onChange(prev => prev.slice(0, -1));
                onHaptic();
            };
            return (
                <div className="fixed inset-0 z-[60] flex flex-col justify-end">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
                    <div className="bg-white rounded-t-3xl shadow-2xl relative z-10 animate-slide-up overflow-hidden pb-safe">
                        <div className="bg-slate-100 p-4 flex justify-between items-center border-b border-slate-200">
                             <div className="flex flex-col">
                                 <span className="text-xs font-bold text-slate-400 uppercase">自訂價格</span>
                                 <div className="flex items-center text-3xl font-black text-slate-800">
                                     <span className="text-xl mr-1 text-slate-500">$</span>
                                     <span>{value || '0'}</span>
                                 </div>
                             </div>
                             <button onClick={onClose} className="bg-slate-200 p-2 rounded-full text-slate-500">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                             </button>
                        </div>
                        <div className="grid grid-cols-3 gap-1 p-2 bg-slate-100">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button key={num} onClick={() => handleKeypadPress(num.toString())} className="bg-white h-16 rounded-xl shadow-sm text-2xl font-bold text-slate-700 active:bg-slate-50 active:scale-[0.98] transition-all">{num}</button>
                            ))}
                            <button onClick={handleBackspace} className="bg-white h-16 rounded-xl shadow-sm text-slate-500 flex items-center justify-center active:bg-slate-50"><BackspaceIcon size={28} /></button>
                            <button onClick={() => handleKeypadPress('0')} className="bg-white h-16 rounded-xl shadow-sm text-2xl font-bold text-slate-700 active:bg-slate-50">0</button>
                            <button onClick={onAdd} className="bg-blue-600 h-16 rounded-xl shadow-sm text-white flex items-center justify-center space-x-1 active:bg-blue-700 active:scale-[0.98] transition-all"><span className="text-lg font-bold">加入</span></button>
                        </div>
                        <div className="bg-slate-100 h-6"></div>
                    </div>
                </div>
            );
        });

        // --- Main App ---
        const SushiroApp = () => {
            const PLATES = [
                { id: 'red', price: 12, label: '紅碟', img: 'red.png', textColor: 'text-[#d32f2f]' },
                { id: 'silver', price: 17, label: '銀碟', img: 'silver.png', textColor: 'text-slate-600' },
                { id: 'gold', price: 22, label: '金碟', img: 'gold.png', textColor: 'text-yellow-700' },
                { id: 'black', price: 27, label: '黑碟', img: 'black.png', textColor: 'text-gray-800' },
            ];
            const OTHER_PRICES = [10, 13, 18, 19, 20, 27, 28, 32, 33, 39];

            const [counts, setCounts] = useState({ red: 0, silver: 0, gold: 0, black: 0 });
            const [extraItems, setExtraItems] = useState([]); 
            const [customPrice, setCustomPrice] = useState('');
            const [resetState, setResetState] = useState('idle');
            const [history, setHistory] = useState([]);
            const [peopleCount, setPeopleCount] = useState(1);
            const [timerMode, setTimerMode] = useState('idle');
            const [startTime, setStartTime] = useState(null);
            const [targetTime, setTargetTime] = useState(null);
            const [elapsedMs, setElapsedMs] = useState(0);
            const [remainingMs, setRemainingMs] = useState(60 * 60 * 1000);
            const [showKeypad, setShowKeypad] = useState(false);

            const haptic = useCallback(() => {
                if (window.navigator && window.navigator.vibrate) {
                    window.navigator.vibrate(10);
                }
            }, []);

            const saveToHistory = () => {
                setHistory(prev => [...prev, {
                    counts: { ...counts },
                    extraItems: JSON.parse(JSON.stringify(extraItems)) 
                }]);
            };

            const handleUndo = () => {
                if (history.length === 0) return;
                const previous = history[history.length - 1];
                setCounts(previous.counts);
                setExtraItems(previous.extraItems);
                setHistory(prev => prev.slice(0, -1));
                haptic();
            };

            // Load Data
            useEffect(() => {
                const saved = localStorage.getItem('sushiro_data_v28');
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        if (parsed.counts) setCounts(parsed.counts);
                        if (Array.isArray(parsed.extraItems)) setExtraItems(parsed.extraItems);
                        if (parsed.timerMode) setTimerMode(parsed.timerMode);
                        if (parsed.startTime) setStartTime(parsed.startTime);
                        if (parsed.targetTime) setTargetTime(parsed.targetTime);
                        if (parsed.peopleCount) setPeopleCount(parsed.peopleCount);
                    } catch(e) { console.error(e); }
                }
            }, []);

            // Save Data
            useEffect(() => {
                localStorage.setItem('sushiro_data_v28', JSON.stringify({ 
                    counts, extraItems, timerMode, startTime, targetTime, peopleCount
                }));
            }, [counts, extraItems, timerMode, startTime, targetTime, peopleCount]);

            // Timer Logic
            useEffect(() => {
                let interval = null;
                if (timerMode === 'running' && startTime && targetTime) {
                    const updateTimer = () => {
                        const now = Date.now();
                        const elapsed = now - startTime;
                        const remaining = targetTime - now;
                        setElapsedMs(elapsed >= 0 ? elapsed : 0);
                        if (remaining <= 0) {
                            setRemainingMs(0);
                            setTimerMode('paused'); 
                            haptic();
                        } else {
                            setRemainingMs(remaining);
                        }
                    };
                    updateTimer(); 
                    interval = setInterval(updateTimer, 1000);
                }
                return () => { if (interval) clearInterval(interval); };
            }, [timerMode, startTime, targetTime]);

            // Idle State Logic
            useEffect(() => {
                if (timerMode === 'idle') {
                    setElapsedMs(0);
                    setRemainingMs(60 * 60 * 1000);
                }
            }, [timerMode]);

            // Actions
            const startTimer = () => {
                const now = Date.now();
                setStartTime(now);
                setTargetTime(now + (60 * 60 * 1000)); 
                setTimerMode('running');
                haptic();
            };
            const pauseTimer = () => { setTimerMode('paused'); haptic(); };
            const resumeTimer = () => {
                const now = Date.now();
                const newTarget = now + remainingMs;
                const newStart = now - elapsedMs;
                setTargetTime(newTarget);
                setStartTime(newStart);
                setTimerMode('running');
                haptic();
            };
            const resetTimer = () => {
                setTimerMode('idle');
                setStartTime(null);
                setTargetTime(null);
                setElapsedMs(0);
                setRemainingMs(60 * 60 * 1000);
                haptic();
            };

            const formatTime = (ms) => {
                if (!ms || ms < 0) ms = 0;
                const totalSeconds = Math.floor(ms / 1000);
                const m = Math.floor(totalSeconds / 60);
                const s = totalSeconds % 60;
                return `${m}:${s < 10 ? '0' : ''}${s}`;
            };

            const getEntryTimeStr = (ts) => {
                if (!ts) return "--:--";
                const date = new Date(ts);
                let hours = date.getHours();
                const minutes = date.getMinutes();
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12; 
                const m = minutes.toString().padStart(2, '0');
                return `${hours}:${m} ${ampm}`;
            };

            // App Logic
            const safeUpdatePlate = (id, delta) => {
                saveToHistory();
                setCounts(prev => ({ ...prev, [id]: Math.max(0, prev[id] + delta) }));
                haptic();
            }

            const addExtra = (price) => {
                if (!price || isNaN(price)) return;
                saveToHistory();
                setExtraItems(prev => {
                    const list = Array.isArray(prev) ? prev : [];
                    const existing = list.find(item => item.price === price);
                    if (existing) {
                        return list.map(item => item.price === price ? { ...item, count: item.count + 1 } : item);
                    }
                    return [...list, { id: Date.now(), price, count: 1 }];
                });
                haptic();
            };

            const updateExtraCount = (id, delta) => {
                saveToHistory();
                setExtraItems(prev => {
                    const list = Array.isArray(prev) ? prev : [];
                    return list.map(item => {
                        if (item.id === id) return { ...item, count: Math.max(0, item.count + delta) };
                        return item;
                    }).filter(item => item.count > 0);
                });
                haptic();
            };

            const removeExtra = (id) => {
                saveToHistory();
                setExtraItems(prev => {
                    const list = Array.isArray(prev) ? prev : [];
                    return list.filter(item => item.id !== id);
                });
                haptic();
            }

            const handleReset = () => {
                if (resetState === 'idle') {
                    setResetState('confirm');
                    setTimeout(() => setResetState('idle'), 3000);
                } else {
                    saveToHistory();
                    setCounts({ red: 0, silver: 0, gold: 0, black: 0 });
                    setExtraItems([]);
                    setCustomPrice('');
                    setResetState('idle');
                    haptic();
                }
            };

            const onKeypadAdd = useCallback(() => {
                if (customPrice) {
                    addExtra(parseInt(customPrice));
                    setCustomPrice('');
                    setShowKeypad(false);
                }
            }, [customPrice, extraItems, counts]);

            // Calculation
            const safeExtraItems = Array.isArray(extraItems) ? extraItems : [];
            const subtotal = 
                Object.keys(counts).reduce((acc, key) => {
                    const plate = PLATES.find(p => p.id === key);
                    return acc + counts[key] * (plate ? plate.price : 0);
                }, 0) +
                safeExtraItems.reduce((acc, item) => acc + (item.price || 0) * (item.count || 0), 0);
                
            const charge = Math.round(subtotal * 0.1);
            const total = subtotal + charge;
            const totalItems = Object.values(counts).reduce((a, b) => a + b, 0) + safeExtraItems.reduce((a, b) => a + b.count, 0);
            
            // Split Bill Calc (1 decimal place)
            const perPerson = (total / Math.max(1, peopleCount)).toFixed(1);

            return (
                <div className="min-h-screen bg-[#F5F5F5] font-sans pb-48">
                    {/* Header */}
                    <div className="bg-white sticky top-0 z-50 px-3 py-3 shadow-sm border-b border-slate-200">
                        <div className="max-w-md mx-auto flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <img src="icon.png" alt="Sushiro" className="w-10 h-10 rounded-lg object-contain shadow-sm border border-slate-100" />
                                <h1 className="text-xl font-extrabold text-slate-800 ml-1 tracking-tight">壽司郎計算機</h1>
                            </div>
                            <div className="flex space-x-2">
                                <button 
                                    onClick={handleUndo}
                                    disabled={history.length === 0}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center space-x-1 ${
                                        history.length === 0 
                                        ? 'bg-slate-100 text-slate-300' 
                                        : 'bg-yellow-300 text-yellow-800 active:bg-yellow-400'
                                    }`}
                                >
                                    <UndoIcon size={14} />
                                    <span>復原</span>
                                </button>
                                <button onClick={handleReset} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${resetState === 'confirm' ? 'bg-red-600 text-white scale-105' : 'bg-pink-500 text-white active:bg-pink-600'}`}>
                                    {resetState === 'confirm' ? '確定?' : '重新設定'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-md mx-auto p-3 space-y-5">
                        <div className="grid grid-cols-2 gap-3">
                            {PLATES.map(plate => (
                                <PlateCard key={plate.id} plate={plate} count={counts[plate.id]} onUpdate={safeUpdatePlate} />
                            ))}
                        </div>

                        <div>
                            <div className="flex items-center space-x-2 mb-2 px-1">
                                <div className="w-1 h-3 rounded-full bg-blue-500"></div>
                                <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">熱食 / 甜品 / 其他</h3>
                            </div>
                            <div className="grid grid-cols-5 gap-2 mb-3">
                                {OTHER_PRICES.map(price => (
                                    <button key={price} onClick={() => addExtra(price)} className="bg-white border border-slate-200 py-2 rounded-xl shadow-sm active:bg-blue-50 active:border-blue-400 active:text-blue-600 transition-all flex flex-col items-center justify-center hover:border-blue-200">
                                        <span className="text-sm font-black text-slate-700">${price}</span>
                                    </button>
                                ))}
                            </div>
                            
                            <div onClick={() => setShowKeypad(true)} className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm h-11 cursor-pointer active:bg-slate-50 transition-colors">
                                <span className="pl-3 text-slate-400 font-bold text-xs whitespace-nowrap">自訂 $</span>
                                <div className="flex-1 px-2 text-lg font-bold text-slate-800">{customPrice || <span className="text-slate-300">...</span>}</div>
                                <div className="bg-slate-800 text-white w-9 h-9 rounded-lg flex items-center justify-center mr-0.5"><Plus size={18} /></div>
                            </div>
                            
                            {safeExtraItems.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                    {safeExtraItems.map(item => (
                                        <div key={item.id} className="flex items-center justify-between bg-white border border-blue-100 p-2 rounded-lg shadow-sm animate-in fade-in zoom-in-95 duration-200">
                                            <div className="font-black text-blue-600 text-base pl-1">${item.price}</div>
                                            <div className="flex items-center bg-blue-50 rounded-md border border-blue-100 h-8 px-1">
                                                <button onClick={() => updateExtraCount(item.id, -1)} className="w-6 flex items-center justify-center text-slate-400 active:bg-slate-200 text-lg font-bold rounded">-</button>
                                                <span className="w-6 text-center font-bold text-slate-800 text-base tabular-nums">{item.count}</span>
                                                <button onClick={() => updateExtraCount(item.id, 1)} className="w-6 flex items-center justify-center text-blue-600 active:bg-blue-200 text-lg font-bold rounded">+</button>
                                            </div>
                                            <button onClick={() => removeExtra(item.id)} className="text-slate-300 hover:text-red-500 px-1"><RemoveIcon size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-50 pb-safe">
                        <div className="w-full bg-slate-50 border-b border-slate-100 px-4 py-2 flex justify-between items-center h-14">
                            {timerMode === 'idle' ? (
                                <button onClick={startTimer} className="w-full flex items-center justify-center space-x-2 text-blue-600 font-bold text-sm bg-white border border-blue-200 px-4 py-2 rounded-full shadow-sm active:scale-95 transition-all">
                                    <TimerIcon size={16} /><span>開始 60 分鐘用餐倒數</span>
                                </button>
                            ) : (
                                <div className="w-full flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center space-x-1">
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">已用餐</span>
                                            <span className="text-lg font-bold tabular-nums text-slate-700 leading-none">{formatTime(elapsedMs)}</span>
                                        </div>
                                        <div className="w-px h-5 bg-slate-300 mx-1"></div>
                                        <div className="flex items-center space-x-1">
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">剩餘</span>
                                            <span className={`text-2xl font-black tabular-nums leading-none ${remainingMs <= 15*60*1000 ? 'text-red-600 animate-pulse' : 'text-emerald-600'}`}>{formatTime(remainingMs)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex flex-col items-end justify-center mr-2">
                                             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">入場</span>
                                             <span className="text-[10px] font-medium tabular-nums text-slate-400 leading-tight">
                                                 {getEntryTimeStr(startTime)}
                                             </span>
                                        </div>
                                        {timerMode === 'running' ? (
                                            <button onClick={pauseTimer} className="flex flex-col items-center justify-center bg-yellow-100 text-yellow-700 w-10 h-9 rounded-lg active:bg-yellow-200"><PauseIcon size={12} /><span className="text-[8px] font-bold mt-0.5">停止</span></button>
                                        ) : (
                                            <button onClick={resumeTimer} className="flex flex-col items-center justify-center bg-green-100 text-green-700 w-10 h-9 rounded-lg active:bg-green-200"><PlayIcon size={12} /><span className="text-[8px] font-bold mt-0.5">繼續</span></button>
                                        )}
                                        <button onClick={resetTimer} className="flex flex-col items-center justify-center bg-slate-200 text-slate-600 w-10 h-9 rounded-lg active:bg-slate-300"><StopIcon size={12} /><span className="text-[8px] font-bold mt-0.5">重設</span></button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-start px-4 py-3 max-w-md mx-auto min-h-[96px]">
                            {/* Left Group: Total */}
                            <div className="flex flex-col">
                                <div className="flex items-center">
                                    <div className="flex items-baseline space-x-0.5 text-emerald-600 mr-3">
                                        <span className="text-xl font-bold">$</span>
                                        <span className="text-5xl font-black tracking-tighter leading-none">{total}</span>
                                    </div>
                                </div>
                                
                                <div className="mt-1">
                                    <span className="text-[9px] text-slate-400 font-bold block">已包括 10% 服務費</span>
                                    <div className="mt-1 pl-0.5">
                                        <p className="text-[8px] text-slate-300 font-bold tracking-wide">Credit by: Cyrus Lau</p>
                                        <p className="text-[8px] text-slate-200 mt-0.5 opacity-60 leading-tight">非官方應用程式 | 商標及版權歸 香港壽司郎 所有</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Group: Split (Left side of right group) & Stats (Right side) */}
                            <div className="flex items-center space-x-3">
                                
                                {/* 1. Split Bill Block - Now aligned left of Items */}
                                <div className="flex flex-col items-end space-y-1">
                                    <div className="flex items-center bg-white border border-slate-200 rounded-md h-6 px-1 shadow-sm">
                                        <button onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))} className="w-5 h-full text-slate-400 active:text-slate-600 flex items-center justify-center"><Minus size={12} strokeWidth={3} /></button>
                                        <div className="flex items-center px-1 space-x-0.5 text-slate-600 border-x border-slate-100 h-4 mx-0.5">
                                            <UserIcon size={10} />
                                            <span className="text-[10px] font-bold tabular-nums leading-none">{peopleCount}</span>
                                        </div>
                                        <button onClick={() => setPeopleCount(peopleCount + 1)} className="w-5 h-full text-blue-500 active:text-blue-700 flex items-center justify-center"><Plus size={12} strokeWidth={3} /></button>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500">每人 ${perPerson}</span>
                                </div>

                                {/* 2. Stats Block */}
                                <div className="flex flex-col items-end space-y-1">
                                    <div className="text-right text-[10px] font-bold text-slate-400 flex flex-col justify-center leading-tight">
                                        <span>小計 ${subtotal}</span>
                                        <span>加一 ${charge}</span>
                                    </div>
                                    <div className="bg-[#FFCC00] text-black h-12 min-w-[3.5rem] px-3 rounded-xl font-bold shadow-sm border-b-4 border-[#E6B800] active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center">
                                        <span className="text-2xl leading-none font-black">{totalItems}</span>
                                        <span className="text-[9px] uppercase font-bold opacity-80">Items</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-2 bg-white"></div>
                    </div>
                    {showKeypad && 
                        <Keypad 
                            value={customPrice}
                            onChange={setCustomPrice}
                            onAdd={onKeypadAdd}
                            onClose={() => setShowKeypad(false)}
                            onHaptic={haptic}
                        />
                    }
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<SushiroApp />);
    </script>
</body>
</html>