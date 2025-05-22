// Attach p5.js to a specific container
let sketch = function(p) {
    // UI state
    let mode = 0; // 0: fugacity vs temperature, 1: fugacity vs pressure
    let pres = 0.080; // bar, for f vs T
    let temp = 375; // K, for f vs P
    let realGas = false;
  
    // UI layout
    const plotW = 820, plotH = 570;
    const marginL = 70, marginR = 30, marginT = 40, marginB = 60;
    const containerW = 950, containerH = 700;
  
    // For pressure slider (f vs T)
    const presMin = 0.020, presMax = 0.150;
  
    // For temperature slider (f vs P)
    const tempMin = 358, tempMax = 395;
  
    // For pressure axis (f vs P)
    const pMax = 3.0; // MPa
  
    // For temperature axis (f vs T)
    const tMin = 280, tMax = 400;
  
    // For fugacity axis
    const fugTMax = 0.20; // bar
    const fugPMax = 3.0; // MPa
  
    // For font
    let font;
  
    // Add hamburger menu state
    let hamburgerOpen = false;
    let hamburgerX = 24, hamburgerY = 24, hamburgerSize = 36;
    let dropdownItems = [
      { label: 'Directions', modal: 'directions-modal' },
      { label: 'Details', modal: 'details-modal' },
      { label: 'About', modal: 'about-modal' }
    ];
  
    p.setup = function() {
      let cnv = p.createCanvas(containerW, containerH);
      cnv.parent('p5-container');
      font = p.textFont('Arial');
      p.noLoop();
      // Redraw on window resize
      window.addEventListener('resize', () => p.redraw());
    };
  
    // Clausius-Clapeyron
    function clausius(T) {
      return 0.101325 * Math.exp(-5268.134 * (1/T - 1/373));
    }
    function invclausius(p) {
      return 1 / ((Math.log(p/0.101325)/-5268.134) + 1/373);
    }
    function fugliq(pres, temp) {
      return clausius(temp);
    }
    function fugvap(pres, temp, realGas) {
      // For f vs T, pres in bar, temp in K
      // For f vs P, pres in MPa, temp in K
      if (mode === 0) {
        // f vs T: pres in bar
        if (realGas) {
          return pres - 0.8 * (pres - Math.log(pres + 1));
        } else {
          return pres;
        }
      } else {
        // f vs P: pres in MPa
        if (realGas) {
          return pres - 0.8 * (pres - Math.log(pres + 1));
        } else {
          return pres;
        }
      }
    }
  
    // Find boiling point for f vs T (T at which fugliq = fugvap)
    function findBoilingPointT(pres, realGas) {
      // Solve fugvap(pres, T, realGas) = fugliq(pres, T)
      // Use bisection
      let Tlow = tMin, Thigh = tMax, Tmid;
      for (let i = 0; i < 30; i++) {
        Tmid = 0.5 * (Tlow + Thigh);
        let fliq = fugliq(pres, Tmid);
        let fvap = fugvap(pres, Tmid, realGas);
        if ((fvap - fliq) > 0) Thigh = Tmid;
        else Tlow = Tmid;
      }
      return Tmid;
    }
  
    // Find boiling point for f vs P (P at which fugliq*10 = fugvap)
    function findBoilingPointP(temp, realGas) {
      // Solve fugvap(P, temp, realGas) = fugliq(P, temp)*10
      let Plow = 0.01, Phigh = pMax, Pmid;
      for (let i = 0; i < 30; i++) {
        Pmid = 0.5 * (Plow + Phigh);
        let fliq = fugliq(Pmid, temp) * 10;
        let fvap = fugvap(Pmid, temp, realGas);
        if ((fvap - fliq) > 0) Phigh = Pmid;
        else Plow = Pmid;
      }
      return Pmid;
    }
  
    // UI controls
    function drawControls() {
      p.push();
      p.textFont('Arial');
      p.textSize(13);
      p.fill(60);
  
      // Hamburger icon
      drawHamburger();
      if (hamburgerOpen) drawDropdown();
  
      // Sliders and controls (centered at top)
      let controlsY = 25;
      let controlsX = hamburgerX + hamburgerSize + 30;
      p.textAlign(p.LEFT, p.CENTER);
      if (mode === 0) {
        p.text("pressure (bar)", controlsX, controlsY);
        let sliderX = controlsX + 110, sliderY = controlsY;
        let sliderW = 180;
        p.stroke(180);
        p.line(sliderX, sliderY, sliderX + sliderW, sliderY);
        let t = (pres - presMin) / (presMax - presMin);
        let handleX = sliderX + t * sliderW;
        p.noStroke();
        p.fill(120);
        p.circle(handleX, sliderY, 12);
        if (p.mouseIsPressed && p.mouseY > sliderY-10 && p.mouseY < sliderY+10 && p.mouseX > sliderX-5 && p.mouseX < sliderX+sliderW+5 && !hamburgerOpen) {
          let newT = p.constrain((p.mouseX - sliderX) / sliderW, 0, 1);
          pres = +(presMin + newT * (presMax - presMin)).toFixed(3);
          p.redraw();
        }
        p.fill(60);
        p.text(pres.toFixed(3), sliderX + sliderW + 20, sliderY);
      } else {
        p.text("temperature (K)", controlsX, controlsY);
        let sliderX = controlsX + 130, sliderY = controlsY;
        let sliderW = 180;
        p.stroke(180);
        p.line(sliderX, sliderY, sliderX + sliderW, sliderY);
        let t = (temp - tempMin) / (tempMax - tempMin);
        let handleX = sliderX + t * sliderW;
        p.noStroke();
        p.fill(120);
        p.circle(handleX, sliderY, 12);
        if (p.mouseIsPressed && p.mouseY > sliderY-10 && p.mouseY < sliderY+10 && p.mouseX > sliderX-5 && p.mouseX < sliderX+sliderW+5 && !hamburgerOpen) {
          let newT = p.constrain((p.mouseX - sliderX) / sliderW, 0, 1);
          temp = Math.round(tempMin + newT * (tempMax - tempMin));
          p.redraw();
        }
        p.fill(60);
        p.text(temp, sliderX + sliderW + 20, sliderY);
      }
  
      // Dropdown for plot type
      let ddX = controlsX + 350, ddY = controlsY - 7;
      p.textAlign(p.LEFT, p.CENTER);
      p.text("fugacity versus " + (mode === 0 ? "temperature" : "pressure"), ddX, ddY + 7);
      // Dropdown click area handled in mousePressed
  
      // Checkbox for real gas
      if (mode === 1) {
        let cbX = controlsX + 570, cbY = controlsY - 7;
        p.noFill();
        p.stroke(80);
        p.rect(cbX, cbY, 18, 18, 4);
        if (realGas) {
          p.line(cbX+3, cbY+9, cbX+8, cbY+15);
          p.line(cbX+8, cbY+15, cbX+15, cbY+3);
        }
        p.noStroke();
        p.fill(60);
        p.textAlign(p.LEFT, p.CENTER);
        p.text("real gas", cbX + 25, cbY + 9);
      }
      p.pop();
    }
  
    function drawHamburger() {
      p.push();
      p.noStroke();
      p.fill(240);
      p.rect(hamburgerX, hamburgerY, hamburgerSize, hamburgerSize, 8);
      p.stroke(60);
      p.strokeWeight(3);
      let cx = hamburgerX + hamburgerSize/2;
      let cy = hamburgerY + hamburgerSize/2;
      for (let i = -1; i <= 1; i++) {
        p.line(cx - 10, cy + i*8, cx + 10, cy + i*8);
      }
      p.pop();
    }
  
    function drawDropdown() {
      p.push();
      let x = hamburgerX, y = hamburgerY + hamburgerSize + 2;
      let w = 170, h = 44 * dropdownItems.length;
      p.fill(255);
      p.stroke(180);
      p.rect(x, y, w, h, 8);
      p.textFont('Arial');
      p.textSize(18);
      p.fill(40);
      for (let i = 0; i < dropdownItems.length; i++) {
        p.textAlign(p.LEFT, p.CENTER);
        p.text(dropdownItems[i].label, x + 18, y + 22 + i*44);
        if (i < dropdownItems.length-1) {
          p.stroke(230);
          p.line(x+8, y + 44*(i+1), x+w-8, y + 44*(i+1));
        }
      }
      p.pop();
    }
  
    // Handle dropdown and checkbox clicks
    p.mousePressed = function() {
      // Hamburger click
      if (
        p.mouseX > hamburgerX && p.mouseX < hamburgerX + hamburgerSize &&
        p.mouseY > hamburgerY && p.mouseY < hamburgerY + hamburgerSize
      ) {
        hamburgerOpen = !hamburgerOpen;
        p.redraw();
        return;
      }
      // Dropdown click
      if (hamburgerOpen) {
        let x = hamburgerX, y = hamburgerY + hamburgerSize + 2;
        let w = 170, h = 44 * dropdownItems.length;
        for (let i = 0; i < dropdownItems.length; i++) {
          if (
            p.mouseX > x && p.mouseX < x + w &&
            p.mouseY > y + i*44 && p.mouseY < y + (i+1)*44
          ) {
            hamburgerOpen = false;
            // Show modal via JS
            setTimeout(() => {
              let modal = document.getElementById(dropdownItems[i].modal);
              if (modal) {
                let modalInstance = bootstrap.Modal.getOrCreateInstance(modal);
                modalInstance.show();
              }
            }, 50);
            p.redraw();
            return;
          }
        }
        // Click outside closes dropdown
        hamburgerOpen = false;
        p.redraw();
        return;
      }
      // Dropdown for plot type
      let controlsY = 25;
      let controlsX = hamburgerX + hamburgerSize + 30;
      let ddX = controlsX + 350, ddY = controlsY - 7;
      if (p.mouseX > ddX && p.mouseX < ddX+180 && p.mouseY > ddY && p.mouseY < ddY+25) {
        mode = 1 - mode;
        p.redraw();
        return;
      }
      // Checkbox
      if (mode === 1) {
        let cbX = controlsX + 570, cbY = controlsY - 7;
        if (p.mouseX > cbX && p.mouseX < cbX+18 && p.mouseY > cbY && p.mouseY < cbY+18) {
          realGas = !realGas;
          p.redraw();
          return;
        }
      }
    };
  
    // Main draw
    p.draw = function() {
      p.clear();
      p.background(255);
  
      // Draw controls
      drawControls();
  
      // Draw plot
      p.push();
      p.translate(marginL, marginT + 40);
  
      if (mode === 0) {
        drawFugacityVsTemperature();
      } else {
        drawFugacityVsPressure();
      }
      p.pop();
    };
  
    // Plot: fugacity vs temperature
    function drawFugacityVsTemperature() {
      // Axes
      drawAxes(tMin, tMax, 0, fugTMax, "temperature (°C)", "fugacity (bar)", 0);
  
      // Find boiling point
      let bp = findBoilingPointT(pres, realGas);
  
      // Plot curves
      let N = 200;
      let xvals = [];
      let yliq = [];
      let yvap = [];
      for (let i = 0; i < N; i++) {
        let T = tMin + (tMax - tMin) * i / (N-1);
        xvals.push(T);
        yliq.push(fugliq(pres, T));
        yvap.push(fugvap(pres, T, realGas));
      }
  
      // Draw liquid (T < bp)
      p.strokeWeight(2.5);
      p.stroke(0, 60, 200);
      p.noFill();
      p.beginShape();
      for (let i = 0; i < N; i++) {
        if (xvals[i] > bp) break;
        let x = mapX(xvals[i], tMin, tMax, plotW);
        let y = mapY(yliq[i], 0, fugTMax, plotH);
        p.vertex(x, y);
      }
      p.endShape();
  
      // Draw vapor (T >= bp)
      p.stroke(0, 60, 200);
      p.beginShape();
      for (let i = 0; i < N; i++) {
        if (xvals[i] < bp) continue;
        let x = mapX(xvals[i], tMin, tMax, plotW);
        let y = mapY(yvap[i], 0, fugTMax, plotH);
        p.vertex(x, y);
      }
      p.endShape();
  
      // Dashed extension
      p.stroke(0, 60, 200, 80);
      p.strokeWeight(2);
      p.drawingContext.setLineDash([6, 8]);
      p.beginShape();
      for (let i = 0; i < N; i++) {
        if (xvals[i] < bp) continue;
        let x = mapX(xvals[i], tMin, tMax, plotW);
        let y = mapY(yliq[i], 0, fugTMax, plotH);
        p.vertex(x, y);
      }
      p.endShape();
      p.drawingContext.setLineDash([]);
  
      // Dashed extension for vapor
      p.drawingContext.setLineDash([6, 8]);
      p.beginShape();
      for (let i = 0; i < N; i++) {
        if (xvals[i] > bp) break;
        let x = mapX(xvals[i], tMin, tMax, plotW);
        let y = mapY(yvap[i], 0, fugTMax, plotH);
        p.vertex(x, y);
      }
      p.endShape();
      p.drawingContext.setLineDash([]);
  
      // Saturation point
      let xbp = mapX(bp, tMin, tMax, plotW);
      let ybp = mapY(clausius(bp), 0, fugTMax, plotH);
      p.stroke(0);
      p.strokeWeight(1.5);
      p.fill(0);
      p.circle(xbp, ybp, 9);
      p.stroke(80);
      p.drawingContext.setLineDash([4, 6]);
      p.line(xbp, ybp, xbp, plotH);
      p.drawingContext.setLineDash([]);
  
      // T^sat label
      p.noStroke();
      p.textFont('Arial');
      p.textSize(18);
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text("T", xbp-32, ybp-10);
      p.textSize(13);
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text("sat", xbp-18, ybp-15);
  
      // Phase labels
      p.textFont('Arial');
      p.textSize(18);
      p.textAlign(p.LEFT, p.CENTER);
      p.push();
      p.rotate(-0.18);
      p.text("liquid", mapX(315, tMin, tMax, plotW), mapY(clausius(315)+0.01, 0, fugTMax, plotH));
      p.pop();
      p.text("vapor", mapX(390, tMin, tMax, plotW), mapY(fugvap(pres, 390, realGas)+0.013, 0, fugTMax, plotH));
    }
  
    // Plot: fugacity vs pressure
    function drawFugacityVsPressure() {
      // Axes
      drawAxes(0, pMax, 0, fugPMax, "pressure (MPa)", "fugacity (MPa)", 1);
  
      // Find boiling point
      let bp2 = findBoilingPointP(temp, realGas);
  
      // Plot curves
      let N = 200;
      let xvals = [];
      let yliq = [];
      let yvap = [];
      for (let i = 0; i < N; i++) {
        let P = 0 + (pMax) * i / (N-1);
        xvals.push(P);
        yliq.push(fugliq(P, temp) * 10);
        yvap.push(fugvap(P, temp, realGas));
      }
  
      // Draw vapor (P < bp2)
      p.strokeWeight(2.5);
      p.stroke(0, 60, 200);
      p.noFill();
      p.beginShape();
      for (let i = 0; i < N; i++) {
        if (xvals[i] > bp2) break;
        let x = mapX(xvals[i], 0, pMax, plotW);
        let y = mapY(yvap[i], 0, fugPMax, plotH);
        p.vertex(x, y);
      }
      p.endShape();
  
      // Draw liquid (P >= bp2)
      p.stroke(0, 60, 200);
      p.beginShape();
      for (let i = 0; i < N; i++) {
        if (xvals[i] < bp2) continue;
        let x = mapX(xvals[i], 0, pMax, plotW);
        let y = mapY(yliq[i], 0, fugPMax, plotH);
        p.vertex(x, y);
      }
      p.endShape();
  
      // Dashed extension
      p.stroke(0, 60, 200, 80);
      p.strokeWeight(2);
      p.drawingContext.setLineDash([6, 8]);
      p.beginShape();
      for (let i = 0; i < N; i++) {
        if (xvals[i] < bp2) continue;
        let x = mapX(xvals[i], 0, pMax, plotW);
        let y = mapY(yvap[i], 0, fugPMax, plotH);
        p.vertex(x, y);
      }
      p.endShape();
      p.drawingContext.setLineDash([]);
  
      // Dashed extension for liquid
      p.drawingContext.setLineDash([6, 8]);
      p.beginShape();
      for (let i = 0; i < N; i++) {
        if (xvals[i] > bp2) break;
        let x = mapX(xvals[i], 0, pMax, plotW);
        let y = mapY(yliq[i], 0, fugPMax, plotH);
        p.vertex(x, y);
      }
      p.endShape();
      p.drawingContext.setLineDash([]);
  
      // Saturation point
      let xbp = mapX(bp2, 0, pMax, plotW);
      let ybp = mapY(fugvap(bp2, temp, realGas), 0, fugPMax, plotH);
      p.stroke(0);
      p.strokeWeight(1.5);
      p.fill(0);
      p.circle(xbp, ybp, 9);
      p.stroke(80);
      p.drawingContext.setLineDash([4, 6]);
      p.line(xbp, ybp, xbp, plotH);
      p.drawingContext.setLineDash([]);
  
      // P^sat label
      p.noStroke();
      p.textFont('Arial');
      p.textSize(18);
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text("P", xbp-32, ybp-10);
      p.textSize(13);
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text("sat", xbp-18, ybp-15);
  
      // Phase labels
      p.textFont('Arial');
      p.textSize(18);
      p.textAlign(p.LEFT, p.CENTER);
      p.text("liquid", mapX(2.7, 0, pMax, plotW), mapY(fugliq(2.7, temp)*10+0.12, 0, fugPMax, plotH));
      p.text("vapor", mapX(0.3, 0, pMax, plotW), mapY(fugvap(0.3, temp, realGas)+0.15, 0, fugPMax, plotH));
    }
  
    // Axes
    function drawAxes(xmin, xmax, ymin, ymax, xlabel, ylabel, which) {
      // Draw box
      p.stroke(0);
      p.strokeWeight(1.5);
      p.noFill();
      p.rect(0, 0, plotW, plotH);
  
      // Ticks and labels
      p.textFont('Arial');
      p.textSize(15);
      p.fill(0);
      p.noStroke();
      // X axis
      let nTicksX = 6;
      for (let i = 0; i <= nTicksX; i++) {
        let x = mapX(xmin + (xmax-xmin)*i/nTicksX, xmin, xmax, plotW);
        let y = plotH;
        p.stroke(0);
        p.line(x, y, x, y+7);
        p.noStroke();
        let val = xmin + (xmax-xmin)*i/nTicksX;
        if (which === 0) // T in degC
          p.text(Math.round(val), x-10, y+25);
        else // P in MPa
          p.text(val.toFixed(1), x-12, y+25);
      }
      // Y axis
      let nTicksY = 5;
      for (let i = 0; i <= nTicksY; i++) {
        let y = mapY(ymin + (ymax-ymin)*i/nTicksY, ymin, ymax, plotH);
        let x = 0;
        p.stroke(0);
        p.line(x-7, y, x, y);
        p.noStroke();
        let val = ymin + (ymax-ymin)*i/nTicksY;
        if (which === 0)
          p.text(val.toFixed(2), x-55, y+5);
        else
          p.text(val.toFixed(1), x-55, y+5);
      }
      // Labels
      p.textFont('Arial');
      p.textSize(18);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(xlabel, plotW/2, plotH+45);
      p.push();
      p.translate(-55, plotH/2);
      p.rotate(-Math.PI/2);
      p.text(ylabel, 0, 0);
      p.pop();
    }
  
    // Map data to plot coordinates
    function mapX(val, xmin, xmax, w) {
      return (val - xmin) / (xmax - xmin) * w;
    }
    function mapY(val, ymin, ymax, h) {
      return h - (val - ymin) / (ymax - ymin) * h;
    }
  };
  
  new p5(sketch, 'p5-container');