import "bootstrap";
import "p5";
import "./style/style.scss";
import { setupCanvas, drawSimulation } from "./js/graphics";

// Global state object
window.state = {
  frameRate: 60,
  pixelDensity: 4,
  hamburgerHasBeenClicked: window.localStorage.getItem("hamburgerHasBeenClicked") === "true",
  canvasSize: [1400, 1000],
  scale: 1
};

const containerElement = document.getElementById("p5-container");

window.setup = function() {
  sizeContainer();
  const { width, height } = setupCanvas(containerElement);
  state.canvasSize = [width, height];
  setupHamburgerMenu();
  windowResized();
};

window.draw = function() {
  const width = containerElement.offsetWidth;
  const height = containerElement.offsetHeight;
  drawSimulation(width, height);
};

// Function to setup hamburger menu
function setupHamburgerMenu() {
  const hamburger = document.getElementById('hamburger-icon');
  const controls = document.getElementById('controls');

  hamburger.addEventListener('click', () => {
    state.hamburgerHasBeenClicked = !state.hamburgerHasBeenClicked;
    window.localStorage.setItem("hamburgerHasBeenClicked", state.hamburgerHasBeenClicked);
    controls.style.display = state.hamburgerHasBeenClicked ? 'block' : 'none';
  });

  controls.style.display = state.hamburgerHasBeenClicked ? 'block' : 'none';
}

window.windowResized = () => {
  const width = containerElement.offsetWidth;
  const height = containerElement.offsetHeight;
  state.canvasSize = [width, height];
  resizeCanvas(width, height);
}

function sizeContainer() {
  // No need to resize container anymore since it's handled by CSS
}