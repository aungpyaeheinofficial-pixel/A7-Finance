/**
 * Logic Engine - Deterministic Financial Calculations
 * This module handles all numerical analysis before AI explanation
 * No AI is involved in these calculations - pure deterministic logic
 */

export interface FinancialData {
  revenue?: number[];
  costs?: number[];
  expenses?: number[];
  assets?: number;
  liabilities?: number;
  equity?: number;
  netIncome?: number;
  investment?: number;
  periods?: string[];
  cashInflows?: number[];
  cashOutflows?: number[];
}

export interface CalculationResult {
  type: string;
  value: number | string;
  breakdown?: Record<string, number | string>;
  trend?: 'up' | 'down' | 'stable';
  interpretation?: string;
}

export interface AnalysisOutput {
  calculations: CalculationResult[];
  summary: string;
  assumptions: string[];
  dataUsed: Record<string, any>;
}

// ============ PROFIT & LOSS CALCULATIONS ============

export function calculateProfit(revenue: number, costs: number): CalculationResult {
  const profit = revenue - costs;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  
  return {
    type: 'profit',
    value: profit,
    breakdown: {
      revenue,
      costs,
      profitMargin: `${margin.toFixed(2)}%`
    },
    trend: profit > 0 ? 'up' : profit < 0 ? 'down' : 'stable',
    interpretation: profit > 0 
      ? `အမြတ်ငွေ ${formatMMK(profit)} ရရှိပါသည်` 
      : `အရှုံးငွေ ${formatMMK(Math.abs(profit))} ဖြစ်ပါသည်`
  };
}

export function calculateGrossProfit(revenue: number, cogs: number): CalculationResult {
  const grossProfit = revenue - cogs;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  
  return {
    type: 'grossProfit',
    value: grossProfit,
    breakdown: {
      revenue,
      costOfGoodsSold: cogs,
      grossMargin: `${grossMargin.toFixed(2)}%`
    },
    interpretation: `Gross Profit Margin: ${grossMargin.toFixed(2)}%`
  };
}

export function calculateNetProfit(
  revenue: number, 
  cogs: number, 
  operatingExpenses: number, 
  taxes: number = 0
): CalculationResult {
  const grossProfit = revenue - cogs;
  const operatingProfit = grossProfit - operatingExpenses;
  const netProfit = operatingProfit - taxes;
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  
  return {
    type: 'netProfit',
    value: netProfit,
    breakdown: {
      revenue,
      costOfGoodsSold: cogs,
      grossProfit,
      operatingExpenses,
      operatingProfit,
      taxes,
      netProfitMargin: `${netMargin.toFixed(2)}%`
    },
    trend: netProfit > 0 ? 'up' : netProfit < 0 ? 'down' : 'stable',
    interpretation: `အသားတင်အမြတ် ${formatMMK(netProfit)} (${netMargin.toFixed(2)}%)`
  };
}

// ============ CASH FLOW ANALYSIS ============

export function calculateCashFlow(inflows: number[], outflows: number[]): CalculationResult {
  const totalInflow = inflows.reduce((a, b) => a + b, 0);
  const totalOutflow = outflows.reduce((a, b) => a + b, 0);
  const netCashFlow = totalInflow - totalOutflow;
  
  return {
    type: 'cashFlow',
    value: netCashFlow,
    breakdown: {
      totalInflows: totalInflow,
      totalOutflows: totalOutflow,
      periods: inflows.length
    },
    trend: netCashFlow > 0 ? 'up' : netCashFlow < 0 ? 'down' : 'stable',
    interpretation: netCashFlow >= 0 
      ? `ငွေသားစီးဆင်းမှု အပေါင်း ${formatMMK(netCashFlow)}`
      : `ငွေသားစီးဆင်းမှု အနှုတ် ${formatMMK(Math.abs(netCashFlow))}`
  };
}

export function calculateOperatingCashFlow(
  netIncome: number,
  depreciation: number,
  changeInWorkingCapital: number
): CalculationResult {
  const ocf = netIncome + depreciation - changeInWorkingCapital;
  
  return {
    type: 'operatingCashFlow',
    value: ocf,
    breakdown: {
      netIncome,
      depreciation,
      changeInWorkingCapital,
    },
    interpretation: `လုပ်ငန်းလည်ပတ်မှုမှ ငွေသားစီးဆင်းမှု: ${formatMMK(ocf)}`
  };
}

