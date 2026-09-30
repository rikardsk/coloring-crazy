import { svgToDataUrl } from './presets';

export interface PromptGenOptions {
  prompt: string;
  style?: 'mandala' | 'geometric' | 'ai';
}

// Convert loaded HTMLImageElement to clean PNG DataURL (100% browser rendering compliant)
export function convertImageElementToPngDataUrl(img: HTMLImageElement, width = 800, height = 800): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      return canvas.toDataURL('image/png');
    }
  } catch {
    // ignore canvas export errors
  }
  return '';
}

// Wrap image URL in a clean local SVG DataURL with white background
export function wrapImageInLocalDataUrl(imgUrl: string, width = 800, height = 800): string {
  if (imgUrl.startsWith('data:')) {
    return imgUrl;
  }
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="white"/>
</svg>`;
  return svgToDataUrl(svg);
}

// Generate procedural mandala SVG string
export function generateProceduralMandala(petals: number = 8, rings: number = 4): string {
  const size = 500;
  const center = size / 2;
  let paths = `<circle cx="${center}" cy="${center}" r="230"/>`;
  
  for (let r = 1; r <= rings; r++) {
    const radius = (200 / rings) * r;
    paths += `<circle cx="${center}" cy="${center}" r="${radius}"/>`;
    
    const angleStep = (2 * Math.PI) / petals;
    for (let i = 0; i < petals; i++) {
      const angle = i * angleStep;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      paths += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(radius / 4).toFixed(1)}"/>`;
    }
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="800" height="800">
  <rect width="${size}" height="${size}" fill="white"/>
  <g stroke="black" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
    ${paths}
  </g>
</svg>`;
  return svgToDataUrl(svg);
}

// Generate procedural Unicorn & Mythical Creature vector line art
export function generateProceduralUnicornArt(): string {
  const size = 500;
  let paths = '';

  // Magical Frame Ring
  paths += `<circle cx="250" cy="250" r="230" fill="none" stroke="black" stroke-width="4"/>`;
  paths += `<circle cx="250" cy="250" r="215" fill="none" stroke="black" stroke-width="2"/>`;

  // Spiral Unicorn Horn
  paths += `<path d="M 235 150 L 250 40 L 265 150 Z" fill="none" stroke="black" stroke-width="3.5"/>`;
  paths += `<line x1="240" y1="130" x2="258" y2="120" stroke="black" stroke-width="2.5"/>`;
  paths += `<line x1="243" y1="105" x2="256" y2="95" stroke="black" stroke-width="2.5"/>`;
  paths += `<line x1="246" y1="80" x2="254" y2="72" stroke="black" stroke-width="2.5"/>`;

  // Head Contour
  paths += `<path d="M 210 210 C 200 160 230 150 250 150 C 270 150 300 160 290 210 C 285 240 270 270 250 270 C 230 270 215 240 210 210 Z" fill="none" stroke="black" stroke-width="3.5"/>`;
  
  // Muzzle & Nostrils
  paths += `<path d="M 225 240 C 240 255 260 255 275 240" fill="none" stroke="black" stroke-width="2.5"/>`;
  paths += `<circle cx="235" cy="245" r="4" fill="none" stroke="black" stroke-width="2"/>`;
  paths += `<circle cx="265" cy="245" r="4" fill="none" stroke="black" stroke-width="2"/>`;

  // Cute Big Eyes
  paths += `<ellipse cx="230" cy="190" rx="12" ry="16" fill="none" stroke="black" stroke-width="3"/>`;
  paths += `<ellipse cx="270" cy="190" rx="12" ry="16" fill="none" stroke="black" stroke-width="3"/>`;
  paths += `<circle cx="232" cy="186" r="5" fill="black"/>`;
  paths += `<circle cx="272" cy="186" r="5" fill="black"/>`;

  // Ears
  paths += `<path d="M 215 155 C 190 130 180 100 205 110 C 215 125 225 145 225 155 Z" fill="none" stroke="black" stroke-width="3"/>`;
  paths += `<path d="M 285 155 C 310 130 320 100 295 110 C 285 125 275 145 275 155 Z" fill="none" stroke="black" stroke-width="3"/>`;

  // Flowing Mane Locks
  paths += `<path d="M 195 160 C 150 170 130 220 160 260 C 180 280 205 270 200 240 C 170 240 165 190 195 160 Z" fill="none" stroke="black" stroke-width="3"/>`;
  paths += `<path d="M 305 160 C 350 170 370 220 340 260 C 320 280 295 270 300 240 C 330 240 335 190 305 160 Z" fill="none" stroke="black" stroke-width="3"/>`;
  paths += `<path d="M 210 270 C 190 330 160 380 230 420 C 250 430 270 430 290 420 C 340 380 310 330 290 270" fill="none" stroke="black" stroke-width="3"/>`;
  paths += `<path d="M 250 270 L 250 425" stroke="black" stroke-width="2.5"/>`;

  // Surrounding Magic Stars
  const sparkles = [
    { x: 100, y: 100, r: 16 }, { x: 400, y: 100, r: 18 },
    { x: 90, y: 360, r: 20 }, { x: 410, y: 360, r: 18 },
    { x: 140, y: 440, r: 14 }, { x: 360, y: 440, r: 14 }
  ];
  sparkles.forEach(s => {
    paths += `<polygon points="${s.x},${s.y - s.r} ${s.x + s.r/4},${s.y - s.r/4} ${s.x + s.r},${s.y} ${s.x + s.r/4},${s.y + s.r/4} ${s.x},${s.y + s.r} ${s.x - s.r/4},${s.y + s.r/4} ${s.x - s.r},${s.y} ${s.x - s.r/4},${s.y - s.r/4}" fill="none" stroke="black" stroke-width="2.5"/>`;
  });

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="800" height="800">
  <rect width="${size}" height="${size}" fill="white"/>
  <g stroke="black" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
    ${paths}
  </g>
</svg>`;
  return svgToDataUrl(svg);
}

