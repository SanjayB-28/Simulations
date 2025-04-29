// Graphics-related functions for the simulation

// State for slider values and valve positions
let sliderAValue = 0.3; // Initial value for Tank A (NaOH)
let sliderBValue = 0.3; // Initial value for Tank B (CH₃COOCH₃)
let valveAPosition = 0; // Initial valve position (horizontal)
let valveBPosition = 0; // Initial valve position (horizontal)
let waveOffset = 0; // For liquid animation

// Add liquid level tracking
let tankALiquidLevel = 0.85; // Initial liquid level for Tank A
let tankBLiquidLevel = 0.85; // Initial liquid level for Tank B
const TANK_VOLUME = 1.0; // 1L volume for each tank
const FLOW_RATE_FACTOR = 0.0005; // Factor to control how fast liquid level decreases

// Add global variable for the new tank's liquid level
let simpleTankLiquidLevel = 0.3; // Changed from 0.0 to 0.3 for default liquid level
const SIMPLE_TANK_MAX_LEVEL = 0.65; // Never completely full, now 65%
const SIMPLE_TANK_FILL_RATE = 0.0005; // Reduced from 0.001 to make filling slower

// Add a variable to track the waterfall fill animation
let simpleTankWaterfallProgress = 0; // 0 = not started, 1 = waterfall has reached liquid
let simpleTankDraining = false;

// Add a global variable for the rotor spin angle and switch state
let rotorAngle = 0;
let rotorOn = false;
let switchBounds = null; // For mouse interaction

// Add state for pump switches
let pumpASwitchOn = false;
let pumpBSwitchOn = false;
let pumpASwitchBounds = null;
let pumpBSwitchBounds = null;

// Add reset button state
let resetButtonBounds = null;

// Slider positions and dimensions
const sliderA = {
  x: 100,
  y: 150,
  width: 200,
  height: 20
};

const sliderB = {
  x: 100,
  y: 250,
  width: 200,
  height: 20
};

// Tank dimensions and positions
const tankA = {
  x: 400,
  y: 150,
  width: 100,
  height: 150
};

const tankB = {
  x: 400,
  y: 350,
  width: 100,
  height: 150
};

const finalTank = {
  x: 600,
  y: 250,
  width: 150,
  height: 200
};

function drawValveMonitor(x, y, value) {
  // Monitor box
  stroke(0);
  strokeWeight(1);
  fill(220);
  const monitorWidth = 50;
  const monitorHeight = 30;
  rect(x, y, monitorWidth, monitorHeight, 5);
  
  // Display value
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(12);
  text(value.toFixed(2), x + monitorWidth/2, y + monitorHeight/2);
}

