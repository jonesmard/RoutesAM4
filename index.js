import React, { useState, useMemo, useRef, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  deleteDoc
} from 'firebase/firestore';
import { 
  Plane, 
  MapPin, 
  DollarSign, 
  Search, 
  Map as MapIcon,
  Navigation,
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  ChevronDown,
  Upload,
  Filter,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  Database,
  Loader2,
  Menu,
  X
} from 'lucide-react';

// --- CONFIGURAÇÃO FIREBASE ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- AUXILIARES ---
const formatTime = (hours) => {
  if (isNaN(hours)) return "0h 0m";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

const RouteCard = ({ data, isInUse, onToggleUse }) => {
  const hasStopover = !!data.stopover;

  return (
    <div className={`relative transition-all duration-300 rounded-2xl border overflow-hidden hover:shadow-xl ${
      isInUse 
      ? 'bg-emerald-50/40 border-emerald-500 ring-2 sm:ring-4 ring-emerald-500/10' 
      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-md'
    }`}>
      {isInUse && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black px-3 sm:px-4 py-1.5 rounded-bl-2xl flex items-center gap-1 sm:gap-2 shadow-lg uppercase tracking-widest">
            <CheckCircle2 size={12} />
            Em Operação
          </div>
        </div>
      )}

      <div className={`p-4 sm:p-5 border-b ${isInUse ? 'bg-emerald-500/10 border-emerald-100' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'}`}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center flex-wrap gap-y-2 gap-x-1.5">
            <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm">{data.origin || 'JFK'}</span>
            <ArrowRight size={14} className="text-slate-400 shrink-0" />
            
            {hasStopover && (
              <>
                <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm">
                  {data.stopover.iata}
                </span>
                <ArrowRight size={14} className="text-slate-400 shrink-0" />
              </>
            )}
            
            <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm">{data.iata}</span>
          </div>

          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg sm:text-xl leading-tight truncate">
                {data.name}
              </h3>
              <p className="text-slate-500 text-xs flex items-center gap-1 mt-1 font-bold">
                <MapPin size={12} className="text-blue-500" /> {data.country}
              </p>
            </div>
            {!isInUse && (
              <div className="text-right shrink-0">
                <div className="text-emerald-600 font-black text-lg sm:text-2xl flex items-center justify-end leading-none">
                  <span className="text-xs font-bold mr-0.5">$</span>
                  {(data.profit || 0).toLocaleString('pt-PT', { maximumFractionDigits: 0 })}
                </div>
                <p className="text-[8px] sm:text-[9px] uppercase tracking-widest text-slate-400 font-black mt-1">Lucro / Voo</p>
              </div>
            )}
          </div>
          <div className="flex">
             <span className="bg-slate-200 dark:bg-slate-700 text-[8px] sm:text-[10px] px-2 py-0.5 rounded font-black text-slate-600 dark:text-slate-300 uppercase truncate">
                {data.aircraft || 'Aeronave'}
              </span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl text-center border border-slate-100 dark:border-slate-700">
            <p className="text-[8px] text-slate-400 uppercase font-black mb-0.5">Distância</p>
            <p className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-200">
              {Math.round(data.dist || 0)} <span className="text-[8px] opacity-50">km</span>
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl text-center border border-slate-100 dark:border-slate-700">
            <p className="text-[8px] text-slate-400 uppercase font-black mb-0.5">Duração</p>
            <p className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-200">
              {formatTime(data.time)}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl text-center border border-slate-100 dark:border-slate-700">
            <p className="text-[8px] text-slate-400 uppercase font-black mb-0.5">Mercado</p>
            <p className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-200">{data.market || 100}%</p>
          </div>
        </div>

        {hasStopover && (
          <div className={`p-3 rounded-xl border flex items-center gap-3 ${
            isInUse ? 'bg-emerald-700/40 border-emerald-400/20 text-emerald-50' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30'
          }`}>
            <div className={`p-2 rounded-lg ${isInUse ? 'bg-emerald-800/50 text-emerald-300' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600'}`}>
              <Navigation size={18} className="shrink-0" />
            </div>
            <div className="text-xs min-w-0 flex-1">
              <p className={`font-black uppercase text-[9px] tracking-widest ${isInUse ? 'text-emerald-200' : 'text-amber-700 dark:text-amber-400'}`}>
                Escala Obrigatória
              </p>
              <p className="font-bold truncate leading-tight">{data.stopover.name} ({data.stopover.iata})</p>
              <p className={`text-[10px] mt-0.5 font-medium ${isInUse ? 'text-emerald-100' : 'text-slate-500'}`}>
                {data.stopover.country}
              </p>
            </div>
          </div>
        )}

        <div className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
          isInUse ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20'
        }`}>
          <div className="flex justify-between items-center mb-2">
             <span className={`text-[9px] font-black uppercase tracking-wider ${isInUse ? 'text-emerald-100' : 'text-blue-600 dark:text-blue-400'}`}>
               Lugares e Preços
             </span>
             <Plane size={14} className={isInUse ? 'text-emerald-200' : 'text-blue-400'} />
          </div>
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: 'Económica (Y)', key: 'y' },
              { label: 'Executiva (J)', key: 'j' },
              { label: 'Primeira (F)', key: 'f' }
            ].map(cls => (
              <div key={cls.key} className={`flex justify-between items-center pb-1 border-b last:border-0 border-dashed ${isInUse ? 'border-emerald-500/50' : 'border-slate-200/50'}`}>
                <span className={`text-[10px] font-bold ${isInUse ? 'text-emerald-50' : 'text-slate-600'}`}>{cls.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black">{data.config?.[cls.key] || 0}</span>
                  <div className={`px-1.5 py-0.5 rounded text-center ${isInUse ? 'bg-emerald-700' : 'bg-slate-200 dark:bg-slate-700'} font-black text-[10px]`}>
                    ${data.prices?.[cls.key] || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={onToggleUse}
          className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 shadow-sm ${
            isInUse ? 'bg-slate-900 text-white' : 'bg-white text-emerald-600 border-2 border-emerald-600'
          }`}
        >
          {isInUse ? <><CheckCircle2 size={14} /> LIBERAR ROTA</> : <>UTILIZAR ROTA</>}
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [inUseRoutes, setInUseRoutes] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("profit");
  const [filterInUse, setFilterInUse] = useState("all");
  const [filterAircraft, setFilterAircraft] = useState("all");
  const [filterOrigin, setFilterOrigin] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error(err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const routesRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'routes');
    const statusRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'status');

    const unsubRoutes = onSnapshot(routesRef, (docSnap) => {
      if (docSnap.exists()) setRoutes(docSnap.data().list || []);
      setLoading(false);
    });

    const unsubStatus = onSnapshot(statusRef, (docSnap) => {
      if (docSnap.exists()) setInUseRoutes(docSnap.data().active || {});
    });

    return () => { unsubRoutes(); unsubStatus(); };
  }, [user]);

  const saveRoutesToCloud = async (newRoutes) => {
    if (!user) return;
    try {
      const routesRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'routes');
      await setDoc(routesRef, { list: newRoutes });
    } catch (err) { console.error(err); }
  };

  const toggleRouteUse = async (id) => {
    if (!user) return;
    const newStatus = { ...inUseRoutes, [id]: !inUseRoutes[id] };
    setInUseRoutes(newStatus);
    try {
      const statusRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'status');
      await setDoc(statusRef, { active: newStatus });
    } catch (err) { console.error(err); }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const fileName = file.name.toLowerCase();
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const newRoutes = lines.slice(1).filter(l => l.trim()).map((line, idx) => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((h, i) => { obj[h] = values[i]; });
        return {
          id: obj['dest.id'] || `${idx}-${Date.now()}`,
          name: obj['dest.name'] || 'Destino',
          country: obj['dest.country'] || 'País',
          iata: obj['dest.iata'] || '???',
          dist: parseFloat(obj['direct_dist']) || 0,
          time: parseFloat(obj['time']) || 0,
          config: { y: obj['cfg.y'] || 0, j: obj['cfg.j'] || 0, f: obj['cfg.f'] || 0 },
          prices: { y: obj['tkt.y'] || 0, j: obj['tkt.j'] || 0, f: obj['tkt.f'] || 0 },
          profit: parseFloat(obj['profit_pt']) || 0,
          stopover: obj['stop.iata'] ? { 
            iata: obj['stop.iata'], 
            name: obj['stop.name'],
            country: obj['stop.country'] || 'Desconhecido'
          } : null,
          market: Math.round(parseFloat(obj['market']) * 100) / 100 || 45,
          aircraft: fileName.includes("mc214") ? "MC-21-400" : "Aeronave",
          origin: fileName.includes("jfk") ? "JFK" : "Origem"
        };
      });
      saveRoutesToCloud(newRoutes);
    };
    reader.readAsText(file);
  };

  const filtered = useMemo(() => {
    let result = routes.filter(r => {
      const search = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.iata.toLowerCase().includes(searchTerm.toLowerCase());
      const usedMatch = filterInUse === 'all' || (filterInUse === 'used' ? inUseRoutes[r.id] : !inUseRoutes[r.id]);
      const airMatch = filterAircraft === 'all' || r.aircraft === filterAircraft;
      const originMatch = filterOrigin === 'all' || r.origin === filterOrigin;
      return search && usedMatch && airMatch && originMatch;
    });
    result.sort((a,b) => sortBy === 'profit' ? b.profit - a.profit : b.dist - a.dist);
    return result;
  }, [routes, searchTerm, filterInUse, filterAircraft, filterOrigin, sortBy, inUseRoutes]);

  const paginated = filtered.slice((currentPage-1)*itemsPerPage, itemsPerPage === 0 ? undefined : currentPage*itemsPerPage);
  const totalP = itemsPerPage === 0 ? 1 : Math.ceil(filtered.length / itemsPerPage);

  if (loading && user) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-blue-500 font-black">CARREGANDO HUB...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-10">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg"><MapIcon className="text-white" size={20} /></div>
            <h1 className="text-lg font-black uppercase tracking-tighter">NEXGEN <span className="text-blue-600">HUB</span></h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fileInputRef.current.click()} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"><Upload size={18} /></button>
            <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800"><Menu size={20} /></button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
           <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Total de Rotas</p>
              <p className="text-xl font-black">{routes.length}</p>
           </div>
           <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Rotas Ativas</p>
              <p className="text-xl font-black text-emerald-600">{Object.values(inUseRoutes).filter(v => v).length}</p>
           </div>
           <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Lucro Estimado</p>
              <p className="text-xl font-black text-blue-600">${filtered.reduce((a,c) => a+c.profit, 0).toLocaleString('pt-PT', {maximumFractionDigits: 0})}</p>
           </div>
        </div>

        <div className={`lg:block ${isMenuOpen ? 'block' : 'hidden'} mb-8 space-y-4`}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Procurar destino..." className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
               <label className="text-[9px] font-black uppercase text-slate-400 ml-1 mb-1 block">Aeronave</label>
               <select className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold outline-none" value={filterAircraft} onChange={(e) => setFilterAircraft(e.target.value)}>
                <option value="all">Todas</option>
                {Array.from(new Set(routes.map(r => r.aircraft))).map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
               <label className="text-[9px] font-black uppercase text-slate-400 ml-1 mb-1 block">Origem</label>
               <select className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold outline-none" value={filterOrigin} onChange={(e) => setFilterOrigin(e.target.value)}>
                <option value="all">Todas</option>
                {Array.from(new Set(routes.map(r => r.origin))).map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
               <label className="text-[9px] font-black uppercase text-slate-400 ml-1 mb-1 block">Status</label>
               <select className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold outline-none" value={filterInUse} onChange={(e) => setFilterInUse(e.target.value)}>
                <option value="all">Ver Tudo</option>
                <option value="used">Ativas</option>
                <option value="unused">Disponíveis</option>
              </select>
            </div>
            <div>
               <label className="text-[9px] font-black uppercase text-slate-400 ml-1 mb-1 block">Ordem</label>
               <select className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold outline-none" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="profit">Maior Lucro</option>
                <option value="dist">Distância</option>
              </select>
            </div>
            <div>
               <label className="text-[9px] font-black uppercase text-slate-400 ml-1 mb-1 block">Exibir</label>
               <select className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold outline-none" value={itemsPerPage} onChange={(e) => setItemsPerPage(parseInt(e.target.value))}>
                <option value={100}>100 por pág.</option>
                <option value={50}>50 por pág.</option>
                <option value={0}>Ver Todas</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {paginated.map(r => <RouteCard key={r.id} data={r} isInUse={inUseRoutes[r.id]} onToggleUse={() => toggleRouteUse(r.id)} />)}
        </div>

        {itemsPerPage > 0 && totalP > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button disabled={currentPage===1} onClick={() => {setCurrentPage(p=>p-1); window.scrollTo(0,0);}} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg disabled:opacity-20 transition-all"><ChevronLeft/></button>
            <span className="text-xs font-black">Página {currentPage} / {totalP}</span>
            <button disabled={currentPage===totalP} onClick={() => {setCurrentPage(p=>p+1); window.scrollTo(0,0);}} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg disabled:opacity-20 transition-all"><ChevronRight/></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
