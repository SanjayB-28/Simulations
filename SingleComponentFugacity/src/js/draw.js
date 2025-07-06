export function drawAll() {
  drawControlBar();
  // Draw canvas popup menu if state.showMenu is true
  if (window.state.showMenu) {
    drawCanvasMenu();
  }
}

function drawControlBar() {
  // Draw a control bar at the top of the canvas
  const barHeight = 8;
  const margin = 2; // Space between bar and canvas border
  
  // Draw the background bar with margins
  fill(240, 240, 240);
  stroke(0);
  strokeWeight(0.4);
  rect(margin, margin, state.canvasSize[0] - 2 * margin, barHeight);
  
  // Draw a subtle border at the bottom of the bar
  stroke(0);
  strokeWeight(0.4);
  line(margin, margin + barHeight, state.canvasSize[0] - margin, margin + barHeight);
  
  // Add some text to indicate it's a control area
  fill(50, 50, 50);
  noStroke();
  textSize(10);
  textAlign(LEFT, CENTER);
  text("Controls", margin + 5, margin + barHeight / 2);

  // Draw a right-aligned hamburger icon
  const iconSize = 6;
  const iconMargin = 4;
  const iconX = state.canvasSize[0] - margin - iconSize - iconMargin;
  const iconY = margin + (barHeight - iconSize) / 2;

  // Icon background with sky blue fill and black outline
  fill(135, 206, 235); // sky blue
  stroke(0); // black outline
  strokeWeight(0.3);
  rect(iconX, iconY, iconSize, iconSize, 1);

  // Hamburger lines (spread out more)
  stroke(30);
  strokeWeight(0.4);
  const linePaddingX = 1;
  const lineStartX = iconX + linePaddingX;
  const lineEndX = iconX + iconSize - linePaddingX;
  // Spread lines more: use 1.2px from top, center, and 1.2px from bottom
  const lineYs = [
    iconY + 1.4,
    iconY + iconSize / 2,
    iconY + iconSize - 1.4
  ];
  for (let i = 0; i < 3; i++) {
    line(lineStartX, lineYs[i], lineEndX, lineYs[i]);
  }

  // Store icon bounds globally for click detection
  window.hamburgerIconBounds = {
    x: iconX,
    y: iconY,
    w: iconSize,
    h: iconSize
  };
}

function drawCanvasMenu() {
  // Popup menu dimensions (even smaller)
  const menuWidth = 22;
  const buttonHeight = 5.4;
  const buttonSpacing = 1.5;
  const popupPadding = 1.5;
  const iconMargin = 4;
  const margin = 2;
  const iconSize = 6;
  const numButtons = 3;
  const menuHeight = 2 * popupPadding + numButtons * buttonHeight + (numButtons - 1) * buttonSpacing;
  // Align the popup so its right edge matches the right side of the hamburger border
  const menuX = state.canvasSize[0] - margin - iconSize - iconMargin + iconSize - menuWidth + iconSize - 6; // -1 for border
  const menuY = margin + (10 - iconSize) / 2 + iconSize + 1;

  // Draw menu background
  push();
  fill(255);
  stroke(0);
  strokeWeight(0.3);
  rect(menuX, menuY, menuWidth, menuHeight, 1);
  pop();

  // Draw buttons
  const labels = ["Directions", "Details", "About"];
  window.menuButtonBounds = [];
  for (let i = 0; i < 3; i++) {
    const btnX = menuX + popupPadding;
    const btnY = menuY + popupPadding + i * (buttonHeight + buttonSpacing);
    const btnW = menuWidth - 2 * popupPadding;
    const btnH = buttonHeight;
    // Button background (no outline)
    noStroke();
    fill('#0D6EFD');
    rect(btnX, btnY, btnW, btnH, 0.7);
    // Button label
    fill(255);
    textSize(3.0);
    textAlign(CENTER, CENTER);
    text(labels[i], btnX + btnW / 2, btnY + btnH / 2 + 0.05);
    // Store bounds for click detection
    window.menuButtonBounds.push({ x: btnX, y: btnY, w: btnW, h: btnH, label: labels[i] });
  }
}