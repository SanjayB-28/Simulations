import { drawBasicPlot, drawPlot1, drawPlot2 } from './graph.js';
import { drawControlBar } from './control.js';
import { drawSlider } from './slider.js';
import { drawHamburger, drawCanvasMenu } from './hamburger.js';

export function drawAll() {
  drawControlBar();
  
  // Draw plots based on selected button
  const selectedIndex = window.state.selectedButtonIndex || 0;
  
  if (selectedIndex === 0) {
    // T-x-y button selected - show Plot 1 only
    drawPlot1({ 
      axisLabelSize: 3.5,
      yLabel: "temperature (°C)"
    });
    
    // Add fugacity text above plot with calculated values
    if (window.currentState) {
      const state = window.currentState;
      
      textSize(3.5);
      textAlign(CENTER, BOTTOM);
      fill(0);
      noStroke();
      
      // Draw text with italic mathematical symbols
      const textX = window.contentArea.x + window.contentArea.width / 2 + 4;
      const textY = window.contentArea.y + 4;
      
      // "P = 1 bar"
      textStyle(ITALIC);
      text("P", textX - 50, textY);
      textStyle(NORMAL);
      text(" = 1 bar", textX - 42.5, textY);
      
      // "f_B = y_B P = 0.39 bar"
      textStyle(ITALIC);
      text("f", textX - 21, textY);
      textStyle(NORMAL);
      textSize(2.5);
      text("B", textX - 18.5, textY + 1);
      textSize(3.5);
      textStyle(ITALIC);
      text(" = y", textX - 15, textY);
      textStyle(NORMAL);
      textSize(2.5);
      text("B", textX - 10.5, textY + 1);
      textSize(3.5);
      textStyle(ITALIC);
      text(" P", textX - 8, textY);
      textStyle(NORMAL);
      text(" = 0.39 bar", textX + 2, textY);
      
      // "f_T = y_T P = 0.61 bar"
      textStyle(ITALIC);
      text("f", textX + 22, textY);
      textStyle(NORMAL);
      textSize(2.5);
      text("T", textX + 24.5, textY + 1);
      textSize(3.5);
      textStyle(ITALIC);
      text(" = y", textX + 28, textY);
      textStyle(NORMAL);
      textSize(2.5);
      text("T", textX + 32.5, textY + 1);
      textSize(3.5);
      textStyle(ITALIC);
      text(" P", textX + 35, textY);
      textStyle(NORMAL);
      text(" = 0.61 bar", textX + 45, textY);
    }
  } else if (selectedIndex === 1) {
    // fugacity versus T button selected - show Plot 2 only
    drawPlot2({ 
      axisLabelSize: 3.5,
      xLabel: "temperature (°C)"
    });
    
    // Add fugacity text above plot with calculated values
    if (window.currentState) {
      const state = window.currentState;
      
      textSize(3.5);
      textAlign(CENTER, BOTTOM);
      fill(0);
      noStroke();
      
      // Draw text with italic mathematical symbols
      const textX = window.contentArea.x + window.contentArea.width / 2 + 4;
      const textY = window.contentArea.y + 4;
      
      // "P = 1 bar"
      textStyle(ITALIC);
      text("P", textX - 50, textY);
      textStyle(NORMAL);
      text(" = 1 bar", textX - 42.5, textY);
      
      // "f_B = y_B P = 0.39 bar"
      textStyle(ITALIC);
      text("f", textX - 21, textY);
      textStyle(NORMAL);
      textSize(2.5);
      text("B", textX - 18.5, textY + 1);
      textSize(3.5);
      textStyle(ITALIC);
      text(" = y", textX - 15, textY);
      textStyle(NORMAL);
      textSize(2.5);
      text("B", textX - 10.5, textY + 1);
      textSize(3.5);
      textStyle(ITALIC);
      text(" P", textX - 8, textY);
      textStyle(NORMAL);
      text(" = 0.39 bar", textX + 2, textY);
      
      // "f_T = y_T P = 0.61 bar"
      textStyle(ITALIC);
      text("f", textX + 22, textY);
      textStyle(NORMAL);
      textSize(2.5);
      text("T", textX + 24.5, textY + 1);
      textSize(3.5);
      textStyle(ITALIC);
      text(" = y", textX + 28, textY);
      textStyle(NORMAL);
      textSize(2.5);
      text("T", textX + 32.5, textY + 1);
      textSize(3.5);
      textStyle(ITALIC);
      text(" P", textX + 35, textY);
      textStyle(NORMAL);
      text(" = 0.61 bar", textX + 45, textY);
    }
  } else if (selectedIndex === 2) {
    // both button selected - show both plots side by side
    const gap = 12; // Space between plots
    const totalMargin = 26 + gap; // 18 + 8 + gap (left margin + right margin + gap)
    const plotWidth = (window.contentArea.width - totalMargin) / 2; // Equal width for both plots
    
    // Plot 1 (left side)
    drawPlot1({
      leftMargin: 18,
      rightMargin: plotWidth + gap + 8, // Add gap and use correct right margin
      xLabel: "mole fraction benzene",
      yLabel: "temperature (°C)",
      axisLabelSize: 3.5,
      yLabelXOffset: -9 // Move Y-axis label to the right in both case
    });
    
    // Plot 2 (right side) - same size as Plot 1
    drawPlot2({
      leftMargin: plotWidth + gap + 18, // Add gap to separate from Plot 1
      rightMargin: 8, // Same right margin as individual plots (default)
      xLabel: "temperature (°C)",
      yLabel: "fugacity (bar)",
      axisLabelSize: 3.5,
      yLabelXOffset: -9, // Move Y-axis label to the right in both case
      isBothPlots: true // Increase text gap when both plots are shown
    });
  }
  
  if (window.state.showMenu) {
    drawCanvasMenu();
  }
}