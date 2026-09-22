import { useRef, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Volume2, Shield } from 'lucide-react';
import { Window } from './components/Window';

import computerIcon from './assets/mypcpng.png';
import spotifyIcon from './assets/spotifypng.png';
import documentsIcon from './assets/documentspng.png';
import browserIcon from './assets/internetexplorerpng.webp';
import recycleBinIcon from './assets/recyclebin.png';

const ICON_MAP: Record<string, string> = {
  computer: computerIcon,
  spotify: spotifyIcon,
  documents: documentsIcon,
  browser: browserIcon,
  trash: recycleBinIcon,
};

interface DesktopItem {
  id: string;
  label: string;
  icon: string;
}

export default function App() {
  const [startOpen, setStartOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [time, setTime] = useState('');
  const iconRefs = useRef<Record<string, { current: HTMLDivElement | null }>>({});

  // 1. Desktop & Window States
  const [icons, setIcons] = useState<DesktopItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Spotify Auth State
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const [openWindows, setOpenWindows] = useState<Record<string, boolean>>({
    spotify: false,
    computer: false,
  });

  const [windowZIndices, setWindowZIndices] = useState<Record<string, number>>({
    spotify: 10,
    computer: 10,
  });

  const [highestZIndex, setHighestZIndex] = useState(10);

  // Clock Timer
  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Desktop Icons from Go Backend
  useEffect(() => {
    fetch('http://localhost:8081/api/desktop/icons')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch desktop icons');
        return res.json();
      })
      .then((resData) => {
        setIcons(resData.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error connecting to backend:', err);
        setLoading(false);
      });
  }, []);

  // Check URL for OAuth result (supports both ? query params and # hash fragments)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.slice(1));

    // Try reading token from query params first, then fallback to hash params
    const token = urlParams.get('access_token') || hashParams.get('access_token');
    const error = urlParams.get('spotify_error');
    const errorDescription = urlParams.get('spotify_error_description');

    if (token) {
      setAccessToken(token);
      setOpenWindows((prev) => ({ ...prev, spotify: true }));
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      setAuthError(errorDescription || error);
      setOpenWindows((prev) => ({ ...prev, spotify: true }));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
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

  const handlePlaybackCommand = (command: 'play' | 'pause' | 'next' | 'previous') => {
    if (!accessToken) return;

    fetch(`https://api.spotify.com/v1/me/player/${command}`, {
      method: command === 'play' || command === 'pause' ? 'PUT' : 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).catch((err) => console.error(`Error sending ${command} command:`, err));
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
      {/* DESKTOP CANVAS */}
      <div className="relative w-full h-[calc(100vh-28px)] p-4">
        {loading ? (
          <div className="text-white text-xs font-mono">Loading Windows 98 desktop...</div>
        ) : (
          icons.map((item, index) => {
            const isSelected = selectedIcon === item.id;
            const iconRef = (iconRefs.current[item.id] ??= { current: null });
            const currentIconSrc = ICON_MAP[item.icon] || computerIcon;

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
                    <img
                      src={currentIconSrc}
                      alt=""
                      className="w-8 h-8 object-contain image-render-pixelated pointer-events-none"
                      draggable={false}
                    />
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
          })
        )}

        {/* MY COMPUTER WINDOW */}
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
              <span className="text-xs">Local Disk (C:)</span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <span className="text-2xl">💿</span>
              <span className="text-xs">CD-ROM (D:)</span>
            </div>
          </div>
        </Window>

        {/* SPOTIFY WINAMP WINDOW */}
        <Window
          id="spotify"
          title="Spotify Webamp 98"
          icon={<img src={spotifyIcon} alt="" className="w-3.5 h-3.5 object-contain image-render-pixelated" />}
          isOpen={openWindows.spotify}
          zIndex={windowZIndices.spotify}
          onClose={() => closeWindow('spotify')}
          onFocus={() => focusWindow('spotify')}
        >
          <div className="bg-black text-green-400 p-3 font-mono win-border-inset flex flex-col gap-3 min-w-[280px]">
            <div className="text-xs font-bold text-center border-b border-green-800 pb-1">
              WINAMP / SPOTIFY PLAYER
            </div>

            {!accessToken ? (
              <div className="flex flex-col items-center gap-3 py-2">
                {authError && <span className="text-xs text-red-400 text-center">Spotify login failed: {authError}</span>}
                <span className="text-xs text-yellow-300 text-center">
                  Please log in with Spotify to access playback controls.
                </span>
                <button
                  onClick={() => {
                    window.location.href = 'http://127.0.0.1:8081/api/auth/spotify/login';
                  }}
                  className="px-3 py-1 bg-[#c0c0c0] text-black text-xs font-bold win-border-outset hover:bg-[#d4d4d4] active:win-border-inset cursor-pointer"
                >
                  🔑 Log In with Spotify
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs border-b border-green-900 pb-1">
                  <span className="text-green-400 font-bold">STATUS: AUTHENTICATED</span>
                  <span className="animate-pulse text-green-500">● ONLINE</span>
                </div>

                <div className="bg-gray-900 p-2 text-xs text-center border border-green-900 my-1">
                  🎵 Active Player Ready
                </div>

                <div className="flex justify-between items-center bg-gray-900 p-2 win-border-inset">
                  <button
                    onClick={() => handlePlaybackCommand('previous')}
                    className="px-2 py-1 bg-[#c0c0c0] text-black text-xs font-bold win-border-outset active:win-border-inset cursor-pointer"
                  >
                    ⏮ Prev
                  </button>
                  <button
                    onClick={() => handlePlaybackCommand('play')}
                    className="px-2 py-1 bg-[#c0c0c0] text-black text-xs font-bold win-border-outset active:win-border-inset cursor-pointer"
                  >
                    ▶ Play
                  </button>
                  <button
                    onClick={() => handlePlaybackCommand('pause')}
                    className="px-2 py-1 bg-[#c0c0c0] text-black text-xs font-bold win-border-outset active:win-border-inset cursor-pointer"
                  >
                    ⏸ Pause
                  </button>
                  <button
                    onClick={() => handlePlaybackCommand('next')}
                    className="px-2 py-1 bg-[#c0c0c0] text-black text-xs font-bold win-border-outset active:win-border-inset cursor-pointer"
                  >
                    ⏭ Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </Window>
      </div>

      {/* START MENU */}
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
              className="px-2 py-0.5 text-xs bg-[#c0c0c0] win-border-inset flex items-center gap-1 w-28 truncate cursor-pointer"
            >
              <img src={spotifyIcon} alt="" className="w-3.5 h-3.5 object-contain image-render-pixelated" />
              Spotify 98
            </button>
          )}
          {openWindows.computer && (
            <button
              onClick={() => focusWindow('computer')}
              className="px-2 py-0.5 text-xs bg-[#c0c0c0] win-border-inset flex items-center gap-1 w-28 truncate cursor-pointer"
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