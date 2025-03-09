import { WordCloud, defaultWords } from './wordcloud.js';

// DOM elements
const container = document.getElementById('container');

// Initialize with default words
let wordCloud = new WordCloud(container);

// Enable interactivity
wordCloud.setupInteractivity();

// Load custom words on page load
async function loadCustomWords() {
    try {
        // Fetch the words.txt file
        const response = await fetch('words.txt');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const text = await response.text();
        
        // Parse the JSON data
        const customWords = JSON.parse(text);
        
        // Update the word cloud with custom words
        wordCloud.updateWords(customWords);
        
        console.log('Custom words loaded successfully!');
    } catch (error) {
        console.error('Error loading custom words:', error);
        // If there's an error, we'll keep the default words
    }
}

// Load custom words automatically when the page loads
document.addEventListener('DOMContentLoaded', loadCustomWords); 