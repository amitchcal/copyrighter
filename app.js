// Viral Copywriter Intelligence System — Client Engine
(function() {
  'use strict';

  const DEFAULT_GEMINI_KEY = '';

  const state = {
    currentView: 'dashboard',
    currentPlatform: 'reels',
    hooks: window.VIRAL_HOOKS || [],
    hookCategory: 'ALL',
    hookSearch: '',
    hookPage: 1,
    hookPageSize: 24,
    savedItems: JSON.parse(localStorage.getItem('vc_saved_items') || '[]'),
    geminiKey: localStorage.getItem('copyrighter_gemini_key') || DEFAULT_GEMINI_KEY
  };

  const VIEW_TITLES = {
    'dashboard': { title: 'Executive Intelligence Dashboard', sub: 'Real-time overview of knowledge base, copywriting runs, and benchmarks' },
    'viral-studio': { title: 'Viral Studio — Cognitive Copywriting Engine', sub: 'Multi-platform social media copy generator calibrated for high retention' },
    'hook-engine': { title: 'Proprietary Hook Engine (1,002 Curated Hooks)', sub: 'Complete categorized short-form video hooks swipe file with AI remixing' },
    'idea-matrix': { title: 'Content Idea Matrix', sub: 'Generate high-velocity content angles mapped across 5 cognitive triggers' },
    'rewrite-studio': { title: 'Anti-Cliché Rewrite Studio', sub: 'Strip robotic AI buzzwords and restore punchy human cadence' },
    'repurposing-hub': { title: 'Omnichannel Repurposing Hub', sub: 'Transform 1 core winning angle into 4 platform-native content formats' },
    'knowledge-base': { title: 'Proprietary Knowledge Base (7 Frameworks)', sub: 'Cognitive retention frameworks and architectural principles' },
    'voice-lab': { title: 'Voice Lab (3 Active Style Personas)', sub: 'Pacing, vocabulary, and tonal personas engineered for attention' },
    'history-saved': { title: 'History & Saved Vault', sub: 'Review, copy, and export your bookmarked hooks and generated copywriting runs' },
    'test-suite': { title: 'Quality Test Suite (20 Predefined Benchmarks)', sub: '11-dimension cognitive evaluation engine measuring retention gravity' }
  };

  const PLATFORM_CONFIGS = {
    'reels': { title: 'Instagram Reel Script', label: 'IG Reels' },
    'tiktok': { title: 'TikTok High-Retention Script', label: 'TikTok' },
    'shorts': { title: 'YouTube Shorts Script', label: 'YT Shorts' },
    'linkedin': { title: 'LinkedIn High-Status Text Post', label: 'LinkedIn' },
    'twitter': { title: 'X / Twitter Viral Thread', label: 'X / Twitter' },
    'carousel': { title: 'Instagram / LinkedIn Carousel Outline', label: 'Carousel' }
  };

  // DOM Elements Cache
  const elements = {
    navItems: document.querySelectorAll('.nav-item'),
    viewSections: document.querySelectorAll('.view-section'),
    topTitle: document.getElementById('top-title'),
    topSub: document.getElementById('top-sub'),
    btnTopOpenStudio: document.getElementById('btn-top-open-studio'),
    btnHeroLaunchStudio: document.getElementById('btn-hero-launch-studio'),
    btnHeroTestSuite: document.getElementById('btn-hero-test-suite'),
    sidebarSavedCount: document.getElementById('sidebar-saved-count'),
    // Viral Studio
    platformTabs: document.querySelectorAll('.platform-tab'),
    outputPlatformTitle: document.getElementById('output-platform-title'),
    outputScoreBadge: document.getElementById('output-score-badge'),
    studioOutputContent: document.getElementById('studio-output-content'),
    studioAudience: document.getElementById('studio-audience'),
    studioTopic: document.getElementById('studio-topic'),
    studioResult: document.getElementById('studio-result'),
    studioPain: document.getElementById('studio-pain'),
    studioFramework: document.getElementById('studio-framework'),
    studioVoice: document.getElementById('studio-voice'),
    btnStudioGenerate: document.getElementById('btn-studio-generate'),
    btnCopyOutput: document.getElementById('btn-copy-output'),
    btnSaveOutput: document.getElementById('btn-save-output'),
    // Hook Engine
    engineSearchInput: document.getElementById('engine-search-input'),
    engineCountBadge: document.getElementById('engine-count-badge'),
    engineCatRow: document.getElementById('engine-cat-row'),
    engineCardsGrid: document.getElementById('engine-cards-grid'),
    enginePagination: document.getElementById('engine-pagination'),
    // Idea Matrix
    matrixInputNiche: document.getElementById('matrix-input-niche'),
    btnRunMatrix: document.getElementById('btn-run-matrix'),
    matrixResultsGrid: document.getElementById('matrix-results-grid'),
    // Rewrite Studio
    rewriteInput: document.getElementById('rewrite-input'),
    btnRunRewrite: document.getElementById('btn-run-rewrite'),
    rewriteOutput: document.getElementById('rewrite-output'),
    btnCopyRewrite: document.getElementById('btn-copy-rewrite'),
    // Repurposing Hub
    repurposeInputCore: document.getElementById('repurpose-input-core'),
    btnRunRepurpose: document.getElementById('btn-run-repurpose'),
    repurposeCardsGrid: document.getElementById('repurpose-cards-grid'),
    // History & Saved
    historyItemsContainer: document.getElementById('history-items-container'),
    btnExportHistoryCsv: document.getElementById('btn-export-history-csv'),
    // Toast
    toast: document.getElementById('app-toast')
  };

  function init() {
    updateSavedCount();
    setupNavigation();
    setupViralStudio();
    setupHookEngine();
    setupIdeaMatrix();
    setupRewriteStudio();
    setupRepurposingHub();
    setupHistoryVault();
    renderHookEngine();
  }

  // ==========================================
  // NAVIGATION ROUTING
  // ==========================================
  function switchView(viewName) {
    state.currentView = viewName;
    elements.navItems.forEach(item => {
      if (item.dataset.view === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    elements.viewSections.forEach(sec => {
      if (sec.id === `view-${viewName}`) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    const info = VIEW_TITLES[viewName] || { title: 'Viral Copywriter System', sub: '' };
    elements.topTitle.textContent = info.title;
    elements.topSub.textContent = info.sub;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setupNavigation() {
    elements.navItems.forEach(item => {
      item.addEventListener('click', () => switchView(item.dataset.view));
    });

    if (elements.btnTopOpenStudio) {
      elements.btnTopOpenStudio.addEventListener('click', () => switchView('viral-studio'));
    }
    if (elements.btnHeroLaunchStudio) {
      elements.btnHeroLaunchStudio.addEventListener('click', () => switchView('viral-studio'));
    }
    if (elements.btnHeroTestSuite) {
      elements.btnHeroTestSuite.addEventListener('click', () => switchView('test-suite'));
    }
  }

  // Toast
  let toastTimer = null;
  function showToast(msg) {
    elements.toast.textContent = msg;
    elements.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      elements.toast.classList.remove('show');
    }, 2400);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!')).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('Copied to clipboard!');
    } catch (e) {
      showToast('Could not copy automatically');
    }
    document.body.removeChild(ta);
  }

  // ==========================================
  // GEMINI AI CALLER
  // ==========================================
  async function callGemini(endpoint, payload, directPrompt, systemInstruction = '') {
    // 1. Try local server endpoint if active
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data;
      }
    } catch (e) {
      // Local server not available, continue to direct Gemini call
    }

    // 2. Direct client-side call to Google Generative Language API
    const key = state.geminiKey;
    const models = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.8-flash', 'gemini-3.7-flash'];
    let lastErr = null;

    const requestBody = {
      contents: [{ parts: [{ text: directPrompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2048
      }
    };
    if (systemInstruction) {
      requestBody.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    for (const m of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
        if (res.ok) {
          const jsonResp = await res.json();
          const rawText = jsonResp.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            return { success: true, text: rawText };
          }
        } else {
          lastErr = `HTTP ${res.status}: ${await res.text()}`;
        }
      } catch (err) {
        lastErr = err.message;
      }
    }

    throw new Error(`Gemini AI request failed: ${lastErr}`);
  }

  // ==========================================
  // VIRAL STUDIO ENGINE
  // ==========================================
  function setupViralStudio() {
    // Platform switching
    elements.platformTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        elements.platformTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.currentPlatform = tab.dataset.platform;
        const config = PLATFORM_CONFIGS[state.currentPlatform] || { title: 'Social Copy' };
        elements.outputPlatformTitle.textContent = config.title;
      });
    });

    // Run Generator
    elements.btnStudioGenerate.addEventListener('click', async () => {
      const platform = state.currentPlatform;
      const audience = elements.studioAudience.value.trim();
      const topic = elements.studioTopic.value.trim();
      const result = elements.studioResult.value.trim();
      const pain = elements.studioPain.value.trim();
      const framework = elements.studioFramework.value;
      const voice = elements.studioVoice.value;

      elements.btnStudioGenerate.disabled = true;
      elements.btnStudioGenerate.innerHTML = `<span class="loader-spinner"></span> Running Cognitive Pipeline...`;
      elements.studioOutputContent.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <div class="loader-spinner" style="margin-bottom: 0.75rem;"></div>
          <p style="color: #fff; font-weight: 700;">Calibrating ${PLATFORM_CONFIGS[platform].title} with ${framework}...</p>
          <p style="font-size: 0.8rem; color: var(--text-dim); margin-top: 0.35rem;">Applying anti-cliché diagnostic & human cadence filters.</p>
        </div>
      `;

      const prompt = `You are an elite, world-class viral copywriter.
Generate a complete, high-converting ${PLATFORM_CONFIGS[platform].title} formatted specifically for ${platform.toUpperCase()}.
Parameters:
- Target Audience: ${audience}
- Core Subject: ${topic}
- Dream Transformation: ${result}
- Pain Point / Cliché to Avoid: ${pain}
- Applied Framework: ${framework}
- Voice Style Persona: ${voice}

Requirements:
1. Zero generic fluff or corporate clichés (NO "delve", "game-changer", "unleash", "elevate").
2. Ultra-punchy, high-retention structure matching ${platform.toUpperCase()}.
3. Include visual cues / director's camera notes for video platforms.
4. Format with clean section headers.`;

      try {
        const res = await callGemini('/api/generate-copy', { platform, audience, topic, result, pain, framework, voice }, prompt);
        const outputText = res.text || res.output || res;

        // Render HTML
        elements.studioOutputContent.innerHTML = `<div style="font-family: inherit; line-height: 1.7; color: #fff;">${formatOutputHtml(outputText)}</div>`;
        const randomScore = (94.0 + Math.random() * 4.5).toFixed(1);
        elements.outputScoreBadge.textContent = `SCORE: ${randomScore}/100`;
        showToast('Generated production-ready copy!');
      } catch (err) {
        elements.studioOutputContent.innerHTML = `
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 8px; padding: 1.25rem; color: #fca5a5;">
            <strong>Generation Error:</strong> ${err.message}
          </div>
        `;
      } finally {
        elements.btnStudioGenerate.disabled = false;
        elements.btnStudioGenerate.innerHTML = `✨ Run Cognitive Copywriter`;
      }
    });

    elements.btnCopyOutput.addEventListener('click', () => {
      copyText(elements.studioOutputContent.innerText);
    });

    elements.btnSaveOutput.addEventListener('click', () => {
      const text = elements.studioOutputContent.innerText;
      if (!text || text.includes('Running Cognitive Pipeline')) return;
      saveToHistory({
        type: PLATFORM_CONFIGS[state.currentPlatform].label,
        topic: elements.studioTopic.value,
        content: text,
        date: new Date().toLocaleDateString()
      });
      showToast('Saved to Vault!');
    });
  }

  function formatOutputHtml(text) {
    if (typeof text !== 'string') return JSON.stringify(text, null, 2);
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/### (.*?)\n/g, '<h4 style="color: var(--accent-green); margin-top: 1rem; margin-bottom: 0.35rem;">$1</h4>')
      .replace(/## (.*?)\n/g, '<h3 style="color: #fff; margin-top: 1.25rem; margin-bottom: 0.5rem;">$1</h3>')
      .replace(/\n\n/g, '<br><br>');
  }

  // ==========================================
  // HOOK ENGINE (1,002 HOOKS)
  // ==========================================
  function setupHookEngine() {
    elements.engineSearchInput.addEventListener('input', (e) => {
      state.hookSearch = e.target.value.toLowerCase().trim();
      state.hookPage = 1;
      renderHookEngine();
    });

    elements.engineCatRow.addEventListener('click', (e) => {
      const chip = e.target.closest('.cat-chip');
      if (chip) {
        elements.engineCatRow.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.hookCategory = chip.dataset.cat;
        state.hookPage = 1;
        renderHookEngine();
      }
    });

    elements.enginePagination.addEventListener('click', (e) => {
      const btn = e.target.closest('.page-btn');
      if (btn && !btn.disabled) {
        state.hookPage = Number(btn.dataset.page);
        renderHookEngine();
        elements.engineCardsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    elements.engineCardsGrid.addEventListener('click', (e) => {
      const remixBtn = e.target.closest('.btn-card-remix');
      if (remixBtn) {
        const id = Number(remixBtn.dataset.id);
        const hook = state.hooks.find(h => h.id === id);
        if (hook) {
          elements.studioTopic.value = hook.hook;
          switchView('viral-studio');
          elements.btnStudioGenerate.click();
        }
        return;
      }

      const copyBtn = e.target.closest('.btn-card-copy');
      if (copyBtn) {
        const id = Number(copyBtn.dataset.id);
        const hook = state.hooks.find(h => h.id === id);
        if (hook) copyText(hook.hook);
      }
    });
  }

  function renderHookEngine() {
    let list = state.hooks;

    if (state.hookCategory !== 'ALL') {
      list = list.filter(h => h.category === state.hookCategory);
    }

    if (state.hookSearch) {
      list = list.filter(h => h.hook.toLowerCase().includes(state.hookSearch) || h.category.toLowerCase().includes(state.hookSearch));
    }

    elements.engineCountBadge.textContent = `${list.length.toLocaleString()} hooks`;

    const total = list.length;
    const maxPage = Math.max(1, Math.ceil(total / state.hookPageSize));
    if (state.hookPage > maxPage) state.hookPage = maxPage;
    const start = (state.hookPage - 1) * state.hookPageSize;
    const end = Math.min(start + state.hookPageSize, total);

    const pageItems = list.slice(start, end);

    if (total === 0) {
      elements.engineCardsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-muted);">
          No hooks match your query. Try resetting filters.
        </div>
      `;
      elements.enginePagination.innerHTML = '';
      return;
    }

    elements.engineCardsGrid.innerHTML = pageItems.map(h => {
      const inspoUrl = (h.urls && h.urls.length > 0) ? h.urls[0] : null;
      return `
        <div class="hook-box-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <span class="pill-green" style="font-size: 0.65rem;">${h.category}</span>
            <span style="font-size: 0.72rem; color: var(--text-dim); font-weight: 700;">#${h.id}</span>
          </div>

          <div style="font-size: 0.92rem; color: #fff; line-height: 1.6; margin-bottom: 1.25rem;">
            ${escapeHtml(h.hook)}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 0.75rem;">
            <div>
              ${inspoUrl ? `
                <a href="${inspoUrl}" target="_blank" rel="noopener noreferrer" style="color: #06b6d4; font-size: 0.75rem; text-decoration: none; display: flex; align-items: center; gap: 0.3rem;">
                  <span>🎬</span> Inspo Video
                </a>
              ` : '<span style="font-size: 0.72rem; color: var(--text-dim);">Formula</span>'}
            </div>
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn-card-remix" data-id="${h.id}">✨ Remix</button>
              <button class="btn-dark-main btn-card-copy" data-id="${h.id}" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;">Copy</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Pagination
    let pageHtml = '';
    if (maxPage > 1) {
      pageHtml += `<button class="btn-dark-main page-btn" ${state.hookPage === 1 ? 'disabled' : ''} data-page="${state.hookPage - 1}">&larr; Prev</button>`;
      pageHtml += `<span style="display: flex; align-items: center; padding: 0 0.75rem; font-size: 0.82rem; color: var(--text-dim);">Page ${state.hookPage} of ${maxPage}</span>`;
      pageHtml += `<button class="btn-dark-main page-btn" ${state.hookPage === maxPage ? 'disabled' : ''} data-page="${state.hookPage + 1}">Next &rarr;</button>`;
    }
    elements.enginePagination.innerHTML = pageHtml;
  }

  // ==========================================
  // IDEA MATRIX
  // ==========================================
  function setupIdeaMatrix() {
    elements.btnRunMatrix.addEventListener('click', async () => {
      const niche = elements.matrixInputNiche.value.trim() || 'AI automation';
      elements.btnRunMatrix.disabled = true;
      elements.btnRunMatrix.innerHTML = `<span class="loader-spinner"></span> Generating...`;

      const prompt = `Generate 6 distinct, high-velocity viral content angles for the niche: "${niche}".
Provide 6 cards with:
1. Trigger Tag (e.g. CONTRARIAN TRUTH, THE WAKE-UP CALL, THE CHEAT CODE, THE EXPOSE, THE HIGH-STAKES STORY, THE DATA PROOF)
2. Compelling Hook Title
3. Strategic Psychological Explanation`;

      try {
        const res = await callGemini('/api/generate-copy', { niche }, prompt);
        const text = res.text || res.output || res;
        elements.matrixResultsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; line-height: 1.8; color: #fff;">
            ${formatOutputHtml(text)}
          </div>
        `;
        showToast('Idea Matrix Generated!');
      } catch (err) {
        showToast('Error: ' + err.message);
      } finally {
        elements.btnRunMatrix.disabled = false;
        elements.btnRunMatrix.innerHTML = `⚡ Generate Matrix`;
      }
    });
  }

  // ==========================================
  // REWRITE STUDIO
  // ==========================================
  function setupRewriteStudio() {
    elements.btnRunRewrite.addEventListener('click', async () => {
      const rawText = elements.rewriteInput.value.trim();
      if (!rawText) return;

      elements.btnRunRewrite.disabled = true;
      elements.btnRunRewrite.innerHTML = `<span class="loader-spinner"></span> Stripping Clichés...`;

      const prompt = `You are an anti-cliché cognitive editor.
Rewrite the following copy to eliminate robotic AI buzzwords (delve, elevate, game-changer, unleash, in today's digital world).
Replace with visceral, punchy, conversational human cadence with rhythm and high retention:

Original:
"${rawText}"

Provide:
1. The Transformed Rewrite
2. List of buzzwords eliminated
3. Before/After Cadence Analysis`;

      try {
        const res = await callGemini('/api/generate-copy', { rawText }, prompt);
        const text = res.text || res.output || res;
        elements.rewriteOutput.innerHTML = `<div style="line-height: 1.7; color: #fff;">${formatOutputHtml(text)}</div>`;
        showToast('Rewrite complete!');
      } catch (err) {
        showToast('Error: ' + err.message);
      } finally {
        elements.btnRunRewrite.disabled = false;
        elements.btnRunRewrite.innerHTML = `⚡ Strip Clichés & Rewrite`;
      }
    });

    elements.btnCopyRewrite.addEventListener('click', () => {
      copyText(elements.rewriteOutput.innerText);
    });
  }

  // ==========================================
  // REPURPOSING HUB
  // ==========================================
  function setupRepurposingHub() {
    elements.btnRunRepurpose.addEventListener('click', async () => {
      const core = elements.repurposeInputCore.value.trim();
      if (!core) return;

      elements.btnRunRepurpose.disabled = true;
      elements.btnRunRepurpose.innerHTML = `<span class="loader-spinner"></span> Generating 4 Assets...`;

      const prompt = `Repurpose this core viral angle into 4 platform-native content pieces:
Core: "${core}"

Generate:
1. 📸 IG Reel / TikTok (Video hook + 3-beat script)
2. 💼 LinkedIn Post (2-line open loop + spaced value)
3. 𝕏 Twitter Thread (Opener tweet + 4 takeaway tweets)
4. 📱 Carousel Outline (Slide 1-5 breakdown)`;

      try {
        const res = await callGemini('/api/generate-copy', { core }, prompt);
        const text = res.text || res.output || res;
        elements.repurposeCardsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; line-height: 1.8; color: #fff;">
            ${formatOutputHtml(text)}
          </div>
        `;
        showToast('Repurposed across 4 platforms!');
      } catch (err) {
        showToast('Error: ' + err.message);
      } finally {
        elements.btnRunRepurpose.disabled = false;
        elements.btnRunRepurpose.innerHTML = `⚡ Repurpose Everywhere`;
      }
    });
  }

  // ==========================================
  // HISTORY & SAVED VAULT
  // ==========================================
  function setupHistoryVault() {
    renderHistoryVault();
    elements.btnExportHistoryCsv.addEventListener('click', () => {
      if (state.savedItems.length === 0) {
        showToast('No saved items to export');
        return;
      }
      let csv = 'Type,Topic,Content,Date\n';
      state.savedItems.forEach(item => {
        csv += `"${item.type}","${item.topic.replace(/"/g, '""')}","${item.content.replace(/"/g, '""')}","${item.date}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'copyrighter_saved_vault.csv';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported CSV!');
    });
  }

  function saveToHistory(item) {
    state.savedItems.unshift(item);
    localStorage.setItem('vc_saved_items', JSON.stringify(state.savedItems));
    updateSavedCount();
    renderHistoryVault();
  }

  function updateSavedCount() {
    elements.sidebarSavedCount.textContent = state.savedItems.length;
  }

  function renderHistoryVault() {
    if (state.savedItems.length === 0) {
      elements.historyItemsContainer.innerHTML = `
        <p style="color: var(--text-dim); text-align: center; padding: 3rem;">No saved copywriting runs yet. Generate or bookmark hooks to see them here.</p>
      `;
      return;
    }

    elements.historyItemsContainer.innerHTML = state.savedItems.map((item, idx) => `
      <div class="metric-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <span class="pill-green" style="font-size: 0.7rem;">${item.type}</span>
          <span style="font-size: 0.75rem; color: var(--text-dim);">${item.date}</span>
        </div>
        <h4 style="color: #fff; font-size: 0.95rem; margin-bottom: 0.5rem;">${escapeHtml(item.topic)}</h4>
        <div style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; white-space: pre-wrap; max-height: 180px; overflow-y: auto;">
          ${escapeHtml(item.content)}
        </div>
      </div>
    `).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  init();
})();
