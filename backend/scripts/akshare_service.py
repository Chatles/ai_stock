#!/usr/bin/env python3
"""
AKShare数据服务 - 通过Python封装AKShare获取金融数据
用法: python akshare_service.py <action> <params_json>
"""

import sys
import json
import subprocess
import os

def run_akshare():
    """运行AKShare命令"""
    try:
        import akshare as ak
        return ak
    except ImportError:
        print(json.dumps({"error": "请先安装akshare: pip install akshare"}))
        sys.exit(1)

def get_stock_info(code):
    """获取股票基本信息"""
    try:
        import akshare as ak
        df = ak.stock_individual_info_em(symbol=code)
        result = {}
        for _, row in df.iterrows():
            result[row['item']] = row['value']
        return result
    except Exception as e:
        return {"error": str(e)}

def get_financial_data(code):
    """获取财务数据"""
    try:
        import akshare as ak
        df = ak.stock_financial_analysis_indicator(symbol=code, start_year="2023")
        if df is not None and len(df) > 0:
            latest = df.iloc[0]
            return {
                "roe": float(latest.get('净资产收益率(%)', 0)) if pd.notna(latest.get('净资产收益率(%)')) else None,
                "gross_margin": float(latest.get('销售毛利率(%)', 0)) if pd.notna(latest.get('销售毛利率(%)')) else None,
                "net_margin": float(latest.get('销售净利率(%)', 0)) if pd.notna(latest.get('销售净利率(%)')) else None,
                "debt_ratio": float(latest.get('资产负债率(%)', 0)) if pd.notna(latest.get('资产负债率(%)')) else None,
            }
        return {}
    except Exception as e:
        return {"error": str(e)}

def get_valuation(code):
    """获取估值数据"""
    try:
        import akshare as ak
        df = ak.stock_a_indicator_lg(symbol=code)
        if df is not None and len(df) > 0:
            latest = df.iloc[0]
            return {
                "pe": float(latest.get('市盈率(TTM)', 0)) if pd.notna(latest.get('市盈率(TTM)')) else None,
                "pb": float(latest.get('市净率(MRQ)', 0)) if pd.notna(latest.get('市净率(MRQ)')) else None,
                "ps": float(latest.get('市销率(TTM)', 0)) if pd.notna(latest.get('市销率(TTM)')) else None,
                "total_mv": float(latest.get('总市值', 0)) if pd.notna(latest.get('总市值')) else None,
                "circ_mv": float(latest.get('流通市值', 0)) if pd.notna(latest.get('流通市值')) else None,
            }
        return {}
    except Exception as e:
        return {"error": str(e)}

def get_industry_info(code):
    """获取行业信息"""
    try:
        import akshare as ak
        df = ak.stock_board_industry_name_em()
        stock_info = ak.stock_individual_info_em(symbol=code)
        industry = None
        for _, row in stock_info.iterrows():
            if '行业' in str(row['item']):
                industry = row['value']
                break

        if industry:
            industry_df = ak.stock_board_industry_cons_em(symbol=industry)
            if industry_df is not None:
                avg_pe = industry_df['市盈率'].mean() if '市盈率' in industry_df.columns else None
                return {
                    "industry": industry,
                    "avg_pe": float(avg_pe) if avg_pe else None,
                }
        return {"industry": industry} if industry else {}
    except Exception as e:
        return {"error": str(e)}

def get_revenue_profit(code):
    """获取营收利润数据"""
    try:
        import akshare as ak
        df = ak.stock_financial_report_sina(stock=code, symbol="利润表")
        if df is not None and len(df) > 0:
            latest = df.iloc[0]
            return {
                "revenue": float(latest.get('营业总收入', 0)) / 100000000 if pd.notna(latest.get('营业总收入')) else None,
                "net_profit": float(latest.get('净利润', 0)) / 100000000 if pd.notna(latest.get('净利润')) else None,
            }
        return {}
    except Exception as e:
        return {"error": str(e)}

def get_main_business(code):
    """获取主营业务构成"""
    try:
        import akshare as ak
        df = ak.stock_zdart_hist_min(symbol=code, adjust="")
        return {}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import pandas as pd

    if len(sys.argv) < 3:
        print(json.dumps({"error": "用法: python akshare_service.py <action> <params_json>"}))
        sys.exit(1)

    action = sys.argv[1]
    params = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}

    result = {}
    try:
        if action == "stock_info":
            result = get_stock_info(params.get("code"))
        elif action == "financial":
            result = get_financial_data(params.get("code"))
        elif action == "valuation":
            result = get_valuation(params.get("code"))
        elif action == "industry":
            result = get_industry_info(params.get("code"))
        elif action == "revenue":
            result = get_revenue_profit(params.get("code"))
        elif action == "all":
            code = params.get("code")
            result = {
                "info": get_stock_info(code),
                "financial": get_financial_data(code),
                "valuation": get_valuation(code),
                "industry": get_industry_info(code),
                "revenue": get_revenue_profit(code),
            }
        else:
            result = {"error": f"Unknown action: {action}"}
    except Exception as e:
        result = {"error": str(e)}

    print(json.dumps(result, ensure_ascii=False, indent=2))