// Generate procedural Cute Animal vector line art
export function generateProceduralAnimalArt(): string {
  const size = 500;
  let paths = '';

  paths += `<circle cx="250" cy="250" r="230" fill="none" stroke="black" stroke-width="4"/>`;
  paths += `<circle cx="250" cy="250" r="140" fill="none" stroke="black" stroke-width="3.5"/>`;
  paths += `<polygon points="140,160 180,80 220,130" fill="none" stroke="black" stroke-width="3"/>`;
  paths += `<polygon points="360,160 320,80 280,130" fill="none" stroke="black" stroke-width="3"/>`;
  paths += `<ellipse cx="200" cy="230" rx="14" ry="18" fill="none" stroke="black" stroke-width="3"/>`;
  paths += `<ellipse cx="300" cy="230" rx="14" ry="18" fill="none" stroke="black" stroke-width="3"/>`;
  paths += `<circle cx="203" cy="226" r="6" fill="black"/>`;
  paths += `<circle cx="303" cy="226" r="6" fill="black"/>`;
  paths += `<polygon points="242,260 258,260 250,270" fill="black"/>`;
  paths += `<path d="M 250 270 C 240 285 220 285 210 275 M 250 270 C 260 285 280 285 290 275" fill="none" stroke="black" stroke-width="2.5"/>`;
  paths += `<line x1="150" y1="260" x2="190" y2="265" stroke="black" stroke-width="2"/>`;
  paths += `<line x1="150" y1="275" x2="190" y2="275" stroke="black" stroke-width="2"/>`;
  paths += `<line x1="350" y1="260" x2="310" y2="265" stroke="black" stroke-width="2"/>`;
  paths += `<line x1="350" y1="275" x2="310" y2="275" stroke="black" stroke-width="2"/>`;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="800" height="800">
  <rect width="${size}" height="${size}" fill="white"/>
  <g stroke="black" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
    ${paths}
  </g>
</svg>`;
  return svgToDataUrl(svg);
}

// Generate procedural Space / Galaxy vector line art
export function generateProceduralSpaceArt(): string {
  const size = 500;
  const center = 250;
  let paths = '';

  // Central Planet & Rings
  paths += `<circle cx="${center}" cy="${center}" r="65" fill="none" stroke="black" stroke-width="4"/>`;
  paths += `<circle cx="${center}" cy="${center}" r="45" fill="none" stroke="black" stroke-width="2"/>`;
  paths += `<ellipse cx="${center}" cy="${center}" rx="135" ry="35" fill="none" stroke="black" stroke-width="3.5" transform="rotate(-25 ${center} ${center})"/>`;
  paths += `<ellipse cx="${center}" cy="${center}" rx="155" ry="48" fill="none" stroke="black" stroke-width="2" transform="rotate(-25 ${center} ${center})"/>`;

  // Orbiting Moons / Planets
  paths += `<circle cx="110" cy="160" r="25" fill="none" stroke="black" stroke-width="3"/>`;
  paths += `<circle cx="390" cy="320" r="32" fill="none" stroke="black" stroke-width="3"/>`;
  paths += `<circle cx="370" cy="120" r="18" fill="none" stroke="black" stroke-width="2.5"/>`;
  paths += `<circle cx="130" cy="380" r="22" fill="none" stroke="black" stroke-width="2.5"/>`;

  // Constellation Stars
  const stars = [
    { x: 70, y: 70, r: 20 }, { x: 430, y: 80, r: 22 },
    { x: 80, y: 430, r: 24 }, { x: 440, y: 420, r: 20 },
    { x: 250, y: 40, r: 16 }, { x: 250, y: 460, r: 16 },
    { x: 200, y: 110, r: 12 }, { x: 300, y: 390, r: 12 }
  ];

  stars.forEach(s => {
    paths += `<polygon points="${s.x},${s.y - s.r} ${s.x + s.r/3},${s.y - s.r/3} ${s.x + s.r},${s.y} ${s.x + s.r/3},${s.y + s.r/3} ${s.x},${s.y + s.r} ${s.x - s.r/3},${s.y + s.r/3} ${s.x - s.r},${s.y} ${s.x - s.r/3},${s.y - s.r/3}" fill="none" stroke="black" stroke-width="3"/>`;
  });

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="800" height="800">
  <rect width="${size}" height="${size}" fill="white"/>
  <g stroke="black" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
    ${paths}
  </g>
</svg>`;
  return svgToDataUrl(svg);
}

