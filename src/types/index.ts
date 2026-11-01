export type DomainId = 
  | '01-macro' 
  | '02-company' 
  | '03-strategy' 
  | '04-micro' 
  | '05-academic' 
  | '06-explore';

export type TargetGoal = 'academic' | 'company' | 'investment';

export type Stage = 'existing' | 'prototype' | 'planned';

export type AccessMode = 'web' | 'local' | 'private' | 'planned';

export type HostingType = 'static' | 'container' | 'local' | 'planned';

export interface DomainInfo {
  id: DomainId;
  number: string;
  name: string;
  enName: string;
  question: string;
  description: string;
  representativeProjects: string[];
}

export interface QueryProtocol {
  tickerParam?: string; // e.g. "ticker"
  dateParam?: string;   // e.g. "as_of"
  macroParam?: string;  // e.g. "series"
  pairParam?: string;   // e.g. "pair"
  defaultExample?: string;
  description?: string;
  hasDirectReceiver?: boolean; // whether target web app already parses this param or if user needs to copy-paste
}

export interface PrototypeInfo {
  type: 'notebook' | 'doc' | 'model';
  label: string;
  url?: string;
  description: string;
  snippet?: string;
}

export interface Project {
  id: string;
  name: string;
  enName: string;
  aliases: string[];
  summary: string;
  description: string;
  domainId: DomainId;
  domainNumber: string;
  domainName: string;
  subCategory?: string;
  targetGoals: TargetGoal[];
  methodTags: string[];
  stage: Stage;
  accessMode: AccessMode;
  hostingType?: HostingType;
  officialUrl?: string;
  repoUrl?: string;
  isRepoPrivate?: boolean;
  localPath?: string;
  verificationStatus: string;
  runCommand?: string;
  inputs: string;
  outputs: string;
  applicableScenes: string;
  techStack: string;
  playbookIds: string[];
  coverImage?: string;
  initialPinned?: boolean;
  prototypeInfo?: PrototypeInfo;
  queryProtocol?: QueryProtocol;
}

export interface PlaybookStep {
  stepNumber: number;
  title: string;
  purpose: string;
  projectId?: string;
  isExisting: boolean;
  toolName: string;
  actionGuidance: string;
  inputsRequired: string;
  expectedOutput: string;
}

export interface Playbook {
  id: string;
  letter: string;
  title: string;
  enTitle: string;
  subtitle: string;
  finalDeliverable: string;
  deliverableDescription: string;
  steps: PlaybookStep[];
  templateMarkdown: string;
}

export interface ResearchNote {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  author: string;
  playbookId: string;
  playbookLetter: string;
  playbookTitle: string;
  domainId: DomainId;
  domainName: string;
  associatedProjectIds: string[];
  targetGoal: TargetGoal;
  tags: string[];
  summary: string;
  keyFindings: string[];
  metrics?: { label: string; value: string; hint?: string }[];
  contentMarkdown: string;
  isDemo?: boolean; // true = 预置教学示范样本; false/undefined = 用户个人真实研究成果
  sourceCaseId?: string; // 关联生成该笔记的研究事项 ID
  evidenceFiles?: { name: string; type: string; size?: string; summary?: string }[];
}

export interface MediaItem {
  id: string;
  title: string;
  category: 'podcast' | 'article' | 'video' | 'essay';
  categoryLabel: string;
  date: string;
  summary: string;
  durationOrReadTime: string;
  link?: string;
  highlightTag?: string;
}

export type ActiveTab = 'workbench' | 'catalog' | 'notes' | 'exploration' | 'contracts';

// ==========================================
// V4.0 NEW CORE OBJECT: 研究事项 (Research Case)
// ==========================================

export type ContextTargetType = 'stock' | 'macro' | 'pair';

export interface ResearchCaseArtifact {
  id: string;
  name: string;
  type: 'csv' | 'json' | 'text' | 'image' | 'link';
  size?: string;
  content?: string;
  createdAt: string;
  stepNumber?: number;
  toolId?: string;
}

export interface ResearchCaseStep {
  stepNumber: number;
  title: string;
  purpose: string;
  toolId?: string;
  toolName: string;
  completed: boolean;
  completedAt?: string;
  notes: string;
  artifacts: ResearchCaseArtifact[];
}

export interface ResearchCase {
  id: string;
  title: string;
  question: string;
  targetType: ContextTargetType;
  targetIdentifier: string; // e.g. "600036.SH" or "US10Y" or "600036.SH,03968.HK"
  targetName: string; // e.g. "招商银行"
  asOfDate: string; // e.g. "2026-03-31"
  playbookId: string;
  playbookTitle: string;
  playbookLetter: string;
  status: 'active' | 'archived' | 'concluded';
  createdAt: string;
  updatedAt: string;
  steps: ResearchCaseStep[];
  conclusion?: string;
  limitations?: string;
  resultMetrics?: { label: string; value: string; hint?: string }[];
}
