// Graphics-related functions for the simulation

// State for slider values and valve positions
let sliderAValue = 0.25; // Initial value for Tank A
let sliderBValue = 0.25; // Initial value for Tank B
let valveAPosition = 0; // Initial valve position (horizontal)
let valveBPosition = 0; // Initial valve position (horizontal)
let waveOffset = 0; // For liquid animation

// Add liquid level tracking
let tankALiquidLevel = 0.85; // Initial liquid level for Tank A
let tankBLiquidLevel = 0.85; // Initial liquid level for Tank B
const MIN_LIQUID_LEVEL = 0.2; // Minimum liquid level to prevent empty tanks
const FLOW_RATE_FACTOR = 0.0005; // Factor to control how fast liquid level decreases

// Add global variable for the new tank's liquid level
let simpleTankLiquidLevel = 0.0; // Start empty
const SIMPLE_TANK_MAX_LEVEL = 0.62; // Never completely full, now 62%
const SIMPLE_TANK_FILL_RATE = 0.0005; // Reduced from 0.001 to make filling slower

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
  stroke(0);
  strokeWeight(1);
  fill(180, 180, 190); // Metallic grey
  circle(x, y, size);
  
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
  const boltSize = size * 0.08;
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
  stroke(0); // Black stroke for bolts
  strokeWeight(1);
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
    stroke(0);
    strokeWeight(1);
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
    const fallLandingX = tankX - (tankWidth - 2 * wall) / 2 + 1; // 1px inside inner wall

    // Calculate flow rates based on valve positions (ensure local definition)
    const flowRateA = map(valveAPosition, 0, -Math.PI/2, 0, 1);
    const flowRateB = map(valveBPosition, 0, -Math.PI/2, 0, 1);

    // Draw waterfall animation if filling
    if ((flowRateA > 0 || flowRateB > 0)) {
      const streamColor = color(200, 180, 220, 200); // Mild purple color
      const startX = fallLandingX;
      const startY = inletY;
      // End at the center of the tank at the liquid surface, but clamp to avoid bouncing
      const endX = tankX;
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
      // Draw a smooth cubic Bezier curve (candy cane)
      beginShape();
      vertex(startX, startY);
      bezierVertex(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY);
      endShape();
    }

    // Draw the tank
    drawSimpleTank(tankX, tankY, tankWidth, tankHeight, simpleTankLiquidLevel, color(200, 180, 220, 200)); // Mild purple liquid

    // Update the liquid level if either flow rate is nonzero
    if (flowRateA > 0 || flowRateB > 0) {
      simpleTankLiquidLevel += SIMPLE_TANK_FILL_RATE;
      simpleTankLiquidLevel = Math.min(simpleTankLiquidLevel, SIMPLE_TANK_MAX_LEVEL);
    }
  }
}