function drawPump(x, y, size, pipeWidth, label) {
  // Main pump body (circular housing)
  stroke(40);
  strokeWeight(2);
  fill(180, 180, 190); // Metallic grey
  circle(x, y, size);
  
  // Rectangular flange and bolts at left (inlet)
  const flangeW = size * 0.60;
  const flangeH = size * 0.33;
  const boltSize = flangeH * 0.32;
  const boltOffsets = [
    [-1, -1], [1, -1], [1, 1], [-1, 1]
  ];
  const inletX = x - size/2;
  fill(200, 200, 210);
  stroke(40);
  strokeWeight(2);
  rect(inletX - flangeW/2, y - flangeH/2, flangeW, flangeH, 5);
  // Bolts at corners - consistent style
  fill(160, 160, 170); // Metallic grey for bolts
  stroke(40);
  strokeWeight(2);
  for (const [dx, dy] of boltOffsets) {
    ellipse(inletX + dx * (flangeW/2 - boltSize/2), y + dy * (flangeH/2 - boltSize/2), boltSize, boltSize);
  }
  
  // Motor housing (rectangle on top)
  const motorWidth = size * 0.8;
  const motorHeight = size * 0.6;
  fill(160, 160, 170); // Darker metallic
  rect(x - motorWidth/2, y - size/2 - motorHeight, motorWidth, motorHeight, 5);
  
  // Cooling fins on motor
  const finCount = 5;
  const finSpacing = motorHeight / (finCount + 1);
  const finLength = motorWidth * 0.1;
  stroke(140, 140, 150);
  strokeWeight(2);
  for (let i = 1; i <= finCount; i++) {
    const finY = y - size/2 - motorHeight + i * finSpacing;
    line(x - motorWidth/2 - finLength, finY, x + motorWidth/2 + finLength, finY);
  }
  
  // Central shaft detail
  stroke(100);
  strokeWeight(2);
  const shaftSize = size * 0.15;
  fill(140, 140, 150);
  circle(x, y, shaftSize);
  
  // Bolt details around the pump housing
  stroke(80);
  strokeWeight(1);
  const boltCount = 8;
  const boltRadius = size * 0.4;
  for (let i = 0; i < boltCount; i++) {
    const angle = (i * 2 * Math.PI) / boltCount;
    const bx = x + Math.cos(angle) * boltRadius;
    const by = y + Math.sin(angle) * boltRadius;
    fill(160, 160, 170);
    circle(bx, by, boltSize);
  }
  
  // Draw horizontal outlet pipe with different lengths for each tank
  const baseOutletLength = size * 1.5;
  const outletLength = label === "Tank A" ? baseOutletLength * 1.83 : baseOutletLength * 0.5; // Increased for Tank A
  const pipeEndX = x + size/2 + outletLength;
  
  // Set uniform pipe style
  stroke(0);
  strokeWeight(1);
  fill(240); // Light grey for pipes
  
  // Draw horizontal outlet pipe from pump with rounded ends
  stroke(40);
  strokeWeight(2);
  beginShape();
  // Left end (at pump)
  arc(x + size/2, y, pipeWidth, pipeWidth, -Math.PI/2, Math.PI/2);
  // Top line
  vertex(x + size/2, y - pipeWidth/2);
  vertex(pipeEndX, y - pipeWidth/2);
  // Right end
  arc(pipeEndX, y, pipeWidth, pipeWidth, -Math.PI/2, Math.PI/2);
  // Bottom line
  vertex(pipeEndX, y + pipeWidth/2);
  vertex(x + size/2, y + pipeWidth/2);
  endShape(CLOSE);
  
  // Draw intersection circle with mechanical details
  const circleRadius = pipeWidth * 0.6;
  const jointBoltCount = 6;
  const jointBoltRadius = circleRadius * 0.7;
  const jointBoltSize = circleRadius * 0.15;
  
  // Draw the main circle
  fill(240);
  circle(pipeEndX, y, circleRadius * 2);
  
  // Draw bolt holes around the circle
  stroke(40);
  strokeWeight(2);
  for (let i = 0; i < jointBoltCount; i++) {
    const angle = (i * 2 * Math.PI) / jointBoltCount;
    const bx = pipeEndX + Math.cos(angle) * jointBoltRadius;
    const by = y + Math.sin(angle) * jointBoltRadius;
    fill(200); // Consistent grey fill for bolts
    circle(bx, by, jointBoltSize);
  }
  
  // Draw center cross detail
  stroke(0); // Black stroke for cross
  strokeWeight(1);
  line(pipeEndX - circleRadius * 0.3, y, pipeEndX + circleRadius * 0.3, y);
  line(pipeEndX, y - circleRadius * 0.3, pipeEndX, y + circleRadius * 0.3);
  
  // Draw vertical pipe for both tanks with different heights
  const verticalPipeHeight = label === "Tank B" ? 400 : 100; // Longer for Tank B
  const verticalPipeY = y;
  
  // Reset pipe style for vertical pipe
  stroke(0);
  strokeWeight(1);
  fill(240);
  
  // Draw vertical pipe going up from intersection (appears behind the circle)
  stroke(40);
  strokeWeight(2);
  beginShape();
  // Bottom end
  arc(pipeEndX, verticalPipeY, pipeWidth, pipeWidth, 0, Math.PI);
  // Left line
  vertex(pipeEndX - pipeWidth/2, verticalPipeY);
  vertex(pipeEndX - pipeWidth/2, verticalPipeY - verticalPipeHeight);
  // Top end
  arc(pipeEndX, verticalPipeY - verticalPipeHeight, pipeWidth, pipeWidth, 0, Math.PI);
  // Right line
  vertex(pipeEndX + pipeWidth/2, verticalPipeY - verticalPipeHeight);
  vertex(pipeEndX + pipeWidth/2, verticalPipeY);
  endShape(CLOSE);
  
  // Redraw the circle and details to ensure they're on top
  fill(240);
  circle(pipeEndX, y, circleRadius * 2);
  
  // Redraw bolt holes with consistent colors
  for (let i = 0; i < jointBoltCount; i++) {
    const angle = (i * 2 * Math.PI) / jointBoltCount;
    const bx = pipeEndX + Math.cos(angle) * jointBoltRadius;
    const by = y + Math.sin(angle) * jointBoltRadius;
    fill(200); // Consistent grey fill for bolts
    circle(bx, by, jointBoltSize);
  }
  
  // Redraw center cross with consistent color
  stroke(0); // Black stroke for cross
  strokeWeight(1);
  line(pipeEndX - circleRadius * 0.3, y, pipeEndX + circleRadius * 0.3, y);
  line(pipeEndX, y - circleRadius * 0.3, pipeEndX, y + circleRadius * 0.3);

  // Add horizontal pipe and intersection for Tank B
  if (label === "Tank B") {
    const horizontalPipeLength = 100; // Length of the horizontal pipe at top
    const horizontalPipeY = verticalPipeY - verticalPipeHeight;
    
    // Set uniform pipe style
    stroke(0);
    strokeWeight(1);
    fill(240); // Light grey for pipes
    
    // Draw horizontal pipe at top of vertical pipe with rounded ends
    stroke(40);
    strokeWeight(2);
    beginShape();
    // Left end
    arc(pipeEndX, horizontalPipeY, pipeWidth, pipeWidth, -Math.PI/2, Math.PI/2);
    // Top line
    vertex(pipeEndX, horizontalPipeY - pipeWidth/2);
    vertex(pipeEndX + horizontalPipeLength, horizontalPipeY - pipeWidth/2);
    // Right end
    arc(pipeEndX + horizontalPipeLength, horizontalPipeY, pipeWidth, pipeWidth, -Math.PI/2, Math.PI/2);
    // Bottom line
    vertex(pipeEndX + horizontalPipeLength, horizontalPipeY + pipeWidth/2);
    vertex(pipeEndX, horizontalPipeY + pipeWidth/2);
    endShape(CLOSE);
    
    // Draw intersection circle with mechanical details at top
    fill(240);
    circle(pipeEndX, horizontalPipeY, circleRadius * 2);
    
    // Draw bolt holes around the circle
    stroke(40);
    strokeWeight(2);
    for (let i = 0; i < jointBoltCount; i++) {
      const angle = (i * 2 * Math.PI) / jointBoltCount;
      const bx = pipeEndX + Math.cos(angle) * jointBoltRadius;
      const by = horizontalPipeY + Math.sin(angle) * jointBoltRadius;
      fill(200);
      circle(bx, by, jointBoltSize);
    }
    
    // Draw center cross detail
    stroke(0);
    strokeWeight(1);
    line(pipeEndX - circleRadius * 0.3, horizontalPipeY, pipeEndX + circleRadius * 0.3, horizontalPipeY);
    line(pipeEndX, horizontalPipeY - circleRadius * 0.3, pipeEndX, horizontalPipeY + circleRadius * 0.3);

    // Draw the new tank at the end of the horizontal pipe
    const tankWidth = size * 5.0; // Doubled from 2.5
    const tankHeight = size * 6.0; // Doubled from 3
    const tankX = pipeEndX + horizontalPipeLength + tankWidth/2;
    const tankY = horizontalPipeY + size * 2; // Moved down by 2 times the pump size

    // Inlet pipe end position (where water falls from)
    const inletX = pipeEndX + horizontalPipeLength;
    const inletY = horizontalPipeY;

    // Calculate the top of the liquid in the tank (inner wall)
    const wall = Math.max(4, tankWidth * 0.035);
    const tankInnerTop = tankY - tankHeight/2 + wall;
    const tankInnerBottom = tankY + tankHeight/2 - wall;
    const liquidHeight = (tankHeight - wall) * simpleTankLiquidLevel;
    const liquidTopY = tankInnerBottom - liquidHeight;

    // X position for the waterfall to land just inside the inner wall
    const fallLandingX = tankX - (tankWidth - 2 * wall) / 2; // exactly at the left inner wall

    // Calculate flow rates based on valve positions (ensure local definition)
    const flowRateA = map(valveAPosition, 0, -Math.PI/2, 0, 1);
    const flowRateB = map(valveBPosition, 0, -Math.PI/2, 0, 1);

    // Calculate blended color for final tank based on concentrations and flow rates
    const totalConcentration = flowRateA + flowRateB;
    const tankAWeight = totalConcentration > 0 ? flowRateA / totalConcentration : 0.5;
    const tankBWeight = totalConcentration > 0 ? flowRateB / totalConcentration : 0.5;
    
    // Extract RGB components from both colors
    const tankAColor = color(200 - sliderAValue * 100, 220 - sliderAValue * 100, 255 - sliderAValue * 100, 200);
    const tankBColor = color(200 - sliderBValue * 100, 255 - sliderBValue * 100, 220 - sliderBValue * 100, 200);
    
    // Calculate weighted average of colors
    const finalRed = red(tankAColor) * tankAWeight + red(tankBColor) * tankBWeight;
    const finalGreen = green(tankAColor) * tankAWeight + green(tankBColor) * tankBWeight;
    const finalBlue = blue(tankAColor) * tankAWeight + blue(tankBColor) * tankBWeight;
    
    // Create final color with same alpha
    const finalTankColor = color(finalRed, finalGreen, finalBlue, 200);

    // Draw waterfall animation if filling
    if ((flowRateA > 0 && pumpASwitchOn) || (flowRateB > 0 && pumpBSwitchOn)) {
      const streamColor = finalTankColor; // Use the same blended color as the tank
      const startX = fallLandingX;
      const startY = inletY;
      // End at the center of the tank at the liquid surface, but clamp to avoid bouncing
      const endX = tankX - tankWidth * 0.3; // closer to the left inner wall
      // Clamp the endY so it never gets too close to the top wall
      const minCurveHeight = tankHeight * 0.18;
      const maxLiquidTopY = tankY - tankHeight/2 + wall + minCurveHeight;
      const unclampedEndY = tankInnerBottom - (tankHeight - 2 * wall) * simpleTankLiquidLevel;
      const endY = Math.max(unclampedEndY, maxLiquidTopY);
      // Fixed candy cane shape: control points are fixed offsets from start/end
      const dx = Math.abs(endX - startX);
      const caneRadius = Math.max(dx * 0.6, tankWidth * 0.18); // Controls the bend
      const ctrl1X = startX + caneRadius;
      const ctrl1Y = startY;
      const ctrl2X = endX;
      const ctrl2Y = startY + caneRadius;
      stroke(streamColor);
      strokeWeight(Math.max(8, tankWidth * 0.06));
      noFill();
      // Waterfall progress: animate the stream falling
      if (simpleTankWaterfallProgress < 1) {
        simpleTankWaterfallProgress += 0.04; // Speed of waterfall fall
      }
      // Interpolate the end point for the waterfall
      const animEndY = startY + (endY - startY) * Math.min(simpleTankWaterfallProgress, 1);
      beginShape();
      vertex(startX, startY);
      bezierVertex(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, animEndY);
      endShape();
      // Only increase liquid level when waterfall has visually reached the surface
      if (simpleTankWaterfallProgress >= 1) {
        simpleTankLiquidLevel += SIMPLE_TANK_FILL_RATE;
        simpleTankLiquidLevel = Math.min(simpleTankLiquidLevel, SIMPLE_TANK_MAX_LEVEL);
        simpleTankDraining = false;
      }
    } else {
      simpleTankWaterfallProgress = 0;
      simpleTankDraining = true;
    }

    // Gradually decrease liquid level if draining
    if (simpleTankDraining && simpleTankLiquidLevel > 0) {
      simpleTankLiquidLevel -= SIMPLE_TANK_FILL_RATE * 0.7; // Drain slower than fill
      if (simpleTankLiquidLevel < 0) simpleTankLiquidLevel = 0;
    }

    // Draw the tank
    drawSimpleTank(tankX, tankY, tankWidth, tankHeight, simpleTankLiquidLevel, finalTankColor); // Use blended color
  }

  // Draw switch and wire for each pump
  let switchY, bounds;
  if (label === 'Tank A') {
    // Switch below pump
    switchY = y + size * 0.9;
    bounds = drawRotorSwitch(x, y, switchY, pumpASwitchOn, true);
    pumpASwitchBounds = bounds;
    // Draw wire
    stroke(60);
    strokeWeight(3);
    noFill();
    beginShape();
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const wx = x;
      const wy = y + size/2 + (switchY - (y + size/2)) * t + Math.sin(t * 4 * Math.PI) * 6 * (1 - t);
      vertex(wx, wy);
    }
    endShape();
  } else if (label === 'Tank B') {
    // Switch above pump (more space)
    switchY = y - size * 2.2;
    bounds = drawRotorSwitch(x, y, switchY, pumpBSwitchOn, true);
    pumpBSwitchBounds = bounds;
    // Draw wire
    stroke(60);
    strokeWeight(3);
    noFill();
    beginShape();
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const wx = x;
      const wy = switchY + 48 + (y - size/2 - (switchY + 48)) * t + Math.sin(t * 4 * Math.PI) * 6 * (1 - t);
      vertex(wx, wy);
    }
    endShape();
  }

  // Rectangular flange and bolts at right (outlet)
  const outletX = x + size/2;
  fill(200, 200, 210);
  stroke(40);
  strokeWeight(2);
  rect(outletX - flangeW/2, y - flangeH/2, flangeW, flangeH, 5);
  // Bolts at corners - consistent style
  fill(160, 160, 170); // Metallic grey for bolts
  stroke(40);
  strokeWeight(2);
  for (const [dx, dy] of boltOffsets) {
    ellipse(outletX + dx * (flangeW/2 - boltSize/2), y + dy * (flangeH/2 - boltSize/2), boltSize, boltSize);
  }
}