// Generate procedural Botanical / Floral vector line art
export function generateProceduralBotanicalArt(): string {
  const size = 500;
  const center = 250;
  let paths = `<circle cx="${center}" cy="${center}" r="40" fill="none" stroke="black" stroke-width="3"/>`;

  // 12 Petals
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 * Math.PI) / 180;
    const x1 = center + 40 * Math.cos(angle);
    const y1 = center + 40 * Math.sin(angle);
    const x2 = center + 180 * Math.cos(angle);
    const y2 = center + 180 * Math.sin(angle);
    const cx1 = center + 110 * Math.cos(angle - 0.3);
    const cy1 = center + 110 * Math.sin(angle - 0.3);
    const cx2 = center + 110 * Math.cos(angle + 0.3);
    const cy2 = center + 110 * Math.sin(angle + 0.3);
    paths += `<path d="M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}" fill="none" stroke="black" stroke-width="3"/>`;
  }

  paths += `<circle cx="${center}" cy="${center}" r="190" fill="none" stroke="black" stroke-width="3"/>`;
  paths += `<circle cx="${center}" cy="${center}" r="215" fill="none" stroke="black" stroke-width="2"/>`;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="800" height="800">
  <rect width="${size}" height="${size}" fill="white"/>
  <g stroke="black" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
    ${paths}
  </g>
</svg>`;
  return svgToDataUrl(svg);
}

// Free AI Image Generation URL builder (Pollinations.ai free line art generator)
export function getFreeAILineArtUrl(userPrompt: string): string {
  const lineArtPrompt = `clean black and white line art coloring page, ${userPrompt}, high contrast bold black outlines, pure white background, no grayscale shading, vector drawing style`;
  const encoded = encodeURIComponent(lineArtPrompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=800&height=800&seed=${Math.floor(Math.random() * 10000)}&nologo=true`;
}

