import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Users, Trash, ChevronDown, ChevronUp, Download } from 'lucide-react';

const DUMMY_STUDENTS = [
  "李小華", "王大明", "林美麗", "陳建國", "黃雅婷", 
  "張家豪", "吳依林", "周杰倫", "劉奕迅", "蔡小英"
];

const COLOR_CLASSES = [
  'border-t-blue-400', 'border-t-emerald-400', 'border-t-amber-400',
  'border-t-rose-400', 'border-t-fuchsia-400', 'border-t-cyan-400',
  'border-t-indigo-400', 'border-t-orange-400'
];
const HEADER_COLORS = [
  'text-blue-600', 'text-emerald-600', 'text-amber-600',
  'text-rose-600', 'text-fuchsia-600', 'text-cyan-600',
  'text-indigo-600', 'text-orange-600'
];
const COUNT_BG_COLORS = [
  'bg-blue-50', 'bg-emerald-50', 'bg-amber-50',
  'bg-rose-50', 'bg-fuchsia-50', 'bg-cyan-50',
  'bg-indigo-50', 'bg-orange-50'
];

export default function App() {
  const [textInput, setTextInput] = useState(DUMMY_STUDENTS.join('\n'));
  const [numGroups, setNumGroups] = useState<number>(3);
  const [groups, setGroups] = useState<string[][]>([]);

  const [eligibleStudents, setEligibleStudents] = useState<string[]>([]);
  const [drawnStudent, setDrawnStudent] = useState<string | null>(null);

  const [eligibleGroupIndices, setEligibleGroupIndices] = useState<number[]>([]);
  const [drawnGroupIndex, setDrawnGroupIndex] = useState<number | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Parse input dynamically to handle commas, newlines, or spaces
  const parseStudents = () => {
    let delimiterPattern = /[\n,，、\t]+/;
    if (!delimiterPattern.test(textInput) && textInput.includes(' ')) {
      delimiterPattern = /\s+/;
    }
    return textInput.split(delimiterPattern).map(s => s.trim()).filter(s => s);
  }

  const handleGroup = () => {
    const currentStudents = parseStudents();
    if (currentStudents.length === 0) return;

    const shuffled = [...currentStudents].sort(() => Math.random() - 0.5);
    const newGroups: string[][] = Array.from({ length: numGroups }, () => []);
    
    shuffled.forEach((student, index) => {
      newGroups[index % numGroups].push(student);
    });

    setGroups(newGroups);
    setEligibleStudents(currentStudents);
    setEligibleGroupIndices(Array.from({ length: numGroups }, (_, i) => i));
    setDrawnStudent(null);
    setDrawnGroupIndex(null);
    
    // Auto collapse sidebar on mobile after applying group
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const downloadCSV = () => {
    if (groups.length === 0) return;
    
    const header = '\uFEFF組別,學生\n';
    const rows = groups.flatMap((group, i) => 
      group.map(student => `第 ${i + 1} 組,"${student}"`)
    );
    const csvContent = header + rows.join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `分組名單_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    handleGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drawRandomStudent = () => {
    if (eligibleStudents.length === 0) return;
    const randomIndex = Math.floor(Math.random() * eligibleStudents.length);
    setDrawnStudent(eligibleStudents[randomIndex]);
  };

  const removeDrawnStudent = () => {
    if (drawnStudent) {
      setEligibleStudents(prev => prev.filter(s => s !== drawnStudent));
      setDrawnStudent(null);
    }
  };

  const drawRandomGroup = () => {
    if (eligibleGroupIndices.length === 0) return;
    const randomIndex = Math.floor(Math.random() * eligibleGroupIndices.length);
    setDrawnGroupIndex(eligibleGroupIndices[randomIndex]);
  };

  const removeDrawnGroup = () => {
    if (drawnGroupIndex !== null) {
      setEligibleGroupIndices(prev => prev.filter(i => i !== drawnGroupIndex));
      setDrawnGroupIndex(null);
    }
  };

  return (
    <div className="min-h-[100dvh] lg:h-[100dvh] w-full flex flex-col bg-slate-50 text-slate-800 font-sans">
      <header className="h-14 lg:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-20 shrink-0 shadow-sm sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-indigo-600 rounded-lg lg:rounded-xl flex items-center justify-center text-white font-bold text-lg lg:text-xl shadow-inner">抽</div>
          <h1 className="text-lg lg:text-xl font-bold text-slate-800 tracking-tight">智慧分組抽籤</h1>
        </div>
        <div className="flex gap-3 items-center">
          <span className="text-[10px] md:text-sm text-slate-500 bg-slate-100 px-2 lg:px-3 py-1.5 rounded-full font-medium shadow-inner hidden sm:inline-block">v2.5 已連線</span>
          <button 
            className="lg:hidden text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-bold border border-indigo-100 flex items-center gap-1"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            名單設定
            {isSidebarOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </header>
      
      <main className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'flex' : 'hidden'} lg:flex w-full lg:w-[320px] bg-white border-b lg:border-r border-slate-200 p-4 lg:p-6 flex-col gap-4 lg:gap-6 shrink-0 lg:overflow-y-auto hidden-scrollbar z-10 shadow-sm lg:shadow-none absolute lg:relative top-0 left-0 right-0 max-h-[60vh] lg:max-h-none`}>
          <section className="flex-1 lg:flex-none flex flex-col relative min-h-[120px]">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">學生名單輸入</label>
            <textarea 
              className="w-full flex-1 lg:h-48 p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none bg-slate-50/50 hover:bg-slate-50 transition-colors"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="支援換行、逗號或空格分隔..."
            />
            <p className="text-[10px] text-slate-400 mt-2 text-right font-medium">共 {parseStudents().length} 人</p>
          </section>
          
          <section>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">分組設定</label>
            <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-sm text-slate-600 font-medium whitespace-nowrap">分組數</span>
              <input 
                type="range" 
                min={2} 
                max={8} 
                value={numGroups}
                onChange={(e) => setNumGroups(parseInt(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-indigo-600 font-bold w-5 text-center">{numGroups}</span>
            </div>
          </section>
          
          <button 
            onClick={handleGroup}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
          >
            立即隨機分組
          </button>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[5] lg:hidden mt-14"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 p-3 lg:p-8 flex flex-col gap-4 lg:gap-8 bg-slate-50/50 overflow-y-auto lg:overflow-hidden min-w-0">
          
          {/* Groups Grid */}
          <div className="flex flex-col flex-[2] min-h-[300px] lg:min-h-0 lg:overflow-hidden">
            <div className="flex justify-between items-end mb-3 lg:mb-4 px-1 shrink-0">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">自動分組結果</h2>
              {groups.length > 0 && (
                <button 
                  onClick={downloadCSV}
                  className="flex items-center gap-1.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition-colors shadow-sm active:scale-95"
                >
                  <Download size={16} strokeWidth={2.5} />
                  <span className="hidden sm:inline">下載 CSV</span>
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 xl:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5 content-start lg:overflow-y-auto lg:pr-2 pb-2">
              {groups.map((group, i) => {
                const isExcluded = !eligibleGroupIndices.includes(i);
                return (
                  <div key={i} className={`glass-card p-3 lg:p-5 rounded-2xl border-t-[3px] lg:border-t-4 transition-all duration-300 flex flex-col h-full bg-white ${COLOR_CLASSES[i % COLOR_CLASSES.length]} ${isExcluded ? 'opacity-40 grayscale scale-[0.98]' : 'hover:-translate-y-1 hover:shadow-md'}`}>
                    <h3 className={`text-sm lg:text-base font-bold ${HEADER_COLORS[i % HEADER_COLORS.length]} mb-2 lg:mb-4 flex items-center justify-between`}>
                      第 {i + 1} 組
                      <span className={`text-[10px] ${COUNT_BG_COLORS[i % COUNT_BG_COLORS.length]} px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-full font-bold uppercase tracking-wider`}>
                        {group.length} 人
                      </span>
                    </h3>
                    <ul className="flex-1 flex flex-col gap-1 lg:gap-0 lg:space-y-1">
                      {group.map((student, sIdx) => {
                        const isStudentExcluded = !eligibleStudents.includes(student);
                        return (
                          <li key={sIdx} className={`text-[13px] lg:text-sm py-1 lg:py-1.5 flex items-center ${sIdx !== group.length - 1 ? 'border-b border-slate-100/60' : ''} ${isStudentExcluded ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                            <span className="truncate">{student}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
              {groups.length === 0 && (
                <div className="col-span-full py-12 flex items-center justify-center text-slate-400 bg-white/50 border border-slate-200 border-dashed rounded-2xl">
                  尚未產出分組名單，請設定名單後點擊「立即隨機分組」
                </div>
              )}
            </div>
          </div>

          {/* Bottom Draw Action Bar */}
          <div className="bg-white rounded-[1.5rem] lg:rounded-[2rem] p-4 lg:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 lg:gap-8 items-center shrink-0">
            <div className="flex-1 flex flex-col gap-3 lg:gap-4 w-full">
              <div className="flex gap-3 lg:gap-4 h-[80px] lg:h-[100px]">
                <button 
                  onClick={drawRandomStudent}
                  disabled={eligibleStudents.length === 0 || groups.length === 0}
                  className="flex-1 flex flex-col items-center justify-center gap-1.5 lg:gap-2 px-2 border-b-4 border-b-transparent active:border-b-indigo-200 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl lg:rounded-2xl border border-indigo-100 transition-all active:scale-[0.98] group"
                >
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-indigo-600 group-disabled:bg-indigo-300 rounded-full flex items-center justify-center text-white shadow-sm">
                    <User size={16} strokeWidth={2.5} className="lg:w-[18px] lg:h-[18px]" />
                  </div>
                  <span className="font-bold text-indigo-800 text-[13px] lg:text-sm">抽單一學生</span>
                </button>
                
                <button 
                  onClick={drawRandomGroup}
                  disabled={eligibleGroupIndices.length === 0 || groups.length === 0}
                  className="flex-1 flex flex-col items-center justify-center gap-1.5 lg:gap-2 px-2 border-b-4 border-b-transparent active:border-b-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl lg:rounded-2xl border border-slate-200 transition-all active:scale-[0.98] group"
                >
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-700 group-disabled:bg-slate-400 rounded-full flex items-center justify-center text-white shadow-sm">
                    <Users size={16} strokeWidth={2.5} className="lg:w-[18px] lg:h-[18px]" />
                  </div>
                  <span className="font-bold text-slate-700 text-[13px] lg:text-sm">抽取組別</span>
                </button>
              </div>
              <p className="text-[11px] lg:text-xs text-slate-400 text-center md:text-left font-medium">※ 將從上方名單未被排除的項目中隨機抽選。</p>
            </div>
            
            {/* Result Displays */}
            <div className="w-full md:w-[320px] lg:w-[400px] h-[140px] lg:h-[160px] bg-slate-900 rounded-[1.25rem] lg:rounded-2xl p-4 lg:p-5 flex items-center justify-center relative overflow-hidden text-center shrink-0 shadow-lg shadow-indigo-900/10">
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/30 rounded-full blur-[40px]"></div>
              
              {!drawnStudent && drawnGroupIndex === null ? (
                <div className="flex flex-col z-10 w-full">
                  <span className="text-indigo-400/80 text-[10px] uppercase tracking-[0.3em] font-bold mb-1 lg:mb-2 text-shadow-sm">幸運抽選</span>
                  <div className="text-white text-2xl lg:text-3xl font-black mb-1 lg:mb-2 tracking-wider opacity-90">等待開獎</div>
                  <div className="text-slate-400 text-[11px] lg:text-xs">請點擊左側按鈕開始</div>
                </div>
              ) : (
                <div className="flex flex-row gap-3 z-10 w-full h-full overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    {drawnStudent && (
                      <motion.div
                        key={`drawn-student-${drawnStudent}`}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex-1 flex flex-col items-center justify-center bg-white/[0.05] hover:bg-white/[0.08] transition-colors rounded-xl p-2 lg:p-3 border border-white/10 backdrop-blur-md"
                      >
                         <span className="text-indigo-300 text-[9px] uppercase tracking-[0.2em] font-bold mb-auto opacity-80">學生中選</span>
                         <div className="text-white text-xl lg:text-2xl font-black truncate w-full px-1">{drawnStudent}</div>
                         <button 
                           onClick={removeDrawnStudent} 
                           className="mt-auto flex items-center justify-center gap-1.5 w-full py-1.5 lg:py-2 bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 rounded-lg transition-all border border-rose-500/20 font-bold text-[11px] lg:text-xs active:scale-95"
                         >
                           <Trash size={12} strokeWidth={2.5}/> 排除不再抽
                         </button>
                      </motion.div>
                    )}
                    {drawnGroupIndex !== null && (
                      <motion.div
                        key={`drawn-group-${drawnGroupIndex}`}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex-1 flex flex-col items-center justify-center bg-white/[0.05] hover:bg-white/[0.08] transition-colors rounded-xl p-2 lg:p-3 border border-white/10 backdrop-blur-md"
                      >
                         <span className="text-emerald-300 text-[9px] uppercase tracking-[0.2em] font-bold mb-auto opacity-80">組別中選</span>
                         <div className="text-white text-xl lg:text-2xl font-black">第 {drawnGroupIndex + 1} 組</div>
                         <div className="text-white/50 text-[10px] mt-0.5 truncate w-full py-0.5 font-medium">包含 {groups[drawnGroupIndex]?.length} 人</div>
                         <button 
                           onClick={removeDrawnGroup} 
                           className="mt-auto flex items-center justify-center gap-1.5 w-full py-1.5 lg:py-2 bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 rounded-lg transition-all border border-rose-500/20 font-bold text-[11px] lg:text-xs active:scale-95"
                         >
                           <Trash size={12} strokeWidth={2.5}/> 排除不再抽
                         </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}