function drawOutletPipe(x, y, pipeWidth, valvePosition, label) {
  // Set black outline for all pipe elements
  stroke(40);
  strokeWeight(2);
  
  // Main vertical pipe - longer for both tanks, extra length for Tank A
  const basePipeHeight = 150;
  const pipeHeight = label === "Tank A" ? basePipeHeight + 100 : basePipeHeight;
  
  // Connect pipe to tank outlet
  const pipeTop = y - pipeWidth/2;
  fill(240); // Light grey for pipes
  
  // Draw pipe with rounded top to connect smoothly
  stroke(40);
  strokeWeight(2);
  beginShape();
  // Straight opening at tank wall (no arc)
  vertex(x - pipeWidth/2, pipeTop);
  vertex(x - pipeWidth/2, y + pipeHeight);
  vertex(x + pipeWidth/2, y + pipeHeight);
  vertex(x + pipeWidth/2, pipeTop);
  endShape(CLOSE);
  
  // Bottom valve (adjustable switch style)
  const valveY = y + pipeHeight;
  const valveSize = pipeWidth * 3;
  
  // Valve body (circle) with matching red tint
  fill(255, 150, 150); // Match the switch handle color
  stroke(40);
  strokeWeight(2);
  circle(x, valveY, valveSize);
  
  // Add bolt holes around the valve body
  const boltCount = 8;
  const boltRadius = valveSize * 0.4;
  const boltSize = valveSize * 0.08;
  for (let i = 0; i < boltCount; i++) {
    const angle = (i * 2 * Math.PI) / boltCount;
    const bx = x + Math.cos(angle) * boltRadius;
    const by = valveY + Math.sin(angle) * boltRadius;
    fill(160, 160, 170); // Metallic grey for bolts
    stroke(40);
    strokeWeight(2);
    circle(bx, by, boltSize);
  }
  
  // Add gear-like pattern inside the valve
  stroke(180, 180, 190); // Metallic grey for gear pattern
  strokeWeight(1);
  noFill();
  const gearRadius = valveSize * 0.3;
  const gearToothCount = 12;
  for (let i = 0; i < gearToothCount; i++) {
    const angle = (i * 2 * Math.PI) / gearToothCount;
    const innerX = x + Math.cos(angle) * gearRadius;
    const innerY = valveY + Math.sin(angle) * gearRadius;
    const outerX = x + Math.cos(angle) * (gearRadius + valveSize * 0.1);
    const outerY = valveY + Math.sin(angle) * (gearRadius + valveSize * 0.1);
    line(innerX, innerY, outerX, outerY);
  }
  
  // Draw horizontal pipe from valve with different lengths for each tank
  const basePipeLength = basePipeHeight * 2;
  const horizontalPipeLength = label === "Tank A" ? basePipeLength : basePipeLength * 0.7; // Reduced for Tank B
  fill(240); // Light grey for pipes
  
  // Ensure black outline for horizontal pipe
  stroke(0);
  strokeWeight(1);
  // Draw horizontal pipe with rounded end
  stroke(40);
  strokeWeight(2);
  beginShape();
  vertex(x + valveSize/2, valveY - pipeWidth/2);
  vertex(x + valveSize/2 + horizontalPipeLength, valveY - pipeWidth/2);
  arc(x + valveSize/2 + horizontalPipeLength, valveY, pipeWidth, pipeWidth, -Math.PI/2, Math.PI/2);
  vertex(x + valveSize/2 + horizontalPipeLength, valveY + pipeWidth/2);
  vertex(x + valveSize/2, valveY + pipeWidth/2);
  endShape(CLOSE);
  
  // Draw pump at the end of horizontal pipe
  const pumpX = x + valveSize/2 + horizontalPipeLength + pipeWidth/2;
  const pumpY = valveY;
  const pumpSize = valveSize * 1.2;
  drawPump(pumpX, pumpY, pumpSize, pipeWidth, label);
  
  // Calculate flow rate based on valve position (0 to 1)
  const flowRate = map(valvePosition, 0, -Math.PI/2, 0, 1);
  
  // Draw monitor and wire first (before the switch)
  if (label === "Tank A") {
    // Draw monitor further to the left
    const monitorX = x - valveSize - 100;
    const monitorY = valveY - valveSize/2;
    
    // Draw wavy connecting wire to monitor
    stroke(100);
    strokeWeight(1);
    beginShape();
    noFill();
    const wireStartX = x - valveSize/2;
    const wireEndX = monitorX + 50;
    const wireLength = wireEndX - wireStartX;
    const segments = 10;
    const amplitude = 5;
    
    for (let i = 0; i <= segments; i++) {
      const xPos = wireStartX + (wireLength * i/segments);
      const yPos = valveY + Math.sin(i * Math.PI/2) * amplitude;
      vertex(xPos, yPos);
    }
    endShape();
    
    // Draw monitor
    drawValveMonitor(monitorX, monitorY, flowRate);
    
    // Draw label
    fill(0);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(12);
    text("NaOH Flow Rate", monitorX - 20, monitorY - 15);
  } else if (label === "Tank B") {
    // Move monitor up for Tank B
    const monitorX = x + valveSize + 10;
    const monitorY = valveY - valveSize * 1.2; // Moved up
    
    // Draw wavy connecting wire to monitor
    stroke(100);
    strokeWeight(1);
    beginShape();
    noFill();
    const wireStartX = x + valveSize/2;
    const wireEndX = monitorX;
    const wireLength = wireEndX - wireStartX;
    const segments = 10;
    const amplitude = 5;
    
    for (let i = 0; i <= segments; i++) {
      const xPos = wireStartX + (wireLength * i/segments);
      const yPos = valveY - (valveY - monitorY) * (i/segments) + Math.sin(i * Math.PI/2) * amplitude;
      vertex(xPos, yPos);
    }
    endShape();
    
    // Draw monitor
    drawValveMonitor(monitorX, monitorY, flowRate);
    
    // Draw label
    fill(0);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(12);
    text("CH₃COOCH₃ Flow Rate", monitorX, monitorY - 15);
  }

  // Draw valve diameter lines (before the switch)
  strokeWeight(1);
  line(x - valveSize/2, valveY, x + valveSize/2, valveY);
  line(x, valveY - valveSize/2, x, valveY + valveSize/2);
  
  // Add center cross detail
  const crossSize = valveSize * 0.15;
  line(x - crossSize, valveY, x + crossSize, valveY);
  line(x, valveY - crossSize, x, valveY + crossSize);
  
  // Valve handle (rotatable) - drawn last to appear on top
  stroke(40);
  strokeWeight(2);
  const handleLength = valveSize;
  const handleWidth = 20;
  
  // Calculate handle end position for hit detection
  const handleEndX = x + handleLength * Math.cos(valvePosition);
  const handleEndY = valveY + handleLength * Math.sin(valvePosition);
  
  // Draw handle as a rectangle with stronger red tint
  push();
  translate(x, valveY);
  rotate(valvePosition);
  fill(255, 150, 150);
  rect(0, -handleWidth/2, handleLength, handleWidth, 5);
  
  // Add handle details
  stroke(0);
  strokeWeight(1);
  // Add grip lines on handle
  const gripCount = 3;
  const gripSpacing = handleLength / (gripCount + 1);
  for (let i = 1; i <= gripCount; i++) {
    line(i * gripSpacing, -handleWidth/2 + 2, i * gripSpacing, handleWidth/2 - 2);
  }
  
  // Draw blue draggable handle at the end
  translate(handleLength, 0);
  fill(100, 150, 255);
  circle(0, 0, handleWidth * 1.2);
  
  // Add center dot to handle
  fill(0);
  circle(0, 0, handleWidth * 0.3);
  pop();
  
  // Store handle end position for interaction
  if (label === "Tank A") {
    window.tankAHandle = { x: handleEndX, y: handleEndY, centerX: x, centerY: valveY };
  } else {
    window.tankBHandle = { x: handleEndX, y: handleEndY, centerX: x, centerY: valveY };
  }
}

