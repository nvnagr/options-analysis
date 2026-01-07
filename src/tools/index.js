/**
 * MCP Tools for Options Analysis
 */

import { etradeClient } from '../etrade/client.js';
import { calculateGreeks, calculateImpliedVolatility } from '../analysis/greeks.js';
import {
  strategies,
  analyzeStrategy,
  calculateStrategyPL,
  generatePriceRange,
} from '../analysis/strategies.js';

export const tools = [
  // === E*TRADE Data Tools ===
  {
    name: 'get_options_chain',
    description: 'Fetch the options chain for a stock symbol from E*TRADE. Returns calls and puts with strikes, premiums, and greeks.',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock ticker symbol (e.g., AAPL, TSLA)',
        },
        expiryDate: {
          type: 'string',
          description: 'Optional expiry date in YYYY-MM-DD format',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_option_expiries',
    description: 'Get available option expiration dates for a symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock ticker symbol',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_quote',
    description: 'Get current stock quote(s) from E*TRADE',
    inputSchema: {
      type: 'object',
      properties: {
        symbols: {
          type: 'string',
          description: 'Comma-separated list of symbols (e.g., "AAPL,TSLA,MSFT")',
        },
      },
      required: ['symbols'],
    },
  },
  {
    name: 'get_accounts',
    description: 'Get list of E*TRADE accounts',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_positions',
    description: 'Get current positions for an E*TRADE account',
    inputSchema: {
      type: 'object',
      properties: {
        accountIdKey: {
          type: 'string',
          description: 'Account ID key from get_accounts',
        },
      },
      required: ['accountIdKey'],
    },
  },

  // === Greeks Calculation Tools ===
  {
    name: 'calculate_greeks',
    description: 'Calculate option Greeks (Delta, Gamma, Theta, Vega, Rho) using Black-Scholes model',
    inputSchema: {
      type: 'object',
      properties: {
        spotPrice: {
          type: 'number',
          description: 'Current stock price',
        },
        strikePrice: {
          type: 'number',
          description: 'Option strike price',
        },
        timeToExpiry: {
          type: 'number',
          description: 'Time to expiration in years (e.g., 0.25 for 3 months)',
        },
        volatility: {
          type: 'number',
          description: 'Implied volatility as decimal (e.g., 0.25 for 25%)',
        },
        optionType: {
          type: 'string',
          enum: ['call', 'put'],
          description: 'Option type',
        },
        riskFreeRate: {
          type: 'number',
          description: 'Risk-free rate as decimal (default 0.05)',
        },
      },
      required: ['spotPrice', 'strikePrice', 'timeToExpiry', 'volatility', 'optionType'],
    },
  },
  {
    name: 'calculate_implied_volatility',
    description: 'Calculate implied volatility from option price',
    inputSchema: {
      type: 'object',
      properties: {
        optionPrice: {
          type: 'number',
          description: 'Current option price',
        },
        spotPrice: {
          type: 'number',
          description: 'Current stock price',
        },
        strikePrice: {
          type: 'number',
          description: 'Option strike price',
        },
        timeToExpiry: {
          type: 'number',
          description: 'Time to expiration in years',
        },
        optionType: {
          type: 'string',
          enum: ['call', 'put'],
          description: 'Option type',
        },
        riskFreeRate: {
          type: 'number',
          description: 'Risk-free rate as decimal (default 0.05)',
        },
      },
      required: ['optionPrice', 'spotPrice', 'strikePrice', 'timeToExpiry', 'optionType'],
    },
  },

  // === Strategy Analysis Tools ===
  {
    name: 'analyze_covered_call',
    description: 'Analyze a covered call strategy (long stock + short call)',
    inputSchema: {
      type: 'object',
      properties: {
        stockPrice: {
          type: 'number',
          description: 'Stock purchase price',
        },
        callStrike: {
          type: 'number',
          description: 'Call option strike price',
        },
        callPremium: {
          type: 'number',
          description: 'Premium received for selling the call',
        },
        expiry: {
          type: 'string',
          description: 'Expiration date (YYYY-MM-DD)',
        },
      },
      required: ['stockPrice', 'callStrike', 'callPremium', 'expiry'],
    },
  },
  {
    name: 'analyze_vertical_spread',
    description: 'Analyze a bull call spread or bear put spread',
    inputSchema: {
      type: 'object',
      properties: {
        spreadType: {
          type: 'string',
          enum: ['bull_call', 'bear_put'],
          description: 'Type of vertical spread',
        },
        lowerStrike: {
          type: 'number',
          description: 'Lower strike price',
        },
        lowerPremium: {
          type: 'number',
          description: 'Premium for lower strike option',
        },
        upperStrike: {
          type: 'number',
          description: 'Upper strike price',
        },
        upperPremium: {
          type: 'number',
          description: 'Premium for upper strike option',
        },
        spotPrice: {
          type: 'number',
          description: 'Current stock price',
        },
        expiry: {
          type: 'string',
          description: 'Expiration date (YYYY-MM-DD)',
        },
      },
      required: ['spreadType', 'lowerStrike', 'lowerPremium', 'upperStrike', 'upperPremium', 'spotPrice', 'expiry'],
    },
  },
  {
    name: 'analyze_iron_condor',
    description: 'Analyze an iron condor strategy',
    inputSchema: {
      type: 'object',
      properties: {
        putLowerStrike: { type: 'number', description: 'Lower put strike (long)' },
        putLowerPremium: { type: 'number', description: 'Premium for lower put' },
        putUpperStrike: { type: 'number', description: 'Upper put strike (short)' },
        putUpperPremium: { type: 'number', description: 'Premium for upper put' },
        callLowerStrike: { type: 'number', description: 'Lower call strike (short)' },
        callLowerPremium: { type: 'number', description: 'Premium for lower call' },
        callUpperStrike: { type: 'number', description: 'Upper call strike (long)' },
        callUpperPremium: { type: 'number', description: 'Premium for upper call' },
        spotPrice: { type: 'number', description: 'Current stock price' },
        expiry: { type: 'string', description: 'Expiration date (YYYY-MM-DD)' },
      },
      required: [
        'putLowerStrike', 'putLowerPremium', 'putUpperStrike', 'putUpperPremium',
        'callLowerStrike', 'callLowerPremium', 'callUpperStrike', 'callUpperPremium',
        'spotPrice', 'expiry',
      ],
    },
  },
  {
    name: 'analyze_straddle',
    description: 'Analyze a long straddle strategy (long call + long put at same strike)',
    inputSchema: {
      type: 'object',
      properties: {
        strike: { type: 'number', description: 'Strike price for both options' },
        callPremium: { type: 'number', description: 'Premium paid for call' },
        putPremium: { type: 'number', description: 'Premium paid for put' },
        spotPrice: { type: 'number', description: 'Current stock price' },
        expiry: { type: 'string', description: 'Expiration date (YYYY-MM-DD)' },
      },
      required: ['strike', 'callPremium', 'putPremium', 'spotPrice', 'expiry'],
    },
  },
  {
    name: 'calculate_pl_chart',
    description: 'Calculate profit/loss data points for charting a custom options position',
    inputSchema: {
      type: 'object',
      properties: {
        positions: {
          type: 'array',
          description: 'Array of position objects',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['stock', 'option'] },
              optionType: { type: 'string', enum: ['call', 'put'] },
              strike: { type: 'number' },
              premium: { type: 'number' },
              quantity: { type: 'number', description: 'Positive for long, negative for short' },
              expiry: { type: 'string' },
            },
          },
        },
        spotPrice: { type: 'number', description: 'Current stock price (center of price range)' },
        priceRangePercent: { type: 'number', description: 'Price range as decimal (default 0.2 = 20%)' },
      },
      required: ['positions', 'spotPrice'],
    },
  },
];

