import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CUSTOM_PAGES_DIR = path.join(__dirname, 'custom_pages');
if (!fs.existsSync(CUSTOM_PAGES_DIR)) {
  fs.mkdirSync(CUSTOM_PAGES_DIR, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Format filename to clean title
function formatTitleFromFilename(filename) {
  const nameWithoutExt = path.parse(filename).name;
  return nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// Convert local server file to data URL
function fileToDataUrl(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const fileBuffer = fs.readFileSync(filePath);
  if (ext === '.svg') {
    return `data:image/svg+xml;base64,${fileBuffer.toString('base64')}`;
  }
  const mimeType = (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png';
  return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
}

// Recursively scan custom_pages directory for image files
function scanCustomPagesDir(baseDir, currentSubDir = '') {
  const targetDir = path.join(baseDir, currentSubDir);
  if (!fs.existsSync(targetDir)) return [];

  let results = [];
  const items = fs.readdirSync(targetDir, { withFileTypes: true });

  for (const item of items) {
    const relPath = currentSubDir ? path.join(currentSubDir, item.name) : item.name;
    if (item.isDirectory()) {
      results = results.concat(scanCustomPagesDir(baseDir, relPath));
    } else if (item.isFile()) {
      const ext = path.extname(item.name).toLowerCase();
      if (['.svg', '.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
        results.push({
          filename: item.name,
          relativePath: relPath.replace(/\\/g, '/'),
          folderName: currentSubDir ? currentSubDir.replace(/\\/g, '/') : 'General',
          fullPath: path.join(targetDir, item.name)
        });
      }
    }
  }
  return results;
}

// Get list of server folders with image counts and preview cover
app.get('/api/server-folders', (req, res) => {
  try {
    if (!fs.existsSync(CUSTOM_PAGES_DIR)) {
      return res.json({ folders: [] });
    }

    const foldersMap = new Map();
    const entries = fs.readdirSync(CUSTOM_PAGES_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        foldersMap.set(entry.name, []);
      }
    }
    foldersMap.set('General', []);

    const allFiles = scanCustomPagesDir(CUSTOM_PAGES_DIR);
    for (const file of allFiles) {
      const key = file.folderName || 'General';
      if (!foldersMap.has(key)) {
        foldersMap.set(key, []);
      }
      foldersMap.get(key).push(file);
    }

    const folders = [];
    for (const [folderPath, files] of foldersMap.entries()) {
      let coverDataUrl = null;
      if (files.length > 0) {
        try {
          coverDataUrl = fileToDataUrl(files[0].fullPath);
        } catch {}
      }
      folders.push({
        id: folderPath,
        name: formatTitleFromFilename(folderPath),
        path: folderPath,
        count: files.length,
        coverDataUrl
      });
    }

    res.json({ folders });
  } catch (err) {
    console.error('Error fetching server folders:', err);
    res.status(500).json({ error: err.message });
  }
});

// Save page endpoint (no-op server disk write, user custom art is stored in IndexedDB/LocalStorage)
app.post('/api/save-page', (req, res) => {
  res.json({ status: 'ok', message: 'Saved locally in client browser storage' });
});

app.get('/api/server-pages', (req, res) => {
  try {
    if (!fs.existsSync(CUSTOM_PAGES_DIR)) {
      return res.json({ pages: [] });
    }

    const { folder } = req.query;
    let allFiles = scanCustomPagesDir(CUSTOM_PAGES_DIR);

    if (folder && folder !== 'all') {
      const targetFolder = String(folder).toLowerCase();
      allFiles = allFiles.filter(f => f.folderName.toLowerCase() === targetFolder);
    }

    const pages = [];
    for (const file of allFiles) {
      const stat = fs.statSync(file.fullPath);
      const dataUrl = fileToDataUrl(file.fullPath);
      const categoryName = formatTitleFromFilename(file.folderName);
      const ext = path.extname(file.filename).replace('.', '');

      pages.push({
        id: `server-${file.relativePath.replace(/[/\\.]/g, '-')}`,
        title: formatTitleFromFilename(file.filename),
        description: `Loaded from server folder: server/custom_pages/${file.relativePath}`,
        category: categoryName,
        folder: file.folderName,
        relativePath: file.relativePath,
        tags: ['server', file.folderName, ext],
        lineArtDataUrl: dataUrl,
        createdAt: Math.round(stat.mtimeMs),
        isPreset: false,
        difficulty: 'Medium',
        author: 'Server Directory'
      });
    }

    res.json({ pages });
  } catch (err) {
    console.error('Error reading server pages folder:', err);
    res.status(500).json({ error: err.message });
  }
});

// Proxy Image (fetches external online image server-side, bypassing browser CORS & canvas tainting)
app.all('/api/proxy-image', async (req, res) => {
  try {
    const targetUrl = req.query.url || req.body?.url;
    if (!targetUrl) {
      return res.status(400).json({ error: 'Missing "url" parameter.' });
    }

    const response = await fetch(targetUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: `Remote server responded with ${response.status} ${response.statusText}` });
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    res.json({ dataUrl });
  } catch (err) {
    console.error('Error proxying image:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch external image' });
  }
});

// Helper: Extract and clean SVG from Gemini AI text
function extractAndCleanSvg(rawText) {
  if (!rawText || !rawText.trim()) return null;

  let clean = rawText
    .replace(/```(?:xml|svg)?/gi, '')
    .replace(/```/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim();

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

    const innerWithoutBg = svgContent.replace(/<rect[^>]*fill=["'](?:white|#fff|#ffffff)["'][^>]*\/?>/gi, '');
    if (!/<(path|circle|line|g|polyline|polygon|ellipse|text|image)/i.test(innerWithoutBg) && !/<rect/i.test(innerWithoutBg)) {
      return null;
    }

    if (!/<rect[^>]*fill=["'](?:white|#fff|#ffffff)["']/i.test(svgContent)) {
      svgContent = svgContent.replace(/(<svg[^>]*>)/i, '$1\n  <rect width="100%" height="100%" fill="white"/>');
    }

    if (!/stroke=/i.test(svgContent)) {
      svgContent = svgContent.replace(/(<svg[^>]*>)/i, '$1\n  <g stroke="black" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">');
      svgContent = svgContent.replace(/<\/svg>/i, '  </g>\n</svg>');
    }

    return svgContent;
  }

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

// Proxy Gemini AI Prompting server-side
app.post('/api/gemini-proxy', async (req, res) => {
  try {
    const { prompt, apiKey, model = 'gemini-3.6-flash' } = req.body;
    if (!prompt || !apiKey) {
      return res.status(400).json({ error: 'Missing prompt or apiKey' });
    }

    const promptInstruction = `You are a master line-art vector illustrator. Output ONLY raw SVG XML code for a detailed black and white coloring page outline of: "${prompt}".

Strict Requirements:
1. Root tag MUST be <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
2. First element MUST be <rect width="800" height="800" fill="white"/>
3. Group all outlines inside <g stroke="black" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
4. Create AT LEAST 15 to 40 detailed <path>, <circle>, <polygon>, or <ellipse> elements forming crisp, closed outlines of ${prompt} ready for flood fill coloring.
5. Do NOT include markdown code blocks, explanation text, or conversational intro/outro. Output raw XML <svg>...</svg> ONLY.`;

    const candidateModels = Array.from(new Set([model, 'gemini-3.6-flash', 'gemini-3.1-pro-preview', 'gemini-flash', 'gemini-3.6-pro']));
    const attemptLogs = [];

    for (const m of candidateModels) {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey.trim()}`;
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptInstruction }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 8192 }
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          attemptLogs.push(`Model '${m}': ${errData.error?.message || response.statusText}`);
          continue;
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanSvg = extractAndCleanSvg(rawText);

        if (!cleanSvg) {
          attemptLogs.push(`Model '${m}': Responded but could not extract valid SVG.`);
          continue;
        }

        const base64Svg = Buffer.from(cleanSvg).toString('base64');
        const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;

        return res.json({ svg: cleanSvg, dataUrl });
      } catch (err) {
        attemptLogs.push(`Model '${m}': ${err.message}`);
      }
    }

    res.status(500).json({ error: `Gemini API Error:\n${attemptLogs.join('\n')}` });
  } catch (err) {
    console.error('Error in gemini-proxy:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`ColoringCrazy proxy server running on http://localhost:${PORT}`);
});