function drawStand(x, y, w, h) {
  stroke(0);
  strokeWeight(3);
  
  // Left leg
  const legSpacing = w * 1.2;
  const leftLegX = x - legSpacing/2;
  const rightLegX = x + legSpacing/2;
  const legBottom = y + h/2 + h * 0.2;
  
  // Draw legs
  line(leftLegX, y - h/4, leftLegX, legBottom);
  line(rightLegX, y - h/4, rightLegX, legBottom);
  
  // Base feet
  const footLength = w * 0.25;
  
  // Left leg foot
  line(leftLegX - footLength/2, legBottom, leftLegX + footLength/2, legBottom);
  
  // Right leg foot
  line(rightLegX - footLength/2, legBottom, rightLegX + footLength/2, legBottom);
  
  // Side clamps
  const clampWidth = w * 0.1;
  const clampExtension = w * 0.15;
  
  // Left clamp
  strokeWeight(2);
  // Horizontal part
  line(leftLegX, y - h/4, leftLegX + clampExtension, y - h/4);
  line(leftLegX, y + h/4, leftLegX + clampExtension, y + h/4);
  // Vertical part
  line(leftLegX + clampExtension, y - h/4, leftLegX + clampExtension, y + h/4);
  
  // Right clamp
  // Horizontal part
  line(rightLegX, y - h/4, rightLegX - clampExtension, y - h/4);
  line(rightLegX, y + h/4, rightLegX - clampExtension, y + h/4);
  // Vertical part
  line(rightLegX - clampExtension, y - h/4, rightLegX - clampExtension, y + h/4);
  
  // Cross support between legs (for stability)
  strokeWeight(1);
  line(leftLegX, y, rightLegX, y);
  line(leftLegX, y + h/4, rightLegX, y - h/4);
  line(leftLegX, y - h/4, rightLegX, y + h/4);
}

function drawSlider(p, x, y, width, height, value) {
  // Draw track
  p.fill(200);
  p.noStroke();
  p.rect(x, y, width, height, height/2);
  
  // Draw handle
  const handleX = x + (width - height) * value;
  p.fill(255, 0, 0); // Red handle
  p.ellipse(handleX + height/2, y + height/2, height);
}

