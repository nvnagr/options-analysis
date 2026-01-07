/**
 * Options Greeks Calculator
 * Uses Black-Scholes model for European-style options
 */

// Standard normal cumulative distribution function
function normalCDF(x) {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

// Standard normal probability density function
function normalPDF(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * Calculate d1 and d2 for Black-Scholes
 */
function calculateD1D2(S, K, T, r, sigma) {
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  return { d1, d2 };
}

/**
 * Calculate all Greeks for an option
 * @param {Object} params
 * @param {number} params.spotPrice - Current stock price (S)
 * @param {number} params.strikePrice - Option strike price (K)
 * @param {number} params.timeToExpiry - Time to expiration in years (T)
 * @param {number} params.riskFreeRate - Risk-free interest rate (r), e.g., 0.05 for 5%
 * @param {number} params.volatility - Implied volatility (sigma), e.g., 0.20 for 20%
 * @param {string} params.optionType - 'call' or 'put'
 * @returns {Object} Greeks: delta, gamma, theta, vega, rho, and theoretical price
 */
export function calculateGreeks({
  spotPrice,
  strikePrice,
  timeToExpiry,
  riskFreeRate = 0.05,
  volatility,
  optionType = 'call',
}) {
  const S = spotPrice;
  const K = strikePrice;
  const T = timeToExpiry;
  const r = riskFreeRate;
  const sigma = volatility;

  // Handle edge case: expired option
  if (T <= 0) {
    const intrinsicValue = optionType === 'call'
      ? Math.max(0, S - K)
      : Math.max(0, K - S);
    return {
      price: intrinsicValue,
      delta: optionType === 'call' ? (S > K ? 1 : 0) : (S < K ? -1 : 0),
      gamma: 0,
      theta: 0,
      vega: 0,
      rho: 0,
    };
  }

  const { d1, d2 } = calculateD1D2(S, K, T, r, sigma);
  const sqrtT = Math.sqrt(T);
  const expRT = Math.exp(-r * T);

  let price, delta, rho;

  if (optionType === 'call') {
    price = S * normalCDF(d1) - K * expRT * normalCDF(d2);
    delta = normalCDF(d1);
    rho = K * T * expRT * normalCDF(d2) / 100;
  } else {
    price = K * expRT * normalCDF(-d2) - S * normalCDF(-d1);
    delta = normalCDF(d1) - 1;
    rho = -K * T * expRT * normalCDF(-d2) / 100;
  }

  // Gamma (same for calls and puts)
  const gamma = normalPDF(d1) / (S * sigma * sqrtT);

  // Theta (per day, divide by 365)
  const thetaAnnual = optionType === 'call'
    ? -(S * normalPDF(d1) * sigma) / (2 * sqrtT) - r * K * expRT * normalCDF(d2)
    : -(S * normalPDF(d1) * sigma) / (2 * sqrtT) + r * K * expRT * normalCDF(-d2);
  const theta = thetaAnnual / 365;

  // Vega (per 1% change in volatility)
  const vega = S * sqrtT * normalPDF(d1) / 100;

  return {
    price: Math.round(price * 100) / 100,
    delta: Math.round(delta * 1000) / 1000,
    gamma: Math.round(gamma * 10000) / 10000,
    theta: Math.round(theta * 100) / 100,
    vega: Math.round(vega * 100) / 100,
    rho: Math.round(rho * 100) / 100,
  };
}

/**
 * Calculate implied volatility using Newton-Raphson method
 */
export function calculateImpliedVolatility({
  optionPrice,
  spotPrice,
  strikePrice,
  timeToExpiry,
  riskFreeRate = 0.05,
  optionType = 'call',
  maxIterations = 100,
  tolerance = 0.0001,
}) {
  let sigma = 0.2; // Initial guess

  for (let i = 0; i < maxIterations; i++) {
    const result = calculateGreeks({
      spotPrice,
      strikePrice,
      timeToExpiry,
      riskFreeRate,
      volatility: sigma,
      optionType,
    });

    const priceDiff = result.price - optionPrice;

    if (Math.abs(priceDiff) < tolerance) {
      return Math.round(sigma * 10000) / 10000;
    }

    // Vega is the derivative of price with respect to volatility
    const vega = result.vega * 100; // Convert back from percentage
    if (vega === 0) break;

    sigma = sigma - priceDiff / vega;

    // Keep sigma reasonable
    if (sigma <= 0) sigma = 0.01;
    if (sigma > 5) sigma = 5;
  }

  return Math.round(sigma * 10000) / 10000;
}
