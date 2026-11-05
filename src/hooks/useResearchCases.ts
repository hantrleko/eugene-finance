import { useState, useEffect, useCallback } from 'react';
import { ResearchCase, ResearchCaseStep, ResearchCaseArtifact, ResearchNote } from '../types';
import { PLAYBOOKS } from '../data/playbooks';

const STORAGE_KEY = 'ef_research_cases_v4';
const NOTES_STORAGE_KEY = 'ef_custom_notes_v4';

// Pre-seeded initial active case for realistic demonstration
const INITIAL_DEFAULT_CASE: ResearchCase = {
  id: 'case-cmb-2026-q1',
  title: '招商银行零售资产质量与净息差拐点研究',
  question: '增长是否需要持续追加大量资本？负债端重定价何时传导至净息差（NIM）边际企稳？',
  targetType: 'stock',
  targetIdentifier: '600036.SH',
  targetName: '招商银行',
  asOfDate: '2026-03-31',
  playbookId: 'playbook-a',
  playbookTitle: '研究一家公司',
  playbookLetter: 'A',
  status: 'active',
  createdAt: '2026-10-22',
  updatedAt: '2026-10-25',
  steps: [
    {
      stepNumber: 1,
      title: '收集与初筛文本证据（年报/研报）',
      purpose: '提取年报 MD&A 语气情绪与风险词频，研判管理层真实态度转向',
      toolId: 'listed-filing-textmine',
      toolName: '年报文本特征引擎',
      completed: true,
      completedAt: '2026-10-23',
      notes: '已提取招行近 8 年年报 MD&A 切片。2025/2026 年报“风险提示”语气指数较 2023 年峰值回落 14.2%，表明存量零售风险敞口化解接近尾声。',
      artifacts: [
        {
          id: 'art-cmb-tone-csv',
          name: 'cmb_mda_tone_timeseries.csv',
          type: 'csv',
          size: '2.4KB',
          createdAt: '2026-10-23',
          stepNumber: 1,
          toolId: 'listed-filing-textmine',
        },
      ],
    },
    {
      stepNumber: 2,
      title: '业务驱动拆解与资产负债表穿透',
      purpose: '厘清收入驱动公式，识别负债成本下行与生息资产定价拐点',
      toolId: 'bank-alm-credit-lab',
      toolName: '银行经营与资产负债分析实验室',
      completed: true,
      completedAt: '2026-10-24',
      notes: '对公中长期贷款结构优化，高成本协议存款到期置换带来负债端成本节约约 9bp；资产端降幅收窄，净利息收入环比呈现企稳迹象。',
      artifacts: [],
    },
    {
      stepNumber: 3,
      title: '反推市场隐含预期（逆向估值）',
      purpose: '不猜具体靶价，用逆向 DCF 反推当前市值隐含的 FCF 增速与市场悲观假设',
      toolId: 'company-valuation-implied-expectations',
      toolName: '公司经营、估值与市场隐含预期实验室',
      completed: false,
      notes: '当前 5.6x P/E 隐含未来 5 年自由现金流年化增长仅 3.2%，低于行业名义 GDP 增速锚点。我方基准假设为 5.8%，安全边际测算约 26.5%。',
      artifacts: [],
    },
    {
      stepNumber: 4,
      title: '确立硬性证伪条件与认错线',
      purpose: '前置定义“出现什么证据证明自己错了”，并在交易前锁定平仓红线',
      toolId: 'decision-probability-calibration',
      toolName: '投资判断与概率校准训练系统',
      completed: false,
      notes: '认错硬线：若连续两个季度净息差环比跌破 1.85%，或关注类贷款迁徙率超过 2.5%，即判定假说失效，无条件认错止损。',
      artifacts: [],
    },
    {
      stepNumber: 5,
      title: '形成可审计结论与执行决议',
      purpose: '输出结构化工作底稿，沉淀非对称赔率逻辑与下季度核验清单',
      toolId: 'portfolio-risk-budgeting',
      toolName: '组合决策与风险预算工作台',
      completed: false,
      notes: '',
      artifacts: [],
    },
  ],
  resultMetrics: [
    { label: '市场隐含增速', value: '3.2%', hint: '逆向DCF隐含预期' },
    { label: '基准测算增速', value: '5.8%', hint: '保守资产回报模型' },
    { label: '估值安全边际', value: '26.5%', hint: '内在价值折价保护' },
  ],
};

