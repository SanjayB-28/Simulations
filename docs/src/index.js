import "bootstrap";
import "./style/slider.scss";
import { drawSimulation } from "./js/graphics.js";
import { handleInteractions } from "./js/interactions.js";

// Global state
window.state = {
  valveAOpen: false,
  valveBOpen: false,
  sliderAValue: 0.25,
  sliderBValue: 0.25,
  isDraggingSliderA: false,
  isDraggingSliderB: false
};

// Setup p5 sketch
const sketch = (p) => {
  p.setup = () => {
    const canvas = p.createCanvas(800, 600);
    canvas.parent('p5-container');
  };

  p.draw = () => {
    p.background(240);
    drawSimulation(p);
    handleInteractions(p);
  };
};

new p5(sketch);

// Hamburger menu functionality
document.getElementById('hamburger-icon').addEventListener('click', () => {
  const controls = document.getElementById('controls');
  controls.style.display = controls.style.display === 'none' ? 'block' : 'none';
});