// ============ FINANCIAL RATIOS ============

export function calculateROI(gain: number, investment: number): CalculationResult {
  const roi = investment > 0 ? ((gain - investment) / investment) * 100 : 0;
  
  return {
    type: 'roi',
    value: roi,
    breakdown: {
      totalGain: gain,
      initialInvestment: investment,
      netReturn: gain - investment
    },
    trend: roi > 0 ? 'up' : roi < 0 ? 'down' : 'stable',
    interpretation: `ရင်းနှီးမြုပ်နှံမှု အကျိုးအမြတ် (ROI): ${roi.toFixed(2)}%`
  };
}

export function calculateROE(netIncome: number, shareholderEquity: number): CalculationResult {
  const roe = shareholderEquity > 0 ? (netIncome / shareholderEquity) * 100 : 0;
  
  return {
    type: 'roe',
    value: roe,
    breakdown: {
      netIncome,
      shareholderEquity
    },
    interpretation: `Return on Equity (ROE): ${roe.toFixed(2)}%`
  };
}

export function calculateROA(netIncome: number, totalAssets: number): CalculationResult {
  const roa = totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0;
  
  return {
    type: 'roa',
    value: roa,
    breakdown: {
      netIncome,
      totalAssets
    },
    interpretation: `Return on Assets (ROA): ${roa.toFixed(2)}%`
  };
}

export function calculateCurrentRatio(currentAssets: number, currentLiabilities: number): CalculationResult {
  const ratio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
  
  let health = 'adequate';
  if (ratio < 1) health = 'risky';
  else if (ratio > 2) health = 'strong';
  
  return {
    type: 'currentRatio',
    value: ratio,
    breakdown: {
      currentAssets,
      currentLiabilities,
      healthIndicator: health
    },
    interpretation: `ကာလတို အချိုးအစား: ${ratio.toFixed(2)} (${health === 'risky' ? 'စိုးရိမ်ဖွယ်' : health === 'strong' ? 'ကောင်းမွန်' : 'လုံလောက်'})`
  };
}

export function calculateDebtToEquity(totalDebt: number, totalEquity: number): CalculationResult {
  const ratio = totalEquity > 0 ? totalDebt / totalEquity : 0;
  
  return {
    type: 'debtToEquity',
    value: ratio,
    breakdown: {
      totalDebt,
      totalEquity
    },
    trend: ratio > 1 ? 'down' : 'stable',
    interpretation: `အကြွေး/အရင်း အချိုး: ${ratio.toFixed(2)}`
  };
}

// ============ BREAK-EVEN ANALYSIS ============

export function calculateBreakEven(
  fixedCosts: number, 
  pricePerUnit: number, 
  variableCostPerUnit: number
): CalculationResult {
  const contributionMargin = pricePerUnit - variableCostPerUnit;
  const breakEvenUnits = contributionMargin > 0 ? fixedCosts / contributionMargin : 0;
  const breakEvenRevenue = breakEvenUnits * pricePerUnit;
  
  return {
    type: 'breakEven',
    value: breakEvenUnits,
    breakdown: {
      fixedCosts,
      pricePerUnit,
      variableCostPerUnit,
      contributionMargin,
      breakEvenUnits: Math.ceil(breakEvenUnits),
      breakEvenRevenue
    },
    interpretation: `အရှုံးအမြတ်မရှိ အရေအတွက်: ${Math.ceil(breakEvenUnits)} ယူနစ် (${formatMMK(breakEvenRevenue)})`
  };
}

// ============ GROWTH & TREND ANALYSIS ============

export function calculateGrowthRate(current: number, previous: number): CalculationResult {
  const growthRate = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  
  return {
    type: 'growthRate',
    value: growthRate,
    breakdown: {
      currentPeriod: current,
      previousPeriod: previous,
      absoluteChange: current - previous
    },
    trend: growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'stable',
    interpretation: `တိုးတက်မှုနှုန်း: ${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(2)}%`
  };
}