function drawLiquid(x, y, w, h, level, color) {
  const cylinderHeight = h * 0.7;
  const coneHeight = h * 0.3;
  const coneTopWidth = w;
  const coneBottomWidth = w * 0.1;
  
  // Calculate total liquid height including cone
  const totalHeight = cylinderHeight + coneHeight;
  const liquidHeight = totalHeight * level;
  const waveHeight = 3;
  const segments = 20;
  
  fill(color);
  noStroke();
  
  beginShape();
  
  // Left side of cone
  if (liquidHeight > coneHeight) {
    // If liquid is in the cylinder part
    vertex(x - coneTopWidth/2, y - h/2 + cylinderHeight);
    vertex(x - w/2, y - h/2 + cylinderHeight - (liquidHeight - coneHeight));
  } else if (liquidHeight > 0) {
    // If liquid is only in the cone part
    const ratio = liquidHeight / coneHeight;
    const currentWidth = lerp(coneBottomWidth, coneTopWidth, ratio);
    vertex(x - currentWidth/2, y - h/2 + cylinderHeight + coneHeight - liquidHeight);
  }
  
  // Draw wavy top surface
  for (let i = 0; i <= segments; i++) {
    let xPos;
    let baseY;
    
    if (liquidHeight > coneHeight) {
      // Liquid in cylinder part
      xPos = x - w/2 + (w * i/segments);
      baseY = y - h/2 + cylinderHeight - (liquidHeight - coneHeight);
    } else {
      // Liquid only in cone part
      const ratio = liquidHeight / coneHeight;
      const currentWidth = lerp(coneBottomWidth, coneTopWidth, ratio);
      xPos = x - currentWidth/2 + (currentWidth * i/segments);
      baseY = y - h/2 + cylinderHeight + coneHeight - liquidHeight;
    }
    
    const yOffset = Math.sin(waveOffset + i * 0.5) * waveHeight;
    vertex(xPos, baseY + yOffset);
  }
  
  // Right side
  if (liquidHeight > coneHeight) {
    // If liquid is in the cylinder part
    vertex(x + w/2, y - h/2 + cylinderHeight - (liquidHeight - coneHeight));
    vertex(x + coneTopWidth/2, y - h/2 + cylinderHeight);
  } else if (liquidHeight > 0) {
    // If liquid is only in the cone part
    const ratio = liquidHeight / coneHeight;
    const currentWidth = lerp(coneBottomWidth, coneTopWidth, ratio);
    vertex(x + currentWidth/2, y - h/2 + cylinderHeight + coneHeight - liquidHeight);
  }
  
  // Add bottom vertices to create the V-shape
  if (liquidHeight > 0) {
    // Right bottom point of the V
    vertex(x + coneBottomWidth/2, y - h/2 + cylinderHeight + coneHeight);
    // Center bottom point of the V
    vertex(x, y - h/2 + cylinderHeight + coneHeight);
    // Left bottom point of the V
    vertex(x - coneBottomWidth/2, y - h/2 + cylinderHeight + coneHeight);
  }
  
  endShape(CLOSE);
}

export function drawTank(p, x, y, width, height, label, concentration) {
  // Draw tank outline
  p.stroke(0);
  p.noFill();
  p.rect(x - width/2, y - height/2, width, height);
  
  // Draw liquid
  const liquidHeight = height * concentration;
  const liquidColor = p.color(
    200 - concentration * 100,
    220 - concentration * 100,
    255 - concentration * 100,
    200
  );
  p.fill(liquidColor);
  p.noStroke();
  p.rect(x - width/2, y + height/2 - liquidHeight, width, liquidHeight);
  
  // Draw label
  p.fill(0);
  p.noStroke();
  p.textAlign(p.CENTER, p.CENTER);
  p.text(label, x, y - height/2 - 20);
}

export function setupCanvas(containerElement) {
  const width = containerElement.offsetWidth;
  const height = containerElement.offsetHeight;
  const canvas = createCanvas(width, height);
  canvas.parent(containerElement);
  pixelDensity(4);
  frameRate(60);
  return { width, height };
}

// Global p5.js mouse event handlers
window.mousePressed = function() {
  handleInteractions();
}

window.mouseDragged = function() {
  handleInteractions();
}

function handleInteractions() {
  const tankAX = width * 0.15;
  const tankBX = width * 0.30;
  const tankY = height * 0.4;
  const tankH = height * 0.35;
  const tankW = width * 0.12;
  const pipeHeight = 150;
  const valveY = tankY + tankH/2 + pipeHeight;
  // --- SLIDER TRACK LOGIC ---
  // These must match drawSlider
  const sliderTrackRadius = 8;
  const sliderTrackW = tankW;
  const sliderAY = tankY - tankH/2 - 40 - 30; // y used in drawSlider
  const sliderBY = tankY - tankH/2 - 40 - 30;
  const sliderATrackLeft = tankAX - sliderTrackW/2 + sliderTrackRadius;
  const sliderATrackRight = tankAX + sliderTrackW/2 - sliderTrackRadius;
  const sliderBTrackLeft = tankBX - sliderTrackW/2 + sliderTrackRadius;
  const sliderBTrackRight = tankBX + sliderTrackW/2 - sliderTrackRadius;
  const sliderHandleRadius = 13; // matches drawSlider

  // Check slider interactions (A)
  if (Math.abs(mouseY - sliderAY) < 18) {
    if (mouseX >= sliderATrackLeft - sliderHandleRadius && mouseX <= sliderATrackRight + sliderHandleRadius) {
      sliderAValue = map(mouseX, sliderATrackLeft, sliderATrackRight, 0.1, 0.5);
      sliderAValue = constrain(sliderAValue, 0.1, 0.5);
      return; // Only allow one slider at a time
    }
  }
  // Check slider interactions (B)
  if (Math.abs(mouseY - sliderBY) < 18) {
    if (mouseX >= sliderBTrackLeft - sliderHandleRadius && mouseX <= sliderBTrackRight + sliderHandleRadius) {
      sliderBValue = map(mouseX, sliderBTrackLeft, sliderBTrackRight, 0.1, 0.5);
      sliderBValue = constrain(sliderBValue, 0.1, 0.5);
      return;
    }
  }

  // Check valve handle interactions
  function updateValvePosition(handle, setPosition) {
    if (!handle) return;
    const { centerX, centerY } = handle;
    if (dist(mouseX, mouseY, handle.x, handle.y) < 9) {
      const deltaX = mouseX - centerX;
      const deltaY = mouseY - centerY;
      let angle = Math.atan2(deltaY, deltaX);
      // Normalize angle to 0 to -PI/2 range (right to up)
      if (angle > 0) angle = 0;
      if (angle < -Math.PI/2) angle = -Math.PI/2;
      setPosition(angle);
    }
  }
  updateValvePosition(window.tankAHandle, (angle) => { valveAPosition = angle; });
  updateValvePosition(window.tankBHandle, (angle) => { valveBPosition = angle; });
}

// Initialize handle positions
window.tankAHandle = null;
window.tankBHandle = null;

