import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export interface StockInfo {
  股票代码?: string;
  股票简称?: string;
  行业?: string;
  总股本?: string;
  流通股本?: string;
  市值?: string;
}

export interface FinancialData {
  roe?: number;
  gross_margin?: number;
  net_margin?: number;
  debt_ratio?: number;
}

export interface ValuationData {
  pe?: number;
  pb?: number;
  ps?: number;
  total_mv?: number;
  circ_mv?: number;
}

export interface IndustryInfo {
  industry?: string;
  avg_pe?: number;
}

export interface StockAnalysis {
  info: StockInfo;
  financial: FinancialData;
  valuation: ValuationData;
  industry: IndustryInfo;
  revenue?: { revenue?: number; net_profit?: number };
}

export class AKShareService {
  private scriptPath: string;

  constructor() {
    this.scriptPath = path.join(__dirname, '../../scripts/akshare_service.py');
  }

  private runPython(action: string, params: Record<string, any> = {}): any {
    try {
      const args = JSON.stringify(params);
      const cmd = `python3 "${this.scriptPath}" ${action} '${args}'`;
      const output = execSync(cmd, { encoding: 'utf-8', timeout: 30000 });
      return JSON.parse(output);
    } catch (error: any) {
      console.error(`AKShare API error (${action}):`, error.message);
      return { error: error.message };
    }
  }

  getStockInfo(code: string): StockInfo {
    return this.runPython('stock_info', { code });
  }

  getFinancialData(code: string): FinancialData {
    return this.runPython('financial', { code });
  }

  getValuation(code: string): ValuationData {
    return this.runPython('valuation', { code });
  }

  getIndustryInfo(code: string): IndustryInfo {
    return this.runPython('industry', { code });
  }

  getRevenueProfit(code: string): { revenue?: number; net_profit?: number } {
    return this.runPython('revenue', { code });
  }

  getFullAnalysis(code: string): StockAnalysis {
    const [info, financial, valuation, industry, revenue] = [
      this.getStockInfo(code),
      this.getFinancialData(code),
      this.getValuation(code),
      this.getIndustryInfo(code),
      this.getRevenueProfit(code),
    ];

    return { info, financial, valuation, industry, revenue };
  }

  formatForDisplay(analysis: StockAnalysis): string {
    const lines: string[] = [];

    if (analysis.valuation) {
      const v = analysis.valuation;
      lines.push('【估值指标】');
      if (v.pe) lines.push(`市盈率(PE): ${v.pe.toFixed(2)}`);
      if (v.pb) lines.push(`市净率(PB): ${v.pb.toFixed(2)}`);
      if (v.ps) lines.push(`市销率(PS): ${v.ps.toFixed(2)}`);
      if (v.total_mv) lines.push(`总市值: ${(v.total_mv / 100000000).toFixed(2)}亿`);
      if (v.circ_mv) lines.push(`流通市值: ${(v.circ_mv / 100000000).toFixed(2)}亿`);
    }

    if (analysis.financial) {
      const f = analysis.financial;
      lines.push('');
      lines.push('【财务指标】');
      if (f.roe !== undefined) lines.push(`净资产收益率(ROE): ${f.roe?.toFixed(2) || 'N/A'}%`);
      if (f.gross_margin !== undefined) lines.push(`毛利率: ${f.gross_margin?.toFixed(2) || 'N/A'}%`);
      if (f.net_margin !== undefined) lines.push(`净利率: ${f.net_margin?.toFixed(2) || 'N/A'}%`);
      if (f.debt_ratio !== undefined) lines.push(`资产负债率: ${f.debt_ratio?.toFixed(2) || 'N/A'}%`);
    }

    if (analysis.industry) {
      const i = analysis.industry;
      lines.push('');
      lines.push('【行业信息】');
      if (i.industry) lines.push(`所属行业: ${i.industry}`);
      if (i.avg_pe) lines.push(`行业平均PE: ${i.avg_pe.toFixed(2)}`);
    }

    if (analysis.revenue) {
      const r = analysis.revenue;
      lines.push('');
      lines.push('【营收利润】');
      if (r.revenue) lines.push(`营业收入: ${r.revenue.toFixed(2)}亿`);
      if (r.net_profit) lines.push(`净利润: ${r.net_profit.toFixed(2)}亿`);
    }

    return lines.join('\n');
  }
}

export const akshareService = new AKShareService();
