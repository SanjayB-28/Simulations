import "bootstrap";
import "p5";
import "./style/style.scss";
import { drawAll } from "./js/draw.js";
import { handleInputs } from "./js/inputs.js";
import { calcAll } from "./js/calcs.js";

// GLOBAL VARIABLES OBJECT
window.state = {
  frameRate: 60,
  pixelDensity: 4,
  showButtons: false,
  hamburgerHasBeenClicked: window.localStorage.getItem("hamburgerHasBeenClicked") === "true",
  canvasSize: [150, 120],
  controlBarHeight: 14, // 10px bar height + 2px top margin + 2px bottom margin
  showMenu: false, // For canvas popup menu
};

const containerElement = document.getElementById("p5-container");

window.setup = function() {
  sizeContainer();
  createCanvas(containerElement.offsetWidth, containerElement.offsetHeight).parent(containerElement);
  handleInputs();
  calcAll();
  pixelDensity(state.pixelDensity);
  frameRate(state.frameRate);
};

window.draw = function() {
  window.width = state.canvasSize[0];
  window.height = state.canvasSize[1];
  scale(relativeSize());
  background(255);
  
  // Set the main content area (below the control bar with margins)
  const margin = 2; // Match the control bar margin
  window.contentArea = {
    x: margin,
    y: state.controlBarHeight + 2 * margin,
    width: state.canvasSize[0] - 2 * margin,
    height: state.canvasSize[1] - state.controlBarHeight - 3 * margin
  };
  
  // Provide scaled mouse coordinates for future use
  window.mX = mouseX / relativeSize();
  window.mY = mouseY / relativeSize();
  
  drawAll();
};

window.mousePressed = function() {
  // Check if menu is open and handle menu button clicks
  if (window.state.showMenu && window.menuButtonBounds) {
    for (const btn of window.menuButtonBounds) {
      if (
        window.mX >= btn.x && window.mX <= btn.x + btn.w &&
        window.mY >= btn.y && window.mY <= btn.y + btn.h
      ) {
        // Trigger the appropriate modal
        let modalId = null;
        if (btn.label === 'Directions') modalId = 'directions-modal';
        if (btn.label === 'Details') modalId = 'details-modal';
        if (btn.label === 'About') modalId = 'about-modal';
        if (modalId) {
          const modal = new window.bootstrap.Modal(document.getElementById(modalId));
          modal.show();
        }
        window.state.showMenu = false;
        return;
      }
    }
    // If click is outside the menu, close it
    // (menu bounds)
    const menu = window.menuButtonBounds[0];
    const menuX = menu.x;
    const menuY = menu.y - 5; // popupPadding
    const menuW = window.menuButtonBounds[0].w + 2 * 5; // btnW + 2*popupPadding
    const menuH = window.menuButtonBounds.length * (12 + 4) - 4 + 2 * 5; // (buttonHeight+buttonSpacing)*3 - spacing + 2*popupPadding
    if (!(window.mX >= menuX && window.mX <= menuX + menuW && window.mY >= menuY && window.mY <= menuY + menuH)) {
      window.state.showMenu = false;
      return;
    }
  }
  // Check if click is inside the hamburger icon
  if (window.hamburgerIconBounds) {
    const { x, y, w, h } = window.hamburgerIconBounds;
    if (
      window.mX >= x && window.mX <= x + w &&
      window.mY >= y && window.mY <= y + h
    ) {
      window.state.showMenu = !window.state.showMenu;
      return;
    }
  }
  // Add other mouse interactions here if needed
};

// Remove mousePressed handler related to hamburger

window.windowResized = () => {
  resizeCanvas(containerElement.offsetWidth, containerElement.offsetHeight);
}

window.relativeSize = () => containerElement.offsetWidth / 150;

function sizeContainer() {
  containerElement.style.width = `calc(100vw - 10px)`;
  containerElement.style.maxWidth = `calc(calc(100vh - 10px) * ${state.canvasSize[0]} / ${state.canvasSize[1]})`;
  containerElement.style.height = `calc(calc(100vw - 10px) * ${state.canvasSize[1]} / ${state.canvasSize[0]})`;
  containerElement.style.maxHeight = `calc(100vh - 10px)`;
}

require("./js/events.js");