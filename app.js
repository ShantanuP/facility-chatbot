/**
 * Facility Manager Chatbot
 * Intent detection → Corrigo connection → data retrieval → response + charts + follow-ups
 */

(function () {
  const CONNECTION_KEY = 'facility_chat_corrigo_connected';
  const CREDENTIALS_KEY = 'facility_chat_corrigo_creds';
  const CHAT_HISTORY_KEY = 'facility_chat_sessions';
  const CURRENT_SESSION_KEY = 'facility_chat_current_id';

  const state = {
    connected: false,
    currentSessionId: null,
    sessions: [],
    chartIdCounter: 0,
  };

  const elements = {
    chatMessages: document.getElementById('chatMessages'),
    chatInput: document.getElementById('chatInput'),
    sendBtn: document.getElementById('sendBtn'),
    welcomeBlock: document.getElementById('welcomeBlock'),
    connectionStatus: document.getElementById('connectionStatus'),
    profileName: document.getElementById('profileName'),
    chatHistoryList: document.getElementById('chatHistoryList'),
    historyEmpty: document.getElementById('historyEmpty'),
    newChatBtn: document.getElementById('newChatBtn'),
    credentialsModal: document.getElementById('credentialsModal'),
    credentialsForm: document.getElementById('credentialsForm'),
    closeCredentialsBtn: document.getElementById('closeCredentialsBtn'),
    cancelCredentialsBtn: document.getElementById('cancelCredentialsBtn'),
  };

  const promptChips = document.querySelectorAll('.prompt-chip');

  // ----- Intent detection (keyword + pattern based for Corrigo data types) -----
  const INTENTS = {
    WORK_ORDERS_OPEN: {
      patterns: [
        /open\s+work\s+order|work\s+order.*open|pending\s+work|last\s+\d+\s+days|recent\s+work/,
        /show\s+(me\s+)?(open\s+)?work\s+order/,
        /list\s+work\s+order/,
      ],
      dataType: 'work_orders',
    },
    WORK_ORDERS_BY_STATUS: {
      patterns: [
        /work\s+order.*status|status.*work\s+order|by\s+status|chart.*status/,
        /breakdown|distribution|count\s+by/,
      ],
      dataType: 'work_orders_by_status',
      chart: true,
    },
    ASSETS_BY_COST: {
      patterns: [
        /top\s+\d+\s+asset|asset.*cost|maintenance\s+cost|cost.*asset/,
        /most\s+expensive|highest\s+cost/,
      ],
      dataType: 'assets_by_cost',
      chart: true,
    },
    ASSETS_LIST: {
      patterns: [/list\s+asset|all\s+asset|asset\s+list|show\s+asset/],
      dataType: 'assets',
    },
    LOCATIONS: {
      patterns: [
        /location|site|building|facility\s+list|where\s+are/,
      ],
      dataType: 'locations',
    },
    MAINTENANCE: {
      patterns: [
        /maintenance|preventive|pm\s+schedule|upcoming\s+maintenance/,
      ],
      dataType: 'maintenance',
    },
    GENERAL: {
      patterns: [/hello|hi|help|what\s+can\s+you/],
      dataType: null,
    },
  };

  function detectIntent(text) {
    const lower = text.toLowerCase().trim();
    for (const [name, config] of Object.entries(INTENTS)) {
      for (const p of config.patterns) {
        if (p.test(lower)) {
          const result = { intent: name, ...config };
          // Only filter work orders by period if the user asks for one
          if (config.dataType === 'work_orders') {
            const lastDaysMatch = lower.match(/last\s+(\d+)\s+days?/);
            if (lastDaysMatch) {
              result.timeRange = true;
              result.lastDays = Math.min(365, parseInt(lastDaysMatch[1], 10) || 7);
            } else if (/\b(last\s+week|recent|past\s+week|this\s+week)\b/.test(lower)) {
              result.timeRange = true;
              result.lastDays = 7;
            } else {
              result.timeRange = false;
            }
          }
          return result;
        }
      }
    }
    return { intent: 'UNKNOWN', dataType: null };
  }

  function needsCorrigoData(intentResult) {
    return intentResult.dataType != null && intentResult.intent !== 'GENERAL';
  }

  // ----- Corrigo connection (simulated; real app would use API) -----
  function loadConnectionState() {
    try {
      state.connected = localStorage.getItem(CONNECTION_KEY) === 'true';
    } catch (_) {
      state.connected = false;
    }
    updateConnectionUI();
  }

  function saveConnection(connected) {
    state.connected = connected;
    try {
      localStorage.setItem(CONNECTION_KEY, connected ? 'true' : '');
    } catch (_) {}
    updateConnectionUI();
  }

  function updateConnectionUI() {
    const statusEl = elements.connectionStatus;
    if (!statusEl) return;
    const dot = statusEl.querySelector('.status-dot');
    const textEl = statusEl.querySelector('.status-text');
    if (state.connected) {
      dot?.classList.remove('disconnected');
      dot?.classList.add('connected');
      if (textEl) textEl.textContent = 'Connected';
    } else {
      dot?.classList.add('disconnected');
      dot?.classList.remove('connected');
      if (textEl) textEl.textContent = 'Not connected';
    }
  }

  function showCredentialsModal() {
    if (elements.credentialsModal) {
      elements.credentialsModal.hidden = false;
    }
  }

  function hideCredentialsModal() {
    if (elements.credentialsModal) {
      elements.credentialsModal.hidden = true;
    }
  }

  async function connectWithCredentials(serverHostname, httpPath, accessToken) {
    try {
      const res = await fetch(API_BASE + '/api/databricks-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverHostname: serverHostname.trim(),
          httpPath: httpPath.trim(),
          accessToken: accessToken.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        console.warn('Databricks connect failed', json.error || res.statusText);
        return false;
      }
    } catch (err) {
      console.warn('Databricks connect error', err);
      return false;
    }
    saveConnection(true);
    try {
      localStorage.setItem(
        CREDENTIALS_KEY,
        JSON.stringify({
          serverHostname: serverHostname.trim(),
          httpPath: httpPath.trim(),
          accessToken: accessToken.trim(),
        })
      );
      const displayName = serverHostname.replace(/^https?:\/\//, '').split('/')[0];
      if (elements.profileName) elements.profileName.textContent = displayName;
    } catch (_) {}
    hideCredentialsModal();
    return true;
  }

  // ----- Corrigo data: fetch from local API (sample data in corrigo.db) -----
  const API_BASE = '';

  async function fetchCorrigoData(dataType, options = {}) {
    if (!state.connected) return null;

    const endpoints = {
      work_orders: 'work-orders',
      work_orders_by_status: 'work-orders-by-status',
      assets_by_cost: 'assets-by-cost',
      assets: 'assets',
      locations: 'locations',
      maintenance: 'maintenance',
    };
    const endpoint = endpoints[dataType];
    if (!endpoint) return null;

    let url = API_BASE + '/api/' + endpoint;
    if (dataType === 'work_orders' && options.timeRange) {
      const lastDays = options.lastDays || 7;
      url += '?lastDays=' + encodeURIComponent(lastDays);
    }
    if (dataType === 'assets_by_cost') {
      url += (url.includes('?') ? '&' : '?') + 'limit=10';
    }

    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Corrigo API request failed:', err);
      return null;
    }
  }

  // ----- Response builders: describe results, optionally chart + follow-ups -----
  function describeWorkOrders(data) {
    if (!data?.workOrders?.length) {
      return { text: 'No open work orders found for the selected period.', followUps: ['Show work orders by status', 'List all assets', 'Show locations'] };
    }
    const list = data.workOrders
      .map((wo) => `• **${wo.id}** – ${wo.title} (${wo.status}, ${wo.priority}) – ${wo.site}`)
      .join('\n');
    const text = `Here are the work orders from Corrigo:\n\n${list}\n\nTotal: ${data.workOrders.length} work order(s).`;
    return {
      text,
      followUps: ['Show work orders by status with a chart', 'Top 5 assets by maintenance cost', 'What locations have the most work?'],
    };
  }

  function describeWorkOrdersByStatus(data) {
    if (!data?.byStatus?.length) {
      return { text: 'No status breakdown available.', followUps: ['Show open work orders', 'List assets'] };
    }
    const list = data.byStatus.map((s) => `• **${s.status}**: ${s.count}`).join('\n');
    const total = data.byStatus.reduce((sum, s) => sum + s.count, 0);
    const text = `Work orders by status:\n\n${list}\n\n**Total:** ${total} work orders. I've added a chart below for a quick view.`;
    return {
      text,
      chart: { type: 'bar', data: data.byStatus },
      followUps: ['Show only open work orders', 'Top assets by cost', 'Upcoming maintenance schedule'],
    };
  }

  function describeAssetsByCost(data) {
    if (!data?.assets?.length) {
      return { text: 'No asset cost data found.', followUps: ['List work orders', 'Show locations'] };
    }
    const list = data.assets
      .map((a) => `• **${a.name}** – $${Number(a.cost).toLocaleString()} (${a.id})`)
      .join('\n');
    const text = `Top assets by maintenance cost this month:\n\n${list}\n\nChart below summarizes costs.`;
    return {
      text,
      chart: { type: 'bar', data: data.assets.map((a) => ({ label: a.name.split(' - ')[0], value: a.cost })) },
      followUps: ['Show work orders by status', 'List all locations', 'Upcoming maintenance'],
    };
  }

  function describeAssets(data) {
    if (!data?.assets?.length) {
      return { text: 'No assets found.', followUps: ['Top assets by cost', 'Open work orders'] };
    }
    const list = data.assets.map((a) => `• **${a.id}** – ${a.name} (${a.type}) – ${a.location}`).join('\n');
    return {
      text: `Assets from Corrigo:\n\n${list}`,
      followUps: ['Top 5 assets by maintenance cost', 'Show open work orders', 'Show locations'],
    };
  }

  function describeLocations(data) {
    if (!data?.locations?.length) {
      return { text: 'No locations found.', followUps: ['Show work orders', 'List assets'] };
    }
    const list = data.locations
      .map((l) => `• **${l.name}** – ${l.address} (${l.workOrderCount} work orders)`)
      .join('\n');
    return {
      text: `Locations/sites:\n\n${list}`,
      followUps: ['Show open work orders', 'Work orders by status', 'Top assets by cost'],
    };
  }

  function describeMaintenance(data) {
    if (!data?.upcoming?.length) {
      return { text: 'No upcoming maintenance scheduled.', followUps: ['Open work orders', 'List assets'] };
    }
    const list = data.upcoming.map((m) => `• **${m.asset}** – ${m.type} on ${m.date}`).join('\n');
    return {
      text: `Upcoming maintenance:\n\n${list}`,
      followUps: ['Show open work orders', 'Work orders by status', 'All locations'],
    };
  }

  function buildResponse(intentResult, corrigoData) {
    if (intentResult.intent === 'GENERAL') {
      return {
        text: "I can help you with work orders, assets, locations, and maintenance from Corrigo. Try asking for **open work orders**, **top assets by cost**, or **work orders by status** (with a chart). If we're not connected to Corrigo yet, I'll ask for your credentials when you request data.",
        followUps: ['Show open work orders', 'Top 5 assets by cost', 'Work orders by status'],
      };
    }

    if (intentResult.intent === 'UNKNOWN') {
      return {
        text: "I'm not sure which Corrigo data you need. You can ask for: **open work orders**, **work orders by status** (with chart), **top assets by maintenance cost**, **locations**, or **upcoming maintenance**. Try one of the prompts above or rephrase your question.",
        followUps: ['Show open work orders', 'Work orders by status', 'Top assets by cost'],
      };
    }

    if (!corrigoData) {
      return null; // caller will ask for credentials
    }

    switch (intentResult.dataType) {
      case 'work_orders':
        return describeWorkOrders(corrigoData);
      case 'work_orders_by_status':
        return describeWorkOrdersByStatus(corrigoData);
      case 'assets_by_cost':
        return describeAssetsByCost(corrigoData);
      case 'assets':
        return describeAssets(corrigoData);
      case 'locations':
        return describeLocations(corrigoData);
      case 'maintenance':
        return describeMaintenance(corrigoData);
      default:
        return { text: 'Data retrieved. How would you like to explore it?', followUps: ['Open work orders', 'Assets by cost', 'Locations'] };
    }
  }

  // ----- Chart rendering -----
  function renderChart(container, chartConfig) {
    if (!chartConfig || !container || typeof Chart === 'undefined') return;
    const id = 'chart-' + ++state.chartIdCounter;
    const canvas = document.createElement('canvas');
    canvas.id = id;
    container.innerHTML = '';
    container.appendChild(canvas);

    const isBar = chartConfig.type === 'bar';
    const labels = chartConfig.data.map((d) => d.status || d.label || d.name);
    const values = chartConfig.data.map((d) => d.count ?? d.value ?? 0);
    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6'];

    new Chart(canvas, {
      type: isBar ? 'bar' : 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors.slice(0, values.length),
            borderColor: '#1a222d',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: !isBar, position: 'bottom' },
        },
        scales: isBar
          ? {
              y: { beginAtZero: true, grid: { color: '#2a3544' }, ticks: { color: '#8b9cad' } },
              x: { grid: { display: false }, ticks: { color: '#8b9cad', maxRotation: 45 } },
            }
          : {},
      },
    });
  }

  // ----- Markdown-like bold -----
  function formatMessageText(raw) {
    const div = document.createElement('div');
    div.innerHTML = raw
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return div.innerHTML;
  }

  // ----- Append message to chat -----
  function appendMessage(role, content, options = {}) {
    if (elements.welcomeBlock) elements.welcomeBlock.remove();
    const wrap = document.createElement('div');
    wrap.className = `message ${role}`;
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? 'You' : 'FM';
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    if (role === 'user') {
      bubble.textContent = content;
    } else {
      bubble.innerHTML = '<p>' + formatMessageText(content) + '</p>';
      if (options.chart) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        bubble.appendChild(chartContainer);
        requestAnimationFrame(() => renderChart(chartContainer, options.chart));
      }
      if (options.followUps?.length) {
        const fu = document.createElement('div');
        fu.className = 'follow-up-prompts';
        fu.innerHTML = '<div class="follow-up-label">You might want to ask:</div>';
        const chips = document.createElement('div');
        chips.className = 'follow-up-chips';
        options.followUps.forEach((label) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'follow-up-chip';
          btn.textContent = label;
          btn.addEventListener('click', () => {
            elements.chatInput.value = label;
            sendMessage();
          });
          chips.appendChild(btn);
        });
        fu.appendChild(chips);
        bubble.appendChild(fu);
      }
    }

    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
    elements.chatMessages.appendChild(wrap);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
  }

  // ----- Send user message and get bot response -----
  async function sendMessage() {
    const raw = (elements.chatInput?.value || '').trim();
    if (!raw) return;

    if (elements.chatInput) elements.chatInput.value = '';
    appendMessage('user', raw);

    const intentResult = detectIntent(raw);
    const needsData = needsCorrigoData(intentResult);

    if (needsData && !state.connected) {
      appendMessage('bot', 'To answer that, I need data from Corrigo. Start the local server to use the sample data: run **npm start** in the project folder, then open **http://localhost:3001**. You can also connect with your Corrigo credentials when you have live access.', {
        followUps: ['Show open work orders', 'Top assets by cost', 'Work orders by status'],
      });
      showCredentialsModal();
      saveToHistory(raw);
      return;
    }

    const corrigoData = needsData
      ? await fetchCorrigoData(intentResult.dataType, {
          timeRange: intentResult.timeRange === true,
          lastDays: intentResult.lastDays || 7,
        })
      : null;

    if (needsData && state.connected && corrigoData == null) {
      appendMessage('bot', 'The data server did not respond. Make sure the app is running from the server: run **npm start** and open **http://localhost:3001**. The chatbot reads from the sample data in `data/corrigo.db`.', {
        followUps: ['Show open work orders', 'Work orders by status', 'Top assets by cost'],
      });
      saveToHistory(raw);
      return;
    }

    const response = buildResponse(intentResult, needsData ? corrigoData : {});

    if (!response) {
      appendMessage('bot', 'Connection to Corrigo is required for this question. Start the server (npm start) to use sample data, or enter your credentials for live Corrigo.', {
        followUps: ['Show open work orders', 'Top assets by cost'],
      });
      showCredentialsModal();
    } else {
      appendMessage('bot', response.text, {
        chart: response.chart,
        followUps: response.followUps,
      });
    }

    saveToHistory(raw);
  }

  // ----- Chat history (sessions) -----
  function loadSessions() {
    try {
      const raw = localStorage.getItem(CHAT_HISTORY_KEY);
      state.sessions = raw ? JSON.parse(raw) : [];
      state.currentSessionId = localStorage.getItem(CURRENT_SESSION_KEY);
    } catch (_) {
      state.sessions = [];
      state.currentSessionId = null;
    }
    renderHistoryList();
  }

  function saveToHistory(lastQuery) {
    const id = state.currentSessionId || 's-' + Date.now();
    let session = state.sessions.find((s) => s.id === id);
    if (!session) {
      session = { id, title: lastQuery.slice(0, 40) + (lastQuery.length > 40 ? '…' : ''), createdAt: Date.now() };
      state.sessions.unshift(session);
    } else {
      session.title = lastQuery.slice(0, 40) + (lastQuery.length > 40 ? '…' : '');
    }
    state.currentSessionId = id;
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(state.sessions));
      localStorage.setItem(CURRENT_SESSION_KEY, id);
    } catch (_) {}
    renderHistoryList();
  }

  function renderHistoryList() {
    const list = elements.chatHistoryList;
    const empty = elements.historyEmpty;
    if (!list) return;
    const items = state.sessions.slice(0, 20).map((s) => {
      const li = document.createElement('li');
      li.className = 'chat-history-item';
      li.textContent = s.title;
      li.dataset.sessionId = s.id;
      li.addEventListener('click', () => selectSession(s.id));
      return li;
    });
    list.innerHTML = '';
    if (items.length === 0 && empty) {
      list.appendChild(empty);
    } else {
      if (empty && empty.parentNode) empty.remove();
      items.forEach((el) => list.appendChild(el));
    }
  }

  function selectSession(sessionId) {
    state.currentSessionId = sessionId;
    try {
      localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
    } catch (_) {}
    // In a full app we would load that session's messages; for demo we just keep current chat.
  }

  function newChat() {
    state.currentSessionId = null;
    try {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    } catch (_) {}
    if (elements.welcomeBlock && elements.chatMessages) {
      elements.chatMessages.innerHTML = '';
      elements.chatMessages.appendChild(elements.welcomeBlock);
    }
  }

  // ----- Credentials form (Databricks) -----
  function initCredentialsForm() {
    if (!elements.credentialsForm) return;
    elements.credentialsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const host = document.getElementById('databricksHost')?.value?.trim();
      const path = document.getElementById('databricksPath')?.value?.trim();
      const token = document.getElementById('databricksToken')?.value;
      if (host && path && token) {
        const ok = await connectWithCredentials(host, path, token);
        if (!ok) {
          appendMessage('bot', 'Could not connect to Databricks. Check server hostname, HTTP path, and access token. Make sure the app is running from the server (node server.js).', { followUps: ['Show open work orders', 'Work orders by status'] });
        }
      }
    });
  }

  if (elements.closeCredentialsBtn) {
    elements.closeCredentialsBtn.addEventListener('click', hideCredentialsModal);
  }
  if (elements.cancelCredentialsBtn) {
    elements.cancelCredentialsBtn.addEventListener('click', hideCredentialsModal);
  }

  // ----- Event bindings -----
  if (elements.sendBtn) {
    elements.sendBtn.addEventListener('click', sendMessage);
  }
  if (elements.chatInput) {
    elements.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  promptChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const prompt = chip.dataset.prompt;
      if (prompt && elements.chatInput) {
        elements.chatInput.value = prompt;
        sendMessage();
      }
    });
  });

  if (elements.newChatBtn) {
    elements.newChatBtn.addEventListener('click', newChat);
  }

  // ----- Init: auto-connect to server; restore Databricks creds if saved -----
  (async function tryDataServer() {
    loadConnectionState();
    if (state.connected) {
      try {
        const saved = localStorage.getItem(CREDENTIALS_KEY);
        if (saved) {
          const creds = JSON.parse(saved);
          if (creds.serverHostname && creds.httpPath && creds.accessToken) {
            await fetch(API_BASE + '/api/databricks-connect', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(creds),
            });
          }
        }
      } catch (_) {}
      loadSessions();
      initCredentialsForm();
      return;
    }
    try {
      const res = await fetch(API_BASE + '/api/health');
      if (res.ok) {
        const json = await res.json();
        if (json.ok) saveConnection(true);
      }
    } catch (_) {}
    try {
      const saved = localStorage.getItem(CREDENTIALS_KEY);
      if (saved) {
        const creds = JSON.parse(saved);
        if (creds.serverHostname && creds.httpPath && creds.accessToken) {
          const r = await fetch(API_BASE + '/api/databricks-connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(creds),
          });
          if (r.ok && (await r.json()).ok) saveConnection(true);
        }
      }
    } catch (_) {}
    loadSessions();
    initCredentialsForm();
  })();
})();