export function drawSimulation(p) {
  background(255);
  
  // Draw reset button
  drawResetButton();
  
  const tankAX = width * 0.15;
  const tankBX = width * 0.30;
  const tankY = height * 0.4;
  const tankW = width * 0.12;
  const tankH = height * 0.35;
  
  // Update wave animation
  waveOffset += 0.05;
  
  // Calculate flow rates based on valve positions
  const flowRateA = map(valveAPosition, 0, -Math.PI/2, 0, 1);
  const flowRateB = map(valveBPosition, 0, -Math.PI/2, 0, 1);
  
  // Update liquid levels based on flow rates
  if (flowRateA > 0 && pumpASwitchOn) {
    tankALiquidLevel = max(0, tankALiquidLevel - flowRateA * FLOW_RATE_FACTOR);
  }
  if (flowRateB > 0 && pumpBSwitchOn) {
    tankBLiquidLevel = max(0, tankBLiquidLevel - flowRateB * FLOW_RATE_FACTOR);
  }
  
  // Draw Tank A (left tank) with blue liquid
  const tankAColor = color(200 - sliderAValue * 100, 220 - sliderAValue * 100, 255 - sliderAValue * 100, 200);
  drawTank(p, tankAX, tankY, tankW, tankH, "NaOH", tankALiquidLevel);
  drawSlider(p, sliderA.x, sliderA.y, sliderA.width, sliderA.height, sliderAValue);
  
  // Draw Tank B (right tank) with green liquid
  const tankBColor = color(200 - sliderBValue * 100, 255 - sliderBValue * 100, 220 - sliderBValue * 100, 200);
  drawTank(p, tankBX, tankY, tankW, tankH, "CH₃COOCH₃", tankBLiquidLevel);
  drawSlider(p, sliderB.x, sliderB.y, sliderB.width, sliderB.height, sliderBValue);

  // Calculate blended color for final tank based on concentrations
  const totalConcentration = sliderAValue + sliderBValue;
  const tankAWeight = totalConcentration > 0 ? sliderAValue / totalConcentration : 0.5;
  const tankBWeight = totalConcentration > 0 ? sliderBValue / totalConcentration : 0.5;
  
  // Extract RGB components from both colors
  const tankARed = red(tankAColor);
  const tankAGreen = green(tankAColor);
  const tankABlue = blue(tankAColor);
  
  const tankBRed = red(tankBColor);
  const tankBGreen = green(tankBColor);
  const tankBBlue = blue(tankBColor);
  
  // Calculate weighted average of colors
  const finalRed = tankARed * tankAWeight + tankBRed * tankBWeight;
  const finalGreen = tankAGreen * tankAWeight + tankBGreen * tankBWeight;
  const finalBlue = tankABlue * tankAWeight + tankBBlue * tankBWeight;
  
  // Create final color with same alpha
  const finalTankColor = color(finalRed, finalGreen, finalBlue, 200);

  // Rotor angle increment
  if (rotorOn) {
    rotorAngle += 0.07; // Speed of spin
    if (rotorAngle > Math.PI * 2) rotorAngle -= Math.PI * 2;
  }
}

// Export slider values for external use
export function getSliderValues() {
  return {
    tankA: sliderAValue,
    tankB: sliderBValue
  };
}

// Draws a rotor with a vertical shaft and two paddle-shaped fans at the bottom
function drawRotor(cx, topY, shaftLen, shaftWidth, bladeLen, bladeWidth, angle = 0) {
  // Shaft
  fill(230);
  stroke(40);
  strokeWeight(2);
  rect(cx - shaftWidth/2, topY, shaftWidth, shaftLen);

  // baseY is used for both mechanical details and blades
  const baseY = topY + shaftLen;
  // Mechanical details: central hub, bolts, and cap
  const hubRadius = shaftWidth * 1.2;
  const boltCount = 6;
  const boltRadius = hubRadius * 0.7;
  const boltSize = hubRadius * 0.22;
  // Hub
  fill(180, 180, 200);
  stroke(40);
  strokeWeight(2);
  ellipse(cx, baseY, hubRadius * 2, hubRadius * 2);
  // Bolts/rivets around hub
  fill(120);
  stroke(40);
  strokeWeight(1.5);
  for (let i = 0; i < boltCount; i++) {
    const theta = (i * 2 * Math.PI) / boltCount;
    const bx = cx + Math.cos(theta) * boltRadius;
    const by = baseY + Math.sin(theta) * boltRadius;
    ellipse(bx, by, boltSize, boltSize);
  }
  // Center cap
  fill(220);
  stroke(40);
  strokeWeight(2);
  ellipse(cx, baseY, hubRadius * 0.7, hubRadius * 0.7);

  // Slim, side-curved paddle shapes - left and right
  fill(230);
  stroke(40);
  strokeWeight(2);

  // 3D spinning: blades rotate in z-x plane, foreshortened by cos(angle)
  for (let i = 0; i < 2; i++) {
    const bladeAngle = angle + i * Math.PI; // 180 deg apart, always in sync
    const dx = Math.cos(bladeAngle) * bladeLen;
    const dz = Math.sin(bladeAngle) * bladeLen * 0.25; // 3D effect: z-depth
    const width3D = bladeWidth * Math.abs(Math.cos(bladeAngle)); // foreshortening
    // Tip of blade
    const tipX = cx + dx;
    const tipY = baseY + dz;
    // Draw curved blade from shaft to tip
    beginShape();
    vertex(cx, baseY);
    bezierVertex(
      cx + dx * 0.7, baseY - width3D * 0.7,
      tipX, tipY - width3D/2,
      tipX, tipY
    );
    bezierVertex(
      tipX, tipY + width3D/2,
      cx + dx * 0.7, baseY + width3D * 0.7,
      cx, baseY
    );
    endShape(CLOSE);
  }
}

// Draw a detailed switch above the tank
function drawRotorSwitch(cx, topY, switchY, isOn, returnBounds = false) {
  // Switch base (reduced size)
  const swWidth = 72;
  const swHeight = 48;
  const leverLen = 44;
  const leverWidth = 11;
  const baseRadius = 16;
  const lightRadius = 10;
  // Draw base
  fill(180);
  stroke(80);
  strokeWeight(2);
  rect(cx - swWidth/2, switchY, swWidth, swHeight, 8);
  // Draw mounting bolts
  fill(120);
  for (let i = 0; i < 2; i++) {
    circle(cx - swWidth/2 + 10 + i * (swWidth - 20), switchY + swHeight - 7, 7);
  }
  // Draw indicator lights
  fill(isOn ? 'limegreen' : 'red');
  stroke(60);
  circle(cx - swWidth/2 + 12, switchY + 12, lightRadius);
  fill('yellow');
  stroke(60);
  circle(cx + swWidth/2 - 12, switchY + 12, lightRadius);
  // Draw ON/OFF labels inside the switch, near the left/right walls
  noStroke();
  fill(0);
  textSize(10);
  textAlign(LEFT, CENTER);
  text('ON', cx - swWidth/2 + 8, switchY + swHeight/2);
  textAlign(RIGHT, CENTER);
  text('OFF', cx + swWidth/2 - 8, switchY + swHeight/2);
  // Draw lever
  const leverAngle = isOn ? -PI/4 : PI/4;
  stroke(60);
  strokeWeight(leverWidth);
  line(cx, switchY + swHeight/2, cx + leverLen * Math.cos(leverAngle), switchY + swHeight/2 + leverLen * Math.sin(leverAngle));
  // Draw lever knob
  fill(220);
  stroke(80);
  strokeWeight(2);
  circle(cx + leverLen * Math.cos(leverAngle), switchY + swHeight/2 + leverLen * Math.sin(leverAngle), baseRadius);
  // Store clickable bounds for interaction
  const bounds = {
    x: cx - swWidth/2,
    y: switchY,
    w: swWidth,
    h: swHeight
  };
  if (returnBounds) return bounds;
}

