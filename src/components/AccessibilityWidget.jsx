import { useState, useEffect } from 'react';
import { 
  FaWheelchair, FaTextHeight, FaArrowsAltV, FaArrowsAltH, 
  FaFont, FaTintSlash, FaAdjust, FaRegLightbulb, 
  FaUnderline, FaHighlighter, FaImage, FaUndo, FaTimes 
} from 'react-icons/fa';

const AccessibilityWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  // --- ACCESSIBILITY STATES ---
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1); 
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  
  const [toggles, setToggles] = useState({
    dyslexic: false,
    grayscale: false,
    contrast: false,
    negative: false,
    bw: false,
    underline: false,
    highlight: false,
  });

  // --- APPLY CHANGES TO DOM GLOBALLY ---
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.style.fontSize = `${fontSizeMultiplier * 100}%`;
    body.style.lineHeight = lineSpacing;
    body.style.letterSpacing = `${letterSpacing}px`;

    body.classList.toggle('a11y-dyslexic', toggles.dyslexic);
    body.classList.toggle('a11y-grayscale', toggles.grayscale);
    body.classList.toggle('a11y-contrast', toggles.contrast);
    body.classList.toggle('a11y-negative', toggles.negative);
    body.classList.toggle('a11y-bw', toggles.bw);
    body.classList.toggle('a11y-underline-links', toggles.underline);
    body.classList.toggle('a11y-highlight-links', toggles.highlight);

  }, [fontSizeMultiplier, lineSpacing, letterSpacing, toggles]);

  // --- HANDLERS ---
  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const cycleFontSize = () => setFontSizeMultiplier(prev => prev >= 1.4 ? 1 : prev + 0.1);
  const cycleLineSpacing = () => setLineSpacing(prev => prev >= 2.5 ? 1.5 : prev + 0.5);
  const cycleLetterSpacing = () => setLetterSpacing(prev => prev >= 3 ? 0 : prev + 1);

  const resetAll = () => {
    setFontSizeMultiplier(1);
    setLineSpacing(1.5);
    setLetterSpacing(0);
    setToggles({
      dyslexic: false, grayscale: false, contrast: false,
      negative: false, bw: false, underline: false, highlight: false,
    });
  };

  // --- TOOL CONFIGURATION ARRAY WITH DESCRIPTIVE TOOLTIPS ---
  const tools = [
    { label: "Increase Text Size", icon: FaTextHeight, action: cycleFontSize, active: fontSizeMultiplier > 1 },
    { label: "Increase Line Spacing", icon: FaArrowsAltV, action: cycleLineSpacing, active: lineSpacing > 1.5 },
    { label: "Increase Letter Spacing", icon: FaArrowsAltH, action: cycleLetterSpacing, active: letterSpacing > 0 },
    { label: "Dyslexia Friendly Font", icon: FaFont, action: () => handleToggle('dyslexic'), active: toggles.dyslexic },
    { label: "Grayscale (Remove Colors)", icon: FaTintSlash, action: () => handleToggle('grayscale'), active: toggles.grayscale },
    { label: "High Contrast (Brighter)", icon: FaAdjust, action: () => handleToggle('contrast'), active: toggles.contrast },
    { label: "Negative Contrast (Invert Colors)", icon: FaRegLightbulb, action: () => handleToggle('negative'), active: toggles.negative },
    { label: "Underline All Links", icon: FaUnderline, action: () => handleToggle('underline'), active: toggles.underline },
    { label: "Highlight All Links", icon: FaHighlighter, action: () => handleToggle('highlight'), active: toggles.highlight },
    { label: "Black & White Only", icon: FaImage, action: () => handleToggle('bw'), active: toggles.bw },
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-[20%] right-0 z-[9990] bg-[#C5A059] text-black p-3 rounded-l-xl shadow-2xl transition-transform hover:bg-[#b58f4a] focus:outline-none focus:ring-4 focus:ring-[#C5A059]/50 ${isOpen ? 'translate-x-full opacity-0' : 'translate-x-0'}`}
        aria-label="Open Accessibility Options"
      >
        <FaWheelchair size={30} />
      </button>

      {/* The Sidebar Panel */}
      <div 
        className={`fixed top-0 right-0 h-[100dvh] w-[80px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-in-out flex flex-col z-[9999] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Top Header Panel Icon */}
        <div className="bg-gray-900 text-[#C5A059] p-4 flex justify-center items-center shadow-md shrink-0 h-[80px]">
          <FaWheelchair size={32} />
        </div>

        {/* Scrollable Tools List */}
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center py-4 gap-4 overflow-x-visible">
          {tools.map((tool, idx) => (
            <div 
              key={idx} 
              className="relative group flex items-center justify-center w-full"
            >
              <button
                onClick={tool.action}
                aria-label={tool.label}
                aria-pressed={tool.active}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-[#C5A059] relative ${
                  tool.active 
                    ? 'bg-[#C5A059] text-black shadow-inner scale-95' 
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                }`}
              >
                <tool.icon size={20} />
              </button>

              {/* Instant Tailwind Tooltip Popout with Descriptive Text */}
              <div className="absolute right-[75px] bg-gray-900 text-white text-[11px] uppercase tracking-wider font-bold px-4 py-2.5 rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 ease-in-out z-[10000]">
                {tool.label}
                <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-[5px] border-transparent border-l-gray-900"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions (Reset & Close) */}
        <div className="flex flex-col shrink-0 border-t border-gray-100 bg-white">
          <div className="relative group w-full flex items-center justify-center border-b border-gray-100">
            <button 
              onClick={resetAll}
              aria-label="Reset Accessibility Settings"
              className="w-full bg-gray-50 text-gray-900 p-4 flex justify-center items-center hover:bg-gray-200 transition-colors focus:outline-none"
            >
              <FaUndo size={22} />
            </button>
            <div className="absolute right-[85px] bg-gray-900 text-white text-[11px] uppercase tracking-wider font-bold px-4 py-2.5 rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 ease-in-out z-[10000]">
              Reset All Settings
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-[5px] border-transparent border-l-gray-900"></div>
            </div>
          </div>

          <div className="relative group w-full flex items-center justify-center">
            <button 
              onClick={() => setIsOpen(false)}
              aria-label="Close Panel"
              className="w-full bg-red-600 text-white p-4 flex justify-center items-center hover:bg-red-700 transition-colors focus:outline-none pb-safe"
            >
              <FaTimes size={22} />
            </button>
            <div className="absolute right-[85px] bg-gray-900 text-white text-[11px] uppercase tracking-wider font-bold px-4 py-2.5 rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 ease-in-out z-[10000]">
              Close Panel
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-[5px] border-transparent border-l-gray-900"></div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default AccessibilityWidget;
