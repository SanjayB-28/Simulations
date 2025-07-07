export function drawAll() {
  drawControlBar();
  drawGraphBar();
  // Draw canvas popup menu if state.showMenu is true
  if (window.state.showMenu) {
    drawCanvasMenu();
  }
  // Draw dropdown options as overlay if open
  if (window.state.showDropdown) {
    drawDropdownOptionsOverlay();
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

  // Dropdown options
  const dropdownOptions = ["fugacity versus temperature", "fugacity versus pressure"];
  const selectedOption = window.state.dropdownSelection;

  // Set slider label and value range based on dropdown
  let sliderLabel, sliderDisplay, sliderMin, sliderMax, sliderValueDisplay;
  if (selectedOption === 0) {
    sliderLabel = "pressure (bar)";
    sliderMin = 0.02;
    sliderMax = 0.15;
    const value = sliderMin + (sliderMax - sliderMin) * window.state.sliderValue;
    sliderDisplay = value.toFixed(3);
    sliderValueDisplay = value;
  } else {
    sliderLabel = "temperature (K)";
    sliderMin = 458;
    sliderMax = 483;
    const value = sliderMin + (sliderMax - sliderMin) * window.state.sliderValue;
    sliderDisplay = Math.round(value);
    sliderValueDisplay = value;
  }

  // Draw slider control
  drawSlider(margin + 26, margin + barHeight / 2, 28, window.state.sliderValue, sliderLabel, sliderDisplay);

  // Draw dropdown next to the value, vertically centered
  const dropdownX = margin + 20 + 25 + 10 + 12;
  drawDropdown(dropdownX, margin + barHeight / 2, dropdownOptions[selectedOption], dropdownOptions);

  // Draw checkbox only for 'fugacity versus pressure'
  if (selectedOption === 1) {
    const checkboxX = margin + 20 + 25 + 10 + 12 + 34 + 2;
    const checkboxY = margin + barHeight / 2;
    drawCheckbox(checkboxX, checkboxY, 2.6, window.state.realGasChecked, "real gas");
  }

  // Draw a right-aligned hamburger icon
  const iconSize = 5.5;
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

function drawSlider(x, y, width, value, label, displayValue) {
  // Draw label on the left edge of the control bar (unchanged)
  fill(50, 50, 50);
  noStroke();
  textSize(3.0);
  textAlign(LEFT, CENTER);
  text(label, 4, y);

  // Draw slider track (rounded, light gray, thinner)
  const trackHeight = 0.8;
  stroke(180);
  strokeWeight(trackHeight);
  strokeCap(ROUND);
  line(x, y, x + width, y);
  noStroke();

  // Draw slider handle (light green ball, no border)
  const handleX = x + (value * width);
  const handleRadius = 1.4;
  fill('#1DCD9F'); // light green
  ellipse(handleX, y, handleRadius * 2, handleRadius * 2);

  // Draw value on the right (restored)
  fill(50, 50, 50);
  noStroke();
  textSize(2.8);
  textAlign(RIGHT, CENTER);
  text(displayValue, x + width + 10, y);

  // Store slider bounds for interaction
  window.sliderBounds = {
    x: x,
    y: y - trackHeight / 2,
    width: width,
    height: trackHeight + handleRadius,
    value: value
  };
}

function drawDropdown(x, y, selectedText, options) {
  // Make dropdown wider for full text
  const dropdownWidth = 34;
  fill(255);
  stroke(0);
  strokeWeight(0.3);
  rect(x, y - 2, dropdownWidth, 4, 1);
  
  // Draw selected text (smaller)
  fill(50, 50, 50);
  noStroke();
  textSize(2.2);
  textAlign(LEFT, CENTER);
  text(selectedText, x + 2, y);
  
  // Draw modern chevron arrow (downward '>' shape)
  const arrowCenterX = x + dropdownWidth - 2.5;
  const arrowCenterY = y + 0.1;
  const chevronSize = 1.2;
  stroke(40);
  strokeWeight(0.4);
  noFill();
  // Draw two lines to form a downward chevron
  line(arrowCenterX - chevronSize, arrowCenterY - chevronSize/2, arrowCenterX, arrowCenterY + chevronSize/2);
  line(arrowCenterX, arrowCenterY + chevronSize/2, arrowCenterX + chevronSize, arrowCenterY - chevronSize/2);
  noStroke();
  
  // Store dropdown bounds for interaction
  window.dropdownBounds = {
    x: x,
    y: y - 2,
    width: dropdownWidth,
    height: 4,
    options: options
  };
}

function drawDropdownOptionsOverlay() {
  // Draw dropdown options as a popup overlay above all
  if (!window.dropdownBounds) return;
  const { x, y, width, height, options } = window.dropdownBounds;
  fill(255);
  stroke(0);
  strokeWeight(0.3);
  // Reduce the vertical gap between box and options
  rect(x, y + height - 4, width, options.length * 4, 1);
  window.dropdownOptionBounds = [];
  for (let i = 0; i < options.length; i++) {
    const optionY = y + height - 4 + i * 4 + 2;
    // Hover effect: highlight if mouse is over this option
    const isHover = window.mX >= x && window.mX <= x + width && window.mY >= optionY - 2 && window.mY <= optionY + 2;
    if (isHover) {
      fill(220, 235, 255); // light blue highlight
      noStroke();
      rect(x + 0.5, optionY - 1.6, width - 1, 3.2, 1);
    }
    fill(50, 50, 50);
    noStroke();
    textSize(2.2);
    textAlign(LEFT, CENTER);
    text(options[i], x + 2, optionY);
    window.dropdownOptionBounds[i] = {
      x: x,
      y: optionY - 2,
      width: width,
      height: 4,
      index: i
    };
  }
}

function drawGraphBar() {
  // Draw a graph bar below the control bar
  const controlBarHeight = 8;
  const graphBarHeight = 107;
  const margin = 2;
  const graphBarY = margin + controlBarHeight + 1; // Position below control bar with 1px gap
  
  // Draw the background bar with margins
  fill(220, 220, 220); // Slightly darker than control bar
  stroke(0);
  strokeWeight(0.4);
  rect(margin, graphBarY, state.canvasSize[0] - 2 * margin, graphBarHeight);
  
  // Draw a subtle border at the bottom of the bar
  stroke(0);
  strokeWeight(0.4);
  line(margin, graphBarY + graphBarHeight, state.canvasSize[0] - margin, graphBarY + graphBarHeight);
  
  // Add some text to indicate it's a graph area
  fill(50, 50, 50);
  noStroke();
  textSize(8);
  textAlign(LEFT, CENTER);
  text("Graph", margin + 5, graphBarY + graphBarHeight / 2);
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
    rect(btnX, btnY, btnW, btnH, 0.6);
    // Button label
    fill(255);
    textSize(3.0);
    textAlign(CENTER, CENTER);
    text(labels[i], btnX + btnW / 2, btnY + btnH / 2 + 0.05);
    // Store bounds for click detection
    window.menuButtonBounds.push({ x: btnX, y: btnY, w: btnW, h: btnH, label: labels[i] });
  }
}

function drawCheckbox(x, y, size, checked, label) {
  // Draw checkbox square
  fill(255);
  stroke(0);
  strokeWeight(0.3);
  rect(x, y - size / 2, size, size, 0.4);
  // Draw checkmark if checked
  if (checked) {
    stroke('#1976D2');
    strokeWeight(0.4);
    line(x + 0.5, y, x + size / 2, y + size / 2 - 0.5);
    line(x + size / 2, y + size / 2 - 0.5, x + size - 0.5, y - size / 2 + 0.5);
  }
  // Draw label
  noStroke();
  fill(50, 50, 50);
  textSize(2.2);
  textAlign(LEFT, CENTER);
  text(label, x + size + 1.2, y);
  // Store bounds for click detection
  window.checkboxBounds = {
    x: x,
    y: y - size / 2,
    w: size,
    h: size
  };
}