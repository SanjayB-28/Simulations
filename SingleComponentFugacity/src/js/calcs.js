export function calcAll() {
  // Only calculate for fugacity vs pressure (dropdownSelection === 1)
  if (window.state.dropdownSelection !== 1) return;

  // Get temperature and real gas flag from state
  const temp = getCurrentTemperature(); // in K
  const realGas = window.state.realGasChecked;

  // Helper functions from Mathematica code
  function clausius(T) {
    return 0.101325 * Math.exp(-5268.134 * (1 / T - 1 / 373));
  }
  function fugliq(P, T) {
    // Use MPa scale only if realGas is true
    return clausius(T) * (realGas ? 10 : 1);
  }
  function fugvap(P, T) {
    if (!realGas) {
      return P;
    } else {
      // Real gas: P - 0.8*(P - log(P+1))
      return P - 0.8 * (P - Math.log(P + 1));
    }
  }

  // Find bp2 (Psat in MPa)
  // Solve fugvap(P, temp) == fugliq(P, temp) for P
  function findPsat(T) {
    // Use numeric search in [0.00001, 3]
    let P = 0.00001;
    let step = 0.001;
    let lastDiff = null;
    for (let i = 0; i < 10000; i++) {
      const diff = fugvap(P, T) - fugliq(P, T);
      if (lastDiff !== null && diff * lastDiff < 0) {
        // Linear interpolation for better accuracy
        const P0 = P - step;
        const d0 = fugvap(P0, T) - fugliq(P0, T);
        return P0 + (0 - d0) * (P - P0) / (diff - d0);
      }
      lastDiff = diff;
      P += step;
      if (P > 3) break;
    }
    return null;
  }
  const Psat = findPsat(temp);

  // Generate data for plotting
  const nPoints = 100;
  const Pmin = 0.0;
  const Pmax = 3.0;
  const Pvals = [];
  const fugacityVapor = [];
  const fugacityLiquid = [];
  for (let i = 0; i < nPoints; i++) {
    const P = Pmin + (Pmax - Pmin) * i / (nPoints - 1);
    Pvals.push(P);
    if (Psat !== null && P < Psat) {
      fugacityVapor.push(fugvap(P, temp));
      fugacityLiquid.push(fugliq(P, temp));
    } else {
      fugacityVapor.push(fugliq(P, temp));
      fugacityLiquid.push(fugliq(P, temp));
    }
  }

  // Store for drawing
  window.state.fugacityPressureGraph = {
    Pvals,
    fugacityVapor,
    fugacityLiquid,
    Psat,
    temp,
    realGas
  };
}

// Helper to get current temperature in K from slider
function getCurrentTemperature() {
  // Slider is 0..1, maps to 458..483 for fugacity vs pressure
  const minT = 458;
  const maxT = 483;
  return minT + (maxT - minT) * window.state.sliderValue;
}