export function useResearchCases() {
  const [cases, setCases] = useState<ResearchCase[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [INITIAL_DEFAULT_CASE];
  });

  const [customNotes, setCustomNotes] = useState<ResearchNote[]>(() => {
    try {
      const saved = localStorage.getItem(NOTES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Save cases to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    } catch {
      // ignore
    }
  }, [cases]);

  // Save custom notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(customNotes));
    } catch {
      // ignore
    }
  }, [customNotes]);

  // Create new research case
  const createCase = useCallback((params: {
    title: string;
    question: string;
    targetType: 'stock' | 'macro' | 'pair';
    targetIdentifier: string;
    targetName: string;
    asOfDate: string;
    playbookId: string;
  }): ResearchCase => {
    const pb = PLAYBOOKS.find((p) => p.id === params.playbookId) || PLAYBOOKS[0];

    const steps: ResearchCaseStep[] = pb.steps.map((s) => ({
      stepNumber: s.stepNumber,
      title: s.title,
      purpose: s.purpose,
      toolId: s.projectId,
      toolName: s.toolName,
      completed: false,
      notes: '',
      artifacts: [],
    }));

    const newCase: ResearchCase = {
      id: `case-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      title: params.title,
      question: params.question,
      targetType: params.targetType,
      targetIdentifier: params.targetIdentifier,
      targetName: params.targetName,
      asOfDate: params.asOfDate,
      playbookId: pb.id,
      playbookTitle: pb.title,
      playbookLetter: pb.letter,
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      steps,
    };

    setCases((prev) => [newCase, ...prev]);
    return newCase;
  }, []);

  // Update research case
  const updateCase = useCallback((caseId: string, partial: Partial<ResearchCase>) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            ...partial,
            updatedAt: new Date().toISOString().slice(0, 10),
          };
        }
        return c;
      })
    );
  }, []);

  // Toggle step completion status
  const toggleStep = useCallback((caseId: string, stepNumber: number) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updatedSteps = c.steps.map((st) => {
            if (st.stepNumber === stepNumber) {
              const nextCompleted = !st.completed;
              return {
                ...st,
                completed: nextCompleted,
                completedAt: nextCompleted ? new Date().toISOString().slice(0, 10) : undefined,
              };
            }
            return st;
          });
          return {
            ...c,
            steps: updatedSteps,
            updatedAt: new Date().toISOString().slice(0, 10),
          };
        }
        return c;
      })
    );
  }, []);

  // Update notes of a specific step
  const updateStepNotes = useCallback((caseId: string, stepNumber: number, notes: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updatedSteps = c.steps.map((st) => {
            if (st.stepNumber === stepNumber) {
              return { ...st, notes };
            }
            return st;
          });
          return {
            ...c,
            steps: updatedSteps,
            updatedAt: new Date().toISOString().slice(0, 10),
          };
        }
        return c;
      })
    );
  }, []);

  // Add evidence artifact to step
  const addStepArtifact = useCallback((caseId: string, stepNumber: number, artifact: Omit<ResearchCaseArtifact, 'id' | 'createdAt'>) => {
    const newArt: ResearchCaseArtifact = {
      ...artifact,
      id: `art-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString().slice(0, 10),
      stepNumber,
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updatedSteps = c.steps.map((st) => {
            if (st.stepNumber === stepNumber) {
              return {
                ...st,
                artifacts: [...st.artifacts, newArt],
              };
            }
            return st;
          });
          return {
            ...c,
            steps: updatedSteps,
            updatedAt: new Date().toISOString().slice(0, 10),
          };
        }
        return c;
      })
    );
  }, []);

  // Delete evidence artifact
  const deleteStepArtifact = useCallback((caseId: string, stepNumber: number, artifactId: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updatedSteps = c.steps.map((st) => {
            if (st.stepNumber === stepNumber) {
              return {
                ...st,
                artifacts: st.artifacts.filter((a) => a.id !== artifactId),
              };
            }
            return st;
          });
          return {
            ...c,
            steps: updatedSteps,
            updatedAt: new Date().toISOString().slice(0, 10),
          };
        }
        return c;
      })
    );
  }, []);

  // Delete research case
  const deleteCase = useCallback((caseId: string) => {
    setCases((prev) => prev.filter((c) => c.id !== caseId));
  }, []);

  // Conclude case and transform into a verified personal ResearchNote
  const concludeAndArchiveCase = useCallback((caseId: string, conclusionText: string, limitationsText: string): ResearchNote | null => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return null;

    const completedCount = targetCase.steps.filter((s) => s.completed).length;
    const today = new Date().toISOString().slice(0, 10);

    // Build synthesized markdown
    let md = `# ${targetCase.title}\n\n`;
    md += `**研究标的**：${targetCase.targetName} (${targetCase.targetIdentifier}) ｜ **基准时点**：${targetCase.asOfDate} ｜ **归档日期**：${today}\n`;
    md += `**采用路径**：路径 ${targetCase.playbookLetter} · ${targetCase.playbookTitle} ｜ **执行完成度**：${completedCount} / ${targetCase.steps.length} 步骤\n\n`;
    md += `> **核心研究命题**：${targetCase.question}\n\n---\n\n`;
    md += `## 一、 核心研判结论 (Conclusion)\n\n${conclusionText || '（未填写结论）'}\n\n`;
    
    if (limitationsText) {
      md += `## 二、 局限性与证伪边界 (Limitations & Kill Conditions)\n\n${limitationsText}\n\n`;
    }

    md += `## 三、 分步执行过程记录与提取证据\n\n`;
    targetCase.steps.forEach((st) => {
      md += `### 步骤 ${st.stepNumber}：${st.title} 【${st.completed ? '已完成' : '未标记'}】\n`;
      md += `- **目标工具**：${st.toolName}\n`;
      md += `- **核心目的**：${st.purpose}\n`;
      if (st.notes) {
        md += `- **实操笔记与记录**：\n\n\`\`\`text\n${st.notes}\n\`\`\`\n\n`;
      }
      if (st.artifacts.length > 0) {
        md += `- **保存证据材料**：${st.artifacts.map((a) => a.name).join('、')}\n\n`;
      }
    });

    const newNote: ResearchNote = {
      id: `note-verified-${Date.now().toString(36)}`,
      title: targetCase.title,
      subtitle: `${targetCase.targetName} · 基于路径 ${targetCase.playbookLetter} 的实证研究底稿`,
      date: today,
      author: 'Eugene (个人实证)',
      playbookId: targetCase.playbookId,
      playbookLetter: targetCase.playbookLetter,
      playbookTitle: targetCase.playbookTitle,
      domainId: '02-company',
      domainName: '公司与产业',
      associatedProjectIds: targetCase.steps.map((s) => s.toolId).filter((id): id is string => Boolean(id)),
      targetGoal: 'company',
      tags: ['实证底稿', targetCase.targetName, targetCase.targetIdentifier],
      summary: conclusionText ? conclusionText.slice(0, 160) + '...' : `关于 ${targetCase.targetName} 的分步实证研究底稿。`,
      keyFindings: [
        `标的与基准日：${targetCase.targetName} (${targetCase.targetIdentifier}) · 时点 ${targetCase.asOfDate}`,
        `已确认执行步骤：已实操并闭环 ${completedCount} / ${targetCase.steps.length} 步`,
        conclusionText ? conclusionText.split('\n')[0] : '已形成初步研判与反证止损线',
      ],
      contentMarkdown: md,
      isDemo: false, // 个人真实研究成果！
      sourceCaseId: targetCase.id,
      evidenceFiles: targetCase.steps.flatMap((s) => s.artifacts.map((a) => ({ name: a.name, type: a.type, size: a.size }))),
    };

    // Save note
    setCustomNotes((prev) => [newNote, ...prev]);

    // Mark case as concluded
    updateCase(caseId, {
      status: 'concluded',
      conclusion: conclusionText,
      limitations: limitationsText,
    });

    return newNote;
  }, [cases, updateCase]);

  // Add custom standalone note
  const addCustomNote = useCallback((note: ResearchNote) => {
    setCustomNotes((prev) => [note, ...prev]);
  }, []);

  // Delete custom note
  const deleteCustomNote = useCallback((noteId: string) => {
    setCustomNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  // Export / Import
  const exportCasesJson = useCallback(() => {
    return JSON.stringify({ cases, customNotes }, null, 2);
  }, [cases, customNotes]);

  const importCasesJson = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && Array.isArray(parsed.cases)) {
        setCases(parsed.cases);
      }
      if (parsed && Array.isArray(parsed.customNotes)) {
        setCustomNotes(parsed.customNotes);
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    cases,
    activeCases: cases.filter((c) => c.status === 'active'),
    concludedCases: cases.filter((c) => c.status === 'concluded'),
    customNotes,
    setCases,
    setCustomNotes,
    createCase,
    updateCase,
    toggleStep,
    updateStepNotes,
    addStepArtifact,
    deleteStepArtifact,
    deleteCase,
    concludeAndArchiveCase,
    addCustomNote,
    deleteCustomNote,
    exportCasesJson,
    importCasesJson,
  };
}
