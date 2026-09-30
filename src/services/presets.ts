import { ColoringPage } from '../types/coloring';

// Helper to encode SVG into Data URL (Base64 for 100% reliable browser rendering)
export function svgToDataUrl(svgString: string): string {
  const clean = svgString.trim();
  try {
    const base64 = btoa(unescape(encodeURIComponent(clean)));
    return `data:image/svg+xml;base64,${base64}`;
  } catch {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(clean)}`;
  }
}

// Preset SVGs
const MANDALA_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="800" height="800">
  <rect width="500" height="500" fill="white"/>
  <g stroke="black" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="250" cy="250" r="230"/>
    <circle cx="250" cy="250" r="180"/>
    <circle cx="250" cy="250" r="120"/>
    <circle cx="250" cy="250" r="60"/>
    <circle cx="250" cy="250" r="20"/>
    <!-- Petals -->
    <path d="M 250,70 Q 280,120 250,170 Q 220,120 250,70 Z" />
    <path d="M 250,330 Q 280,380 250,430 Q 220,380 250,330 Z" />
    <path d="M 70,250 Q 120,280 170,250 Q 120,220 70,250 Z" />
    <path d="M 330,250 Q 380,280 430,250 Q 380,220 330,250 Z" />
    <!-- Diagonal petals -->
    <path d="M 122,122 Q 175,150 197,197 Q 150,175 122,122 Z" />
    <path d="M 378,122 Q 350,175 303,197 Q 325,150 378,122 Z" />
    <path d="M 122,378 Q 150,325 197,303 Q 175,350 122,378 Z" />
    <path d="M 378,378 Q 325,350 303,303 Q 350,325 378,378 Z" />
    <!-- Radiating spokes -->
    <line x1="250" y1="20" x2="250" y2="70"/>
    <line x1="250" y1="430" x2="250" y2="480"/>
    <line x1="20" y1="250" x2="70" y2="250"/>
    <line x1="430" y1="250" x2="480" y2="250"/>
  </g>
</svg>
`;

const ANIMAL_CAT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="800" height="800">
  <rect width="500" height="500" fill="white"/>
  <g stroke="black" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- Cat Head -->
    <circle cx="250" cy="250" r="140"/>
    <!-- Ears -->
    <polygon points="130,170 110,60 210,120"/>
    <polygon points="370,170 390,60 290,120"/>
    <polygon points="140,150 130,80 190,120"/>
    <polygon points="360,150 370,80 310,120"/>
    <!-- Eyes -->
    <circle cx="190" cy="220" r="25"/>
    <circle cx="310" cy="220" r="25"/>
    <circle cx="195" cy="215" r="8" fill="black"/>
    <circle cx="315" cy="215" r="8" fill="black"/>
    <!-- Nose & Mouth -->
    <polygon points="240,270 260,270 250,285"/>
    <path d="M 250,285 Q 230,310 210,295"/>
    <path d="M 250,285 Q 270,310 290,295"/>
    <!-- Whiskers -->
    <line x1="120" y1="260" x2="40" y2="240"/>
    <line x1="120" y1="280" x2="30" y2="280"/>
    <line x1="120" y1="300" x2="40" y2="320"/>
    <line x1="380" y1="260" x2="460" y2="240"/>
    <line x1="380" y1="280" x2="470" y2="280"/>
    <line x1="380" y1="300" x2="460" y2="320"/>
    <!-- Body & Paws -->
    <path d="M 160,370 Q 140,460 250,460 Q 360,460 340,370"/>
    <ellipse cx="200" cy="450" rx="30" ry="15"/>
    <ellipse cx="300" cy="450" rx="30" ry="15"/>
  </g>
</svg>
`;

const CASTLE_DRAGON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="800" height="800">
  <rect width="500" height="500" fill="white"/>
  <g stroke="black" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- Hill -->
    <path d="M 0,420 Q 250,350 500,420 L 500,500 L 0,500 Z"/>
    <!-- Castle Main Tower -->
    <rect x="200" y="200" width="100" height="200"/>
    <!-- Left Tower -->
    <rect x="110" y="240" width="70" height="160"/>
    <polygon points="110,240 145,170 180,240"/>
    <!-- Right Tower -->
    <rect x="320" y="240" width="70" height="160"/>
    <polygon points="320,240 355,170 390,240"/>
    <!-- Main Spire -->
    <polygon points="200,200 250,110 300,200"/>
    <!-- Flag -->
    <line x1="250" y1="110" x2="250" y2="60"/>
    <polygon points="250,60 290,75 250,90"/>
    <!-- Gate -->
    <path d="M 225,400 L 225,330 A 25,25 0 0 1 275,330 L 275,400 Z"/>
    <!-- Windows -->
    <rect x="235" y="240" width="30" height="40" rx="15"/>
    <rect x="135" y="280" width="20" height="30" rx="10"/>
    <rect x="345" y="280" width="20" height="30" rx="10"/>
    <!-- Friendly Cute Dragon Flying -->
    <path d="M 380,80 Q 430,50 450,100 Q 420,130 380,100 Z"/> <!-- Dragon wing -->
    <circle cx="360" cy="110" r="20"/> <!-- Head -->
    <path d="M 360,130 Q 350,170 390,160 Q 410,140 380,120"/> <!-- Body & Tail -->
    <circle cx="355" cy="105" r="3" fill="black"/>
  </g>
</svg>
`;

const SPACE_FANTASY_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="800" height="800">
  <rect width="500" height="500" fill="white"/>
  <g stroke="black" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- Planet with Ring -->
    <ellipse cx="250" cy="250" rx="90" ry="90"/>
    <ellipse cx="250" cy="250" rx="160" ry="35" transform="rotate(-20 250 250)"/>
    <!-- Planet Craters -->
    <circle cx="210" cy="210" r="18"/>
    <circle cx="270" cy="280" r="24"/>
    <circle cx="280" cy="200" r="12"/>
    <!-- Rocket -->
    <path d="M 100,100 Q 140,60 170,110 L 130,150 Z"/>
    <polygon points="100,100 80,130 115,135"/>
    <polygon points="170,110 175,150 145,135"/>
    <circle cx="135" cy="115" r="10"/>
    <!-- Stars & Moons -->
    <polygon points="400,80 405,95 420,95 408,105 412,120 400,110 388,120 392,105 380,95 395,95"/>
    <polygon points="80,350 83,360 93,360 85,367 88,377 80,370 72,377 75,367 67,360 77,360"/>
    <polygon points="410,380 413,390 423,390 415,397 418,407 410,400 402,407 405,397 397,390 407,390"/>
    <path d="M 330,60 A 30,30 0 1 0 370,100 A 25,25 0 1 1 330,60 Z"/>
  </g>
</svg>
`;

const NATURE_BOTANICAL_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="800" height="800">
  <rect width="500" height="500" fill="white"/>
  <g stroke="black" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- Center Sunflower / Flower -->
    <circle cx="250" cy="250" r="45"/>
    <!-- Seeds Pattern -->
    <circle cx="235" cy="235" r="4"/>
    <circle cx="265" cy="235" r="4"/>
    <circle cx="250" cy="250" r="4"/>
    <circle cx="235" cy="265" r="4"/>
    <circle cx="265" cy="265" r="4"/>
    <!-- Flower Petals -->
    <path d="M 250,205 Q 230,130 250,120 Q 270,130 250,205 Z"/>
    <path d="M 250,295 Q 230,370 250,380 Q 270,370 250,295 Z"/>
    <path d="M 205,250 Q 130,230 120,250 Q 130,270 205,250 Z"/>
    <path d="M 295,250 Q 370,230 380,250 Q 370,270 295,250 Z"/>
    <!-- Diagonal Petals -->
    <path d="M 218,218 Q 160,160 158,142 Q 176,144 218,218 Z"/>
    <path d="M 282,218 Q 340,160 342,142 Q 324,144 282,218 Z"/>
    <path d="M 218,282 Q 160,340 158,358 Q 176,356 218,282 Z"/>
    <path d="M 282,282 Q 340,340 342,358 Q 324,356 282,282 Z"/>
    <!-- Leaves in corners -->
    <path d="M 50,50 Q 120,60 150,120 Q 80,130 50,50 Z"/>
    <path d="M 450,50 Q 380,60 350,120 Q 420,130 450,50 Z"/>
    <path d="M 50,450 Q 120,440 150,380 Q 80,370 50,450 Z"/>
    <path d="M 450,450 Q 380,440 350,380 Q 420,370 450,450 Z"/>
  </g>
</svg>
`;

export const PRESET_PAGES: ColoringPage[] = [
  {
    id: 'preset-mandala-1',
    title: 'Sacred Bloom Mandala',
    description: 'An intricate geometric mandala with radial flower petals, perfect for mindful relaxation.',
    category: 'Mandalas',
    tags: ['mandala', 'relaxing', 'geometry', 'patterns'],
    lineArtDataUrl: svgToDataUrl(MANDALA_SVG),
    createdAt: Date.now() - 100000,
    isPreset: true,
    difficulty: 'Medium',
    likes: 42,
    author: 'ColoringCrazy'
  },
  {
    id: 'preset-animal-cat',
    title: 'Whiskers the Kitten',
    description: 'A adorable playful kitten with big eyes waiting for vibrant colors.',
    category: 'Cute Animals',
    tags: ['cat', 'kitten', 'pets', 'cute'],
    lineArtDataUrl: svgToDataUrl(ANIMAL_CAT_SVG),
    createdAt: Date.now() - 80000,
    isPreset: true,
    difficulty: 'Easy',
    likes: 68,
    author: 'ColoringCrazy'
  },
  {
    id: 'preset-castle-dragon',
    title: 'Dragon & High Castle',
    description: 'A friendly dragon swooping past a fairytale castle on top of a grassy hill.',
    category: 'Castle & Dragons',
    tags: ['castle', 'dragon', 'fairytale', 'adventure'],
    lineArtDataUrl: svgToDataUrl(CASTLE_DRAGON_SVG),
    createdAt: Date.now() - 60000,
    isPreset: true,
    difficulty: 'Medium',
    likes: 55,
    author: 'ColoringCrazy'
  },
  {
    id: 'preset-space-fantasy',
    title: 'Cosmic Ring Planet',
    description: 'A rocket ship exploring a distant ringed planet amidst glittering stars.',
    category: 'Fantasy & Space',
    tags: ['space', 'planet', 'rocket', 'stars', 'sci-fi'],
    lineArtDataUrl: svgToDataUrl(SPACE_FANTASY_SVG),
    createdAt: Date.now() - 40000,
    isPreset: true,
    difficulty: 'Easy',
    likes: 39,
    author: 'ColoringCrazy'
  },
  {
    id: 'preset-botanical-sunflower',
    title: 'Sunny Sunflower Garden',
    description: 'A symmetrical blooming botanical flower surrounded by leafy flourishes.',
    category: 'Nature & Botanical',
    tags: ['flowers', 'sunflower', 'botanical', 'nature'],
    lineArtDataUrl: svgToDataUrl(NATURE_BOTANICAL_SVG),
    createdAt: Date.now() - 20000,
    isPreset: true,
    difficulty: 'Medium',
    likes: 47,
    author: 'ColoringCrazy'
  }
];