export function calculateCAGR(
  beginningValue: number, 
  endingValue: number, 
  years: number
): CalculationResult {
  const cagr = years > 0 && beginningValue > 0 
    ? (Math.pow(endingValue / beginningValue, 1 / years) - 1) * 100 
    : 0;
  
  return {
    type: 'cagr',
    value: cagr,
    breakdown: {
      beginningValue,
      endingValue,
      years
    },
    trend: cagr > 0 ? 'up' : cagr < 0 ? 'down' : 'stable',
    interpretation: `နှစ်စဉ်ပျမ်းမျှ တိုးတက်မှုနှုန်း (CAGR): ${cagr.toFixed(2)}%`
  };
}

export function analyzeTrend(values: number[], periods?: string[]): CalculationResult {
  if (values.length < 2) {
    return {
      type: 'trend',
      value: 0,
      interpretation: 'ခွဲခြမ်းစိတ်ဖြာရန် လုံလောက်သောဒေတာ မရှိပါ'
    };
  }
  
  // Calculate period-over-period changes
  const changes: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const change = values[i - 1] > 0 
      ? ((values[i] - values[i - 1]) / values[i - 1]) * 100 
      : 0;
    changes.push(change);
  }
  
  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const totalChange = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  
  // Determine trend direction
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (avgChange > 2) trend = 'up';
  else if (avgChange < -2) trend = 'down';
  
  return {
    type: 'trend',
    value: avgChange,
    breakdown: {
      startValue: firstValue,
      endValue: lastValue,
      totalChangePercent: `${totalChange.toFixed(2)}%`,
      averageChangePercent: `${avgChange.toFixed(2)}%`,
      periodCount: values.length,
      periodChanges: changes.map(c => `${c.toFixed(2)}%`)
    },
    trend,
    interpretation: trend === 'up' 
      ? `တိုးတက်မှု လမ်းကြောင်း (ပျမ်းမျှ +${avgChange.toFixed(2)}% တိုးတက်)`
      : trend === 'down'
      ? `ကျဆင်းမှု လမ်းကြောင်း (ပျမ်းမျှ ${avgChange.toFixed(2)}% ကျဆင်း)`
      : `တည်ငြိမ်မှု လမ်းကြောင်း (ပျမ်းမျှ ${avgChange.toFixed(2)}%)`
  };
}

// ============ COST VS REVENUE ANALYSIS ============

export function analyzeRevenueVsCost(
  revenues: number[], 
  costs: number[], 
  periods?: string[]
): CalculationResult {
  const totalRevenue = revenues.reduce((a, b) => a + b, 0);
  const totalCost = costs.reduce((a, b) => a + b, 0);
  const totalProfit = totalRevenue - totalCost;
  const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  
  // Period-by-period analysis
  const periodAnalysis = revenues.map((rev, i) => ({
    period: periods?.[i] || `Period ${i + 1}`,
    revenue: rev,
    cost: costs[i] || 0,
    profit: rev - (costs[i] || 0),
    margin: rev > 0 ? (((rev - (costs[i] || 0)) / rev) * 100).toFixed(2) + '%' : '0%'
  }));
  
  return {
    type: 'revenueVsCost',
    value: totalProfit,
    breakdown: {
      totalRevenue,
      totalCost,
      totalProfit,
      overallMargin: `${overallMargin.toFixed(2)}%`,
      periodCount: revenues.length,
      periodDetails: periodAnalysis
    },
    trend: totalProfit > 0 ? 'up' : totalProfit < 0 ? 'down' : 'stable',
    interpretation: `စုစုပေါင်း အမြတ်: ${formatMMK(totalProfit)} (${overallMargin.toFixed(2)}% Margin)`
  };
}

// ============ HELPER FUNCTIONS ============

export function formatMMK(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(2)} ဘီလီယံ ကျပ်`;
  } else if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)} သန်း ကျပ်`;
  } else if (Math.abs(amount) >= 100_000) {
    return `${(amount / 100_000).toFixed(2)} သိန်း ကျပ်`;
  }
  return `${amount.toLocaleString()} ကျပ်`;
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(amount);
}

// ============ MAIN ANALYSIS ORCHESTRATOR ============

export interface AnalysisRequest {
  type: 'profit' | 'cashflow' | 'ratio' | 'growth' | 'breakeven' | 'trend' | 'comparison';
  data: FinancialData;
  options?: Record<string, any>;
}

