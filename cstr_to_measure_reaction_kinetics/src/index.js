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
};

window.draw = function() {
  const width = containerElement.offsetWidth;
  const height = containerElement.offsetHeight;
  drawSimulation(width, height);
};

window.windowResized = () => {
  const width = containerElement.offsetWidth;
  const height = containerElement.offsetHeight;
  state.canvasSize = [width, height];
  resizeCanvas(width, height);
}

function sizeContainer() {
  // No need to resize container anymore since it's handled by CSS
}