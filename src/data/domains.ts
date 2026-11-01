import { DomainInfo } from '../types';

export const DOMAINS: DomainInfo[] = [
  {
    id: '01-macro',
    number: '01',
    name: '市场与宏观',
    enName: 'MARKET & MACRO',
    question: '现在发生了什么？宏观环境和风险如何变化？',
    description: '从全局流动性与时点宏观出发，穿透跨资产风险结构与地缘政治脉冲，严防前视偏差。',
    representativeProjects: ['Market Pulse', 'QuantRiskLab', 'GPR避险实验室', 'Global Capital Flow Atlas'],
    existingCount: 4,
    plannedCount: 1
  },
  {
    id: '02-company',
    number: '02',
    name: '公司与产业',
    enName: 'COMPANY & INDUSTRY',
    question: '企业如何赚钱？行业利润在哪里？价值和风险如何判断？',
    description: '解构非结构化文本、绘制产业链利润池与供需周期，从微观经营驱动推导资产负债与估值预期。',
    representativeProjects: ['年报文本特征引擎', '公司估值实验室', '产业链利润池', '银行经营ALM', '信用压力实验室', 'MEMS/LBS技术经济'],
    existingCount: 1,
    plannedCount: 5
  },
  {
    id: '03-strategy',
    number: '03',
    name: '策略与组合',
    enName: 'STRATEGY & PORTFOLIO',
    question: '哪些策略值得研究？如何配置？自己的判断是否有效？',
    description: '从统计套利、单因子有效性检验与风格归因，走向风险平价预算与事前概率决策校准。',
    representativeProjects: ['A+H协整配对', '因子工作台', '美股量化工具', '决策概率校准', '风险预算工作台'],
    existingCount: 3,
    plannedCount: 2
  },
  {
    id: '04-micro',
    number: '04',
    name: '微观与衍生品',
    enName: 'MICROSTRUCTURE & DERIVATIVES',
    question: '交易如何影响价格？衍生品风险如何形成和管理？',
    description: '微观订单流(LOB)毒性仿真、价格冲击函数，及离散时间下期权动态Delta对冲误差度量。',
    representativeProjects: ['MML微观结构实验室', '期权曲面对冲误差实验室'],
    existingCount: 1,
    plannedCount: 1
  },
  {
    id: '05-academic',
    number: '05',
    name: '学术与学习',
    enName: 'ACADEMIC & EDUCATION',
    question: '如何理解理论、设计研究、复现结果并提升专业能力？',
    description: '计量交互实验、严谨因果识别策略、顶刊论文复现流水线与高密度专业知识伙伴。',
    representativeProjects: ['EF Lab · 理论实验', 'A股事件研究', 'CFA-Wizard-Buddy', '因果识别训练场'],
    existingCount: 3,
    plannedCount: 1
  },
  {
    id: '06-explore',
    number: '06',
    name: '探索与创作',
    enName: 'EXPLORATION & CREATION',
    question: '如何学习、探索知识并表达想法？',
    description: '独立创作空间：自然地理沙盘、历史战役推演、海洋标本与多维语言探索，保留人文与作品表达。',
    representativeProjects: ['陕西地理沙盘', '深海图鉴', '华夏烽火', 'PET单词挑战', '媒体空间'],
    existingCount: 4,
    plannedCount: 0
  }
];
