import { Notice } from '../types';

const MOCK_NOTICES: Notice[] = [
  {
    noticeDate: '2026-05-08',
    securityCode: '600519',
    securityNameAbbr: '贵州茅台',
    noticeType: '季度报告',
    noticeTitle: '贵州茅台关于2026年第一季度报告的公告',
    noticeUrl: 'https://data.eastmoney.com/notices/detail/600519/AN202605081822000001.html',
    id: '600519_001',
  },
  {
    noticeDate: '2026-05-08',
    securityCode: '000858',
    securityNameAbbr: '五粮液',
    noticeType: '股东大会资料',
    noticeTitle: '五粮液关于召开2025年年度股东大会的通知',
    noticeUrl: 'https://data.eastmoney.com/notices/detail/000858/AN202605081822000002.html',
    id: '000858_002',
  },
  {
    noticeDate: '2026-05-07',
    securityCode: '601318',
    securityNameAbbr: '中国平安',
    noticeType: '重大事项',
    noticeTitle: '中国平安关于披露2025年年报的公告',
    noticeUrl: 'https://data.eastmoney.com/notices/detail/601318/AN202605071822000003.html',
    id: '601318_003',
  },
  {
    noticeDate: '2026-05-07',
    securityCode: '000001',
    securityNameAbbr: '平安银行',
    noticeType: '业绩预告',
    noticeTitle: '平安银行关于2026年半年度业绩预告的公告',
    noticeUrl: 'https://data.eastmoney.com/notices/detail/000001/AN202605071822000004.html',
    id: '000001_004',
  },
  {
    noticeDate: '2026-05-07',
    securityCode: '600036',
    securityNameAbbr: '招商银行',
    noticeType: '分红公告',
    noticeTitle: '招商银行关于2024年度利润分配方案的公告',
    noticeUrl: 'https://data.eastmoney.com/notices/detail/600036/AN202605071822000005.html',
    id: '600036_005',
  },
  {
    noticeDate: '2026-05-06',
    securityCode: '688041',
    securityNameAbbr: '寒武纪',
    noticeType: '科创板公告',
    noticeTitle: '寒武纪关于公司股票交易异常波动的公告',
    noticeUrl: 'https://data.eastmoney.com/notices/detail/688041/AN202605061822000006.html',
    id: '688041_006',
  },
  {
    noticeDate: '2026-05-06',
    securityCode: '300750',
    securityNameAbbr: '宁德时代',
    noticeType: '创业板公告',
    noticeTitle: '宁德时代关于使用闲置募集资金进行现金管理的公告',
    noticeUrl: 'https://data.eastmoney.com/notices/detail/300750/AN202605061822000007.html',
    id: '300750_007',
  },
  {
    noticeDate: '2026-05-06',
    securityCode: '002594',
    securityNameAbbr: '比亚迪',
    noticeType: '定期报告',
    noticeTitle: '比亚迪关于2025年年度报告的补充公告',
    noticeUrl: 'https://data.eastmoney.com/notices/detail/002594/AN202605061822000008.html',
    id: '002594_008',
  },
  {
    noticeDate: '2026-05-05',
    securityCode: '601012',
    securityNameAbbr: '隆基绿能',
    noticeType: '融资公告',
    noticeTitle: '隆基绿能关于公开发行可转债申请获审核通过的公告',
    noticeUrl: 'https://data.eastmoney.com/notices/detail/601012/AN202605051822000009.html',
    id: '601012_009',
  },
  {
    noticeDate: '2026-05-05',
    securityCode: '000333',
    securityNameAbbr: '美的集团',
    noticeType: '股权激励',
    noticeTitle: '美的集团关于2024年限制性股票激励计划首次授予第一个解除限售期解除限售条件成就的公告',
    noticeUrl: 'https://data.eastmoney.com/notices/detail/000333/AN202605051822000010.html',
    id: '000333_010',
  },
  {
    noticeDate: '2026-05-04',
    securityCode: '600276',
    securityNameAbbr: '恒瑞医药',
    noticeType: '药品研发',
    noticeTitle: '恒瑞医药关于获得药物临床试验批准通知书的公告',
    noticeUrl: 'https://data.eastmoney.com/notices/detail/600276/AN202605041822000011.html',
    id: '600276_011',
  },
  {
    noticeDate: '2026-05-04',
    securityCode: '300059',
    securityNameAbbr: '东方财富',
    noticeType: '券商公告',
    noticeTitle: '东方财富关于子公司东方财富证券2026年度短期融资券发行情况的公告',
    noticeUrl: 'https://data.eastmoney.com/notices/detail/300059/AN202605041822000012.html',
    id: '300059_012',
  },
  {
    noticeDate: '2026-05-03',
    securityCode: '002230',
    securityNameAbbr: '科大讯飞',
    noticeType: '人工智能',
    noticeTitle: '科大讯飞关于发布星火大模型的公告',
    noticeUrl: 'https://data.eastmoney.com/notices/detail/002230/AN202605031822000013.html',
    id: '002230_013',
  },
  {
    noticeDate: '2026-05-03',
    securityCode: '600009',
    securityNameAbbr: '上海机场',
    noticeType: '机场公告',
    noticeTitle: '上海机场关于2026年4月运输生产情况的公告',
    noticeUrl: 'https://data.eastmoney.com/notices/detail/600009/AN202605031822000014.html',
    id: '600009_014',
  },
  {
    noticeDate: '2026-05-02',
    securityCode: '601857',
    securityNameAbbr: '中国石油',
    noticeType: '资源公告',
    noticeTitle: '中国石油关于发现大型天然气田的公告',
    noticeUrl: 'https://data.eastmoney.com/notices/detail/601857/AN202605021822000015.html',
    id: '601857_015',
  },
  {
    noticeDate: '2026-05-02',
    securityCode: '600028',
    securityNameAbbr: '中国石化',
    noticeType: '炼化公告',
    noticeTitle: '中国石化关于2026年第一季度生产经营数据的公告',
    noticeUrl: 'https://data.eastmoney.com/notices/detail/600028/AN202605021822000016.html',
    id: '600028_016',
  },
  {
    noticeDate: '2026-05-01',
    securityCode: '601398',
    securityNameAbbr: '工商银行',
    noticeType: '银行业公告',
    noticeTitle: '工商银行关于2025年度利润分配方案的公告',
    noticeUrl: 'https://data.eastmoney.com/notices/detail/601398/AN202605011822000017.html',
    id: '601398_017',
  },
  {
    noticeDate: '2026-05-01',
    securityCode: '601288',
    securityNameAbbr: '农业银行',
    noticeType: '农业公告',
    noticeTitle: '农业银行关于服务乡村振兴战略的公告',
    noticeUrl: 'https://data.eastmoney.com/notices/detail/601288/AN202605011822000018.html',
    id: '601288_018',
  },
  {
    noticeDate: '2026-04-30',
    securityCode: '601988',
    securityNameAbbr: '中国银行',
    noticeType: '外汇公告',
    noticeTitle: '中国银行关于2026年外汇牌价的公告',
    noticeUrl: 'https://data.eastmoney.com/notices/detail/601988/AN202604301822000019.html',
    id: '601988_019',
  },
  {
    noticeDate: '2026-04-30',
    securityCode: '601939',
    securityNameAbbr: '建设银行',
    noticeType: '建设公告',
    noticeTitle: '建设银行关于2025年度业绩发布的公告',
    noticeUrl: 'https://data.eastmoney.com/notices/detail/601939/AN202604301822000020.html',
    id: '601939_020',
  },
];

export class MockDataService {
  getNotices(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    market?: string;
  }): {
    list: Notice[];
    total: number;
    page: number;
    pageSize: number;
  } {
    const page = params.page || 1;
    const pageSize = Math.min(params.pageSize || 20, 50);
    const keyword = params.keyword?.toLowerCase() || '';

    let filteredNotices = MOCK_NOTICES;

    if (keyword) {
      filteredNotices = MOCK_NOTICES.filter(
        (notice) =>
          notice.securityCode.includes(keyword) ||
          notice.securityNameAbbr.toLowerCase().includes(keyword) ||
          notice.noticeTitle.toLowerCase().includes(keyword)
      );
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedNotices = filteredNotices.slice(startIndex, endIndex);

    return {
      list: paginatedNotices,
      total: filteredNotices.length,
      page,
      pageSize,
    };
  }
}

export const mockDataService = new MockDataService();
