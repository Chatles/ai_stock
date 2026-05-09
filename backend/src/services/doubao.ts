import axios from 'axios';

interface DoubaoResponse {
  choices: Array<{
    message: { content: string; };
  }>;
  error?: { message: string; };
}

interface FullAnalysisResult {
  result: '利好' | '无影响' | '待定';
  利好程度: number;
  priceChangePredict: string;
  contentSummary: string;
  fundamentalAnalysis: string;
  industryAnalysis: string;
  competitiveAnalysis: string;
  reason: string;
}

export class DoubaoService {
  private apiKey: string;
  private baseUrl: string = 'https://ark.cn-beijing.volces.com/api/v3';

  constructor() {
    this.apiKey = process.env.DOUBAO_API_KEY || '';
    if (!this.apiKey) {
      console.warn('DOUBAO_API_KEY not set, AI analysis will use fallback');
    }
  }

  async analyzeNoticeFull(
    noticeTitle: string,
    noticeContent: string,
    stockCode: string,
    stockName: string,
    fundamentalData: string
  ): Promise<FullAnalysisResult> {
    if (!this.apiKey) {
      return this.fallbackAnalysis(noticeTitle);
    }

    const prompt = this.buildFullPrompt(noticeTitle, noticeContent, stockCode, stockName, fundamentalData);

    try {
      const response = await this.callAPI(prompt);
      return this.parseFullResponse(response);
    } catch (error: any) {
      console.error('AI analysis error:', error.message);
      return this.fallbackAnalysis(noticeTitle);
    }
  }

  private async callAPI(prompt: string): Promise<string> {
    const response = await axios.post<DoubaoResponse>(
      `${this.baseUrl}/chat/completions`,
      {
        model: 'doubao-seed-2.0',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        timeout: 60000,
      }
    );

    if (response.data.error) {
      throw new Error(response.data.error.message);
    }

    return response.data.choices[0]?.message?.content || '';
  }

  private buildFullPrompt(
    title: string,
    content: string,
    code: string,
    name: string,
    fundamental: string
  ): string {
    return `你是专业股票分析师。请深度分析以下A股公告对次日股价的影响。

## 股票信息
代码：${code}
名称：${name}

## 公告标题
${title}

## 公告内容摘要
${content || '无详细内容，仅根据标题分析'}

## 公司基本面数据
${fundamental || '暂无数据'}

## 分析要求

请从以下维度进行深度分析：

1. **内容摘要**：公告的核心内容是什么（20字内）
2. **基本面影响**：对公司财务、盈利能力的实际影响（40字内）
3. **行业分析**：所处行业现状及趋势，与行业平均估值对比（40字内）
4. **竞争分析**：相对竞争对手的优劣势，可能的市场影响（40字内）
5. **股价预测**：
   - 预测次日涨跌方向和幅度（如：预计上涨2%-4%）
   - 上涨概率评估（高/中/低）
6. **投资建议**：是否值得关注（强烈推荐/推荐/观望/回避）

## 输出格式（JSON）
{
  "result": "利好|无影响|待定",
  "利好程度": 1-5的整数（1=轻微利好，5=重大利好）,
  "priceChangePredict": "具体涨跌预测，如'预计上涨2%-4%'",
  "contentSummary": "内容摘要（20字内）",
  "fundamentalAnalysis": "基本面分析（40字内）",
  "industryAnalysis": "行业分析（40字内）",
  "competitiveAnalysis": "竞争分析（40字内）",
  "reason": "综合判断理由（30字内）"
}

请只输出JSON，不要有其他内容。`;
  }

  private parseFullResponse(content: string): FullAnalysisResult {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return {
          result: data.result || '待定',
          利好程度: Math.min(5, Math.max(1, data.利好程度 || 3)),
          priceChangePredict: data.priceChangePredict || '待观察',
          contentSummary: data.contentSummary || '',
          fundamentalAnalysis: data.fundamentalAnalysis || '',
          industryAnalysis: data.industryAnalysis || '',
          competitiveAnalysis: data.competitiveAnalysis || '',
          reason: data.reason || '',
        };
      }
    } catch (error) {
      console.error('Parse error:', error);
    }
    return this.fallbackAnalysis('');
  }

  private fallbackAnalysis(noticeTitle: string): FullAnalysisResult {
    const title = noticeTitle.toLowerCase();
    const noImpactKeywords = ['董事会', '独立董事', '监事会', '候选人', '声明', '承诺', '会议通知', '辞职'];
    const goodKeywords = ['业绩', '净利润', '营收', '利润', '分红', '回购', '增持', '订单', '合同', '突破', '中标', '新药', '并购', '重组'];

    if (noImpactKeywords.some(k => title.includes(k))) {
      return {
        result: '无影响', 利好程度: 0,
        priceChangePredict: '预计无明显波动',
        contentSummary: '日常治理公告', fundamentalAnalysis: '无影响',
        industryAnalysis: '无影响', competitiveAnalysis: '无影响',
        reason: '日常事务公告'
      };
    }

    if (goodKeywords.some(k => title.includes(k))) {
      return {
        result: '利好', 利好程度: 3,
        priceChangePredict: '预计上涨1%-3%',
        contentSummary: '需获取完整公告内容分析',
        fundamentalAnalysis: '需结合财务数据判断',
        industryAnalysis: '需了解行业情况',
        competitiveAnalysis: '需对比竞争对手',
        reason: '标题含利好关键词，建议深入分析'
      };
    }

    return {
      result: '待定', 利好程度: 3,
      priceChangePredict: '待观察',
      contentSummary: '需获取完整公告内容',
      fundamentalAnalysis: '需获取财务数据',
      industryAnalysis: '需了解行业动态',
      competitiveAnalysis: '需对比竞争对手',
      reason: '建议获取公告全文和基本面数据'
    };
  }
}

export const doubaoService = new DoubaoService();
