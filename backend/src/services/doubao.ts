import axios from 'axios';

interface DoubaoResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

interface AnalysisResult {
  result: '利好' | '无影响' | '待定';
  利好程度: number;
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

  async analyzeNotice(
    noticeTitle: string,
    noticeContent: string,
    stockCode: string,
    stockName: string
  ): Promise<AnalysisResult> {
    if (!this.apiKey) {
      return this.fallbackAnalysis(noticeTitle);
    }

    const prompt = this.buildPrompt(noticeTitle, noticeContent, stockCode, stockName);

    try {
      const response = await axios.post<DoubaoResponse>(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'doubao-seed-2.0',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 30000,
        }
      );

      if (response.data.error) {
        console.error('Doubao API error:', response.data.error);
        return this.fallbackAnalysis(noticeTitle);
      }

      return this.parseResponse(response.data.choices[0]?.message?.content || '');
    } catch (error) {
      console.error('Error calling Doubao API:', error);
      return this.fallbackAnalysis(noticeTitle);
    }
  }

  private buildPrompt(
    title: string,
    content: string,
    code: string,
    name: string
  ): string {
    return `你是一个专业的股票分析师。请分析以下A股公告对第二天股价的影响。

股票信息：
- 代码：${code}
- 名称：${name}

公告标题：${title}
${content ? `公告内容：${content}` : ''}

请根据以下标准进行分析：

1. **利好**：公告内容对公司业绩、主营业务、行业地位有正面影响
   - 例如：业绩大幅增长、新订单签订、技术突破、政策利好、并购重组等

2. **无影响**：公告内容与股价无直接关联
   - 例如：董事会会议通知、高管任免公告（不影响经营）、独立董事候选人声明、日常事务公告等

3. **待定**：公告内容有潜在影响，但需要结合更多因素判断
   - 例如：战略合作协议（需看具体条款）、行业政策（需看力度）、竞争对手动态等

请以JSON格式返回分析结果：
{
  "result": "利好|无影响|待定",
  "利好程度": 1-5的整数（仅当result为"利好"时填写，1为轻微利好，5为重大利好）,
  "reason": "分析理由，简洁明了"
}

只返回JSON，不要有其他内容。`;
  }

  private parseResponse(content: string): AnalysisResult {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return {
          result: data.result || '待定',
          利好程度: data.利好程度 || 3,
          reason: data.reason || '分析完成',
        };
      }
    } catch (error) {
      console.error('Parse response error:', error);
    }
    return this.fallbackAnalysis('');
  }

  private fallbackAnalysis(noticeTitle: string): AnalysisResult {
    const title = noticeTitle.toLowerCase();
    const noImpactKeywords = [
      '董事会', '监事会', '独立董事', '候选人', '声明', '承诺',
      '会议通知', '召开', '议案', '延期', '补充公告', '更正',
      '辞职', '离任', '退休', '工作调整'
    ];

    const hasNoImpactKeyword = noImpactKeywords.some(keyword =>
      title.includes(keyword)
    );

    if (hasNoImpactKeyword) {
      return {
        result: '无影响',
        利好程度: 0,
        reason: '根据标题判断为日常事务性公告，对股价无影响'
      };
    }

    return {
      result: '待定',
      利好程度: 3,
      reason: '需要进一步分析'
    };
  }
}

export const doubaoService = new DoubaoService();