// Tool handler implementation
export async function handleToolCall(name, args) {
  switch (name) {
    // E*TRADE Data
    case 'get_options_chain': {
      let options = {};
      if (args.expiryDate) {
        // Parse YYYY-MM-DD format into individual components for E*TRADE API
        const [year, month, day] = args.expiryDate.split('-').map(Number);
        options = { expiryYear: year, expiryMonth: month, expiryDay: day };
      }
      return await etradeClient.getOptionsChain(args.symbol, options);
    }

    case 'get_option_expiries':
      return await etradeClient.getOptionExpiries(args.symbol);

    case 'get_quote':
      return await etradeClient.getQuote(args.symbols);

    case 'get_accounts':
      return await etradeClient.getAccounts();

    case 'get_positions':
      return await etradeClient.getPositions(args.accountIdKey);

    // Greeks Calculation
    case 'calculate_greeks':
      return calculateGreeks({
        spotPrice: args.spotPrice,
        strikePrice: args.strikePrice,
        timeToExpiry: args.timeToExpiry,
        volatility: args.volatility,
        optionType: args.optionType,
        riskFreeRate: args.riskFreeRate || 0.05,
      });

    case 'calculate_implied_volatility':
      return {
        impliedVolatility: calculateImpliedVolatility({
          optionPrice: args.optionPrice,
          spotPrice: args.spotPrice,
          strikePrice: args.strikePrice,
          timeToExpiry: args.timeToExpiry,
          optionType: args.optionType,
          riskFreeRate: args.riskFreeRate || 0.05,
        }),
      };

    // Strategy Analysis
    case 'analyze_covered_call': {
      const positions = strategies.coveredCall(
        args.stockPrice, args.callStrike, args.callPremium, args.expiry
      );
      return analyzeStrategy(positions, args.stockPrice, args.expiry);
    }

    case 'analyze_vertical_spread': {
      const positions = args.spreadType === 'bull_call'
        ? strategies.bullCallSpread(
            args.lowerStrike, args.lowerPremium,
            args.upperStrike, args.upperPremium, args.expiry
          )
        : strategies.bearPutSpread(
            args.lowerStrike, args.lowerPremium,
            args.upperStrike, args.upperPremium, args.expiry
          );
      return analyzeStrategy(positions, args.spotPrice, args.expiry);
    }

    case 'analyze_iron_condor': {
      const positions = strategies.ironCondor(
        args.putLowerStrike, args.putLowerPremium,
        args.putUpperStrike, args.putUpperPremium,
        args.callLowerStrike, args.callLowerPremium,
        args.callUpperStrike, args.callUpperPremium,
        args.expiry
      );
      return analyzeStrategy(positions, args.spotPrice, args.expiry);
    }

    case 'analyze_straddle': {
      const positions = strategies.longStraddle(
        args.strike, args.callPremium, args.putPremium, args.expiry
      );
      return analyzeStrategy(positions, args.spotPrice, args.expiry);
    }

    case 'calculate_pl_chart': {
      const priceRange = generatePriceRange(
        args.spotPrice,
        args.priceRangePercent || 0.2,
        50
      );
      return {
        priceRange,
        plData: calculateStrategyPL(args.positions, priceRange, new Date(args.positions[0]?.expiry)),
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