// Robust Image Loader via Blob Fetch & HTMLImageElement (Avoids Canvas Tainting & CORS Security Errors)
export function convertImageUrlToDataUrlViaImage(url: string, timeoutMs = 25000): Promise<{ dataUrl: string; imgElement: HTMLImageElement }> {
  return new Promise((resolve, reject) => {
    let timer: any = null;

    const controller = new AbortController();
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error(`API request to online image endpoint timed out after ${Math.round(timeoutMs / 1000)}s`));
    }, timeoutMs);

    // 0. Try server-side proxy first if available (completely bypasses CORS & browser canvas security errors)
    fetch('/api/proxy-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: controller.signal
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server proxy HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.dataUrl) {
          const img = new Image();
          img.onload = () => {
            if (timer) clearTimeout(timer);
            resolve({ dataUrl: data.dataUrl, imgElement: img });
          };
          img.onerror = () => {
            throw new Error('Failed to load proxy image');
          };
          img.src = data.dataUrl;
          return;
        }
        throw new Error('No dataUrl returned from proxy');
      })
      .catch(() => {
        // 1. Fallback to client-side Blob fetch
        fetch(url, { signal: controller.signal })
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.blob();
          })
          .then((blob) => {
            const blobUrl = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
              if (timer) clearTimeout(timer);
              try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || 800;
                canvas.height = img.naturalHeight || 800;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = '#FFFFFF';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  const dataUrl = canvas.toDataURL('image/png');
                  URL.revokeObjectURL(blobUrl);
                  resolve({ dataUrl, imgElement: img });
                  return;
                }
              } catch {
                // ignore canvas export errors
              }
              resolve({ dataUrl: blobUrl, imgElement: img });
            };
            img.onerror = () => {
              if (timer) clearTimeout(timer);
              reject(new Error(`Failed to decode image from online AI generator.`));
            };
            img.src = blobUrl;
          })
          .catch(() => {
            // 2. Fallback to standard Image element loader with CORS
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              if (timer) clearTimeout(timer);
              try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || 800;
                canvas.height = img.naturalHeight || 800;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = '#FFFFFF';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  const dataUrl = canvas.toDataURL('image/png');
                  resolve({ dataUrl, imgElement: img });
                  return;
                }
              } catch {
                // ignore
              }
              resolve({ dataUrl: url, imgElement: img });
            };
            img.onerror = () => {
              // 3. Fallback to Image loader without CORS restriction
              const imgNoCors = new Image();
              imgNoCors.onload = () => {
                if (timer) clearTimeout(timer);
                const pngDataUrl = convertImageElementToPngDataUrl(imgNoCors);
                resolve({ dataUrl: pngDataUrl, imgElement: imgNoCors });
              };
              imgNoCors.onerror = () => {
                if (timer) clearTimeout(timer);
                reject(new Error(`Online AI image generator endpoint is currently unreachable or blocking connection.`));
              };
              imgNoCors.src = url;
            };
            img.src = url;
          });
      });
  });
}

// Helper to fetch and convert online AI image URL to local DataURL for IndexedDB offline persistence
export async function convertImageUrlToDataUrl(url: string): Promise<string> {
  const res = await convertImageUrlToDataUrlViaImage(url);
  return res.dataUrl;
}

