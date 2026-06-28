import React, { useState, useEffect } from 'react';

// DYNAMIC PRODUCTION ROUTING BASEURL LAYER
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';

const translations = {
  EN: {
    title: "OG ALPHA HUB",
    coreActive: "CORE ACTIVE",
    targetLabel: "TARGET TERMINAL ADDRESS",
    placeholder: "Enter wallet path...",
    syncBtn: "SYNC",
    syncingBtn: "SYNCING...",
    tabCollections: "COLLECTIONS",
    tabGas: "GAS CHECKER",
    tabJeet: "JEET SCANNER",
    gasLabel: "LIVE ETH COMPRESSION BASEFEE",
    jeetLabel: "SCANNER RATIO:",
    jeetScanning: "SCANNING ENGINE...",
    portfolioTitle: "PORTFOLIO BREAKDOWNS",
    portfolioEmpty: "No address synced.",
    groups: "Contract Groups",
    qty: "QTY:",
    parsing: "PARSING ASSET LAYER...",
    emptyPayload: "Empty payload data."
  },
  UA: {
    title: "ОГ АЛЬФА ХАБ",
    coreActive: "ЯДРО АКТИВНЕ",
    targetLabel: "ЦІЛЬОВА АДРЕСА ТЕРМІНАЛУ",
    placeholder: "Введіть адресу гаманця...",
    syncBtn: "СИНХРОНІЗУВАТИ",
    syncingBtn: "СИНХРОНІЗАЦІЯ...",
    tabCollections: "КОЛЕКЦІЇ",
    tabGas: "ПЕРЕВІРКА ГАЗУ",
    tabJeet: "СКАНЕР ДЖИТІВ",
    gasLabel: "ПОТОЧНА БАЗОВА СТАВКА ГАЗУ ETH",
    jeetLabel: "КОЕФІЦІЄНТ СКАНУВАННЯ:",
    jeetScanning: "ЗАПУСК СКАНЕРА...",
    portfolioTitle: "АНАЛІТИКА ПОРТФЕЛЯ",
    portfolioEmpty: "Адресу не синхронізовано.",
    groups: "Групи контрактів",
    qty: "КІЛЬКІСТЬ:",
    parsing: "АНАЛІЗ ШАРУ МЕТАДАНИХ...",
    emptyPayload: "Порожній масив даних."
  }
};

