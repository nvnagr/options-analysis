/**
 * Options Strategy Analyzer
 * Calculates P&L for common options strategies
 */

import { calculateGreeks } from './greeks.js';

/**
 * Calculate P&L for a position at a given stock price
 */
function calculatePositionPL(position, stockPrice, currentDate = new Date()) {
  const { type, strike, premium, quantity, expiry, optionType } = position;

  if (type === 'stock') {
    return (stockPrice - premium) * quantity;
  }

  // Calculate time to expiry in years
  const expiryDate = new Date(expiry);
  const timeToExpiry = Math.max(0, (expiryDate - currentDate) / (365 * 24 * 60 * 60 * 1000));

  if (timeToExpiry <= 0) {
    // At expiration
    let intrinsicValue = 0;
    if (optionType === 'call') {
      intrinsicValue = Math.max(0, stockPrice - strike);
    } else {
      intrinsicValue = Math.max(0, strike - stockPrice);
    }
    return (intrinsicValue - premium) * quantity * 100;
  }

  // Before expiration - would need IV to calculate current value
  // For now, return intrinsic value minus premium
  let intrinsicValue = 0;
  if (optionType === 'call') {
    intrinsicValue = Math.max(0, stockPrice - strike);
  } else {
    intrinsicValue = Math.max(0, strike - stockPrice);
  }
  return (intrinsicValue - premium) * quantity * 100;
}

/**
 * Calculate total P&L for a strategy across a range of prices
 */
export function calculateStrategyPL(positions, priceRange, currentDate = new Date()) {
  return priceRange.map(price => {
    const totalPL = positions.reduce((sum, position) => {
      return sum + calculatePositionPL(position, price, currentDate);
    }, 0);
    return { price, pl: Math.round(totalPL * 100) / 100 };
  });
}

/**
 * Generate price range for analysis
 */
export function generatePriceRange(centerPrice, percentRange = 0.2, steps = 50) {
  const minPrice = centerPrice * (1 - percentRange);
  const maxPrice = centerPrice * (1 + percentRange);
  const stepSize = (maxPrice - minPrice) / steps;

  return Array.from({ length: steps + 1 }, (_, i) => {
    return Math.round((minPrice + i * stepSize) * 100) / 100;
  });
}

/**
 * Pre-built strategy constructors
 */
export const strategies = {
  // Long Call
  longCall(strike, premium, expiry) {
    return [{
      type: 'option',
      optionType: 'call',
      strike,
      premium,
      quantity: 1,
      expiry,
    }];
  },

  // Long Put
  longPut(strike, premium, expiry) {
    return [{
      type: 'option',
      optionType: 'put',
      strike,
      premium,
      quantity: 1,
      expiry,
    }];
  },

  // Covered Call: Long stock + short call
  coveredCall(stockPrice, callStrike, callPremium, expiry) {
    return [
      { type: 'stock', premium: stockPrice, quantity: 100 },
      { type: 'option', optionType: 'call', strike: callStrike, premium: callPremium, quantity: -1, expiry },
    ];
  },

  // Bull Call Spread: Long lower strike call + short higher strike call
  bullCallSpread(lowerStrike, lowerPremium, upperStrike, upperPremium, expiry) {
    return [
      { type: 'option', optionType: 'call', strike: lowerStrike, premium: lowerPremium, quantity: 1, expiry },
      { type: 'option', optionType: 'call', strike: upperStrike, premium: upperPremium, quantity: -1, expiry },
    ];
  },

  // Bear Put Spread: Long higher strike put + short lower strike put
  bearPutSpread(lowerStrike, lowerPremium, upperStrike, upperPremium, expiry) {
    return [
      { type: 'option', optionType: 'put', strike: upperStrike, premium: upperPremium, quantity: 1, expiry },
      { type: 'option', optionType: 'put', strike: lowerStrike, premium: lowerPremium, quantity: -1, expiry },
    ];
  },

  // Straddle: Long call + long put at same strike
  longStraddle(strike, callPremium, putPremium, expiry) {
    return [
      { type: 'option', optionType: 'call', strike, premium: callPremium, quantity: 1, expiry },
      { type: 'option', optionType: 'put', strike, premium: putPremium, quantity: 1, expiry },
    ];
  },

  // Strangle: Long OTM call + long OTM put
  longStrangle(putStrike, putPremium, callStrike, callPremium, expiry) {
    return [
      { type: 'option', optionType: 'put', strike: putStrike, premium: putPremium, quantity: 1, expiry },
      { type: 'option', optionType: 'call', strike: callStrike, premium: callPremium, quantity: 1, expiry },
    ];
  },

  // Iron Condor: Bull put spread + bear call spread
  ironCondor(putLower, putLowerPrem, putUpper, putUpperPrem, callLower, callLowerPrem, callUpper, callUpperPrem, expiry) {
    return [
      // Bull put spread (credit)
      { type: 'option', optionType: 'put', strike: putLower, premium: putLowerPrem, quantity: 1, expiry },
      { type: 'option', optionType: 'put', strike: putUpper, premium: putUpperPrem, quantity: -1, expiry },
      // Bear call spread (credit)
      { type: 'option', optionType: 'call', strike: callLower, premium: callLowerPrem, quantity: -1, expiry },
      { type: 'option', optionType: 'call', strike: callUpper, premium: callUpperPrem, quantity: 1, expiry },
    ];
  },

  // Butterfly Spread
  butterflySpread(lowerStrike, lowerPrem, middleStrike, middlePrem, upperStrike, upperPrem, expiry, optionType = 'call') {
    return [
      { type: 'option', optionType, strike: lowerStrike, premium: lowerPrem, quantity: 1, expiry },
      { type: 'option', optionType, strike: middleStrike, premium: middlePrem, quantity: -2, expiry },
      { type: 'option', optionType, strike: upperStrike, premium: upperPrem, quantity: 1, expiry },
    ];
  },
};

/**
 * Analyze a strategy and return key metrics
 */
export function analyzeStrategy(positions, spotPrice, expiry) {
  const priceRange = generatePriceRange(spotPrice, 0.3, 100);
  const plData = calculateStrategyPL(positions, priceRange, new Date(expiry));

  // Find max profit, max loss, breakeven points
  let maxProfit = -Infinity;
  let maxLoss = Infinity;
  const breakevenPoints = [];

  for (let i = 0; i < plData.length; i++) {
    const { price, pl } = plData[i];
    if (pl > maxProfit) maxProfit = pl;
    if (pl < maxLoss) maxLoss = pl;

    // Check for breakeven (P&L crosses zero)
    if (i > 0) {
      const prevPL = plData[i - 1].pl;
      if ((prevPL < 0 && pl >= 0) || (prevPL > 0 && pl <= 0)) {
        breakevenPoints.push(price);
      }
    }
  }

  // Calculate net premium (cost or credit)
  const netPremium = positions.reduce((sum, pos) => {
    if (pos.type === 'option') {
      return sum + pos.premium * pos.quantity * 100;
    }
    return sum;
  }, 0);

  return {
    maxProfit: maxProfit === Infinity ? 'Unlimited' : Math.round(maxProfit * 100) / 100,
    maxLoss: maxLoss === -Infinity ? 'Unlimited' : Math.round(maxLoss * 100) / 100,
    breakevenPoints: breakevenPoints.map(p => Math.round(p * 100) / 100),
    netPremium: Math.round(netPremium * 100) / 100,
    plData,
  };
}