// Robust SVG Extractor and Cleaner for AI responses
export function extractAndCleanSvg(rawText: string): string | null {
  if (!rawText || !rawText.trim()) return null;

  // 1. Remove markdown code block wrappers (```xml ... ``` or ```svg ... ```) and unescape HTML entities
  let clean = rawText
    .replace(/```(?:xml|svg)?/gi, '')
    .replace(/```/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim();

  // 2. Find <svg ... </svg> (or up to end of string if closing tag was omitted)
  const svgMatch = clean.match(/<svg[\s\S]*?(?:<\/svg>|$)/i);
  if (svgMatch) {
    let svgContent = svgMatch[0].trim();
    if (!/<\/svg>/i.test(svgContent)) {
      svgContent += '\n</svg>';
    }
    if (!/viewBox=/i.test(svgContent)) {
      svgContent = svgContent.replace(/<svg/i, '<svg viewBox="0 0 800 800" width="800" height="800"');
    }
    if (!/xmlns=/i.test(svgContent)) {
      svgContent = svgContent.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    // Remove background rect temporarily to check for real drawing elements
    const innerWithoutBg = svgContent.replace(/<rect[^>]*fill=["'](?:white|#fff|#ffffff)["'][^>]*\/?>/gi, '');
    if (!/<(path|circle|line|g|polyline|polygon|ellipse|text|image)/i.test(innerWithoutBg) && !/<rect/i.test(innerWithoutBg)) {
      return null; // Reject SVG if it contains no line art drawing elements!
    }

    // Ensure white background rect is present
    if (!/<rect[^>]*fill=["'](?:white|#fff|#ffffff)["']/i.test(svgContent)) {
      svgContent = svgContent.replace(/(<svg[^>]*>)/i, '$1\n  <rect width="100%" height="100%" fill="white"/>');
    }

    // Ensure default stroke formatting if stroke is missing
    if (!/stroke=/i.test(svgContent)) {
      svgContent = svgContent.replace(/(<svg[^>]*>)/i, '$1\n  <g stroke="black" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">');
      svgContent = svgContent.replace(/<\/svg>/i, '  </g>\n</svg>');
    }

    return svgContent;
  }

  // 3. Fallback: If AI returned raw SVG elements (<g>, <path>, etc.) without root <svg>
  if (/<(path|circle|line|g|polyline|polygon|ellipse)/i.test(clean)) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <rect width="800" height="800" fill="white"/>
  <g stroke="black" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
    ${clean}
  </g>
</svg>`;
  }

  return null;
}

// Google Gemini API SVG Line Art Generator (prefers server backend proxy)
export async function generateGeminiLineArtSvg(userPrompt: string, apiKey: string, requestedModel = 'gemini-3.6-flash'): Promise<string> {
  // 1. Try server backend proxy endpoint first
  try {
    const proxyRes = await fetch('/api/gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userPrompt, apiKey, model: requestedModel })
    });
    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data.dataUrl) return data.dataUrl;
      if (data.svg) return svgToDataUrl(data.svg);
    }
  } catch {
    // Backend proxy unavailable, fallback to direct browser fetch
  }

  // 2. Client-side direct fallback
  const promptInstruction = `You are a master line-art vector illustrator. Output ONLY raw SVG XML code for a detailed black and white coloring page outline of: "${userPrompt}".

Strict Requirements:
1. Root tag MUST be <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
2. First element MUST be <rect width="800" height="800" fill="white"/>
3. Group all outlines inside <g stroke="black" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
4. Create AT LEAST 15 to 40 detailed <path>, <circle>, <polygon>, or <ellipse> elements forming crisp, closed outlines of ${userPrompt} ready for flood fill coloring.
5. Do NOT include markdown code blocks, explanation text, or conversational intro/outro. Output raw XML <svg>...</svg> ONLY.`;

  const defaultCandidates = ['gemini-3.6-flash', 'gemini-3.1-pro-preview', 'gemini-flash', 'gemini-3.6-pro'];
  const candidateModels = Array.from(new Set([requestedModel, ...defaultCandidates].filter(Boolean)));
  const attemptLogs: string[] = [];

  for (const model of candidateModels) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptInstruction }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192
          }
        })
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const errMessage = errorJson.error?.message || `HTTP ${response.status} ${response.statusText}`;
        attemptLogs.push(`Model '${model}': ${errMessage}`);
        continue;
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      const cleanSvg = extractAndCleanSvg(rawText);
      if (!cleanSvg) {
        const sampleText = rawText.slice(0, 150).replace(/\n/g, ' ');
        attemptLogs.push(`Model '${model}': Responded but could not extract SVG XML (Received: "${sampleText}...")`);
        continue;
      }

      return svgToDataUrl(cleanSvg);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      attemptLogs.push(`Model '${model}': ${msg}`);
    }
  }

  throw new Error(`Gemini API Error across tested models:\n${attemptLogs.join('\n')}`);
}
