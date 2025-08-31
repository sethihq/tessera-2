# **App Name**: Tessera

## Core Features:

- World Style Extraction: Analyze uploaded or selected reference art to extract style characteristics, including palette, textures, perspective, and line weight, and saves them as World Style presets.
- Asset Generation: Generate 2D environment assets based on the selected World Style, including parallax backgrounds, tilemaps/tilesets, props, and FX sprites.  Uses Nano Banana’s API tool for generation.
- Preview Playground: Preview generated asset packs in parallax scrolling, tileable grids, or animation frames. Enable live palette swapping and parameter adjustments.
- Asset Export: Export generated assets in game-native formats, including PNG + JSON (Aseprite syntax) and Tiled .tmx/.tsx, Godot .tres, Unity SpriteAtlas.
- Generation Modes: Offer generation modes including text prompt-based generation and visual guide-based generation. Enables refining/regenerating asset subsets while maintaining cohesion.
- Luxe UI Implementation: Integrate Luxe UI components for a seamless, elegant user experience, utilizing Next.js, Tailwind CSS, and Radix as needed.

## Style Guidelines:

- Primary color: Saturated purple (#A059D9), reminiscent of imagination, magic, and digital spaces.
- Background color: Desaturated light purple (#F2E7FA) for a clean, soft canvas.
- Accent color: Deep indigo (#3F51B5) to highlight key interactions, creating clear visual cues.
- Body and headline font: 'Inter', sans-serif, providing a clean, modern, and highly readable appearance for the user interface.
- Use clean, minimalist icons that are consistent with the Luxe UI style. Ensure icons are easily recognizable and intuitive.
- Employ a responsive, modular layout to accommodate various screen sizes and devices, focusing on intuitive content placement.
- Incorporate subtle, smooth transitions and animations using Framer Motion to enhance user interaction and provide visual feedback.