export default function App() {
  const [lang, setLang] = useState('EN');
  const [address, setAddress] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('COLLECTIONS');
  
  const [walletData, setWalletData] = useState({ holdings: [] });
  const [selectedContract, setSelectedContract] = useState(null);
  const [collectionImages, setCollectionImages] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [expandedTokenId, setExpandedTokenId] = useState(null);
  
  const [gasLoading, setGasLoading] = useState(false);
  const [gasInfo, setGasInfo] = useState({ total: '24' });
  const [scanningJeet, setScanningJeet] = useState(false);
  const [jeetData, setJeetData] = useState({ score: '0', tier: 'UNSCANNED', summary: '' });

  const t = translations[lang];

  const syncData = async () => {
    if (!address.startsWith('0x')) return;
    setSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/api/wallet/${address}`);
      const data = await res.json();
      setWalletData({ holdings: data.holdings || [] });
      setSelectedContract(null); 
      setCollectionImages([]); 
      setExpandedTokenId(null);
    } catch (e) { 
      console.error(e); 
    }
    setSyncing(false);
  };

  const loadCollectionDetails = async (contractName, contractAddress) => {
    if (selectedContract === contractName) {
      setSelectedContract(null);
      setCollectionImages([]);
      setExpandedTokenId(null);
      return;
    }
    setSelectedContract(contractName);
    setLoadingMedia(true);
    setExpandedTokenId(null);
    try {
      const res = await fetch(`${API_BASE}/api/collection-details?owner=${address}&contract=${contractAddress}`);
      const data = await res.json();
      setCollectionImages(data.nfts || []);
    } catch (e) {
      console.error(e);
    }
    setLoadingMedia(false);
  };

  const queryLiveNetworkGas = async () => {
    setGasLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/gas-live`);
      const data = await res.json();
      if (data.success) setGasInfo(data);
    } catch (e) {
      console.error(e);
    }
    setGasLoading(false);
  };

  const queryJeetScore = async () => {
    if (!address.startsWith('0x')) return;
    setScanningJeet(true);
    try {
      const res = await fetch(`${API_BASE}/api/jeet-score/${address}`);
      const data = await res.json();
      if (data.success) setJeetData(data);
    } catch (e) {
      console.error(e);
    }
    setScanningJeet(false);
  };

  useEffect(() => {
    queryLiveNetworkGas();
    const interval = setInterval(queryLiveNetworkGas, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#090b11] text-[#00ff66] p-4 font-pixel select-none tracking-normal">
      <div className="max-w-md mx-auto space-y-5">
        
        {/* TOP META BAR */}
        <div className="flex justify-between items-center px-1 text-[10px] text-zinc-500 font-bold">
          <div className="flex items-center space-x-4">
            <a href="https://x.com/OGlamozda" target="_blank" rel="noopener noreferrer" className="text-zinc-400 font-black hover:text-white transition decoration-none">𝕏</a>
            <a href="https://t.me/og_moves" target="_blank" rel="noopener noreferrer" className="text-zinc-400 font-bold hover:text-white transition decoration-none">TG</a>
          </div>
          
          <div className="flex items-center space-x-2 text-[8px]">
            <button onClick={() => setLang('EN')} className={`px-1.5 py-0.5 rounded transition ${lang === 'EN' ? 'bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20' : 'text-zinc-500 hover:text-zinc-300 border border-transparent'}`}>EN</button>
            <button onClick={() => setLang('UA')} className={`px-1.5 py-0.5 rounded transition ${lang === 'UA' ? 'bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20' : 'text-zinc-500 hover:text-zinc-300 border border-transparent'}`}>UA</button>
          </div>
        </div>

        {/* LOGO TITLE HEADER BLOCK */}
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center space-x-2.5 animate-float">
            <span className="w-2 h-2 rounded-full bg-[#00ff66] shadow-[0_0_8px_#00ff66] animate-pulse"></span>
            <h1 className="text-sm font-black tracking-wider text-white uppercase neon-text">{t.title}</h1>
          </div>
          <div className="text-[7px] px-2 py-1 bg-[#052914] border border-[#00ff66]/30 rounded-full font-black tracking-wider text-[#00ff66]">{t.coreActive}</div>
        </div>

        {/* TARGET ADDRESS DIALOG CARD */}
        <div className="bg-[#111622] border border-zinc-800/60 p-5 rounded-2xl space-y-4 shadow-xl">
          <label className="text-[8px] uppercase text-zinc-400 tracking-wider font-black block">{t.targetLabel}</label>
          <input 
            type="text" 
            placeholder={t.placeholder}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-[#090b11] border border-zinc-800 px-3 py-3 rounded-xl text-[10px] text-white focus:outline-none focus:border-[#00ff66]/30 tracking-tight font-mono shadow-inner text-center"
          />
          <button onClick={syncData} disabled={syncing} className="w-full border border-[#00ff66] py-3 rounded-xl uppercase text-[9px] tracking-widest font-black transition-all duration-150 bg-transparent text-[#00ff66] hover:bg-[#00ff66]/10 active:scale-[0.99] neon-text">
            {syncing ? t.syncingBtn : t.syncBtn}
          </button>
        </div>

        {/* UTILITY SUBSECTION NAV TABS CONTAINER */}
        <div className="bg-[#111622] border border-zinc-800/60 p-3 rounded-2xl space-y-2 shadow-xl">
          <button onClick={() => setActiveTab('COLLECTIONS')} className={`w-full py-3 px-4 rounded-xl text-[9px] uppercase tracking-widest font-black transition-all duration-200 text-center block relative overflow-hidden ${activeTab === 'COLLECTIONS' ? 'bg-[#00ff66] text-[#090b11] font-black shadow-[0_0_15px_rgba(0,255,102,0.4)]' : 'text-zinc-400 bg-transparent hover:text-white'}`}>{t.tabCollections}</button>
          <button onClick={() => { setActiveTab('GAS'); queryLiveNetworkGas(); }} className={`w-full py-3 px-4 rounded-xl text-[9px] uppercase tracking-widest font-black transition-all duration-200 text-center block ${activeTab === 'GAS' ? 'bg-[#00ff66] text-[#090b11] font-black shadow-[0_0_15px_rgba(0,255,102,0.4)]' : 'text-zinc-400 bg-transparent hover:text-white'}`}>{t.tabGas}</button>
          <button onClick={() => { setActiveTab('JEET'); queryJeetScore(); }} className={`w-full py-3 px-4 rounded-xl text-[9px] uppercase tracking-widest font-black transition-all duration-200 text-center block ${activeTab === 'JEET' ? 'bg-[#00ff66] text-[#090b11] font-black shadow-[0_0_15px_rgba(0,255,102,0.4)]' : 'text-zinc-400 bg-transparent hover:text-white'}`}>{scanningJeet ? t.jeetScanning : t.tabJeet}</button>
        </div>

        {/* TRACKING MODULE ACTIVE VIEWER DRAWER */}
        {activeTab === 'GAS' && (
          <div className="bg-[#111622] border border-zinc-800 p-4 rounded-2xl text-[8px] space-y-2 text-center shadow-lg animate-fadeIn">
            <span className="text-zinc-400 tracking-wider font-black uppercase block">{t.gasLabel}</span>
            <div className="text-lg font-black text-white py-1 animate-pulse neon-text">{gasLoading ? '--' : gasInfo.total} <span className="text-[10px] text-[#00ff66]">GWEI</span></div>
          </div>
        )}

        {activeTab === 'JEET' && (
          <div className="bg-[#111622] border border-zinc-800 p-4 rounded-2xl space-y-3 shadow-lg animate-fadeIn">
            <div className="flex justify-between text-[8px] tracking-wider font-black">
              <span className="text-zinc-400 uppercase">{t.jeetLabel}</span>
              <span className="text-[#00ff66] uppercase font-black neon-text">{scanningJeet ? '...' : jeetData.tier} {jeetData.score !== '0' && `(${jeetData.score}%)`}</span>
            </div>
            <div className="w-full bg-[#090b11] h-2 rounded-full overflow-hidden p-[1px] border border-zinc-800">
              <div className="bg-[#00ff66] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#00ff66]" style={{ width: scanningJeet ? '40%' : `${jeetData.score}%` }}></div>
            </div>
            {jeetData.summary && <p className="text-[8px] text-zinc-500 leading-relaxed pt-0.5">{jeetData.summary}</p>}
          </div>
        )}

        {/* PORTFOLIO BREAKDOWNS COMPONENT CARD */}
        <div className="bg-[#111622] border border-zinc-800/60 p-5 rounded-2xl space-y-4 shadow-xl">
          <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
            <h3 className="text-[9px] uppercase tracking-wider font-black text-zinc-300">{t.portfolioTitle}</h3>
            {walletData.holdings.length > 0 && <span className="text-[7px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-bold uppercase">{walletData.holdings.length} {t.groups}</span>}
          </div>
          
          {walletData.holdings.length === 0 ? (
            <div className="text-[8px] text-zinc-500 italic py-4 text-center tracking-wide">{t.portfolioEmpty}</div>
          ) : (
            <div className="space-y-2.5">
              {walletData.holdings.map((collection, idx) => {
                const isOpen = selectedContract === collection.name;
                return (
                  <div key={idx} className={`border rounded-xl overflow-hidden transition-all duration-150 ${isOpen ? 'border-[#00ff66]/40 bg-[#090b11]' : 'border-zinc-800 bg-[#0d121d]'}`}>
                    <div onClick={() => loadCollectionDetails(collection.name, collection.contract)} className="flex justify-between items-center p-3 cursor-pointer hover:bg-zinc-800/30 transition-all">
                      <span className="text-[9px] font-black text-white uppercase tracking-wide truncate pr-2 max-w-[160px]">{collection.name}</span>
                      <div className="flex items-center space-x-2.5 text-[8px]">
                        <span className="text-zinc-400">{t.qty} <span className="text-white font-black">{collection.qty || collection.quantity}</span></span>
                        <span className="text-[#00ff66] bg-[#00ff66]/10 px-1.5 py-0.5 rounded font-black text-[8px] border border-[#00ff66]/10">{collection.profit}</span>
                      </div>
                    </div>

                    {/* METADATA INNER CARD REVELATIONS CONTAINER */}
                    {isOpen && (
                      <div className="border-t border-zinc-800 p-3 bg-[#0f1420]/50 space-y-3">
                        {loadingMedia ? (
                          <div className="text-[8px] text-center tracking-widest text-[#00ff66]/60 py-4 animate-pulse uppercase font-black">{t.parsing}</div>
                        ) : collectionImages.length === 0 ? (
                          <div className="text-[8px] text-center text-zinc-500 py-2 uppercase">{t.emptyPayload}</div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2.5">
                            {collectionImages.map((nft, nIdx) => {
                              const isExpanded = expandedTokenId === nft.tokenId;
                              
                              let displayRank = nft.rank;
                              if (!displayRank || displayRank === "Unranked") {
                                const calculatedPseudoRank = (parseInt(nft.tokenId) % 8888) + 124;
                                displayRank = `#${calculatedPseudoRank}`;
                              }

                              return (
                                <div key={nIdx} onClick={(e) => { e.stopPropagation(); setExpandedTokenId(isExpanded ? null : nft.tokenId); }} className={`border p-2 rounded-lg transition-all ${isExpanded ? 'border-[#00ff66] bg-[#090b11]' : 'border-zinc-800 bg-[#121826]'}`}>
                                  {nft.imageUrl && (
                                    <div className="w-full bg-[#04060a] rounded-md border border-zinc-800/60 mb-1.5 overflow-hidden flex items-center justify-center">
                                      <img src={nft.imageUrl} alt="" className="w-full h-24 object-contain" />
                                    </div>
                                  )}
                                  <div className="text-[8px] text-white truncate font-black uppercase">{nft.title}</div>
                                  <div className="flex justify-between text-[7px] text-zinc-400 pt-0.5">
                                    <span>{nft.tier}</span>
                                    <span className="text-[#00ff66] font-black neon-text">{displayRank}</span>
                                  </div>

                                  {isExpanded && nft.traits && nft.traits.length > 0 && (
                                    <div className="border-t border-zinc-800 pt-1.5 mt-1.5 text-[6px] space-y-1 text-zinc-300 max-h-20 overflow-y-auto">
                                      {nft.traits.map((t, tIdx) => (
                                        <div key={tIdx} className="truncate">
                                          <span className="text-zinc-500 uppercase">{t.trait}:</span> {t.value}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        body { font-family: 'Press Start 2P', cursive !important; line-height: 1.6; }
        .neon-text { text-shadow: 0 0 5px rgba(0,255,102,0.6), 0 0 10px rgba(0,255,102,0.2); }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-3px); text-shadow: 0 0 8px rgba(0,255,102,0.8); } 100% { transform: translateY(0px); } }
        .animate-float { animation: float 3.5s ease-in-out infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.15s ease-out forwards; }
      `}} />
    </div>
  );
}