// Update drawSimpleTank to draw the liquid inside the cutaway tank
function drawSimpleTank(x, y, w, h, liquidLevel, liquidColor) {
  // Tank body (vertically sliced open, with wall thickness)
  const ellipseHeight = w * 0.18;
  const wall = Math.max(4, w * 0.035);
  const wOuter = w;
  const wInner = w - 2 * wall;
  const eOuter = ellipseHeight;
  const eInner = ellipseHeight - wall * 0.5;
  const topY = y - h/2;
  const bottomY = y + h/2;

  // Draw wall fill (grey area between outer and inner walls)
  noStroke();
  fill(200);
  // Top wall (front arc)
  beginShape();
  arc(x, topY, wOuter, eOuter, 0, Math.PI);
  arc(x, topY, wInner, eInner, Math.PI, 0, true);
  endShape(CLOSE);
  // Bottom wall (front arc)
  beginShape();
  arc(x, bottomY, wOuter, eOuter, Math.PI, 2 * Math.PI);
  arc(x, bottomY, wInner, eInner, 2 * Math.PI, Math.PI, true);
  endShape(CLOSE);
  // Left wall
  rect(x - wOuter/2, topY, wall, h);
  // Right wall
  rect(x + wOuter/2 - wall, topY, wall, h);

  // Draw back wall (lighter arcs)
  stroke(200);
  strokeWeight(2);
  noFill();
  arc(x, topY, wOuter, eOuter, Math.PI, 2 * Math.PI);
  arc(x, topY, wInner, eInner, Math.PI, 2 * Math.PI);
  arc(x, bottomY, wOuter, eOuter, 0, Math.PI);
  arc(x, bottomY, wInner, eInner, 0, Math.PI);

  // Fill the backside upper wall with grey
  fill(200);
  noStroke();
  beginShape();
  arc(x, topY, wOuter, eOuter, Math.PI, 2 * Math.PI);
  arc(x, topY, wInner, eInner, 2 * Math.PI, Math.PI, true);
  endShape(CLOSE);

  // Draw outer and inner front arcs and sides (black)
  stroke(0);
  strokeWeight(2); // Thinner black outline
  // Outer and inner back arcs (top, black)
  arc(x, topY, wOuter, eOuter, Math.PI, 2 * Math.PI);
  arc(x, topY, wInner, eInner, Math.PI, 2 * Math.PI);
  // Outer and inner front arcs (top, light grey)
  stroke(200);
  arc(x, topY, wOuter, eOuter, 0, Math.PI);
  arc(x, topY, wInner, eInner, 0, Math.PI);
  // Bottom arcs (front, black)
  stroke(0);
  arc(x, bottomY, wOuter, eOuter, Math.PI, 2 * Math.PI);
  arc(x, bottomY, wInner, eInner, Math.PI, 2 * Math.PI);
  // Sides
  line(x - wOuter/2, topY, x - wOuter/2, bottomY);
  line(x + wOuter/2, topY, x + wOuter/2, bottomY);
  line(x - wOuter/2 + wall, topY, x - wOuter/2 + wall, bottomY);
  line(x + wOuter/2 - wall, topY, x + wOuter/2 - wall, bottomY);

  // Add white padding and grey outline to top wall
  // First draw the white padding
  stroke(255);
  strokeWeight(3);
  noFill();
  arc(x, topY, wOuter, eOuter, 0, Math.PI);
  arc(x, topY, wInner, eInner, 0, Math.PI);
  line(x - wOuter/2, topY, x - wOuter/2 + wall, topY);
  line(x + wOuter/2, topY, x + wOuter/2 - wall, topY);
  
  // Then draw the grey outline on top
  stroke(180);
  strokeWeight(2);
  noFill();
  arc(x, topY, wOuter, eOuter, 0, Math.PI);
  arc(x, topY, wInner, eInner, 0, Math.PI);
  line(x - wOuter/2, topY, x - wOuter/2 + wall, topY);
  line(x + wOuter/2, topY, x + wOuter/2 - wall, topY);

  // Add top base outline (matching bottom style)
  stroke(200);
  strokeWeight(2);
  noFill();
  // Draw the top base outline
  const topBaseWidth = w * 0.4;
  const topBaseHeight = 10;
  rect(x - topBaseWidth/2, topY - topBaseHeight, topBaseWidth, topBaseHeight, 5);
  // Add a small lip at the front
  line(x - topBaseWidth/2, topY - topBaseHeight, x - topBaseWidth/2, topY);
  line(x + topBaseWidth/2, topY - topBaseHeight, x + topBaseWidth/2, topY);

  // Add outlet pipe on the right wall
  const pipeWidth = w * 0.1;
  const pipeLength = w * 0.3;
  const pipeY = y + h * 0.4; // Position pipe even lower (changed from +0.35 to +0.4)
  
  // Draw pipe with rounded end at tank and detailed open end
  stroke(40);
  strokeWeight(2);
  fill(240); // Light grey for pipe
  beginShape();
  // Left end (at tank)
  arc(x + wOuter/2, pipeY, pipeWidth, pipeWidth, -Math.PI/2, Math.PI/2);
  // Top line
  vertex(x + wOuter/2, pipeY - pipeWidth/2);
  vertex(x + wOuter/2 + pipeLength, pipeY - pipeWidth/2);
  // Bottom line
  vertex(x + wOuter/2 + pipeLength, pipeY + pipeWidth/2);
  vertex(x + wOuter/2, pipeY + pipeWidth/2);
  endShape(CLOSE);

  // Add detail to the pipe opening with black outline
  const openingDetail = pipeWidth * 0.1;
  // Draw inner edge of pipe opening
  stroke(180); // Slightly darker grey for inner edge
  line(x + wOuter/2 + pipeLength, pipeY - pipeWidth/2 + openingDetail, 
       x + wOuter/2 + pipeLength, pipeY + pipeWidth/2 - openingDetail);
  // Draw outer edge of pipe opening
  stroke(0); // Black outline
  line(x + wOuter/2 + pipeLength - openingDetail, pipeY - pipeWidth/2, 
       x + wOuter/2 + pipeLength - openingDetail, pipeY + pipeWidth/2);
  // Draw black outline for the opening
  stroke(0);
  line(x + wOuter/2 + pipeLength, pipeY - pipeWidth/2, 
       x + wOuter/2 + pipeLength, pipeY + pipeWidth/2);

  // Draw rotor (suspended from the top, centered) BEFORE the liquid
  const shaftWidth = w * 0.04;
  const shaftLen = h * 0.75; // Increased shaft length
  const bladeLen = w * 0.32;  // Paddle length
  const bladeWidth = h * 0.11; // Slimmer paddle width
  const rotorTopY = y - h/2 + Math.max(4, w * 0.035) + 2; // Just below the inner top wall

  // Draw curved dome above rotor shaft
  const domeWidth = w * 0.15;
  const domeHeight = h * 0.25;
  const domeY = rotorTopY;
  
  // Dome shadow
  noStroke();
  fill(180, 180, 180, 100);
  ellipse(x, domeY + 2, domeWidth, domeHeight);
  
  // Dome main body
  fill(200);
  stroke(40);
  strokeWeight(1);
  // Draw main dome body with more pronounced curve
  beginShape();
  vertex(x - domeWidth/2, domeY);
  bezierVertex(
    x - domeWidth/2, domeY - domeHeight * 0.8, // Control point 1
    x + domeWidth/2, domeY - domeHeight * 0.8, // Control point 2
    x + domeWidth/2, domeY
  );
  endShape(CLOSE);
  
  // Dome highlight
  noStroke();
  fill(255, 255, 255, 100);
  ellipse(x - domeWidth * 0.2, domeY - domeHeight * 0.4, domeWidth * 0.4, domeHeight * 0.2);

  drawRotor(x, rotorTopY, shaftLen, shaftWidth, bladeLen, bladeWidth, rotorAngle);

  // Draw the liquid inside the cutaway tank with flat top and curved bottom
  if (liquidLevel > 0) {
    const tankInnerTop = topY + wall;
    const tankInnerBottom = bottomY - wall;
    const liquidHeight = (h - 2 * wall) * liquidLevel;
    const liquidTopY = tankInnerBottom - liquidHeight;
    fill(liquidColor);
    noStroke();
    beginShape();
    // Left side
    vertex(x - wInner/2, liquidTopY);
    // Flat top
    vertex(x + wInner/2, liquidTopY);
    // Right side down to bottom
    // Follow inner wall curve at bottom (right to left)
    let angleSteps = 20;
    for (let i = 0; i <= angleSteps; i++) {
      const angle = 0 + (i / angleSteps) * Math.PI;
      const px = x + Math.cos(angle) * wInner/2;
      const py = tankInnerBottom + Math.sin(angle) * eInner/2;
      vertex(px, py);
    }
    endShape(CLOSE);
  }

  // Add bar structures on both sides of the inner walls
  const barWidth = w * 0.04; // Width of the bars
  const barLength = h * 0.38; // Reduced length
  const rodWidth = w * 0.015; // Width of the connecting rods
  const rodLength = w * 0.05; // Length of the connecting rods
  const barExtension = h * 0.025; // Slightly reduced extension
  const verticalOffset = h * 0.16; // Move bars further down
  
  // Draw left side bar structure
  fill(180); // Dark grey for bars and rods
  stroke(40);
  strokeWeight(2);
  
  // Left bar (extended beyond clamps)
  rect(x - wInner/2 + rodLength, y - barLength/2 - barExtension + verticalOffset, barWidth, barLength + 2 * barExtension);
  
  // Top rod
  rect(x - wInner/2, y - barLength/2 + verticalOffset, rodLength, rodWidth);
  
  // Bottom rod
  rect(x - wInner/2, y + barLength/2 - rodWidth + verticalOffset, rodLength, rodWidth);
  
  // Draw right side bar structure
  // Right bar (extended beyond clamps)
  rect(x + wInner/2 - rodLength - barWidth, y - barLength/2 - barExtension + verticalOffset, barWidth, barLength + 2 * barExtension);
  
  // Top rod
  rect(x + wInner/2 - rodLength, y - barLength/2 + verticalOffset, rodLength, rodWidth);
  
  // Bottom rod
  rect(x + wInner/2 - rodLength, y + barLength/2 - rodWidth + verticalOffset, rodLength, rodWidth);

  // Draw switch above the tank
  const switchY = y - h/2 - 130;
  switchBounds = drawRotorSwitch(x, y - h/2, switchY, rotorOn, true);
  // Draw wire from switch to top of rotor shaft
  stroke(60);
  strokeWeight(3);
  noFill();
  const shaftTopY = y - h/2 + Math.max(4, w * 0.035) + 2;
  // Draw a wavy wire for realism
  beginShape();
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const wx = x;
    const wy = switchY + 32 + (shaftTopY - (switchY + 32)) * t + Math.sin(t * 4 * Math.PI) * 6 * (1 - t);
    vertex(wx, wy);
  }
  endShape();
}

