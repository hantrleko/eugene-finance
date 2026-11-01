/**
 * Eugene Finance · Micro-Header (Cross-Project Unified Nav Bar)
 * Version: 3.0.0
 * Framework-free, zero dependencies, Shadow DOM isolated.
 * 
 * Usage in any sub-project (HTML, React, Vue, Streamlit, Replit, Railway):
 * <script src="https://hantrleko.github.io/eugene-finance/ef-nav.js" data-project="quant-risk-lab"></script>
 */
(function () {
  if (typeof window === 'undefined') return;
  if (document.getElementById('ef-micro-header-root')) return;

  // Project directory mapping for domain & next tool suggestions
  const HUB_URL = 'https://hantrleko.github.io/eugene-finance/';
  
  const PROJECT_ROUTING = {
    'market-pulse': {
      name: 'Market Pulse',
      domain: '01 市场与宏观',
      nextId: 'quant-risk-lab',
      nextName: 'QuantRiskLab (无前瞻时点风险)',
      nextUrl: 'https://quantrisklab-production.up.railway.app'
    },
    'quant-risk-lab': {
      name: 'QuantRiskLab',
      domain: '01 市场与宏观',
      nextId: 'gpr-haven-lab',
      nextName: 'GPR避险实验室',
      nextUrl: 'https://hantrleko.github.io/gpr-haven-lab/'
    },
    'gpr-haven-lab': {
      name: 'GPR避险实验室',
      domain: '01 市场与宏观',
      nextId: 'global-capital-flow-atlas',
      nextName: 'Global Capital Flow Atlas',
      nextUrl: 'https://hantrleko.github.io/global-capital-flow-atlas/'
    },
    'global-capital-flow-atlas': {
      name: 'Global Capital Flow Atlas',
      domain: '01 市场与宏观',
      nextId: 'market-pulse',
      nextName: 'Market Pulse',
      nextUrl: 'https://market-pulse.replit.app'
    },
    'listed-filing-textmine': {
      name: '年报文本特征引擎',
      domain: '02 公司与产业',
      nextId: 'a-share-event-study',
      nextName: 'A股事件研究 (检验语气超额收益)',
      nextUrl: 'https://a-share-event-study-production.up.railway.app'
    },
    'ah-pairs-dashboard': {
      name: 'A+H协整与配对交易',
      domain: '03 策略与组合',
      nextId: 'factor-workbench',
      nextName: '因子工作台',
      nextUrl: 'https://factor-workbench-production.up.railway.app'
    },
    'factor-workbench': {
      name: '因子工作台',
      domain: '03 策略与组合',
      nextId: 'us-stock-quant-tool',
      nextName: 'QuantLab美股量化',
      nextUrl: 'https://us-stock-quant-tool.bolt.app'
    },
    'market-microstructure-lab': {
      name: 'MML 市场微观结构',
      domain: '04 微观与衍生品',
      nextId: 'market-pulse',
      nextName: 'Market Pulse',
      nextUrl: 'https://market-pulse.replit.app'
    },
    'ef-lab': {
      name: 'EF Lab · 理论与实验',
      domain: '05 学术与学习',
      nextId: 'a-share-event-study',
      nextName: 'A股事件研究',
      nextUrl: 'https://a-share-event-study-production.up.railway.app'
    },
    'a-share-event-study': {
      name: 'A股事件研究',
      domain: '05 学术与学习',
      nextId: 'listed-filing-textmine',
      nextName: '年报文本特征引擎 (提取MD&A变量)',
      nextUrl: 'https://listed-filing-textmine-production.up.railway.app'
    },
    'cfa-wizard-buddy': {
      name: 'CFA-Wizard-Buddy',
      domain: '05 学术与学习',
      nextId: 'ef-lab',
      nextName: 'EF Lab · 理论与交互实验',
      nextUrl: 'https://eugenefinance.tech/'
    }
  };

  // Find calling script tag to extract attributes
  const currentScript = document.currentScript || (function () {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  let projectId = currentScript ? currentScript.getAttribute('data-project') : null;

  // Auto-detect if not explicitly provided
  if (!projectId) {
    const host = window.location.hostname.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    for (const key of Object.keys(PROJECT_ROUTING)) {
      if (host.includes(key) || path.includes(key)) {
        projectId = key;
        break;
      }
    }
  }

  const projectInfo = (projectId && PROJECT_ROUTING[projectId]) ? PROJECT_ROUTING[projectId] : {
    name: 'Eugene Finance 子系统',
    domain: 'Eugene Finance 体系',
    nextId: 'hub',
    nextName: '返回工作台',
    nextUrl: HUB_URL
  };

  // Create Container
  const container = document.createElement('div');
  container.id = 'ef-micro-header-root';
  document.body.appendChild(container);

  // Attach Shadow DOM to strictly prevent CSS leak
  const shadow = container.attachShadow({ mode: 'open' });

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 11px;
      line-height: 28px;
      color: #94a3b8;
      box-sizing: border-box;
      z-index: 2147483647;
      position: relative;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    .ef-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 28px;
      background: rgba(8, 12, 21, 0.94);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(212, 175, 55, 0.25);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 12px;
      z-index: 2147483647;
      transition: transform 0.2s ease, opacity 0.2s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.5);
    }
    .ef-bar.collapsed {
      transform: translateY(-28px);
      pointer-events: none;
    }
    .ef-left, .ef-center, .ef-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ef-brand {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #e2e8f0;
      font-weight: 600;
      text-decoration: none;
      letter-spacing: 0.02em;
    }
    .ef-brand:hover {
      color: #f6e05e;
    }
    .ef-badge-logo {
      display: inline-block;
      width: 14px;
      height: 14px;
      border-radius: 3px;
      background: linear-gradient(135deg, #d4af37, #b78727);
      color: #080c15;
      font-weight: 800;
      font-size: 9px;
      line-height: 14px;
      text-align: center;
    }
    .ef-back-link {
      color: #cbd5e1;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 3px;
      padding: 1px 6px;
      border-radius: 4px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      transition: all 0.15s ease;
    }
    .ef-back-link:hover {
      color: #ffffff;
      background: rgba(212, 175, 55, 0.2);
      border-color: rgba(212, 175, 55, 0.4);
    }
    .ef-domain-tag {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 10px;
      color: #d4af37;
      background: rgba(212, 175, 55, 0.1);
      border: 1px solid rgba(212, 175, 55, 0.25);
      border-radius: 3px;
      padding: 0 5px;
      height: 18px;
      line-height: 17px;
    }
    .ef-current-name {
      color: #94a3b8;
      font-size: 10px;
    }
    .ef-next-link {
      color: #38bdf8;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      transition: color 0.15s ease;
    }
    .ef-next-link:hover {
      color: #7dd3fc;
      text-decoration: underline;
    }
    .ef-toggle-btn {
      background: transparent;
      border: none;
      color: #64748b;
      cursor: pointer;
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 3px;
      line-height: 1;
    }
    .ef-toggle-btn:hover {
      color: #cbd5e1;
      background: rgba(255,255,255,0.1);
    }
    /* Floating restored pill when collapsed */
    .ef-floater {
      position: fixed;
      top: 6px;
      left: 8px;
      z-index: 2147483647;
      background: rgba(8, 12, 21, 0.9);
      border: 1px solid rgba(212, 175, 55, 0.4);
      border-radius: 12px;
      padding: 3px 8px;
      display: none;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      color: #d4af37;
      font-size: 10px;
      backdrop-filter: blur(8px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    }
    .ef-floater:hover {
      background: rgba(15, 23, 42, 0.95);
      color: #fef08a;
    }
    .ef-floater.visible {
      display: flex;
    }
    @media (max-width: 640px) {
      .ef-domain-tag, .ef-current-name {
        display: none;
      }
    }
  `;
  shadow.appendChild(style);

  // Template HTML
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="ef-bar" id="efBar">
      <div class="ef-left">
        <a href="${HUB_URL}" class="ef-brand" target="_top" title="访问 Eugene Finance 统一主站">
          <span class="ef-badge-logo">EF</span>
          <span>Eugene Finance</span>
        </a>
        <a href="${HUB_URL}#workbench" class="ef-back-link" target="_top" title="返回统一工作台">
          <span>← 工作台</span>
        </a>
        <span class="ef-domain-tag">${projectInfo.domain}</span>
        <span class="ef-current-name">· ${projectInfo.name}</span>
      </div>

      <div class="ef-right">
        ${projectInfo.nextUrl ? `
          <a href="${projectInfo.nextUrl}" class="ef-next-link" target="_top" title="链向下一个推荐工具">
            <span>推荐下一站: ${projectInfo.nextName}</span>
            <span>→</span>
          </a>
        ` : ''}
        <button class="ef-toggle-btn" id="efCollapseBtn" title="折叠导航条（腾出视口空间）">✕</button>
      </div>
    </div>

    <div class="ef-floater" id="efFloater" title="展开 Eugene Finance 导航条">
      <span class="ef-badge-logo">EF</span>
      <span>工作台导航 ▲</span>
    </div>
  `;
  shadow.appendChild(wrapper);

  // Adjust host page body padding
  const pushBody = currentScript ? currentScript.getAttribute('data-push-body') !== 'false' : true;
  if (pushBody) {
    document.body.style.paddingTop = '28px';
  }

  // Interaction: Collapse & Expand
  const bar = shadow.getElementById('efBar');
  const floater = shadow.getElementById('efFloater');
  const collapseBtn = shadow.getElementById('efCollapseBtn');

  collapseBtn.addEventListener('click', function () {
    bar.classList.add('collapsed');
    floater.classList.add('visible');
    if (pushBody) {
      document.body.style.paddingTop = '0px';
    }
  });

  floater.addEventListener('click', function () {
    bar.classList.remove('collapsed');
    floater.classList.remove('visible');
    if (pushBody) {
      document.body.style.paddingTop = '28px';
    }
  });

})();
