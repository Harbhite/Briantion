# ⚡ Flash UI

Flash UI is an ultra-fast, premium, interactive UI generation playground and design sandbox. Powered by Google Gemini and custom-tailored style guides, Flash UI transforms your text prompts and wireframes into elegant, responsive, and functional frontend artifacts in a flash.

---

## ✨ Features

- **💡 Prompt Templates Library**: Launch quickly with beautiful pre-made layouts spanning SaaS Landing Pages, Analytics Dashboards, Frosted Glass Sign-Up forms, Minimal E-Commerce grids, Retro Brutalist Audio Players, and Developer Documentation templates.
- **🛠️ Design Specs & Controls**: Take complete command over the visual outcome. Customize exact guidelines for **Typography**, **Color Schemes & Palettes**, **Structuring & Layouts**, and **Styling Vibes & Themes**.
- **🌡️ Generation Temperature Slider**: Fine-tune the creativity of the AI model, shifting from structured, focused designs to highly creative and imaginative iterations.
- **📸 High-Resolution Screenshot Capture**: Download clean, pixel-perfect `.png` images of your live-rendered artifacts instantly with single-click precision.
- **🎨 Visual Reference & Adherence Levels**: Drag-and-drop or upload design references (sketches, images) and choose from **Loose**, **Medium**, or **Strict** visual alignment constraints.
- **🔄 Dynamic Real-time Streaming**: Watch your UI render seamlessly, element-by-element, with instantaneous responsive styling feedback.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18 or higher) installed on your system.

### Installation

1. Clone or download the repository:
   ```bash
   git clone <repository-url>
   cd flash-ui
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

---

## 🔑 Environment Configuration

To power the AI generations, declare your Google Gemini API key in a `.env` file at the root of your project:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

---

## ⚡ Production Deployment

### Deploying to Vercel

Since Flash UI compiles to a high-speed, lightweight static single-page application (SPA), it is fully ready for zero-config Vercel hosting:

1. **Push your code** to GitHub or export it as a ZIP file.
2. **Import the project** inside your Vercel Dashboard.
3. Keep the default build configurations:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Go to **Project Settings > Environment Variables** and add your `GEMINI_API_KEY`.
5. Click **Deploy**!

For detailed configuration instructions, see the pre-configured [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) guide.

---

## 🛠️ Built With

- **React 18** with **Vite** as the fast frontend build tool.
- **TypeScript** for strict, bulletproof type safety.
- **Tailwind CSS** for polished, responsive utility classes.
- **html2canvas** for rendering and exporting native iframe screenshots.
- **Google Gen AI SDK** (`@google/genai`) for lightning-fast preview-generation streams.
