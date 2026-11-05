import { Playbook } from '../types';

export const PLAYBOOKS: Playbook[] = [
  {
    id: 'playbook-a',
    letter: 'A',
    title: '研究一家公司',
    enTitle: 'RESEARCH A COMPANY',
    subtitle: '从经营驱动出发，解构文本信号、产业链利润池与市场隐含预期，完成一份可证伪的公司深度备忘录。',
    finalDeliverable: '《公司深度研究备忘录 (Company Research Memo)》',
    deliverableDescription: '给出关键经营预测、逆向估值假设以及明确的反证/认错条件。',
    steps: [
      {
        stepNumber: 1,
        title: '非结构化文本与管理层语气解构',
        purpose: '提取管理层讨论(MD&A)中的真实语气偏向、研发投入叙事与重大未显性风险。',
        projectId: 'listed-filing-textmine',
        isExisting: true,
        toolName: '年报文本特征引擎',
        actionGuidance: '通过本地提取管线处理目标公司近3~5年年报与10-K，对比管理层乐观/不确定性词频序列漂移。',
        inputsRequired: '公司年报PDF/文本、对比公司池词表',
        expectedOutput: '语气情绪时序得分、核心风险披露变动清单'
      },
      {
        stepNumber: 2,
        title: '上下游产业链供需与资本开支定位',
        purpose: '明确目标企业在产业链中的利润池占有率与当前行业所处的Capex周期阶段。',
        projectId: 'industry-profit-pool-capex',
        isExisting: true,
        toolName: '产业链利润池与资本开支研究台',
        actionGuidance: '审查上游原材料与下游议价权，测算在建工程转固节奏与全行业供给出清拐点。',
        inputsRequired: '产业链环节毛利率矩阵、行业主要玩家在建工程数据',
        expectedOutput: '微笑曲线环节定位、行业产能周期阶段判断'
      },
      {
        stepNumber: 3,
        title: '经营驱动推导与逆向DCF隐含预期',
        purpose: '从单价、销量、毛利驱动现金流，反向测算当前市场股价隐含的增长率与ROIC要求。',
        projectId: 'company-valuation-implied-expectations',
        isExisting: true,
        toolName: '公司经营、估值与市场隐含预期实验室',
        actionGuidance: '输入保守经营基准情景，求解市场当前交易价格需要多极端的乐观预期才能支撑。',
        inputsRequired: '自由现金流拆解参数、WACC折现率、当前总市值',
        expectedOutput: '市场隐含预期敏感性矩阵、安全边际估值区间'
      },
      {
        stepNumber: 4,
        title: '记录事前投资命题与反证条件',
        purpose: '将主观预期量化为可追踪的假设，写明什么经营数据恶化时将证明本次判断错误。',
        projectId: 'decision-probability-calibration',
        isExisting: true,
        toolName: '投资判断与概率校准训练系统',
        actionGuidance: '在入场前填写事前决策备忘，确定1~2个不可妥协的核心观测指标与认错止损线。',
        inputsRequired: '主观置信度(0~100%)、到期核验日、证伪触发指标',
        expectedOutput: '完成归档的事前投资决策记录卡'
      }
    ],
    templateMarkdown: `# 公司深度研究备忘录 (Company Research Memo)

**标的名称 / 代码**：________________________  
**研究日期**：${new Date().toISOString().split('T')[0]}  
**研究员**：Eugene Finance 研究工作台  

---

## 一、 核心投资假说 (Core Investment Thesis)
1. 市场目前的共识预期是什么？
2. 我们的非共识洞察（Variant Perception）是什么？
3. 促成价值重估的关键催化剂（Catalysts）与时间窗口：

## 二、 业务驱动与单元经济 (Operating Drivers & Unit Economics)
- 收入核心拆解公式：收入 = 容量 × 渗透率 × 份额 × 单价
- 成本与毛利结构：固定成本占比 / 规模效应降本空间
- 自由现金流转化率（FCF / Net Profit）与营运资本变动：

## 三、 产业链位置与资本开支周期 (Value Chain & Capex)
- 在产业链利润池中的分工与议价权（微笑曲线所处位置）：
- 行业Capex与产能投放阶段：[ ] 产能扩张期 [ ] 产能出清期 [ ] 供需紧平衡
- 竞争壁垒护城河评估（技术工艺、客户转换成本、网络效应）：

## 四、 估值与市场隐含预期 (Market Implied Expectations)
- 当前市值：_______ 亿元 ｜ 对应 P/E: _______ ｜ EV/EBITDA: _______
- **逆向DCF反推结果**：当前股价所隐含的未来5年年化FCF增速为 _______%
- 我方基准情景预测增速为 _______%，安全边际空间为 _______%

## 五、 关键反证与认错条件 (Kill Conditions / Pre-Mortem)
> 只有预先写明“在什么情况下我证明自己做错了”，才能避免在持仓下跌时陷入认知辩解。

- [ ] **反证指标 1**：若季度营收增速连续两个季度低于 _______%
- [ ] **反证指标 2**：若核心产品毛利率跌破 _______%
- [ ] **反证指标 3**：若高管管理层在年报MD&A中出现异常减损或辞职
- **最终结论与操作建议**：[ ] 强烈推荐 [ ] 观察仓位 [ ] 风险回避
`
  },
  {
    id: 'playbook-b',
    letter: 'B',
    title: '完成一项实证研究',
    enTitle: 'CONDUCT EMPIRICAL RESEARCH',
    subtitle: '从微观理论推导、严谨因果识别策略，到标准化计量流水线与局限性诚实审视，产出高可复现论文成果。',
    finalDeliverable: '《实证研究设计与可复现结果包 (Empirical Research Pack)》',
    deliverableDescription: '包含一份理论机制说明、基准与稳健性回归表，以及对内生性局限的完整交代。',
    steps: [
      {
        stepNumber: 1,
        title: '理论假说推导与参数基准定义',
        purpose: '从经典资产定价理论或微观经济学出发，理清经济变量间的传导因果链条。',
        projectId: 'ef-lab',
        isExisting: true,
        toolName: 'EF Lab · 理论与交互实验',
        actionGuidance: '利用3D曲面与随机模拟实验直观审视参数敏感性边界，写下待验证的无套利或行为假说。',
        inputsRequired: '经济学理论模型、参数先验分布',
        expectedOutput: '数理假说命题(H1/H2)、理论传导机制流程图'
      },
      {
        stepNumber: 2,
        title: '因果识别策略论证与内生性排查',
        purpose: '评估遗漏变量、反向因果与测量误差，设计多期DID、断点回归或工具变量方案。',
        projectId: 'causal-inference-replication-ground',
        isExisting: true,
        toolName: '因果识别与论文复现训练场',
        actionGuidance: '检验外生冲击冲击点有效性，制定严格的平行趋势检验与对照组构造方法。',
        inputsRequired: '政策变动冲击时间表、样本处理组与对照组判定准则',
        expectedOutput: '因果识别图谱、平行趋势预检设计'
      },
      {
        stepNumber: 3,
        title: '标准化实证流水线回归与安慰剂检验',
        purpose: '运行标准化实证代码，计算事件窗口超额收益CAR，导出论文级三线回归表。',
        projectId: 'a-share-event-study',
        isExisting: true,
        toolName: 'A股事件研究流水线',
        actionGuidance: '通过Web应用或本地流水线加载事件样本，重算CAAR，执行时点打乱的安慰剂蒙特卡洛检验。',
        inputsRequired: '清洗后的事件清单CSV、股票与基准指数收益率面板',
        expectedOutput: 'CAAR路径时序图、符合顶刊标准的LaTeX实证表格'
      },
      {
        stepNumber: 4,
        title: '形成结果阐释与研究局限性备忘',
        purpose: '客观区分“统计相关”与“真正机制”，诚实交代数据缺口与结论边界。',
        projectId: 'global-capital-flow-atlas',
        isExisting: true,
        toolName: '跨国宏观数据/研究报告标准规范',
        actionGuidance: '撰写实证结论备忘，严禁在识别不足时将市场模型残差解释为必然因果。',
        inputsRequired: '回归估计系数值、稳健性检验输出',
        expectedOutput: '论文实证章节草稿与局限性讨论备忘'
      }
    ],
    templateMarkdown: `# 实证研究设计与可复现备忘录 (Empirical Study Pack)

**论文题目**：____________________________________________________  
**工作论文版本**：V1.0  
**设计归档时间**：${new Date().toISOString().split('T')[0]}  

---

## 一、 研究问题与理论假说 (Research Question & Hypotheses)
- **核心研究问题**：
- **理论机制**（从哪一理论框架推导）：
- **待检验假说 H1**：
- **待检验假说 H2**：

## 二、 识别策略与因果推断 (Identification Strategy)
- **识别方法**：[ ] 多期双重差分 (Staggered DID) ｜ [ ] 断点回归 (RDD) ｜ [ ] 事件研究法 (Event Study) ｜ [ ] 工具变量 (IV)
- **外生冲击定义**（事件发生时点与影响群体）：
- **内生性担忧与应对**：
  - 遗漏变量控制（固定效应维度：行业 × 年份、个体 FE）：
  - 反向因果排除机制：
  - 平行趋势检验窗口期设计：

## 三、 样本选择与数据清洗 (Sample & Data Protocol)
- 样本区间：从 _______ 年至 _______ 年
- 排除规则：剔除 ST/PT 标的、剔除关键财务缺失样本、连续变量 1% 双边缩尾(Winsorize)
- 数据源：CSMAR / Wind / 年报文本挖掘特征库

## 四、 基准模型方程 (Baseline Econometric Specification)
$$Y_{it} = \\alpha + \\beta \\cdot (Treat_i \\times Post_t) + \\gamma \\cdot X_{it} + \\mu_i + \\lambda_t + \\varepsilon_{it}$$

- 被解释变量 ($Y_{it}$)：
- 核心解释变量 ($Treat_i \\times Post_t$)：
- 控制变量向量 ($X_{it}$)：

## 五、 稳健性与安慰剂检验清单 (Robustness Checklists)
- [ ] 平行趋势检验 (Event Study Dynamic Coefficients)
- [ ] 虚假政策时点 / 虚假处理组安慰剂检验 (Placebo 500次抽样)
- [ ] 剔除并发其他政策样本的干净子样本检验
- [ ] 变换被解释变量定义 / 聚类稳健标准误层级调整

## 六、 结论与局限性自白 (Limitations & Caveats)
- 本研究能够确证的事实：
- 本研究尚无法完全排除的替代解释：
`
  },
  {
    id: 'playbook-c',
    letter: 'C',
    title: '形成一次可复盘的投资决策',
    enTitle: 'AUDITABLE INVESTMENT DECISION',
    subtitle: '穿透宏观时点脉冲、严控前瞻偏差、核验多因子收益与配置预算，建立事前决策档案以供事后Brier复盘。',
    finalDeliverable: '《事前投资决策卡片与Brier复盘账本 (Pre-Mortem Record)》',
    deliverableDescription: '写清楚为什么做、承担什么波动率风险、置信概率是多少，以及何时认错。',
    steps: [
      {
        stepNumber: 1,
        title: '宏观脉冲与跨资产热度扫描',
        purpose: '了解当前处于周期的哪个位置，确认全球流动性与大类资产大趋势。',
        projectId: 'market-pulse',
        isExisting: true,
        toolName: 'Market Pulse 金融数据中枢',
        actionGuidance: '核对跨资产收益率矩阵、利差变动与重大宏观日历，排除极端流动性枯竭时点。',
        inputsRequired: '大类资产价格、国债收益率曲线、实时宏观事件流',
        expectedOutput: '大类资产流动性环境诊断、顺风/逆风定位'
      },
      {
        stepNumber: 2,
        title: '时点风险与等权方差贡献穿透',
        purpose: '仅使用历史截至时点（as_of）客观信息，穿透持仓潜在风险结构与利率敏感性。',
        projectId: 'quant-risk-lab',
        isExisting: true,
        toolName: 'QuantRiskLab 时点风险工作台',
        actionGuidance: '导入候选配置组合，计算无前瞻偏差的方差贡献度，避免隐藏在低波动下的尾部敞口。',
        inputsRequired: 'as_of时点行情切片、候选资产协方差矩阵',
        expectedOutput: '等权方差贡献分解图、极端压力情景预期缺损'
      },
      {
        stepNumber: 3,
        title: 'Alpha因子有效性与对冲策略检验',
        purpose: '验证支撑本次决策的超额收益是来自真实因子溢价还是单纯运气。',
        projectId: 'factor-workbench',
        isExisting: true,
        toolName: '因子工作台 / A+H协整看板',
        actionGuidance: '运行单因子最新截面Rank IC与Brinson归因，确认选股风格未受到行业极端偏离污染。',
        inputsRequired: '候选个股因子暴露、行业基准分类',
        expectedOutput: '因子近期有效性评分、风格溢价净值曲线'
      },
      {
        stepNumber: 4,
        title: '风险平价预算与最大回撤配额',
        purpose: '将个人风险偏好转换为量化波动率预算，确保单次失误不造成毁灭性打击。',
        projectId: 'portfolio-risk-budgeting',
        isExisting: true,
        toolName: '组合决策与风险预算工作台',
        actionGuidance: '计算各资产边际风险贡献(MRC)，根据组合允许的最大回撤倒算头寸上限。',
        inputsRequired: '总资金规模、最大容忍回撤比率、各资产预期波动率',
        expectedOutput: '建议仓位权重分配表、组合整体VaR/CVaR上限'
      },
      {
        stepNumber: 5,
        title: '事前概率赋值与复盘档案归档',
        purpose: '写明买入前提，给出明确概率赋值(如65%)，设定到期日并备忘事后复盘。',
        projectId: 'decision-probability-calibration',
        isExisting: true,
        toolName: '投资判断与概率校准训练系统',
        actionGuidance: '填写不可修改的事前决策表，锁定证伪指标。定期结算并计算Brier打分。',
        inputsRequired: '决策主观置信度、观察截止日期、出场规则',
        expectedOutput: '事前决策档案卡 (可计算Brier得分)'
      }
    ],
    templateMarkdown: `# 事前投资决策卡片与Brier复盘账本 (Pre-Mortem Record)

**决策流水号**：EF-DEC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}  
**记录时间（事前）**：${new Date().toISOString()}  
**决策责任人**：Eugene Finance 研究工作台  

---

## 一、 标的与头寸规模 (Asset & Position Sizing)
- **交易标的**：________________________（代码：_______）
- **买入/开仓方向**：[ ] 多头 (Long) ｜ [ ] 空头 (Short) ｜ [ ] 配对对冲 (Pairs)
- **分配本金 / 仓位占比**：_______ 万元（占总组合净值 _______%）
- **经风险预算折算后的最大容忍亏损额**：_______ 万元

## 二、 核心买入逻辑三要点 (Three Core Drivers)
1. **宏观与流动性顺风**：
2. **基本面与Alpha因子支撑**：
3. **市场情绪与预期差（为什么对手盘会卖给我）**：

## 三、 事前概率量化 (Ex-Ante Probability Calibration)
- **命题定义**：在 _______ 年 ___ 月 ___ 日前，该标的将达到 [目标价格 / 经营指标]
- **主观置信度赋值**：[ ] 50% [ ] 60% [ ] 70% [ ] 80% [ ] 90%
> 注：若实际发生记为 1，未发生记为 0。事后将自动结算本次预测的 Brier 得分 $(p - o)^2$。

## 四、 明确的离场与止损规则 (Exit & Invalidation Rules)
- **正常止盈目标**：目标价格 _______ 元（预期回报 _______%）
- **硬性止损线**：回撤达到 _______% 时强制无条件平仓
- **逻辑失效出场（Logic Invalidation）**：出现以下任一事实时立即离场，即使未触及价格止损：
  - 条件 1：
  - 条件 2：

---

## 五、 事后复盘对账（到期后填写 · 严禁事前修改）
- **复盘时间**：____年___月___日
- **实际结果**：[ ] 命题成立 [ ] 命题证伪
- **本次 Brier 误差得分**：_______（越接近0越精确）
- **认知复盘思考**：本次决策成功/失败是因为实力还是运气？是否存在过度自信？
`
  }
];
