import React from 'react';

interface RoamieAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isSpeaking?: boolean;
  isListening?: boolean;
  isTyping?: boolean;
  className?: string;
  imgSrc?: string | null;
}

export const RoamieAvatar: React.FC<RoamieAvatarProps> = ({
  size = 'md',
  isSpeaking = false,
  isListening = false,
  isTyping = false,
  className = '',
  imgSrc = null,
}) => {
  // Sizing mapping
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-40 h-40',
    '2xl': 'w-56 h-56 md:w-64 md:h-64'
  };

  const ringStyles = () => {
    if (isListening) return 'ring-2 ring-rose-500/60 shadow-lg shadow-rose-500/10 transition-all';
    if (isSpeaking) return 'ring-2 ring-purple-500/60 shadow-lg shadow-purple-500/10 transition-all';
    if (isTyping) return 'ring-2 ring-cyan-500/60 shadow-lg shadow-cyan-500/10 transition-all';
    return '';
  };

  return (
    <div className={`relative rounded-full flex items-center justify-center bg-[#FAF8F5] overflow-hidden ${sizeClasses[size]} ${ringStyles()} ${className}`}>
      
      {/* Background Soft Glow to simulate 3D lightning */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#7A24B8]/10 via-[#D61A80]/10 to-[#13B4C5]/10 blur-xl opacity-70" />

      {imgSrc ? (
        <img 
          src={imgSrc} 
          alt="Roamie Assistant Avatar" 
          className="w-full h-full object-cover rounded-full z-10"
          referrerPolicy="no-referrer"
        />
      ) : (
        /* Intricate companion SVG representing ROAMIE in high-fidelity 3D aesthetic */
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full select-none z-10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
        <defs>
          {/* Neon hair gradients matching image_1.png */}
          <linearGradient id="hairPink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB12B6" />
            <stop offset="40%" stopColor="#FF60CD" />
            <stop offset="100%" stopColor="#FFAEE7" />
          </linearGradient>
          <linearGradient id="hairCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10BACB" />
            <stop offset="50%" stopColor="#48DDF1" />
            <stop offset="100%" stopColor="#A8F6FF" />
          </linearGradient>
          <linearGradient id="hairLime" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8ED521" />
            <stop offset="60%" stopColor="#B4F43F" />
            <stop offset="100%" stopColor="#DCFF9D" />
          </linearGradient>
          <linearGradient id="hairOrange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7A00" />
            <stop offset="100%" stopColor="#FFA620" />
          </linearGradient>
          <radialGradient id="faceGrad" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#FFEADF" />
            <stop offset="75%" stopColor="#FFCEBB" />
            <stop offset="100%" stopColor="#F7B299" />
          </radialGradient>
          <linearGradient id="sweaterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7E2ED2" />
            <stop offset="50%" stopColor="#9C4AEC" />
            <stop offset="100%" stopColor="#5711A3" />
          </linearGradient>
          <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE600" />
            <stop offset="100%" stopColor="#FF9900" />
          </linearGradient>
          <linearGradient id="cupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E21D8A" />
            <stop offset="30%" stopColor="#9C4AEC" />
            <stop offset="70%" stopColor="#10BACB" />
            <stop offset="100%" stopColor="#8ED521" />
          </linearGradient>
          
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#4B1280" floodOpacity="0.15" />
          </filter>
          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <style>{`
            @keyframes avatarBreathe {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-1.5px) scale(1.005); }
            }
            @keyframes mouthSpeak {
              0%, 100% { transform: scaleY(0.65); }
              50% { transform: scaleY(1.35); }
            }
            @keyframes eyeBlink {
              0%, 94%, 100% { transform: scaleY(1); }
              97% { transform: scaleY(0.15); }
            }
            @keyframes listeningPulse {
              0%, 100% { transform: scale(0.98); opacity: 0.2; }
              50% { transform: scale(1.04); opacity: 0.55; }
            }
            @keyframes thinkingSpin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .breathe-elem {
              animation: avatarBreathe 4s ease-in-out infinite;
              transform-origin: bottom center;
            }
            .speak-elem {
              animation: mouthSpeak 0.2s ease-in-out infinite;
              transform-origin: 100px 98px;
            }
            .blink-elem {
              animation: eyeBlink 4.5s ease-in-out infinite;
              transform-origin: 100px 87px;
            }
            .listen-ring-1 {
              animation: listeningPulse 1.8s ease-in-out infinite;
              transform-origin: 100px 100px;
            }
            .listen-ring-2 {
              animation: listeningPulse 1.8s ease-in-out infinite;
              animation-delay: 0.9s;
              transform-origin: 100px 100px;
            }
            .think-ring {
              animation: thinkingSpin 7s linear infinite;
              transform-origin: 100px 100px;
            }
          `}</style>
        </defs>

        {/* GLOWS & BACKDROP */}
        <ellipse cx="100" cy="180" rx="60" ry="15" fill="#000000" fillOpacity="0.15" filter="url(#glowEffect)" />
        <circle cx="100" cy="100" r="94" fill="#FFFFFF" fillOpacity="0.05" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 3" className={isTyping ? "think-ring" : ""} />
        <circle cx="100" cy="100" r="90" fill="none" stroke="url(#cupGrad)" strokeWidth="1.5" strokeOpacity="0.25" />

        {/* Pulsing listening/speaking outer ripples */}
        {isListening && (
          <g>
            <circle cx="100" cy="100" r="95" fill="none" stroke="#EF4444" strokeWidth="2" strokeOpacity="0.4" className="listen-ring-1" />
            <circle cx="100" cy="100" r="95" fill="none" stroke="#EF4444" strokeWidth="1" strokeOpacity="0.2" className="listen-ring-2" />
          </g>
        )}
        {isSpeaking && (
          <g>
            <circle cx="100" cy="100" r="95" fill="none" stroke="#A855F7" strokeWidth="2" strokeOpacity="0.4" className="listen-ring-1" />
            <circle cx="100" cy="100" r="95" fill="none" stroke="#A855F7" strokeWidth="1" strokeOpacity="0.2" className="listen-ring-2" />
          </g>
        )}

        <g className="breathe-elem">
          {/* GORGEOUS OUTERSHELL OF VOLUMINOUS CURLY DIAGONALS (Outer Hair Layer) */}
          <g id="outer-hair" filter="url(#softShadow)">
            {/* Chartreuse/Lime curly waves */}
            <circle cx="68" cy="40" r="28" fill="url(#hairLime)" />
            <circle cx="132" cy="40" r="28" fill="url(#hairPink)" />
            <circle cx="44" cy="70" r="26" fill="url(#hairOrange)" />
            <circle cx="156" cy="70" r="26" fill="url(#hairCyan)" />
            <circle cx="40" cy="100" r="28" fill="url(#hairPink)" />
            <circle cx="160" cy="100" r="28" fill="url(#hairLime)" />
            
            {/* Top hair puffs */}
            <circle cx="100" cy="32" r="32" fill="url(#hairPink)" />
            <circle cx="80" cy="28" r="24" fill="url(#hairOrange)" />
            <circle cx="120" cy="28" r="24" fill="url(#hairCyan)" />

            {/* Additional colorful ring curls to capture ROAMIE's vibrant density */}
            <circle cx="56" cy="125" r="22" fill="url(#hairLime)" />
            <circle cx="144" cy="125" r="22" fill="url(#hairOrange)" />
            <circle cx="48" cy="52" r="24" fill="url(#hairPink)" />
            <circle cx="152" cy="52" r="24" fill="url(#hairCyan)" />
          </g>

          {/* BACKPACK STRAPS & SHOULDERS */}
          <g id="body">
            {/* Shoulders / Torso */}
            <path d="M45 160C45 142 60 132 100 132C140 132 155 142 155 160V190H45V160Z" fill="url(#sweaterGrad)" />
            
            {/* Backpack Straps (mismatched/rainbow styled) */}
            {/* Left Strap */}
            <path d="M 62,132 C 60,140 60,155 64,170" stroke="#FF7A00" strokeWidth="6" strokeLinecap="round" />
            <path d="M 62,132 C 60,140 60,155 64,170" stroke="#FFE600" strokeWidth="2" strokeLinecap="round" />
            
            {/* Right Strap */}
            <path d="M 138,132 C 140,140 140,155 136,170" stroke="#10BACB" strokeWidth="6" strokeLinecap="round" />
            <path d="M 138,132 C 140,140 140,155 136,170" stroke="#B4F43F" strokeWidth="2" strokeLinecap="round" />
            
            {/* Collar of the Sweater */}
            <path d="M 76,132 C 76,144 124,144 124,132" fill="none" stroke="#7E2ED2" strokeWidth="4" />
          </g>

          {/* HEAD & CONFIDENT FACE */}
          <g id="head">
            {/* Neck */}
            <rect x="88" y="118" width="24" height="20" rx="10" fill="#FFCEBB" />
            <path d="M 88,128 C 100,132 100,132 112,128" stroke="#E09F84" strokeWidth="1.5" />
            
            {/* Rounded cute Face */}
            <circle cx="100" cy="90" r="36" fill="url(#faceGrad)" />
            <path d="M 75,108 C 88,114 112,114 125,108" stroke="#E5997A" strokeWidth="1" strokeLinecap="round" />
          </g>

          {/* INNER FOREHEAD HAIR BANGS/TWIRLS Layer */}
          <g id="hair-bangs">
            {/* Soft overlay curls framed over forehead exactly as ROAMIE's signature look */}
            <path d="M 68,70 C 80,68 85,78 80,84" stroke="url(#hairPink)" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M 132,70 C 120,68 115,78 120,84" stroke="url(#hairCyan)" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M 100,60 C 95,68 105,74 100,80" stroke="url(#hairLime)" strokeWidth="6" strokeLinecap="round" fill="none" />
          </g>

          {/* CONFIDENT WARM INTELLIGENT EYE SELECTION */}
          <g id="eyes" className="blink-elem">
            {/* Eye shadows / lids */}
            <path d="M 76,82 C 81,79 89,79 92,82" stroke="#4A2514" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 108,82 C 111,79 119,79 124,82" stroke="#4A2514" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Eyebrows */}
            <path d="M 74,74 C 80,71 88,72 91,76" stroke="#5C361D" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <path d="M 126,74 C 120,71 112,72 109,76" stroke="#5C361D" strokeWidth="2.8" strokeLinecap="round" fill="none" />

            {/* Left Large Green Eye */}
            <circle cx="84" cy="87" r="7" fill="#FFFFFF" />
            <circle cx="84" cy="87" r="5" fill="#149A4B" /> {/* Emerald iris */}
            <circle cx="84.5" cy="87" r="2.5" fill="#132B1A" />
            <circle cx="82.5" cy="85.5" r="1.8" fill="#FFFFFF" /> {/* Highlighting gleam */}
            <circle cx="85.5" cy="88.5" r="0.8" fill="#FFFFFF" />

            {/* Right Large Green Eye */}
            <circle cx="116" cy="87" r="7" fill="#FFFFFF" />
            <circle cx="116" cy="87" r="5" fill="#149A4B" /> {/* Emerald iris */}
            <circle cx="116.5" cy="87" r="2.5" fill="#132B1A" />
            <circle cx="114.5" cy="85.5" r="1.8" fill="#FFFFFF" /> {/* Highlighting gleam */}
            <circle cx="117.5" cy="88.5" r="0.8" fill="#FFFFFF" />
            
            {/* Cutest rosy cheeks */}
            <circle cx="73" cy="98" r="5" fill="#FF1A82" fillOpacity="0.2" filter="url(#glowEffect)" />
            <circle cx="127" cy="98" r="5" fill="#FF1A82" fillOpacity="0.2" filter="url(#glowEffect)" />
          </g>

          {/* DELIGHTED POLISHED CONFIDENT SMILE */}
          <g id="smile" className={isSpeaking ? "speak-elem" : ""}>
            {/* Confidence teeth-showing gentle smile */}
            <path d="M 87,97 C 91,106 109,106 113,97" stroke="#4A1300" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 90,98.5 C 95,103 105,103 110,98.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M 92,97.5 C 93,98.5 107,98.5 108,97.5" stroke="#FFA6CD" strokeWidth="1" strokeLinecap="round" fill="none" />
          </g>

          {/* CHEST EMBLEMS: SIGNATURE BRIGHT YELLOW STAR FROM CHESSIE/ROAMIE */}
          <g id="chest-star" filter="url(#glowEffect)">
            {/* Prominent slightly canted gold star centered on the chest */}
            <path
              d="M 100,142 L 103,150 L 111,150.5 L 105,156 L 107,164.5 L 100,160 L 93,164.5 L 95,156 L 89,150.5 L 97,150 Z"
              fill="url(#starGrad)"
              stroke="#EA8200"
              strokeWidth="0.8"
            />
          </g>

          {/* COFFEE MUG DESIGN WITH VIBRANT ABSTRACT SHAPES */}
          <g id="coffee-mug" filter="url(#softShadow)">
            {/* Hands holding the cup */}
            {/* Cup shape */}
            <path d="M 135,160 L 138,188 C 138,191 152,191 152,188 L 155,160 Z" fill="url(#cupGrad)" stroke="#FFFFFF" strokeWidth="1" />
            {/* Mug sleeve texture */}
            <path d="M 136,168 L 137,178 L 153,178 L 154,168 Z" fill="#D2B48C" stroke="#8B5A2B" strokeWidth="0.5" />
            {/* Cup Lid */}
            <ellipse cx="145" cy="160" rx="11" ry="3" fill="#333333" />
            <rect x="142" y="157" width="6" height="2" fill="#333333" />
            
            {/* Tiny steam trails */}
            {(isSpeaking || isTyping || isListening) && (
              <g stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.6" className="animate-pulse">
                <path d="M 142,152 C 141,148 143,146 142,142" fill="none" />
                <path d="M 147,153 C 146,149 148,147 147,143" fill="none" />
              </g>
            )}

            {/* ROAMIE's friendly, warm, colorful cartoon fingers holding the coffee cup */}
            <rect x="127" y="170" width="10" height="4" rx="2" fill="#FFCEBB" stroke="#E09F84" strokeWidth="0.5" />
            <rect x="129" y="174" width="9" height="4" rx="2" fill="#FFCEBB" stroke="#E09F84" strokeWidth="0.5" />
            <rect x="128" y="178" width="9" height="4" rx="2" fill="#FFCEBB" stroke="#E09F84" strokeWidth="0.5" />
          </g>
        </g>

        {/* SPARKS & AUDIO ENERGY SIGNATURES */}
        {(isSpeaking || isTyping) && (
          <g fill="#FFD700" opacity="0.9" className="animate-bounce">
            {/* Spark A */}
            <path d="M 28,68 L 30,71 L 34,71.5 L 31,73.5 L 32,77 L 28,75 L 24,77 L 25,73.5 L 22,71.5 L 26,71 Z" />
            {/* Spark B */}
            <path d="M 172,68 L 174,71 L 178,71.5 L 175,73.5 L 176,77 L 172,75 L 168,77 L 169,73.5 L 166,71.5 L 170,71 Z" />
          </g>
        )}
      </svg>
      )}
      
      {/* Active Recording State Overlay indicator */}
      {isListening && (
        <span className="absolute bottom-0.5 right-0.5 flex h-4 w-4">
          <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border border-white/60 shadow-md shadow-rose-900/30" />
        </span>
      )}
      {isSpeaking && (
        <span className="absolute bottom-0.5 right-0.5 flex h-4 w-4">
          <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500 border border-white/60 shadow-md shadow-purple-900/30" />
        </span>
      )}
    </div>
  );
};
