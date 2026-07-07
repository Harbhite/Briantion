# ⚡ Flash UI

Flash UI is a fast and interactive UI generation playground and design sandbox. Powered by Google Gemini and custom-tailored style guides, Flash UI transforms your text prompts and wireframes into frontend artifacts.

## ✨ Features

- **💡 Prompt Templates Library**: Launch quickly with beautiful pre-made layouts.
- **🛠️ Design Specs & Controls**: Customize exact guidelines for **Typography**, **Color Schemes**, **Structuring**, and **Styling**.
- **🌡️ Generation Temperature Slider**: Fine-tune the creativity of the AI model.
- **📸 High-Resolution Screenshot Capture**: Download clean, pixel-perfect `.png` images of your artifacts.
- **🎨 Visual Reference & Adherence Levels**: Drag-and-drop or upload design references.
- **🔄 Dynamic Real-time Streaming**: Watch your UI render element-by-element.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)

### Installation

1. Clone or download the repository.
2. Install the project dependencies:
   `npm install`

3. Run the development server:
   `npm run dev &`

4. Open your browser and navigate to `http://localhost:3000`.

## 🔑 Environment Configuration

Declare your Google Gemini API key in a `.env` file at the root of your project:

VITE_GEMINI_API_KEY=your_google_gemini_api_key_here


## 🛠️ Built With

- **React 18** and **Vite**
- **TypeScript**
- **Tailwind CSS**
- **Google Gen AI SDK** (`@google/genai`)
