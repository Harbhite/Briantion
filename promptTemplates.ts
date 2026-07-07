export interface PromptTemplate {
    id: string;
    name: string;
    category: 'dashboard' | 'landing page' | 'form' | 'grid' | 'player' | 'docs';
    prompt: string;
    specs: {
        typography: string;
        colorScheme: string;
        structuring: string;
        style: string;
    };
    icon: string; // Tailwind-friendly key or simple short label
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
    {
        id: 'dashboard',
        name: 'Analytics Dashboard',
        category: 'dashboard',
        prompt: 'A premium Web Analytics Dashboard featuring three KPI metric cards (Pageviews, Bounce Rate, Conversion Rate) with trend indicators, an interactive visual line chart widget rendered via beautiful SVG, a responsive data table showing recent traffic channels, and a sidebar navigation panel.',
        specs: {
            typography: 'Inter for clean UI, JetBrains Mono for exact numerical metric values',
            colorScheme: 'Ultra-dark theme (deep charcoal background), neon teal and purple glowing accents',
            structuring: 'Sleek 3-column dashboard grid layout with sidebar controls',
            style: 'Frosted glassmorphism, glowing card borders, and smooth hover translations'
        },
        icon: '📊'
    },
    {
        id: 'landing',
        name: 'SaaS Landing Page',
        category: 'landing page',
        prompt: 'A high-converting SaaS landing page highlighting a bold hero section with striking display typography, an integrated interactive feature grid with multi-card bento box item grids, a beautiful responsive three-tier pricing comparison table with a interactive toggle, and an animated contact section.',
        specs: {
            typography: 'Space Grotesk for dramatic bold headings, Inter for clean body copy',
            colorScheme: 'Midnight dark canvas, electric indigo and hot pink glowing gradient highlights',
            structuring: 'Fluid modern vertical scrolling page with spacious sections',
            style: 'Sleek dark tech-forward aesthetics, ambient mesh background glows, and crisp hover animations'
        },
        icon: '🚀'
    },
    {
        id: 'form',
        name: 'Frosted Glass Sign-Up',
        category: 'form',
        prompt: 'An interactive user sign-up form with input validations. It displays Name, Email, and Password text fields, custom OAuth social credentials buttons (Google, GitHub), dynamic error validation state prompts, and an elegant branding graphic card adjacent to the inputs.',
        specs: {
            typography: 'Outfit or Inter for extremely readable inputs and headings',
            colorScheme: 'Frosted semi-translucent overlay, bright violet ambient background gradients',
            structuring: 'Split two-column form card (decorative left column, input fields right column)',
            style: 'Sophisticated glassmorphism backdrop filter, soft pill-shaped buttons, and active rings'
        },
        icon: '📝'
    },
    {
        id: 'ecommerce',
        name: 'Minimal E-Commerce Layout',
        category: 'grid',
        prompt: 'An elegant minimal e-commerce product listings portal showcasing designer lighting and seating products. Features interactive category pill buttons (All, Seating, Lighting, Tables), 6 hover-interactive product cards showing custom prices and ratings, and an instant interactive cart count badge.',
        specs: {
            typography: 'Playfair Display for editorial luxury titles, Inter for product cards and prices',
            colorScheme: 'Warm sand and linen cream light theme with deep charcoal text and forest green buttons',
            structuring: 'Balanced responsive grid of product listings with thin dividing borders',
            style: 'Editorial minimalism, generous negative space, crisp hairline dividers, and elegant button states'
        },
        icon: '🛒'
    },
    {
        id: 'player',
        name: 'Brutalist Music Player',
        category: 'player',
        prompt: 'An atmospheric retro neo-brutalist music player widget. Includes a large high-contrast record artwork card, active progress bar scrubbing slider, tactile retro playback control buttons (play, pause, next, back), an active volume slider, and a scrollable track history log.',
        specs: {
            typography: 'JetBrains Mono exclusively for high-contrast retro monospace text',
            colorScheme: 'Pitch-black background with neon green console displays and bright yellow buttons',
            structuring: 'Centered asymmetric bento player layout with thick outline blocks',
            style: 'Thick chunky solid borders, heavy hard black drop-shadows, and pixel-art aesthetic indicators'
        },
        icon: '📻'
    },
    {
        id: 'docs',
        name: 'Developer Documentation',
        category: 'docs',
        prompt: 'An interactive developer documentation portal. Features a responsive left sidebar navigation list with a filter bar, a center-column code documentation article alongside an interactive live code playground editor simulation, and a floating keyboard shortcuts helper modal.',
        specs: {
            typography: 'Inter for documentation prose, Fira Code or JetBrains Mono for code highlights',
            colorScheme: 'Deep slate grey backdrop, mint green text syntax accents, and charcoal buttons',
            structuring: 'Three-column technical documentation dashboard (sidebar menu, main copy, right-side TOC)',
            style: 'Technical minimalism, elegant border accents, crisp monospace terminal blocks, and tag labels'
        },
        icon: '📖'
    }
];
