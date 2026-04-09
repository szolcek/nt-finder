export function UKMapIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 720"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Land fill — warm parchment watercolour */}
        <linearGradient id="land" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d6c9a8" />
          <stop offset="40%" stopColor="#cfc1a0" />
          <stop offset="100%" stopColor="#c4b898" />
        </linearGradient>
        <linearGradient id="landDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c9bc96" />
          <stop offset="100%" stopColor="#bdb18e" />
        </linearGradient>
        {/* Water */}
        <linearGradient id="water" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9cc5c9" />
          <stop offset="100%" stopColor="#87b5ba" />
        </linearGradient>
        {/* Mountain gradients */}
        <linearGradient id="mtnBrown" x1="0%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#8a7356" />
          <stop offset="60%" stopColor="#a08b6c" />
          <stop offset="100%" stopColor="#c4a97a" />
        </linearGradient>
        <linearGradient id="mtnGrey" x1="0%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#8a8a7e" />
          <stop offset="100%" stopColor="#b5b3a4" />
        </linearGradient>
        <linearGradient id="mtnSnow" x1="0%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#9a8e74" />
          <stop offset="70%" stopColor="#bab09a" />
          <stop offset="100%" stopColor="#e8e2d4" />
        </linearGradient>
        {/* Soft background glow */}
        <radialGradient id="bgWash" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#e8dcc8" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#e8dcc8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background wash */}
      <circle cx="250" cy="360" r="320" fill="url(#bgWash)" />

      {/* ═══════════════════════════════════════════
          LANDMASSES — more detailed outlines
          ═══════════════════════════════════════════ */}

      {/* Scotland */}
      <path d="
        M228,55 C218,52 210,56 202,62 C195,54 185,48 175,52
        C168,45 155,40 145,48 C138,42 128,40 120,48
        C112,44 102,48 98,56 C90,52 80,58 78,66
        C70,64 62,70 65,80 C58,82 52,90 56,100
        C50,106 46,116 52,126 C48,134 50,142 56,148
        C52,155 54,164 62,170 C58,178 62,186 70,190
        C66,198 70,206 78,210 C74,218 78,226 86,228
        C82,236 88,244 96,246 C100,254 108,258 118,254
        C126,262 138,260 148,254
        C156,260 168,258 176,252
        C184,258 196,254 204,246
        C212,252 224,248 230,240
        C238,244 248,238 252,228
        C260,230 268,222 266,212
        C274,208 278,198 272,188
        C278,180 276,170 268,164
        C274,156 272,146 264,140
        C270,132 268,122 260,118
        C264,110 260,100 254,94
        C258,86 252,78 244,74
        C240,66 234,60 228,55Z"
        fill="url(#land)" stroke="#a09878" strokeWidth="1.2" strokeLinejoin="round"
      />

      {/* England + Wales main body */}
      <path d="
        M266,164 C270,174 274,185 270,196
        C276,206 278,218 274,228
        C280,238 282,250 278,262
        C284,272 286,284 282,296
        C288,306 290,318 286,330
        C292,340 294,352 290,364
        C296,374 298,386 294,398
        C298,408 296,418 290,428
        C294,438 292,448 286,458
        C290,468 286,478 278,486
        C282,494 278,504 270,510
        C274,518 268,526 258,530
        C254,538 246,542 236,538
        C228,544 218,540 210,534
        C202,538 192,536 186,528
        C178,532 168,528 162,520
        C154,524 144,520 140,512
        C132,516 122,510 120,500
        C112,498 106,490 108,480
        C100,474 96,464 100,454
        C94,446 92,436 96,428
        C90,420 88,410 92,400
        C86,392 84,382 88,374
        C82,366 80,356 84,348
        C78,340 78,330 84,322
        C78,314 80,304 88,298"
        fill="url(#land)" stroke="#a09878" strokeWidth="1.2" strokeLinejoin="round"
      />

      {/* Wales bulge */}
      <path d="
        M88,298 C78,294 68,298 60,306
        C50,302 40,310 38,322
        C30,326 24,338 28,350
        C22,358 24,368 32,374
        C28,382 32,392 40,396
        C36,404 40,412 50,414
        C54,420 62,422 70,418
        C76,424 84,420 88,412
        C86,404 84,394 88,386
        C84,378 82,368 86,360
        C80,352 80,342 86,334
        C80,326 82,316 88,308
        C86,304 88,300 88,298Z"
        fill="url(#landDark)" stroke="#a09878" strokeWidth="1.2" strokeLinejoin="round"
      />

      {/* Cornwall */}
      <path d="
        M140,512 C134,518 126,522 118,526
        C110,528 102,534 94,530
        C86,534 76,530 70,524
        C64,528 56,524 52,516
        C46,518 40,512 42,504
        C36,500 38,492 44,486
        C48,480 54,478 62,482
        C70,478 78,480 84,486
        C92,482 100,486 106,492
        C114,488 122,494 128,502
        C134,498 138,504 140,512Z"
        fill="url(#land)" stroke="#a09878" strokeWidth="1.2" strokeLinejoin="round"
      />

      {/* Northern Ireland */}
      <path d="
        M58,195 C50,190 40,194 34,202
        C26,198 16,206 14,216
        C6,220 2,232 6,242
        C2,250 4,260 12,266
        C8,274 12,282 22,282
        C26,290 34,286 40,280
        C48,284 56,280 60,272
        C68,276 76,270 74,260
        C80,254 80,244 74,238
        C78,230 76,220 70,214
        C66,206 62,198 58,195Z"
        fill="url(#land)" stroke="#a09878" strokeWidth="1.2" strokeLinejoin="round"
      />

      {/* ═══════════════════════════════════════════
          WATER FEATURES — lochs & lakes
          ═══════════════════════════════════════════ */}
      <ellipse cx="160" cy="140" rx="8" ry="3" fill="url(#water)" opacity="0.7" transform="rotate(-15,160,140)" />
      <ellipse cx="190" cy="178" rx="6" ry="2.5" fill="url(#water)" opacity="0.7" transform="rotate(10,190,178)" />
      <ellipse cx="132" cy="190" rx="10" ry="3" fill="url(#water)" opacity="0.7" transform="rotate(-20,132,190)" />
      <ellipse cx="210" cy="282" rx="7" ry="2.5" fill="url(#water)" opacity="0.7" />
      <ellipse cx="175" cy="310" rx="5" ry="2" fill="url(#water)" opacity="0.6" />

      {/* ═══════════════════════════════════════════
          MOUNTAINS — detailed with shading
          ═══════════════════════════════════════════ */}

      {/* Ben Nevis area */}
      <g transform="translate(155,145)">
        <polygon points="0,0 -18,0 -6,-22" fill="url(#mtnSnow)" />
        <polygon points="0,0 18,0 6,-22" fill="url(#mtnBrown)" />
        <polygon points="-6,-22 0,-28 6,-22" fill="#e0dac8" />
        <text x="0" y="10" textAnchor="middle" fill="#6b5d45" fontFamily="Georgia,serif" fontSize="6" fontStyle="italic">Ben Nevis</text>
      </g>

      {/* Cairngorms */}
      <g transform="translate(220,130)">
        <polygon points="0,0 -14,0 -5,-17" fill="url(#mtnGrey)" />
        <polygon points="0,0 14,0 5,-17" fill="url(#mtnBrown)" />
        <polygon points="-5,-17 0,-22 5,-17" fill="#ddd8c8" />
        <polygon points="18,0 32,0 26,-14" fill="url(#mtnBrown)" opacity="0.7" />
        <polygon points="18,0 4,0 10,-14" fill="url(#mtnGrey)" opacity="0.7" />
        <text x="14" y="10" textAnchor="middle" fill="#6b5d45" fontFamily="Georgia,serif" fontSize="5.5" fontStyle="italic">Cairngorms</text>
      </g>

      {/* Lake District peaks */}
      <g transform="translate(175,250)">
        <polygon points="0,0 -12,0 -4,-16" fill="url(#mtnBrown)" />
        <polygon points="0,0 12,0 4,-16" fill="url(#mtnGrey)" />
        <polygon points="14,0 28,0 22,-12" fill="url(#mtnBrown)" opacity="0.8" />
        <polygon points="14,0 0,0 6,-12" fill="url(#mtnGrey)" opacity="0.8" />
        <text x="8" y="10" textAnchor="middle" fill="#6b5d45" fontFamily="Georgia,serif" fontSize="5.5" fontStyle="italic">Lake District</text>
      </g>

      {/* Snowdonia */}
      <g transform="translate(62,330)">
        <polygon points="0,0 -12,0 -4,-18" fill="url(#mtnSnow)" />
        <polygon points="0,0 12,0 4,-18" fill="url(#mtnBrown)" />
        <polygon points="-4,-18 0,-23 4,-18" fill="#ddd6c4" />
        <text x="0" y="10" textAnchor="middle" fill="#6b5d45" fontFamily="Georgia,serif" fontSize="5.5" fontStyle="italic">Snowdonia</text>
      </g>

      {/* Peak District */}
      <g transform="translate(210,330)">
        <polygon points="0,0 -10,0 -4,-12" fill="url(#mtnBrown)" />
        <polygon points="0,0 10,0 4,-12" fill="url(#mtnGrey)" />
        <text x="0" y="10" textAnchor="middle" fill="#6b5d45" fontFamily="Georgia,serif" fontSize="5" fontStyle="italic">Peak District</text>
      </g>

      {/* ═══════════════════════════════════════════
          PINE TREES — scattered across landscape
          ═══════════════════════════════════════════ */}
      {/* Pine tree component macro — trunk + triangular layers */}
      {[
        [130,80], [148,95], [112,110], [170,108], [200,90],
        [240,105], [258,125], [138,165], [210,165], [240,155],
        [120,135], [96,150], [195,145], [100,180], [160,210],
        [142,230], [120,250], [190,225], [230,200], [255,195],
        [100,270], [72,290], [55,315], [48,355], [65,375],
        [190,265], [220,260], [245,245], [260,280], [270,310],
        [230,360], [260,360], [280,340], [250,400], [230,410],
        [195,430], [160,460], [130,470],
      ].map(([x, y], i) => (
        <g key={`tree-${i}`} transform={`translate(${x},${y}) scale(${0.6 + (i % 3) * 0.15})`}>
          <rect x="-1" y="0" width="2" height="6" fill="#7a6b4e" rx="0.5" />
          <polygon points="0,-10 -5,0 5,0" fill="#4a6b4a" />
          <polygon points="0,-15 -4,-4 4,-4" fill="#3d5e3d" />
          <polygon points="0,-18 -3,-9 3,-9" fill="#2d4e2d" />
        </g>
      ))}

      {/* Deciduous trees — rounder shapes for southern England */}
      {[
        [200,380], [170,400], [240,430], [220,460], [260,450],
        [200,490], [150,500], [180,475], [115,440], [100,420],
      ].map(([x, y], i) => (
        <g key={`dtree-${i}`} transform={`translate(${x},${y})`}>
          <rect x="-1" y="0" width="2" height="5" fill="#7a6b4e" rx="0.5" />
          <circle cx="0" cy="-4" r={4 + (i % 2)} fill="#6a8a5a" />
          <circle cx="-2" cy="-5" r={2.5 + (i % 2) * 0.5} fill="#5a7a4a" />
        </g>
      ))}

      {/* ═══════════════════════════════════════════
          LANDMARKS — castles, houses, monuments
          ═══════════════════════════════════════════ */}

      {/* Edinburgh Castle */}
      <g transform="translate(195,195)">
        <rect x="-10" y="-4" width="20" height="14" rx="1" fill="#8a7a5e" />
        <rect x="-12" y="-12" width="6" height="12" rx="0.5" fill="#7a6a4e" />
        <rect x="6" y="-12" width="6" height="12" rx="0.5" fill="#7a6a4e" />
        <rect x="-3" y="-16" width="6" height="10" rx="0.5" fill="#8a7a5e" />
        {/* Battlements */}
        <rect x="-12" y="-14" width="2" height="3" fill="#6a5a3e" />
        <rect x="-8" y="-14" width="2" height="3" fill="#6a5a3e" />
        <rect x="6" y="-14" width="2" height="3" fill="#6a5a3e" />
        <rect x="10" y="-14" width="2" height="3" fill="#6a5a3e" />
        <rect x="-3" y="-18" width="2" height="3" fill="#6a5a3e" />
        <rect x="1" y="-18" width="2" height="3" fill="#6a5a3e" />
        <rect x="-2" y="3" width="4" height="7" fill="#5a4a2e" rx="2 2 0 0" />
        <circle cx="0" cy="-20" r="2" fill="#d4a843" />
        <text x="0" y="20" textAnchor="middle" fill="#5a4a32" fontFamily="Georgia,serif" fontSize="6" fontWeight="600">Edinburgh</text>
      </g>

      {/* Stately home — Cotswolds area */}
      <g transform="translate(185,395)">
        <rect x="-12" y="-2" width="24" height="12" rx="1" fill="#c9a86e" stroke="#a08850" strokeWidth="0.5" />
        <polygon points="-14,-2 0,-12 14,-2" fill="#8b6040" stroke="#7a5030" strokeWidth="0.5" />
        <rect x="-8" y="2" width="4" height="4" fill="#87ceeb" opacity="0.5" rx="0.3" />
        <rect x="4" y="2" width="4" height="4" fill="#87ceeb" opacity="0.5" rx="0.3" />
        <rect x="-1.5" y="4" width="3" height="6" fill="#5a3e28" rx="0.3" />
        {/* Chimney */}
        <rect x="-8" y="-13" width="3" height="4" fill="#8a7a5e" />
        <rect x="5" y="-13" width="3" height="4" fill="#8a7a5e" />
        <text x="0" y="20" textAnchor="middle" fill="#5a4a32" fontFamily="Georgia,serif" fontSize="5.5" fontStyle="italic">Cotswolds</text>
      </g>

      {/* Castle — Wales (Conwy style) */}
      <g transform="translate(52,360)">
        <rect x="-8" y="-2" width="16" height="10" rx="1" fill="#8a7e6a" />
        <rect x="-10" y="-10" width="5" height="12" fill="#7a6e5a" />
        <rect x="5" y="-10" width="5" height="12" fill="#7a6e5a" />
        <rect x="-10" y="-12" width="2" height="3" fill="#6a5e4a" />
        <rect x="-7" y="-12" width="2" height="3" fill="#6a5e4a" />
        <rect x="5" y="-12" width="2" height="3" fill="#6a5e4a" />
        <rect x="8" y="-12" width="2" height="3" fill="#6a5e4a" />
        <rect x="-1.5" y="2" width="3" height="6" fill="#5a4e3a" rx="1.5 1.5 0 0" />
      </g>

      {/* London — crown / Tower */}
      <g transform="translate(245,438)">
        <rect x="-8" y="-2" width="16" height="10" fill="#b8a070" stroke="#9a8660" strokeWidth="0.5" rx="0.5" />
        <rect x="-10" y="-8" width="4" height="8" fill="#a89060" />
        <rect x="6" y="-8" width="4" height="8" fill="#a89060" />
        <rect x="-2" y="-12" width="4" height="6" fill="#b8a070" />
        <circle cx="0" cy="-14" r="2.5" fill="#d4a843" />
        {/* Cross on top */}
        <rect x="-0.5" y="-18" width="1" height="5" fill="#d4a843" />
        <rect x="-2" y="-16" width="4" height="1" fill="#d4a843" />
        <text x="0" y="18" textAnchor="middle" fill="#5a4a32" fontFamily="Georgia,serif" fontSize="7" fontWeight="600">London</text>
      </g>

      {/* Lighthouse — Cornwall */}
      <g transform="translate(78,508)">
        <rect x="-3" y="-18" width="6" height="18" fill="#f0ece0" stroke="#ccc" strokeWidth="0.5" rx="0.5" />
        <rect x="-3" y="-13" width="6" height="3.5" fill="#cc4444" rx="0.3" />
        <rect x="-3" y="-5" width="6" height="3.5" fill="#cc4444" rx="0.3" />
        <rect x="-4" y="-20" width="8" height="3" fill="#333" rx="0.5" />
        <circle cx="0" cy="-22" r="3" fill="#f9e76c" />
        <circle cx="0" cy="-22" r="5.5" fill="#f9e76c" opacity="0.2" />
        <circle cx="0" cy="-22" r="8" fill="#f9e76c" opacity="0.08" />
      </g>

      {/* ═══════════════════════════════════════════
          PEOPLE — hikers
          ═══════════════════════════════════════════ */}

      {/* Hiker 1 — Lake District */}
      <g transform="translate(192,240)">
        <circle cx="0" cy="-14" r="3" fill="#d4a070" />
        <rect x="-3" y="-11" width="6" height="8" fill="#2d6b5a" rx="1" />
        <rect x="-3" y="-3" width="2.5" height="6" fill="#4a3a2a" rx="0.5" />
        <rect x="0.5" y="-3" width="2.5" height="6" fill="#4a3a2a" rx="0.5" />
        {/* Walking stick */}
        <line x1="5" y1="-8" x2="8" y2="3" stroke="#7a6040" strokeWidth="1" strokeLinecap="round" />
        {/* Backpack */}
        <rect x="2" y="-10" width="3" height="5" fill="#c45a30" rx="0.5" />
      </g>

      {/* Hiker 2 — Yorkshire */}
      <g transform="translate(228,290)">
        <circle cx="0" cy="-14" r="3" fill="#d4a070" />
        <rect x="-3" y="-11" width="6" height="8" fill="#cc7a30" rx="1" />
        <rect x="-3" y="-3" width="2.5" height="6" fill="#3a3a5a" rx="0.5" />
        <rect x="0.5" y="-3" width="2.5" height="6" fill="#3a3a5a" rx="0.5" />
        <line x1="-5" y1="-8" x2="-8" y2="3" stroke="#7a6040" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* ═══════════════════════════════════════════
          ANIMALS
          ═══════════════════════════════════════════ */}

      {/* Deer — Scottish Highlands */}
      <g transform="translate(140,120)">
        <ellipse cx="0" cy="0" rx="7" ry="4" fill="#b89868" />
        <ellipse cx="-7" cy="-3" rx="3" ry="2.5" fill="#b89868" />
        <circle cx="-8.5" cy="-4" r="0.8" fill="#2a2a2a" />
        {/* Antlers */}
        <path d="M-7,-5 L-10,-14 M-9,-10 L-12,-12 M-9,-8 L-6,-12" stroke="#6a5030" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <path d="M-5,-5 L-4,-14 M-4,-10 L-1,-12 M-4,-8 L-7,-11" stroke="#6a5030" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        {/* Legs */}
        <rect x="-3" y="3" width="1.2" height="4.5" fill="#8a7050" rx="0.3" />
        <rect x="2" y="3" width="1.2" height="4.5" fill="#8a7050" rx="0.3" />
        <rect x="-1" y="3" width="1.2" height="4" fill="#8a7050" rx="0.3" />
        <rect x="4" y="3" width="1.2" height="4" fill="#8a7050" rx="0.3" />
      </g>

      {/* Sheep — Yorkshire */}
      <g transform="translate(210,305)">
        <ellipse cx="0" cy="0" rx="6" ry="4.5" fill="#f0ece0" stroke="#d0caba" strokeWidth="0.5" />
        <circle cx="-5.5" cy="-2" r="2.8" fill="#3a3a3a" />
        <circle cx="-6" cy="-2.5" r="0.8" fill="white" />
        <rect x="-3" y="3.5" width="1.3" height="3.5" fill="#3a3a3a" rx="0.3" />
        <rect x="2" y="3.5" width="1.3" height="3.5" fill="#3a3a3a" rx="0.3" />
      </g>

      {/* Puffin — coast Scotland */}
      <g transform="translate(95,88)">
        <ellipse cx="0" cy="0" rx="3.5" ry="4.5" fill="#1a1a1a" />
        <ellipse cx="0" cy="1" rx="2.5" ry="3" fill="white" />
        <circle cx="0" cy="-3" r="2.8" fill="#1a1a1a" />
        <circle cx="1" cy="-3.5" r="1" fill="white" />
        <circle cx="1.3" cy="-3.5" r="0.5" fill="#1a1a1a" />
        {/* Beak */}
        <polygon points="2.5,-3 6,-2.5 2.5,-1.5" fill="#e85020" />
        <polygon points="2.5,-2.8 5,-2.5 2.5,-2" fill="#f0a020" />
        {/* Feet */}
        <polygon points="-1.5,4.5 -3,6 0,6" fill="#e85020" />
        <polygon points="1.5,4.5 3,6 0,6" fill="#e85020" />
      </g>

      {/* Birds flying */}
      {[[280,80], [295,70], [310,90], [320,75], [100,220], [110,230]].map(([x, y], i) => (
        <path key={`bird-${i}`} d={`M${x},${y} Q${x + 3},${y - 3} ${x + 6},${y} M${x},${y} Q${x - 3},${y - 3} ${x - 6},${y}`} stroke="#4a4a4a" strokeWidth="0.8" fill="none" />
      ))}

      {/* ═══════════════════════════════════════════
          PLACE NAMES — handwritten style
          ═══════════════════════════════════════════ */}
      <text x="145" y="175" fill="#4a3e2e" fontFamily="Georgia,serif" fontSize="11" fontStyle="italic" opacity="0.55" transform="rotate(-5,145,175)">SCOTLAND</text>
      <text x="185" y="380" fill="#4a3e2e" fontFamily="Georgia,serif" fontSize="13" fontStyle="italic" opacity="0.5" transform="rotate(-6,185,380)">ENGLAND</text>
      <text x="42" y="350" fill="#4a3e2e" fontFamily="Georgia,serif" fontSize="8" fontStyle="italic" opacity="0.5" transform="rotate(-12,42,350)">WALES</text>
      <text x="22" y="240" fill="#4a3e2e" fontFamily="Georgia,serif" fontSize="6.5" fontStyle="italic" opacity="0.5">N. IRELAND</text>

      {/* Smaller place names */}
      <text x="248" y="170" fill="#5a4e3a" fontFamily="Georgia,serif" fontSize="5.5" fontWeight="600">ABERDEEN</text>
      <text x="125" y="200" fill="#5a4e3a" fontFamily="Georgia,serif" fontSize="5" fontWeight="600">GLASGOW</text>
      <text x="200" y="275" fill="#5a4e3a" fontFamily="Georgia,serif" fontSize="5" fontWeight="600">YORK</text>
      <text x="150" y="300" fill="#5a4e3a" fontFamily="Georgia,serif" fontSize="5" fontWeight="600">MANCHESTER</text>
      <text x="55" y="395" fill="#5a4e3a" fontFamily="Georgia,serif" fontSize="4.5" fontWeight="600">CARDIFF</text>
      <text x="180" y="440" fill="#5a4e3a" fontFamily="Georgia,serif" fontSize="5" fontWeight="600">BATH</text>
      <text x="60" y="500" fill="#5a4e3a" fontFamily="Georgia,serif" fontSize="5" fontWeight="600">CORNWALL</text>
      <text x="235" y="490" fill="#5a4e3a" fontFamily="Georgia,serif" fontSize="5" fontWeight="600">SUSSEX</text>

      {/* ═══════════════════════════════════════════
          DOTTED TRAIL PATHS
          ═══════════════════════════════════════════ */}
      <path d="M195,210 C200,240 195,270 210,300 C220,330 230,370 240,430" fill="none" stroke="#c4a060" strokeWidth="1.5" strokeDasharray="3 5" opacity="0.4" />
      <path d="M40,250 C50,290 55,330 50,370 C48,390 60,420 75,460" fill="none" stroke="#c4a060" strokeWidth="1.5" strokeDasharray="3 5" opacity="0.35" />

      {/* Trail dots */}
      {[[195,210],[205,265],[210,300],[220,340],[230,380],[240,430],[40,250],[50,310],[50,370],[65,430]].map(([x, y], i) => (
        <circle key={`dot-${i}`} cx={x} cy={y} r="2" fill="#c4a060" opacity="0.5" />
      ))}

      {/* ═══════════════════════════════════════════
          SEA DETAILS — waves
          ═══════════════════════════════════════════ */}
      <g opacity="0.12" stroke="#6a8a8a" strokeWidth="1.2" fill="none">
        <path d="M310,180 Q320,174 330,180 Q340,186 350,180" />
        <path d="M320,200 Q328,195 336,200" />
        <path d="M300,300 Q310,294 320,300 Q330,306 340,300" />
        <path d="M310,320 Q318,315 326,320" />
        <path d="M10,300 Q20,294 30,300" />
        <path d="M5,320 Q15,314 25,320 Q35,326 45,320" />
        <path d="M130,560 Q140,554 150,560 Q160,566 170,560" />
        <path d="M140,575 Q150,570 160,575" />
        <path d="M290,500 Q300,494 310,500" />
      </g>

      {/* ═══════════════════════════════════════════
          COMPASS ROSE — detailed
          ═══════════════════════════════════════════ */}
      <g transform="translate(420,620)">
        <circle cx="0" cy="0" r="28" fill="#f5f0e4" stroke="#8a7a5a" strokeWidth="1" />
        <circle cx="0" cy="0" r="24" fill="none" stroke="#c4b890" strokeWidth="0.5" />
        {/* Cardinal points */}
        <polygon points="0,-20 3,-6 0,-8 -3,-6" fill="#2d5a3f" />
        <polygon points="0,20 3,6 0,8 -3,6" fill="#b8a888" />
        <polygon points="-20,0 -6,-3 -8,0 -6,3" fill="#b8a888" />
        <polygon points="20,0 6,-3 8,0 6,3" fill="#b8a888" />
        {/* Intermediate points */}
        <polygon points="14,-14 5,-5 4,-6 5,-5" fill="#c4a060" />
        <polygon points="-14,-14 -5,-5 -4,-6 -5,-5" fill="#c4a060" />
        <polygon points="14,14 5,5 6,4 5,5" fill="#c4a060" />
        <polygon points="-14,14 -5,5 -6,4 -5,5" fill="#c4a060" />
        <circle cx="0" cy="0" r="3" fill="#2d5a3f" />
        <circle cx="0" cy="0" r="1.5" fill="#d4a843" />
        {/* Labels */}
        <text x="0" y="-28" textAnchor="middle" fill="#2d5a3f" fontFamily="Georgia,serif" fontSize="8" fontWeight="700">N</text>
        <text x="0" y="36" textAnchor="middle" fill="#8a7a5a" fontFamily="Georgia,serif" fontSize="6">S</text>
        <text x="28" y="3" textAnchor="middle" fill="#8a7a5a" fontFamily="Georgia,serif" fontSize="6">E</text>
        <text x="-28" y="3" textAnchor="middle" fill="#8a7a5a" fontFamily="Georgia,serif" fontSize="6">W</text>
      </g>

      {/* ═══════════════════════════════════════════
          TITLE
          ═══════════════════════════════════════════ */}
      <text x="380" y="40" textAnchor="middle" fill="#6a5a3e" fontFamily="Georgia,serif" fontSize="9" letterSpacing="2" opacity="0.5">THE</text>
      <text x="380" y="58" textAnchor="middle" fill="#4a3e2a" fontFamily="Georgia,serif" fontSize="16" fontWeight="700" fontStyle="italic">National</text>
      <text x="380" y="76" textAnchor="middle" fill="#4a3e2a" fontFamily="Georgia,serif" fontSize="16" fontWeight="700" fontStyle="italic">Trust</text>
      <text x="380" y="92" textAnchor="middle" fill="#6a5a3e" fontFamily="Georgia,serif" fontSize="8" letterSpacing="1" opacity="0.5">FINDER</text>
      {/* Decorative line */}
      <line x1="345" y1="98" x2="415" y2="98" stroke="#a09060" strokeWidth="0.8" opacity="0.4" />
      <line x1="355" y1="101" x2="405" y2="101" stroke="#a09060" strokeWidth="0.5" opacity="0.3" />

      {/* Small NT leaf/acorn decorative element */}
      <g transform="translate(380, 110)" opacity="0.4">
        <ellipse cx="0" cy="0" rx="4" ry="5" fill="#6a8a5a" />
        <ellipse cx="0" cy="-2" rx="3" ry="4" fill="#7a9a6a" />
        <line x1="0" y1="5" x2="0" y2="10" stroke="#5a4a2e" strokeWidth="0.8" />
      </g>
    </svg>
  );
}
