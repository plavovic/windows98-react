import { useRef, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Volume2, Shield } from 'lucide-react';
import { Window } from './components/Window';
import computerIcon from './assets/mypcpng.png';
import spotifyIcon from './assets/spotifypng.png';
import documentsIcon from './assets/documentspng.png';
import browserIcon from './assets/internetexplorerpng.webp';
import recycleBinIcon from './assets/recyclebin.png';

const INITIAL_ICONS = [
  { id: 'computer', label: 'My Computer', icon: computerIcon },
  { id: 'spotify', label: 'Spotify 98', icon: spotifyIcon },
  { id: 'documents', label: 'My Documents', icon: documentsIcon },
  { id: 'browser', label: 'Internet Explorer', icon: browserIcon },
  { id: 'trash', label: 'Recycle Bin', icon: recycleBinIcon },
];




export default function App() {
  const [startOpen, setStartOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [time, setTime] = useState('');
  const iconRefs = useRef<Record<string, { current: HTMLDivElement | null }>>({});


  const [openWindows, setOpenWindows] = useState<Record<string, boolean>>({
    spotify: false,
    computer: false,
  });

  const [windowZIndices, setWindowZIndices] = useState<Record<string, number>>({
    spotify: 10,
    computer: 10,
  });

  const [highestZIndex, setHighestZIndex] = useState(10);


  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);


  const openWindow = (id: string) => {
    focusWindow(id);
    setOpenWindows((prev) => ({ ...prev, [id]: true }));
  };

  const closeWindow = (id: string) => {
    setOpenWindows((prev) => ({ ...prev, [id]: false }));
  };

  const focusWindow = (id: string) => {
    const nextZ = highestZIndex + 1;
    setHighestZIndex(nextZ);
    setWindowZIndices((prev) => ({ ...prev, [id]: nextZ }));
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none font-sans"
      style={{ backgroundColor: '#008080' }}
      onClick={() => {
        setStartOpen(false);
        setSelectedIcon(null);
      }}
    >
  
      <div className="relative w-full h-[calc(100vh-28px)] p-4">
        {INITIAL_ICONS.map((item, index) => {
          const isSelected = selectedIcon === item.id;
          const iconRef = (iconRefs.current[item.id] ??= { current: null });

          return (
            <Draggable
              key={item.id}
              bounds="parent"
              defaultPosition={{ x: 0, y: index * 96 }}
              nodeRef={iconRef}
            >
              <div
                ref={iconRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIcon(item.id);
                }}
                onDoubleClick={() => openWindow(item.id)}
                className="w-20 flex flex-col items-center gap-1 cursor-pointer group"
              >
                <div
                  className={`p-2 rounded flex items-center justify-center ${
                    isSelected ? 'bg-[#000080]/40 border border-dotted border-white' : ''
                  }`}
                >
                  <img src={item.icon} alt="" className="w-8 h-8 object-contain image-render-pixelated" />
                </div>
                <span
                  className={`text-xs text-white text-center px-1 leading-tight ${
                    isSelected ? 'bg-[#000080] font-bold' : 'drop-shadow-[1px_1px_1px_rgba(0,0,0,1)]'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </Draggable>
          );
        })}

  
        <Window
          id="computer"
          title="My Computer"
          icon={<img src={computerIcon} alt="" className="w-3.5 h-3.5 object-contain image-render-pixelated" />}
          isOpen={openWindows.computer}
          zIndex={windowZIndices.computer}
          onClose={() => closeWindow('computer')}
          onFocus={() => focusWindow('computer')}
        >
          <div className="bg-white p-3 win-border-inset min-h-[120px] flex gap-4">
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <span className="text-2xl">💽</span>
              <span>Local Disk (C:)</span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <span className="text-2xl">💿</span>
              <span>CD-ROM (D:)</span>
            </div>
          </div>
        </Window>

  
        <Window
          id="spotify"
          title="Spotify Webamp 98"
          icon={<img src={spotifyIcon} alt="" className="w-3.5 h-3.5 object-contain image-render-pixelated" />}
          isOpen={openWindows.spotify}
          zIndex={windowZIndices.spotify}
          onClose={() => closeWindow('spotify')}
          onFocus={() => focusWindow('spotify')}
        >
          <div className="bg-black text-green-400 p-3 font-mono win-border-inset flex flex-col gap-2">
            <div className="text-xs font-bold text-center border-b border-green-800 pb-1">
              WINAMP / SPOTIFY PLAYER
            </div>
            <div className="text-sm">🎵 Now Playing: Synthwave 1998</div>
            <div className="flex justify-between items-center bg-gray-900 p-2 mt-2">
              <button className="px-2 py-0.5 bg-gray-700 text-white win-border-outset">▶ Play</button>
              <button className="px-2 py-0.5 bg-gray-700 text-white win-border-outset">⏸ Pause</button>
              <button className="px-2 py-0.5 bg-gray-700 text-white win-border-outset">⏹ Stop</button>
            </div>
          </div>
        </Window>
      </div>


      {startOpen && (
        <div
          className="absolute bottom-7 left-0 w-52 bg-[#c0c0c0] win-border-outset z-50 flex shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-8 bg-[#000080] flex items-end justify-center py-2">
            <span className="text-white font-bold tracking-widest text-sm -rotate-90 whitespace-nowrap">
              Windows<span className="font-normal text-xs pl-1">98</span>
            </span>
          </div>

          <div className="flex-1 py-1 text-xs">
            <button className="w-full text-left px-3 py-1.5 hover:bg-[#000080] hover:text-white flex items-center gap-2">
              📁 Programs
            </button>
            <button className="w-full text-left px-3 py-1.5 hover:bg-[#000080] hover:text-white flex items-center gap-2">
              📄 Documents
            </button>
            <button className="w-full text-left px-3 py-1.5 hover:bg-[#000080] hover:text-white flex items-center gap-2">
              ⚙️ Settings
            </button>
            <hr className="my-1 border-t border-gray-400" />
            <button className="w-full text-left px-3 py-1.5 hover:bg-[#000080] hover:text-white flex items-center gap-2">
              💻 Shut Down...
            </button>
          </div>
        </div>
      )}

      {/* TASKBAR */}
      <div className="absolute bottom-0 left-0 right-0 h-7 bg-[#c0c0c0] win-border-outset flex items-center justify-between px-1 z-50">
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStartOpen(!startOpen);
            }}
            className={`px-2 py-0.5 flex items-center gap-1 text-xs font-bold bg-[#c0c0c0] ${
              startOpen ? 'win-border-inset bg-[#b0b0b0]' : 'win-border-outset'
            }`}
          >
            <span>🪟</span> Start
          </button>

          {openWindows.spotify && (
            <button
              onClick={() => focusWindow('spotify')}
              className="px-2 py-0.5 text-xs bg-[#c0c0c0] win-border-inset flex items-center gap-1 w-28 truncate"
            >
              <img src={spotifyIcon} alt="" className="w-3.5 h-3.5 object-contain image-render-pixelated" />
              Spotify 98
            </button>
          )}
          {openWindows.computer && (
            <button
              onClick={() => focusWindow('computer')}
              className="px-2 py-0.5 text-xs bg-[#c0c0c0] win-border-inset flex items-center gap-1 w-28 truncate"
            >
              <img src={computerIcon} alt="" className="w-3.5 h-3.5 object-contain image-render-pixelated" />
              My Computer
            </button>
          )}
        </div>

        <div className="win-border-inset px-2 py-0.5 flex items-center gap-2 bg-[#c0c0c0] text-xs">
          <Shield className="w-3.5 h-3.5 text-green-700" />
          <Volume2 className="w-3.5 h-3.5" />
          <span className="font-mono text-[11px]">{time}</span>
        </div>
      </div>
    </div>
  );
}