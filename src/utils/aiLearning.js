// =====================================================
// 🔥 CONFIG
// =====================================================

const STORAGE_KEYS = {
  DATA: "ai_data_v1",
  FEEDBACK: "ai_feedback_v1",
  QUEUE: "ai_queue_v1", // 🔥 NEW (retry queue)
};

const MAX_DATA_POINTS = 50;
const MAX_FEEDBACK_POINTS = 50;

const API = "/api/ai";
const REQUEST_TIMEOUT = 4000;

// =====================================================
// 🔥 SAFE JSON PARSE
// =====================================================

const safeParse = (value, fallback = []) => {
  try {
    return JSON.parse(value) || fallback;
  } catch {
    return fallback;
  }
};

// =====================================================
// 🔥 FETCH WITH TIMEOUT
// =====================================================

const fetchWithTimeout = async (url, options = {}, timeout = REQUEST_TIMEOUT) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

// =====================================================
// 🔥 LOCAL SAVE HELPERS
// =====================================================

const saveLocalData = (key, entry, limit) => {
  const existing = safeParse(localStorage.getItem(key));
  const updated = [...existing, entry].slice(-limit);
  localStorage.setItem(key, JSON.stringify(updated));
};

// =====================================================
// 🔥 QUEUE SYSTEM (RETRY FAILED REQUESTS)
// =====================================================

const addToQueue = (item) => {
  const queue = safeParse(localStorage.getItem(STORAGE_KEYS.QUEUE));
  queue.push(item);
  localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
};

const processQueue = async () => {
  const queue = safeParse(localStorage.getItem(STORAGE_KEYS.QUEUE));

  if (!queue.length) return;

  const remaining = [];

  for (const item of queue) {
    try {
      await fetchWithTimeout(item.url, item.options);
    } catch {
      remaining.push(item); // keep failed
    }
  }

  localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(remaining));
};

// auto retry on load
setTimeout(processQueue, 2000);

// =====================================================
// 🔥 SAVE SCAN DATA (HYBRID + RETRY)
// =====================================================

export const saveScanData = async (data, user = null) => {
  if (!data) return;

  const entry = {
    ...data,
    user_id: user?.id || null,
    timestamp: Date.now(),
  };

  // 🔥 LOCAL SAVE
  saveLocalData(STORAGE_KEYS.DATA, entry, MAX_DATA_POINTS);

  const request = {
    url: `${API}/save-scan`,
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(user?.token && { Authorization: `Bearer ${user.token}` }),
      },
      body: JSON.stringify(entry),
    },
  };

  try {
    await fetchWithTimeout(request.url, request.options);
  } catch {
    addToQueue(request); // 🔥 retry later
  }
};

// =====================================================
// 🔥 SAVE FEEDBACK (HYBRID + RETRY)
// =====================================================

export const saveFeedback = async (feedback, user = null) => {
  if (!feedback || !feedback.type) return;

  const entry = {
    type: feedback.type,
    userId: user?.id || null,
    timestamp: Date.now(),
  };

  // 🔥 LOCAL SAVE
  saveLocalData(STORAGE_KEYS.FEEDBACK, entry, MAX_FEEDBACK_POINTS);

  const request = {
    url: `${API}/feedback`,
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(user?.token && { Authorization: `Bearer ${user.token}` }),
      },
      body: JSON.stringify(entry),
    },
  };

  try {
    await fetchWithTimeout(request.url, request.options);
  } catch {
    addToQueue(request);
  }
};

// =====================================================
// 🔥 LOCAL CORRECTION (FALLBACK)
// =====================================================

const getLocalCorrection = () => {
  const feedbacks = safeParse(localStorage.getItem(STORAGE_KEYS.FEEDBACK));

  if (!feedbacks.length) return 0;

  let total = 0;
  let count = 0;

  feedbacks.forEach((f) => {
    if (f.type === "tight") {
      total += 2;
      count++;
    }
    if (f.type === "loose") {
      total -= 2;
      count++;
    }
  });

  if (count === 0) return 0;

  return Math.max(-4, Math.min(4, total / count));
};

// =====================================================
// 🔥 GET CORRECTION (PERSONALIZED)
// =====================================================

export const getCorrection = async (userId = null) => {
  try {
    const url = userId
      ? `${API}/correction/${userId}`
      : `${API}/correction/global`;

    const res = await fetchWithTimeout(url);

    if (!res.ok) throw new Error();

    const data = await res.json();

    return Math.max(-4, Math.min(4, data.adjust || 0));
  } catch {
    return getLocalCorrection();
  }
};

// =====================================================
// 🔥 GET LAST SIZE (RETURN USER)
// =====================================================

export const getLastSize = async (userId) => {
  if (!userId) return { found: false };

  try {
    const res = await fetchWithTimeout(`${API}/last-size/${userId}`);
    const data = await res.json();
    return data;
  } catch {
    return { found: false };
  }
};

// =====================================================
// 🔥 RESET
// =====================================================

export const resetLearning = () => {
  localStorage.removeItem(STORAGE_KEYS.DATA);
  localStorage.removeItem(STORAGE_KEYS.FEEDBACK);
  localStorage.removeItem(STORAGE_KEYS.QUEUE);
};