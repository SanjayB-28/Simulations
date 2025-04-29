export function handleInteractions(p) {
  // Check if mouse is over slider A
  if (p.mouseX >= sliderA.x && p.mouseX <= sliderA.x + sliderA.width &&
      p.mouseY >= sliderA.y && p.mouseY <= sliderA.y + sliderA.height) {
    p.cursor(p.HAND);
    if (p.mouseIsPressed) {
      window.state.sliderAValue = (p.mouseX - sliderA.x) / sliderA.width;
      window.state.sliderAValue = p.constrain(window.state.sliderAValue, 0, 1);
    }
  }
  
  // Check if mouse is over slider B
  else if (p.mouseX >= sliderB.x && p.mouseX <= sliderB.x + sliderB.width &&
           p.mouseY >= sliderB.y && p.mouseY <= sliderB.y + sliderB.height) {
    p.cursor(p.HAND);
    if (p.mouseIsPressed) {
      window.state.sliderBValue = (p.mouseX - sliderB.x) / sliderB.width;
      window.state.sliderBValue = p.constrain(window.state.sliderBValue, 0, 1);
    }
  }
  
  // Check if mouse is over valve A
  else if (p.mouseX >= tankA.x - 50 && p.mouseX <= tankA.x + 50 &&
           p.mouseY >= tankA.y + tankA.height/2 && p.mouseY <= tankA.y + tankA.height/2 + 50) {
    p.cursor(p.HAND);
    if (p.mouseIsPressed) {
      window.state.valveAOpen = !window.state.valveAOpen;
    }
  }
  
  // Check if mouse is over valve B
  else if (p.mouseX >= tankB.x - 50 && p.mouseX <= tankB.x + 50 &&
           p.mouseY >= tankB.y + tankB.height/2 && p.mouseY <= tankB.y + tankB.height/2 + 50) {
    p.cursor(p.HAND);
    if (p.mouseIsPressed) {
      window.state.valveBOpen = !window.state.valveBOpen;
    }
  }
  
  else {
    p.cursor(p.ARROW);
  }
} 