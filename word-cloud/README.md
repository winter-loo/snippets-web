# 3D Word Cloud

This is an interactive 3D word cloud visualization built with Three.js. It displays English words in a 3D spatial arrangement.

## Features

- Interactive 3D visualization of words
- Words are arranged in a spherical pattern
- Word size corresponds to its importance/weight
- Orbit controls to rotate and zoom the view
- Add new words dynamically
- Randomize word positions
- Reset to default word set

## Usage

1. Open `index.html` in a web browser
2. Interact with the word cloud:
   - Click and drag to rotate the view
   - Scroll to zoom in/out
   - Use the controls at the bottom left to add words, randomize positions, or reset

## Controls

- **Add Word**: Type a word in the input field and click "Add" (or press Enter)
- **Randomize**: Rearranges all words to new positions
- **Reset**: Returns to the default set of words

## Technical Details

- Built with Three.js
- Uses 3D text geometry for word representation
- Implements dynamic font loading
- Fallback to basic shapes if font loading fails
- Smooth animations for position changes
- Responsive design that adapts to window size

## Requirements

- Modern web browser with WebGL support
- Internet connection (for loading Three.js from CDN)

## License

Open source for educational and personal use.
