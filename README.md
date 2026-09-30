# Coloring Crazy 🎨✨

**Coloring Crazy** is a modern, interactive digital coloring book web application built with React, TypeScript, Vite, and Tailwind CSS. It allows users of all ages to color artwork, create custom coloring pages from images, draw with rich tools, and print or export their masterpieces to PDF.

---

## 🌟 Key Features

- **🎨 Interactive Coloring Studio**
  - **Flood Fill (Bucket)** tool with smart edge detection and color tolerance.
  - **Drawing & Brush Tools**: Freehand painting, shapes (lines, circles, squares, spirals), stencils, stamps, and speech bubbles.
  - **Color Palette Manager**: Favorite color saving, color picker, and history.
  - **Gradient & Color Transformations**: Add dynamic gradients and color fills to line art.

- **📸 Custom Line Art Creator**
  - Convert your own images into line-art coloring pages using vector tracing and edge processing algorithms.
  - Customize canvas aspect ratios and difficulty settings.

- **📚 Library & Artwork Storage**
  - High-quality preset coloring pages.
  - Save progress and artwork locally in your browser using **Dexie.js (IndexedDB)**.
  - Revisit, continue, or manage your completed artworks anytime.

- **🖨️ Print Station & PDF Export**
  - Export coloring pages and completed artwork as high-resolution PDF documents ready for printing.

- **🖥️ Local Asset Server (Optional)**
  - Includes a Node.js / Express backend to browse and import local folder image resources.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Icons**: Lucide React
- **Local Storage**: Dexie.js (IndexedDB)
- **Backend (Optional)**: Express, Node.js, Cors
- **Testing**: Vitest, JSDOM

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `pnpm`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rikardsk/coloring-crazy.git
   cd coloring-crazy
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **(Optional) Start the local backend server:**
   ```bash
   npm run server
   ```

---

## 📜 Available Scripts

- `npm run dev` — Starts the Vite development server.
- `npm run server` — Starts the Node/Express backend server.
- `npm run build` — Compiles TypeScript and builds the application for production.
- `npm run preview` — Previews the production build locally.
- `npm run test` — Runs the unit test suite using Vitest.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