function drawOutletPipe(x, y, pipeWidth, valvePosition, label) {
  // Set black outline for all pipe elements
  stroke(0);
  strokeWeight(1);
  
  // Main vertical pipe - longer for both tanks, extra length for Tank A
  const basePipeHeight = 150;
  const pipeHeight = label === "Tank A" ? basePipeHeight + 100 : basePipeHeight;
  
  // Connect pipe to tank outlet
  const pipeTop = y - pipeWidth/2;
  fill(240); // Light grey for pipes
  
  // Draw pipe with rounded top to connect smoothly
  beginShape();
  vertex(x - pipeWidth/2, pipeTop);
  vertex(x - pipeWidth/2, y + pipeHeight);
  vertex(x + pipeWidth/2, y + pipeHeight);
  vertex(x + pipeWidth/2, pipeTop);
  arc(x, pipeTop, pipeWidth, pipeWidth, -Math.PI, 0);
  endShape(CLOSE);
  
  // Bottom valve (adjustable switch style)
  const valveY = y + pipeHeight;
  const valveSize = pipeWidth * 3;
  
  // Valve body (circle) with matching red tint
  fill(255, 150, 150); // Match the switch handle color
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
    text(`${label} Flow Rate`, monitorX - 20, monitorY - 15);
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
    text(`${label} Flow Rate`, monitorX, monitorY - 15);
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
  stroke(0);
  strokeWeight(2); // Reduced from 3 to 2
  const handleLength = valveSize * 0.9;
  const handleWidth = 15;
  
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

function drawSlider(x, y, w, value, label) {
  const sliderY = y - 30;
  stroke(0);
  strokeWeight(1);
  
  // Draw slider track
  line(x - w/2, sliderY, x + w/2, sliderY);
  
  // Draw slider handle
  const handleX = map(value, 0, 0.5, x - w/2, x + w/2);
  fill(255);
  stroke(0);
  strokeWeight(1);
  circle(handleX, sliderY, 10);
  
  // Draw value label
  noStroke();
  fill(0);
  textAlign(CENTER, BOTTOM);
  textSize(12);
  text(`${label}: ${value.toFixed(2)} mol/L`, x, sliderY - 10);
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
  // Start at the bottom point of the cone
  vertex(x, y - h/2 + cylinderHeight + coneHeight);
  
  // Left side of cone
  if (liquidHeight > coneHeight) {
    vertex(x - coneBottomWidth/2, y - h/2 + cylinderHeight + coneHeight);
    vertex(x - coneTopWidth/2, y - h/2 + cylinderHeight);
    vertex(x - w/2, y - h/2 + cylinderHeight - (liquidHeight - coneHeight));
  } else {
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
    vertex(x + w/2, y - h/2 + cylinderHeight - (liquidHeight - coneHeight));
    vertex(x + coneTopWidth/2, y - h/2 + cylinderHeight);
    vertex(x + coneBottomWidth/2, y - h/2 + cylinderHeight + coneHeight);
  } else {
    const ratio = liquidHeight / coneHeight;
    const currentWidth = lerp(coneBottomWidth, coneTopWidth, ratio);
    vertex(x + currentWidth/2, y - h/2 + cylinderHeight + coneHeight - liquidHeight);
  }
  
  endShape(CLOSE);
}

export function drawTank(x, y, w, h, label, liquidColor, isFirstTank, liquidLevel) {
  // Draw stand first
  drawStand(x, y, w, h);
  
  // Draw liquid with current level
  drawLiquid(x, y, w, h, liquidLevel, liquidColor);
  
  // Tank outline
  stroke(0);
  strokeWeight(2);
  noFill();
  
  // Main cylindrical body
  const cylinderHeight = h * 0.7;
  
  // Draw lid
  const lidWidth = w * 0.4;
  const lidHeight = 10;
  rect(x - lidWidth/2, y - h/2 - lidHeight, lidWidth, lidHeight, 5);
  
  // Draw rounded top
  arc(x, y - h/2, w, 40, Math.PI, 2 * Math.PI);
  
  // Draw main cylinder sides
  line(x - w/2, y - h/2, x - w/2, y - h/2 + cylinderHeight);
  line(x + w/2, y - h/2, x + w/2, y - h/2 + cylinderHeight);
  
  // Conical bottom
  const coneTopWidth = w;
  const coneBottomWidth = w * 0.1;
  const coneHeight = h * 0.3;
  
  // Draw cone
  line(x - coneTopWidth/2, y - h/2 + cylinderHeight, x - coneBottomWidth/2, y - h/2 + cylinderHeight + coneHeight);
  line(x + coneTopWidth/2, y - h/2 + cylinderHeight, x + coneBottomWidth/2, y - h/2 + cylinderHeight + coneHeight);
  
  // Bottom line of cone
  line(x - coneBottomWidth/2, y - h/2 + cylinderHeight + coneHeight, x + coneBottomWidth/2, y - h/2 + cylinderHeight + coneHeight);
  
  // Draw outlet pipe with bottom valve
  const valvePos = isFirstTank ? valveAPosition : valveBPosition;
  const valveLabel = isFirstTank ? "Tank A" : "Tank B";
  drawOutletPipe(x, y - h/2 + cylinderHeight + coneHeight + 10, coneBottomWidth, valvePos, valveLabel);
  
  // Tank label
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(h * 0.05);
  text(label, x, y);
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
  const sliderY = tankY - tankH/2 - 30;
  const handleRadius = 9;

  // Check slider interactions
  if (Math.abs(mouseY - sliderY) < 10) {
    if (mouseX >= tankAX - tankW/2 && mouseX <= tankAX + tankW/2) {
      sliderAValue = map(mouseX, tankAX - tankW/2, tankAX + tankW/2, 0, 0.5);
      sliderAValue = constrain(sliderAValue, 0, 0.5);
    } else if (mouseX >= tankBX - tankW/2 && mouseX <= tankBX + tankW/2) {
      sliderBValue = map(mouseX, tankBX - tankW/2, tankBX + tankW/2, 0, 0.5);
      sliderBValue = constrain(sliderBValue, 0, 0.5);
    }
  }

  // Check valve handle interactions
  function updateValvePosition(handle, setPosition) {
    if (!handle) return;
    
    const { centerX, centerY } = handle;
    if (dist(mouseX, mouseY, handle.x, handle.y) < handleRadius) {
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

export function drawSimulation(width, height) {
  background(255);
  
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
  if (flowRateA > 0) {
    tankALiquidLevel = max(MIN_LIQUID_LEVEL, tankALiquidLevel - flowRateA * FLOW_RATE_FACTOR);
  }
  if (flowRateB > 0) {
    tankBLiquidLevel = max(MIN_LIQUID_LEVEL, tankBLiquidLevel - flowRateB * FLOW_RATE_FACTOR);
  }
  
  // Draw Tank A (left tank) with blue liquid
  drawTank(tankAX, tankY, tankW, tankH, "Tank A", color(200, 220, 255, 200), true, tankALiquidLevel);
  drawSlider(tankAX, tankY - tankH/2, tankW, sliderAValue, "CA0");
  
  // Draw Tank B (right tank) with green liquid
  drawTank(tankBX, tankY, tankW, tankH, "Tank B", color(200, 255, 220, 200), false, tankBLiquidLevel);
  drawSlider(tankBX, tankY - tankH/2, tankW, sliderBValue, "CB0");
}

// Export slider values for external use
export function getSliderValues() {
  return {
    tankA: sliderAValue,
    tankB: sliderBValue
  };
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
  fill(240); // Light grey for pipe
  stroke(0); // Black outline
  strokeWeight(1);
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
  const barLength = h * 0.5; // Length of the bars
  const rodWidth = w * 0.015; // Width of the connecting rods
  const rodLength = w * 0.05; // Length of the connecting rods
  const barExtension = h * 0.03; // How much the bar extends beyond the clamps
  const verticalOffset = h * 0.1; // Added vertical offset to move bars down
  
  // Draw left side bar structure
  fill(180); // Dark grey for bars and rods
  noStroke();
  
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
} 