// Refactor mousePressed handler to check all switches and only return after toggling the correct one
const oldMousePressed = window.mousePressed;
window.mousePressed = function() {
  // Check reset button
  if (resetButtonBounds && 
      mouseX >= resetButtonBounds.x && 
      mouseX <= resetButtonBounds.x + resetButtonBounds.width &&
      mouseY >= resetButtonBounds.y && 
      mouseY <= resetButtonBounds.y + resetButtonBounds.height) {
    resetSimulation();
    return;
  }
  
  // Check other interactions
  const mx = mouseX, my = mouseY;
  let toggled = false;
  if (pumpASwitchBounds && mx >= pumpASwitchBounds.x && mx <= pumpASwitchBounds.x + pumpASwitchBounds.w && my >= pumpASwitchBounds.y && my <= pumpASwitchBounds.y + pumpASwitchBounds.h) {
    pumpASwitchOn = !pumpASwitchOn;
    toggled = true;
  }
  if (pumpBSwitchBounds && mx >= pumpBSwitchBounds.x && mx <= pumpBSwitchBounds.x + pumpBSwitchBounds.w && my >= pumpBSwitchBounds.y && my <= pumpBSwitchBounds.y + pumpBSwitchBounds.h) {
    pumpBSwitchOn = !pumpBSwitchOn;
    toggled = true;
  }
  if (switchBounds && mx >= switchBounds.x && mx <= switchBounds.x + switchBounds.w && my >= switchBounds.y && my <= switchBounds.y + switchBounds.h) {
    rotorOn = !rotorOn;
    toggled = true;
  }
  if (!toggled && typeof oldMousePressed === 'function') oldMousePressed();
};

function drawResetButton() {
  const buttonWidth = 80;
  const buttonHeight = 30;
  const buttonX = width - buttonWidth - 20;
  const buttonY = 20;
  
  // Button background
  fill(200);
  stroke(40);
  strokeWeight(1);
  rect(buttonX, buttonY, buttonWidth, buttonHeight, 5);
  
  // Button text
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(14);
  text("Reset", buttonX + buttonWidth/2, buttonY + buttonHeight/2);
  
  // Store button bounds for interaction
  resetButtonBounds = {
    x: buttonX,
    y: buttonY,
    width: buttonWidth,
    height: buttonHeight
  };
}

function resetSimulation() {
  // Reset slider values
  sliderAValue = 0.3;
  sliderBValue = 0.3;
  
  // Reset valve positions
  valveAPosition = 0;
  valveBPosition = 0;
  
  // Reset liquid levels
  tankALiquidLevel = 0.85;
  tankBLiquidLevel = 0.85;
  simpleTankLiquidLevel = 0.3;
  
  // Reset waterfall progress
  simpleTankWaterfallProgress = 0;
  simpleTankDraining = false;
  
  // Reset rotor state
  rotorAngle = 0;
  rotorOn = false;
  
  // Reset pump switches
  pumpASwitchOn = false;
  pumpBSwitchOn = false;
} 