export function runAnalysis(request: AnalysisRequest): AnalysisOutput {
  const calculations: CalculationResult[] = [];
  const assumptions: string[] = [];
  
  switch (request.type) {
    case 'profit':
      if (request.data.revenue && request.data.costs) {
        const totalRev = Array.isArray(request.data.revenue) 
          ? request.data.revenue.reduce((a, b) => a + b, 0) 
          : request.data.revenue;
        const totalCost = Array.isArray(request.data.costs) 
          ? request.data.costs.reduce((a, b) => a + b, 0) 
          : request.data.costs;
        
        calculations.push(calculateProfit(totalRev, totalCost));
        
        if (request.data.expenses) {
          const totalExp = Array.isArray(request.data.expenses)
            ? request.data.expenses.reduce((a, b) => a + b, 0)
            : request.data.expenses;
          calculations.push(calculateNetProfit(totalRev, totalCost, totalExp));
        }
      } else {
        assumptions.push('ဝင်ငွေနှင့် ကုန်ကျစရိတ် ဒေတာ မပြည့်စုံပါ');
      }
      break;
      
    case 'cashflow':
      if (request.data.cashInflows && request.data.cashOutflows) {
        calculations.push(calculateCashFlow(
          request.data.cashInflows, 
          request.data.cashOutflows
        ));
      }
      break;
      
    case 'ratio':
      if (request.data.netIncome && request.data.investment) {
        calculations.push(calculateROI(request.data.netIncome, request.data.investment));
      }
      if (request.data.netIncome && request.data.equity) {
        calculations.push(calculateROE(request.data.netIncome, request.data.equity));
      }
      if (request.data.netIncome && request.data.assets) {
        calculations.push(calculateROA(request.data.netIncome, request.data.assets));
      }
      if (request.data.liabilities && request.data.equity) {
        calculations.push(calculateDebtToEquity(request.data.liabilities, request.data.equity));
      }
      break;
      
    case 'growth':
      if (request.data.revenue && Array.isArray(request.data.revenue) && request.data.revenue.length >= 2) {
        const revs = request.data.revenue;
        calculations.push(calculateGrowthRate(revs[revs.length - 1], revs[revs.length - 2]));
        
        if (revs.length >= 3) {
          calculations.push(calculateCAGR(revs[0], revs[revs.length - 1], revs.length - 1));
        }
      }
      break;
      
    case 'trend':
      if (request.data.revenue && Array.isArray(request.data.revenue)) {
        calculations.push(analyzeTrend(request.data.revenue, request.data.periods));
      }
      if (request.data.costs && Array.isArray(request.data.costs)) {
        const costTrend = analyzeTrend(request.data.costs, request.data.periods);
        costTrend.type = 'costTrend';
        calculations.push(costTrend);
      }
      break;
      
    case 'comparison':
      if (request.data.revenue && request.data.costs) {
        const revs = Array.isArray(request.data.revenue) ? request.data.revenue : [request.data.revenue];
        const costs = Array.isArray(request.data.costs) ? request.data.costs : [request.data.costs];
        calculations.push(analyzeRevenueVsCost(revs, costs, request.data.periods));
      }
      break;
  }
  
  // Generate summary
  const summary = calculations.length > 0
    ? calculations.map(c => c.interpretation).filter(Boolean).join('\n')
    : 'ခွဲခြမ်းစိတ်ဖြာရန် လုံလောက်သောဒေတာ မရှိပါ။ ကျေးဇူးပြု၍ လိုအပ်သည့် ဘဏ္ဍာရေးဒေတာများ ပေးပါ။';
  
  return {
    calculations,
    summary,
    assumptions,
    dataUsed: request.data
  };
}

// Export all functions for direct use
export default {
  calculateProfit,
  calculateGrossProfit,
  calculateNetProfit,
  calculateCashFlow,
  calculateOperatingCashFlow,
  calculateROI,
  calculateROE,
  calculateROA,
  calculateCurrentRatio,
  calculateDebtToEquity,
  calculateBreakEven,
  calculateGrowthRate,
  calculateCAGR,
  analyzeTrend,
  analyzeRevenueVsCost,
  formatMMK,
  formatUSD,
  runAnalysis
};

