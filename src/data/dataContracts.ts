export interface DataField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  required: boolean;
  description: string;
  example: string | number | boolean;
}

export interface DataContract {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  version: string;
  sourceProjectId: string;
  sourceProjectName: string;
  targetProjectIds: string[];
  targetProjectNames: string[];
  format: 'csv' | 'parquet' | 'json';
  playbookId: string;
  playbookLetter: string;
  purpose: string;
  fields: DataField[];
  sampleCsv: string;
  jsonSchema: Record<string, any>;
}

export const DATA_CONTRACTS: DataContract[] = [
  {
    id: 'contract-filing-tone',
    code: 'EF-CONTRACT-NLP-01',
    name: '年报与季报 MD&A 文本语气特征面板',
    subtitle: '年报文本特征引擎 ➔ A股事件研究 / 因子工作台',
    version: '1.2.0',
    sourceProjectId: 'listed-filing-textmine',
    sourceProjectName: '年报文本特征引擎',
    targetProjectIds: ['a-share-event-study', 'factor-workbench'],
    targetProjectNames: ['A股事件研究', '因子工作台'],
    format: 'csv',
    playbookId: 'playbook-b',
    playbookLetter: 'B',
    purpose: '规范上市公司定期财报管理层讨论与分析（MD&A）的情感词频特征导出格式，用于直接检验语气冲击超额收益(CAR)或构造风格因子。',
    fields: [
      { name: 'ticker', type: 'string', required: true, description: '统一证券代码（带后缀）', example: '600036.SH' },
      { name: 'announcement_date', type: 'date', required: true, description: '财报官方公布日期 (YYYY-MM-DD)', example: '2026-03-28' },
      { name: 'fiscal_year', type: 'number', required: true, description: '财报所属会计年度', example: 2025 },
      { name: 'tone_net_optimism', type: 'number', required: true, description: '净乐观度 [(Pos - Neg) / (Pos + Neg + 1)]', example: 0.285 },
      { name: 'uncertainty_ratio', type: 'number', required: true, description: '不确定性词频占总词汇比例', example: 0.042 },
      { name: 'forward_looking_ratio', type: 'number', required: true, description: '前瞻性叙述段落比重', example: 0.183 },
      { name: 'mda_word_count', type: 'number', required: true, description: 'MD&A 章节有效词汇总量', example: 14250 }
    ],
    sampleCsv: `ticker,announcement_date,fiscal_year,tone_net_optimism,uncertainty_ratio,forward_looking_ratio,mda_word_count
600036.SH,2026-03-28,2025,0.285,0.042,0.183,14250
600519.SH,2026-03-31,2025,0.412,0.021,0.215,18900
000858.SZ,2026-04-15,2025,0.198,0.038,0.147,12600
002594.SZ,2026-03-26,2025,0.342,0.049,0.264,21300
601318.SH,2026-03-24,2025,0.165,0.055,0.128,16800`,
    jsonSchema: {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "FilingTonePanel",
      "type": "array",
      "items": {
        "type": "object",
        "required": ["ticker", "announcement_date", "fiscal_year", "tone_net_optimism"],
        "properties": {
          "ticker": { "type": "string", "pattern": "^[0-9]{6}\\.(SH|SZ|BJ)$" },
          "announcement_date": { "type": "string", "format": "date" },
          "fiscal_year": { "type": "integer", "minimum": 2000 },
          "tone_net_optimism": { "type": "number", "minimum": -1.0, "maximum": 1.0 },
          "uncertainty_ratio": { "type": "number", "minimum": 0.0 },
          "forward_looking_ratio": { "type": "number", "minimum": 0.0 }
        }
      }
    }
  },
  {
    id: 'contract-event-study-list',
    code: 'EF-CONTRACT-EVT-02',
    name: '标准事件清单与异常收益窗口规范',
    subtitle: '多源研判工具 ➔ A股事件研究流水线',
    version: '1.1.0',
    sourceProjectId: 'listed-filing-textmine',
    sourceProjectName: '年报文本 / 外部清单',
    targetProjectIds: ['a-share-event-study'],
    targetProjectNames: ['A股事件研究'],
    format: 'csv',
    playbookId: 'playbook-b',
    playbookLetter: 'B',
    purpose: '定义输入给事件研究流水线的标准 CSV 格式，支持事件日前后窗口参数设定及市场基准收益对齐。',
    fields: [
      { name: 'ticker', type: 'string', required: true, description: '事件主体证券代码', example: '600036.SH' },
      { name: 'event_date', type: 'date', required: true, description: '事件公告日 (T0)', example: '2026-03-28' },
      { name: 'event_label', type: 'string', required: true, description: '事件标签分类', example: 'mda_tone_surge' },
      { name: 'window_pre', type: 'number', required: true, description: '事件前观察交易日数', example: -2 },
      { name: 'window_post', type: 'number', required: true, description: '事件后观察交易日数', example: 3 },
      { name: 'benchmark', type: 'string', required: true, description: '基准指数代码', example: '000300.SH' }
    ],
    sampleCsv: `ticker,event_date,event_label,window_pre,window_post,benchmark
600036.SH,2026-03-28,mda_tone_surge,-2,3,000300.SH
600519.SH,2026-03-31,mda_tone_surge,-2,3,000300.SH
002594.SZ,2026-03-26,mda_tone_surge,-2,3,000300.SH
601398.SH,2026-03-27,mda_tone_drop,-2,3,000300.SH`,
    jsonSchema: {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "EventStudyList",
      "type": "array",
      "items": {
        "type": "object",
        "required": ["ticker", "event_date", "event_label", "benchmark"],
        "properties": {
          "ticker": { "type": "string" },
          "event_date": { "type": "string", "format": "date" },
          "event_label": { "type": "string" },
          "window_pre": { "type": "integer" },
          "window_post": { "type": "integer" },
          "benchmark": { "type": "string" }
        }
      }
    }
  },
  {
    id: 'contract-pit-macro-vintages',
    code: 'EF-CONTRACT-PIT-03',
    name: '无前瞻时点宏观快照与修订切片',
    subtitle: 'QuantRiskLab ➔ 组合决策与风险预算工作台',
    version: '1.0.0',
    sourceProjectId: 'quant-risk-lab',
    sourceProjectName: 'QuantRiskLab',
    targetProjectIds: ['portfolio-risk-budgeting', 'gpr-haven-lab'],
    targetProjectNames: ['组合决策与风险预算', 'GPR避险实验室'],
    format: 'csv',
    playbookId: 'playbook-c',
    playbookLetter: 'C',
    purpose: '严格杜绝全样本修订数据前视偏差。仅保留截至给定 as_of 日期当时官方首次发布或当期修订的经济数据序列。',
    fields: [
      { name: 'as_of', type: 'date', required: true, description: '时点切片截面日期', example: '2026-10-30' },
      { name: 'series_id', type: 'string', required: true, description: '宏观序列标识符', example: 'US_CPI_YOY' },
      { name: 'reference_period', type: 'string', required: true, description: '对应统计月份 (YYYY-MM)', example: '2026-09' },
      { name: 'reported_value', type: 'number', required: true, description: '当时可得报告值', example: 2.85 },
      { name: 'revision_seq', type: 'number', required: true, description: '修订序号 (0=初值, 1=一次修订)', example: 0 }
    ],
    sampleCsv: `as_of,series_id,reference_period,reported_value,revision_seq
2026-10-30,US_CPI_YOY,2026-09,2.85,0
2026-10-30,US_PAYEMS,2026-09,142.0,1
2026-10-30,CN_M2_YOY,2026-09,7.10,0
2026-10-30,CN_CPI_YOY,2026-09,0.40,0`,
    jsonSchema: {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "PointInTimeMacroSlice",
      "type": "array",
      "items": {
        "type": "object",
        "required": ["as_of", "series_id", "reported_value"],
        "properties": {
          "as_of": { "type": "string", "format": "date" },
          "series_id": { "type": "string" },
          "reported_value": { "type": "number" }
        }
      }
    }
  },
  {
    id: 'contract-tick-orderflow-lob',
    code: 'EF-CONTRACT-LOB-04',
    name: '逐笔成交回放与瞬时订单流切片',
    subtitle: 'MML 市场微观结构实验室 ➔ 实盘执行优化',
    version: '1.0.0',
    sourceProjectId: 'market-microstructure-lab',
    sourceProjectName: 'MML 市场微观结构实验室',
    targetProjectIds: ['market-pulse'],
    targetProjectNames: ['Market Pulse'],
    format: 'csv',
    playbookId: 'playbook-c',
    playbookLetter: 'C',
    purpose: '标准化真实逐笔成交与盘口挂单特征格式，用于测算主动订单冲击半衰期、逆向选择成本及大单滑点。',
    fields: [
      { name: 'symbol', type: 'string', required: true, description: '标的代码', example: '600036.SH' },
      { name: 'timestamp_ms', type: 'number', required: true, description: '毫秒级时间戳', example: 1761984000125 },
      { name: 'trade_price', type: 'number', required: true, description: '成交价', example: 32.45 },
      { name: 'trade_vol', type: 'number', required: true, description: '成交量（股）', example: 5000 },
      { name: 'side', type: 'string', required: true, description: '主动吃单方向 (buy/sell)', example: 'sell' },
      { name: 'bid1_price', type: 'number', required: true, description: '瞬时买一价', example: 32.44 },
      { name: 'ask1_price', type: 'number', required: true, description: '瞬时卖一价', example: 32.45 }
    ],
    sampleCsv: `symbol,timestamp_ms,trade_price,trade_vol,side,bid1_price,ask1_price
600036.SH,1761984000125,32.45,5000,sell,32.44,32.45
600036.SH,1761984000180,32.44,12000,sell,32.44,32.45
600036.SH,1761984000240,32.44,3000,sell,32.43,32.44
600036.SH,1761984000310,32.45,800,buy,32.44,32.45`,
    jsonSchema: {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "TickOrderflow",
      "type": "array",
      "items": {
        "type": "object",
        "required": ["symbol", "timestamp_ms", "trade_price", "side"],
        "properties": {
          "symbol": { "type": "string" },
          "trade_price": { "type": "number" },
          "side": { "enum": ["buy", "sell"] }
        }
      }
    }
  },
  {
    id: 'contract-risk-budget-weights',
    code: 'EF-CONTRACT-RISK-05',
    name: '等风险贡献与组合权重预算配置输出',
    subtitle: '组合决策与风险预算 ➔ 交易执行与持仓穿透',
    version: '1.0.0',
    sourceProjectId: 'portfolio-risk-budgeting',
    sourceProjectName: '组合决策与风险预算工作台',
    targetProjectIds: ['quant-risk-lab'],
    targetProjectNames: ['QuantRiskLab'],
    format: 'csv',
    playbookId: 'playbook-c',
    playbookLetter: 'C',
    purpose: '输出等风险贡献(ERC)与层级风险平价(HRP)优化后的目标权重及边际风险贡献分解，支持交易执行与事后风险审计。',
    fields: [
      { name: 'asset_ticker', type: 'string', required: true, description: '资产代码', example: 'GLD' },
      { name: 'asset_name', type: 'string', required: true, description: '资产名称', example: '现货黄金ETF' },
      { name: 'target_weight', type: 'number', required: true, description: '目标配置权重 (0-1)', example: 0.130 },
      { name: 'volatility_annual', type: 'number', required: true, description: '年化波动率估计', example: 0.155 },
      { name: 'marginal_risk_contrib', type: 'number', required: true, description: '边际风险贡献 (MRC)', example: 0.020 },
      { name: 'risk_budget_pct', type: 'number', required: true, description: '分得风险预算占比', example: 0.125 }
    ],
    sampleCsv: `asset_ticker,asset_name,target_weight,volatility_annual,marginal_risk_contrib,risk_budget_pct
GLD,现货黄金ETF,0.130,0.155,0.020,0.125
SHY,1-3Y美债ETF,0.240,0.022,0.005,0.058
TLT,20Y+美债ETF,0.180,0.178,0.032,0.285
SPY,标普500ETF,0.450,0.165,0.074,0.532`,
    jsonSchema: {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "RiskBudgetWeights",
      "type": "array",
      "items": {
        "type": "object",
        "required": ["asset_ticker", "target_weight", "marginal_risk_contrib"],
        "properties": {
          "asset_ticker": { "type": "string" },
          "target_weight": { "type": "number", "minimum": 0, "maximum": 1 }
        }
      }
    }
  }
];
