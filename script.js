/* ─── STATE ─────────────────────────────────────── */
const EMOJIS = [
  "😀","😂","🥰","😍","😘","😊","🥺","😭","😤","🤩","😎","🤔","😅","🙈","🤣","😇",
  "🔥","❤️","💕","💯","✨","🎉","🎊","🥳","💪","👏","🙌","🤝","👋","🤙",
  "🍕","🍔","🍦","🎂","🍺","☕","🍷","🎵","🎸","🎮","🏆","⚽","🏀","🎯",
  "💀","👻","🤡","😈","🥵","🥶","😱","🤯","😴","🤧","🥸","😬","😏","😒",
  "🐶","🐱","🐼","🦊","🐸","🦄","🐙","🦋","🌸","🌺","🌈","⭐","🌙","☀️",
  "💎","💰","🚀","✈️","🏖️","🎪","🎭","🎨","📱","💻","⌚","📸","🎁","🛍️",
  "👑","🧠","💡","🔑","🗝️","🎤","🎧","📚","🏋️","🧘","🤸","💃","🕺","🏊"
];

const DEFAULT_MESSAGES = [
  { type: "them", text: "Hey! Where are you? 😅" },
  { type: "me",   text: "On my way!! Almost there 🚀" },
  { type: "them", text: "You said that 20 mins ago lol" },
  { type: "me",   text: "I got distracted by a dog 🐕" },
  { type: "them", text: "OF COURSE YOU DID 😂😂" },
  { type: "me",   text: "He had little boots on 🥺" },
  { type: "typing", text: "" },
  { type: "them", text: "Ok I can forgive that ❤️" },
];

let messages = JSON.parse(JSON.stringify(DEFAULT_MESSAGES));
let currentTheme = "whatsapp";
let currentBg = "wa-classic";
let timers = [];
let mediaRecorder, recordedChunks = [];
let avatarImage = null;

document.addEventListener("DOMContentLoaded", () => {
  const avatarUpload = document.getElementById("avatarUpload");

  if (avatarUpload) {
    avatarUpload.addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = ev => {
        avatarImage = new Image();
        avatarImage.src = ev.target.result;
      };

      reader.readAsDataURL(file);
    });
  }
});

function applyVisibilityToggles() {
  const statusBar = document.querySelector(".status-bar");
  const topBar = document.querySelector(".topbar");
  const inputBar = document.querySelector(".input-bar");

  if (statusBar) {
    statusBar.style.display = document.getElementById("showStatusBar")?.checked ? "flex" : "none";
  }

  if (topBar) {
    topBar.style.display = document.getElementById("showTopBar")?.checked ? "flex" : "none";
  }

  if (inputBar) {
    inputBar.style.display = document.getElementById("showBottomBar")?.checked ? "flex" : "none";
  }

  document.querySelectorAll(".avatar, .topbar-avatar").forEach(el => {
    el.style.display = document.getElementById("showAvatar")?.checked ? "block" : "none";
  });
}

["showStatusBar", "showTopBar", "showBottomBar", "showAvatar"].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("change", applyVisibilityToggles);
  }
});

document.addEventListener("DOMContentLoaded", applyVisibilityToggles);

/* ─── ELEMENTS ──────────────────────────────────── */
const chatEl        = document.getElementById("chat");
const stageEl       = document.getElementById("stage");
const phoneEl       = document.getElementById("phone");
const msgListEl     = document.getElementById("msgList");
const contactNameEl = document.getElementById("contactName");
const contactEmoji  = document.getElementById("contactEmoji");
const contactStatus = document.getElementById("contactStatus");
const topbarName    = document.getElementById("topbarName");
const topbarAvatar  = document.getElementById("topbarAvatar");
const topbarStatus  = document.getElementById("topbarStatus");
const theirColorEl  = document.getElementById("theirColor");
const myColorEl     = document.getElementById("myColor");
const theirColorVal = document.getElementById("theirColorVal");
const myColorVal    = document.getElementById("myColorVal");
const fontSizeEl      = document.getElementById("fontSize");
const fontSizeVal     = document.getElementById("fontSizeVal");
const bubbleOpacityEl = document.getElementById("bubbleOpacity");
const bubbleOpacityVl = document.getElementById("bubbleOpacityVal");
const stageScaleEl    = document.getElementById("stageScale");
const stageScaleVl    = document.getElementById("stageScaleVal");
const stageWidthEl    = document.getElementById("stageWidth");
const stageWidthVl    = document.getElementById("stageWidthVal");
const bgOpacityEl     = document.getElementById("bgOpacity");
const bgOpacityVl     = document.getElementById("bgOpacityVal");
const delayEl         = document.getElementById("delayInput");
const delayValEl    = document.getElementById("delayVal");
const fakeInput     = document.getElementById("fakeInput");
const sendBtn       = document.getElementById("sendBtn");
const emojiTrigger  = document.getElementById("emojiTrigger");
const emojiPicker   = document.getElementById("emojiPicker");
const emojiGrid     = document.getElementById("emojiGrid");
const emojiSearch   = document.getElementById("emojiSearch");
const clockDisplay  = document.getElementById("clockDisplay");

/* ─── CLOCK ─────────────────────────────────────── */
function updateClock() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, "0");
  const m = now.getMinutes().toString().padStart(2, "0");
  clockDisplay.textContent = `${h}:${m}`;
}
updateClock();
setInterval(updateClock, 30000);

/* ─── TABS ──────────────────────────────────────── */
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
  });
});

/* ─── THEME ─────────────────────────────────────── */
const THEME_DEFAULTS = {
  whatsapp: { my: "#25d366", their: "#e5e5ea", myText: "#fff", theirText: "#111" },
  imessage: { my: "#007aff", their: "#e5e5ea", myText: "#fff", theirText: "#000" },
  telegram: { my: "#4a90d9", their: "#ffffff", myText: "#fff", theirText: "#000" },
  dark:     { my: "#4a3aff", their: "#2c2c3e", myText: "#fff", theirText: "#f0f0f0" },
};

document.querySelectorAll(".theme-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".theme-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentTheme = btn.dataset.theme;
    applyTheme(currentTheme);
  });
});

function applyTheme(theme) {
  phoneEl.className = phoneEl.className.replace(/theme-\S+/g, "").trim();
  phoneEl.classList.add(`theme-${theme}`);
  const d = THEME_DEFAULTS[theme];
  myColorEl.value   = d.my;
  theirColorEl.value = d.their;
  myColorVal.textContent   = d.my;
  theirColorVal.textContent = d.their;
  applyColors();
}

/* ─── COLORS & SIZES ────────────────────────────── */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return { r, g, b };
}

function hexLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126*(r/255) + 0.7152*(g/255) + 0.0722*(b/255);
}

function applyColors() {
  const root   = document.documentElement;
  const alpha  = Number(bubbleOpacityEl.value) / 100;
  const me     = hexToRgb(myColorEl.value);
  const them   = hexToRgb(theirColorEl.value);

  root.style.setProperty("--me-bubble",   `rgba(${me.r},${me.g},${me.b},${alpha})`);
  root.style.setProperty("--them-bubble", `rgba(${them.r},${them.g},${them.b},${alpha})`);

  const myLum   = hexLuminance(myColorEl.value);
  const themLum = hexLuminance(theirColorEl.value);
  root.style.setProperty("--me-text",   myLum > 0.4 ? "#000" : "#fff");
  root.style.setProperty("--them-text", themLum > 0.4 ? "#000" : "#fff");
}

myColorEl.addEventListener("input", () => {
  myColorVal.textContent = myColorEl.value;
  applyColors();
});

theirColorEl.addEventListener("input", () => {
  theirColorVal.textContent = theirColorEl.value;
  applyColors();
});

fontSizeEl.addEventListener("input", () => {
  const px = fontSizeEl.value + "px";
  fontSizeVal.textContent = px;
  document.documentElement.style.setProperty("--font-size", px);
});

bubbleOpacityEl.addEventListener("input", () => {
  bubbleOpacityVl.textContent = bubbleOpacityEl.value + "%";
  applyColors();
});

stageScaleEl.addEventListener("input", () => {
  stageScaleVl.textContent = stageScaleEl.value + "%";
  applyStageSize();
});

stageWidthEl.addEventListener("input", () => {
  stageWidthVl.textContent = stageWidthEl.value + "px";
  applyStageSize();
});

function applyStageSize() {
  const scale = Number(stageScaleEl.value) / 100;
  const w = Number(stageWidthEl.value);
  stageEl.style.width  = w + "px";
  stageEl.style.transform = `scale(${scale})`;
}

bgOpacityEl.addEventListener("input", () => {
  bgOpacityVl.textContent = bgOpacityEl.value + "%";
  applyBgOpacity();
});

function applyBgOpacity() {
  stageEl.style.opacity = Number(bgOpacityEl.value) / 100;
}

delayEl.addEventListener("input", () => {
  delayValEl.textContent = delayEl.value + "ms";
});

/* ─── CONTACT ───────────────────────────────────── */
contactNameEl.addEventListener("input", () => {
  topbarName.textContent = contactNameEl.value || "Contact";
});
contactEmoji.addEventListener("input", () => {
  topbarAvatar.textContent = contactEmoji.value || "👤";
});
contactStatus.addEventListener("input", () => {
  topbarStatus.textContent = contactStatus.value || "online";
});

/* ─── BACKGROUND ─────────────────────────────────── */
document.querySelectorAll(".bg-swatch").forEach(sw => {
  sw.addEventListener("click", () => {
    document.querySelectorAll(".bg-swatch").forEach(s => s.classList.remove("active"));
    sw.classList.add("active");
    setBg(sw.dataset.bg);
  });
});

function setBg(bg) {
  currentBg = bg;
  stageEl.className = `stage bg-${bg}`;
}

/* ─── MESSAGE EDITOR ─────────────────────────────── */
let dragSrcIndex = null;

function renderEditor() {
  msgListEl.innerHTML = "";
  messages.forEach((msg, i) => {
    const row = document.createElement("div");
    row.className = "msg-row";
    row.draggable = true;
    row.dataset.index = i;

    /* ── drag handle ── */
    const handle = document.createElement("div");
    handle.className = "drag-handle";
    handle.textContent = "⠿";
    handle.title = "Drag to reorder";

    /* ── drag events ── */
    row.addEventListener("dragstart", e => {
      dragSrcIndex = i;
      row.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    row.addEventListener("dragend", () => {
      row.classList.remove("dragging");
      document.querySelectorAll(".msg-row").forEach(r => r.classList.remove("drag-over"));
    });
    row.addEventListener("dragover", e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      document.querySelectorAll(".msg-row").forEach(r => r.classList.remove("drag-over"));
      if (i !== dragSrcIndex) row.classList.add("drag-over");
    });
    row.addEventListener("drop", e => {
      e.preventDefault();
      if (dragSrcIndex === null || dragSrcIndex === i) return;
      const moved = messages.splice(dragSrcIndex, 1)[0];
      messages.splice(i, 0, moved);
      dragSrcIndex = null;
      renderEditor();
    });

    const left = document.createElement("div");
    left.style.flex = "1";

    const top = document.createElement("div");
    top.className = "msg-row-top";

    const badge = document.createElement("span");
    badge.className = `msg-sender-badge ${msg.type === "typing" ? "typing-type" : msg.type === "them" && isOnlyEmoji(msg.text) ? "emoji-type" : msg.type}`;
    badge.textContent = msg.type === "typing" ? "Typing…" : msg.type === "me" ? "Me" : "Them";

    if (msg.type !== "typing") {
      badge.style.cursor = "pointer";
      badge.title = "Click to swap sender";
      badge.addEventListener("click", () => {
        messages[i].type = messages[i].type === "me" ? "them" : "me";
        renderEditor();
      });
    }

    top.appendChild(badge);
    left.appendChild(top);

    if (msg.type !== "typing") {
      const ta = document.createElement("textarea");
      ta.className = "msg-textarea";
      ta.value = msg.text;
      ta.rows = 1;
      ta.addEventListener("input", () => {
        messages[i].text = ta.value;
        ta.style.height = "auto";
        ta.style.height = ta.scrollHeight + "px";
      });
      ta.style.height = "auto";
      left.appendChild(ta);
    } else {
      const info = document.createElement("div");
      info.style.cssText = "font-size:11px;color:var(--text-muted);padding:4px 0";
      info.textContent = "Shows animated dots";
      left.appendChild(info);
    }

    const del = document.createElement("button");
    del.className = "msg-delete";
    del.textContent = "×";
    del.addEventListener("click", () => {
      messages.splice(i, 1);
      renderEditor();
    });

    row.appendChild(handle);
    row.appendChild(left);
    row.appendChild(del);
    msgListEl.appendChild(row);
  });
}

function isOnlyEmoji(str) {
  const emojiRe = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji}\u20E3|[\u200D\u{1F3FB}-\u{1F3FF}]|\s)+$/u;
  return emojiRe.test(str.trim()) && str.trim().length <= 8;
}

document.getElementById("addThem").addEventListener("click", () => {
  messages.push({ type: "them", text: "New message…" });
  renderEditor();
  msgListEl.scrollTop = msgListEl.scrollHeight;
});
document.getElementById("addMe").addEventListener("click", () => {
  messages.push({ type: "me", text: "New message…" });
  renderEditor();
  msgListEl.scrollTop = msgListEl.scrollHeight;
});
document.getElementById("addEmoji").addEventListener("click", () => {
  messages.push({ type: "them", text: "❤️" });
  renderEditor();
  msgListEl.scrollTop = msgListEl.scrollHeight;
});
document.getElementById("addTyping").addEventListener("click", () => {
  messages.push({ type: "typing", text: "" });
  renderEditor();
  msgListEl.scrollTop = msgListEl.scrollHeight;
});

/* ─── PREVIEW ────────────────────────────────────── */
function resetPreview() {
  timers.forEach(clearTimeout);
  timers = [];
  chatEl.innerHTML = "";
}

function createBubble(msg) {
  const wrap = document.createElement("div");
  wrap.className = `bubble-wrap ${msg.type === "typing" ? "them" : msg.type}`;

  if (msg.type === "typing") {
    const ind = document.createElement("div");
    ind.className = "typing-indicator";
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("div");
      dot.className = "dot";
      ind.appendChild(dot);
    }
    wrap.appendChild(ind);
    return wrap;
  }

  const b = document.createElement("div");
  const onlyEmoji = isOnlyEmoji(msg.text);
  b.className = `bubble ${msg.type}${onlyEmoji ? " emoji-bubble" : ""}`;
  b.textContent = msg.text;

  if (msg.type === "me" && !onlyEmoji) {
    b.setAttribute("data-ticks", "✓✓");
  }

  wrap.appendChild(b);

  return wrap;
}

function playPreview() {
  resetPreview();
  const delay = Number(delayEl.value) || 900;

  messages.forEach((msg, i) => {
    const t = setTimeout(() => {
      const el = createBubble(msg);
      chatEl.appendChild(el);
      chatEl.scrollTop = chatEl.scrollHeight;

      if (msg.type === "typing") {
        setTimeout(() => el.remove(), delay * 0.9);
      }
    }, i * delay);
    timers.push(t);
  });
}

document.getElementById("playBtn").addEventListener("click", playPreview);
document.getElementById("resetBtn").addEventListener("click", resetPreview);

/* ─── LIVE SEND ─────────────────────────────────── */
function sendMessage() {
  const text = fakeInput.textContent.trim();
  if (!text) return;
  const msg = { type: "me", text };
  const el = createBubble(msg);
  chatEl.appendChild(el);
  chatEl.scrollTop = chatEl.scrollHeight;
  fakeInput.textContent = "";
}

sendBtn.addEventListener("click", sendMessage);
fakeInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

/* ─── EMOJI PICKER ───────────────────────────────── */
let emojiPickerOpen = false;
let pickerTarget = "input"; // "input" or "bubble"

function renderEmojis(filter = "") {
  emojiGrid.innerHTML = "";
  const list = filter
    ? EMOJIS.filter(e => e.includes(filter))
    : EMOJIS;
  list.forEach(emoji => {
    const item = document.createElement("div");
    item.className = "emoji-item";
    item.textContent = emoji;
    item.addEventListener("click", () => {
      if (pickerTarget === "input") {
        fakeInput.focus();
        document.execCommand("insertText", false, emoji);
      }
      closeEmojiPicker();
    });
    emojiGrid.appendChild(item);
  });
}

function openEmojiPicker(target = "input") {
  pickerTarget = target;
  emojiPicker.classList.add("open");
  emojiSearch.value = "";
  renderEmojis();
  emojiPickerOpen = true;
  setTimeout(() => emojiSearch.focus(), 50);
}

function closeEmojiPicker() {
  emojiPicker.classList.remove("open");
  emojiPickerOpen = false;
}

emojiTrigger.addEventListener("click", e => {
  e.stopPropagation();
  emojiPickerOpen ? closeEmojiPicker() : openEmojiPicker("input");
});

emojiSearch.addEventListener("input", () => renderEmojis(emojiSearch.value));

document.addEventListener("click", e => {
  if (emojiPickerOpen && !emojiPicker.contains(e.target) && e.target !== emojiTrigger) {
    closeEmojiPicker();
  }
});

/* ─── OPEN IN NEW TAB ───────────────────────────── */
document.getElementById("openTabBtn").href = window.location.href;

/* ─── EXPORT VIDEO ───────────────────────────────── */
const exportStatusEl = document.getElementById("exportStatus");
const exportBtn      = document.getElementById("exportBtn");

function setExportStatus(msg, visible = true) {
  exportStatusEl.style.display = visible ? "block" : "none";
  exportStatusEl.textContent   = msg;
}

document.getElementById("exportBtn").addEventListener("click", () => {
  if (exportBtn.disabled) return;

  // ── Format detection ──────────────────────────────
  const FORMAT_PRIORITY = [
    { mime: "video/mp4; codecs=avc1.42E01E", ext: "mp4",  label: "MP4 H.264" },
    { mime: "video/mp4; codecs=avc1",        ext: "mp4",  label: "MP4 H.264" },
    { mime: "video/mp4",                     ext: "mp4",  label: "MP4"       },
    { mime: "video/webm; codecs=vp9",        ext: "webm", label: "WebM VP9"  },
    { mime: "video/webm; codecs=vp8",        ext: "webm", label: "WebM VP8"  },
    { mime: "video/webm",                    ext: "webm", label: "WebM"      },
  ];
  const chosen = FORMAT_PRIORITY.find(f => MediaRecorder.isTypeSupported(f.mime));
  if (!chosen) {
    setExportStatus("❌ No supported format. Open the app in a new tab (not Replit preview) and try Chrome, Edge, or Safari.");
    return;
  }
  const { mime: mimeType, ext: fileExt, label: formatLabel } = chosen;

  // ── Resolution / position ─────────────────────────
  const resVal      = document.getElementById("exportRes").value;
  const posVal      = document.getElementById("exportPos").value;
  const exportBgVal = document.getElementById("exportBg").value;

  const chatW = stageEl.offsetWidth  || 390;
  const chatH = stageEl.offsetHeight || 844;

  let canvasW, canvasH;
  if (resVal === "source") { canvasW = chatW; canvasH = chatH; }
  else { [canvasW, canvasH] = resVal.split("x").map(Number); }

  // Scale factor so chat fills as much of the target frame as possible
  const S      = Math.min(canvasW / chatW, canvasH / chatH);
  const drawnW = Math.round(chatW * S);
  const drawnH = Math.round(chatH * S);

  const p24 = 24;
  const posMap = {
    "center":       [Math.round((canvasW-drawnW)/2), Math.round((canvasH-drawnH)/2)],
    "left":         [p24, Math.round((canvasH-drawnH)/2)],
    "right":        [canvasW-drawnW-p24, Math.round((canvasH-drawnH)/2)],
    "top-left":     [p24, p24],
    "top-right":    [canvasW-drawnW-p24, p24],
    "bottom-left":  [p24, canvasH-drawnH-p24],
    "bottom-right": [canvasW-drawnW-p24, canvasH-drawnH-p24],
  };
  const [OX, OY] = posMap[posVal] || posMap["center"];

  // ── Canvas + recorder ─────────────────────────────
  const canvas = document.createElement("canvas");
  canvas.width  = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");

  const chunks = [];
  const stream = canvas.captureStream(60);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 40_000_000 });
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: mimeType });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `chat-${canvasW}x${canvasH}.${fileExt}`,
    });
    a.click();
    URL.revokeObjectURL(a.href);
    exportBtn.disabled    = false;
    exportBtn.textContent = `⬇ Export ${formatLabel}`;
    setExportStatus(`✅ Done! ${canvasW}×${canvasH} ${formatLabel}`);
    setTimeout(() => setExportStatus("", false), 7000);
  };

  exportBtn.disabled    = true;
  exportBtn.textContent = "⏺ Recording…";
  setExportStatus("⏳ Rendering… please wait.");

  // ── Theme colours ─────────────────────────────────
  const TOPBARS = {
    whatsapp: { bg: "#1f2c34", text: "#fff" },
    imessage: { bg: "#f2f2f7", text: "#000" },
    telegram: { bg: "#527da3", text: "#fff" },
    dark:     { bg: "#1a1a2e", text: "#fff" },
  };
  const TH = TOPBARS[currentTheme] || TOPBARS.whatsapp;
  const TH_IS_DARK = TH.text === "#fff";

  const CHAT_BG_COL = {
    "wa-classic":   "#0b141a",
    "wa-beige":     "#ece5dd",
    "galaxy":       "#0a0e27",
    "white":        "#f5f5f5",
    "green-screen": "#00ff00",
    "dark":         "#1a1a1a",
  };
  const OUTER_BG_COL = {
    "wa-classic":   "#080d10",
    "wa-beige":     "#d4c9c0",
    "galaxy":       "#020408",
    "white":        "#dadada",
    "green-screen": "#00cc00",
    "dark":         "#0a0a0a",
  };

  const bubbleAlpha = Number(bubbleOpacityEl.value) / 100;
  const meRgb   = hexToRgb(myColorEl.value);
  const themRgb = hexToRgb(theirColorEl.value);
  const ME_COL   = `rgba(${meRgb.r},${meRgb.g},${meRgb.b},${bubbleAlpha})`;
  const THEM_COL = `rgba(${themRgb.r},${themRgb.g},${themRgb.b},${bubbleAlpha})`;
  const ME_TEXT   = hexLuminance(myColorEl.value)   > 0.4 ? "#111" : "#fff";
  const THEM_TEXT = hexLuminance(theirColorEl.value) > 0.4 ? "#111" : "#fff";

  // ── Scaled metrics ────────────────────────────────
  const ST_H   = Math.round(28 * S);   // status bar
  const TB_H   = Math.round(60 * S);   // topbar
  const IN_H   = Math.round(68 * S);   // input bar
  const PAD    = Math.round(12 * S);   // side padding
  const BR     = Math.round(18 * S);   // bubble radius
  const BP_H   = Math.round(12 * S);   // bubble horizontal pad
  const BP_V   = Math.round(9  * S);   // bubble vertical pad
  const AV_R   = Math.round(17 * S);   // avatar radius
  const MSG_GAP = Math.round(6  * S);  // same-sender gap
  const SND_GAP = Math.round(14 * S);  // different-sender gap

  const FSIZE_VAL = Number(fontSizeEl.value || 17);
  const FSIZE = Math.round(FSIZE_VAL * S);
  const LH_PX = Math.round(FSIZE_VAL * 1.38 * S); // line-height in px

  const CHAT_TOP = OY + ST_H + TB_H + Math.round(8 * S);
  const CHAT_BOT = OY + drawnH - IN_H - Math.round(8 * S);
  const MAX_BW   = Math.round(chatW * 0.76 * S);
  const THEM_BX  = OX + PAD + AV_R * 2 + Math.round(6 * S); // left bubble x

  // ── Helpers ───────────────────────────────────────
  function rrect(x, y, w, h, tl, tr, br2, bl) {
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + w - tr, y);
    ctx.arcTo(x+w, y,   x+w, y+tr,    tr);
    ctx.lineTo(x+w, y+h-br2);
    ctx.arcTo(x+w, y+h, x+w-br2, y+h, br2);
    ctx.lineTo(x+bl, y+h);
    ctx.arcTo(x, y+h, x, y+h-bl, bl);
    ctx.lineTo(x, y+tl);
    ctx.arcTo(x, y,   x+tl, y,   tl);
    ctx.closePath();
  }

  function wrapText(text, maxW) {
    ctx.font = `${FSIZE}px Inter, system-ui, sans-serif`;
    const words = text.split(" ");
    const lines = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  }

  // ── Pre-measure all bubbles ───────────────────────
  ctx.font = `${FSIZE}px Inter, system-ui, sans-serif`;
  const measured = messages.map(msg => {
    if (msg.type === "typing") {
      return { w: Math.round(60*S), h: Math.round(38*S), lines: [], isTyping: true };
    }
    if (isOnlyEmoji(msg.text)) {
      const sz = Math.round(48*S);
      return { w: sz, h: sz, lines: [], isEmoji: true };
    }
    const lines = wrapText(msg.text, MAX_BW - BP_H * 2);
    const tw = Math.max(...lines.map(l => ctx.measureText(l).width));
    const bw = Math.min(tw + BP_H * 2, MAX_BW);
    const bh = lines.length * LH_PX + BP_V * 2;
    return { w: bw, h: bh, lines };
  });

  // ── Bubble Y positions (bottom-anchored) ──────────
  // Walk backwards from the bottom of the chat area
  const bubbleY = new Array(messages.length);
  let y = CHAT_BOT - measured[messages.length - 1]?.h;
  bubbleY[messages.length - 1] = y;
  for (let i = messages.length - 2; i >= 0; i--) {
    const sameSender = messages[i].type === messages[i+1].type;
    const gap = sameSender ? MSG_GAP : SND_GAP;
    y -= gap + measured[i].h;
    bubbleY[i] = y;
  }
  // Clamp: don't let first bubble go above chat area top
  const overflow = CHAT_TOP + Math.round(8*S) - bubbleY[0];
  if (overflow > 0) {
    for (let i = 0; i < messages.length; i++) bubbleY[i] += overflow;
  }

  // ── Static-layer draw calls ───────────────────────
  function drawOuter() {
    ctx.fillStyle = OUTER_BG_COL[exportBgVal] || "#080808";
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  function drawChatBg() {
    ctx.fillStyle = CHAT_BG_COL[exportBgVal] || "#0b141a";
    ctx.fillRect(OX, OY, drawnW, drawnH);
  }

  function drawStatusBar() {
    ctx.fillStyle = TH.bg;
    ctx.fillRect(OX, OY, drawnW, ST_H);
    const now = new Date();
    const t = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;
    ctx.fillStyle = TH.text;
    ctx.font = `600 ${Math.round(11*S)}px Inter, system-ui, sans-serif`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(t, OX + Math.round(18*S), OY + ST_H/2);
    ctx.textAlign = "right";
    ctx.globalAlpha = 0.7;
    ctx.fillText("▮▮▮  WiFi  ▌", OX + drawnW - Math.round(14*S), OY + ST_H/2);
    ctx.globalAlpha = 1;
  }

  function drawTopbar() {
    ctx.fillStyle = TH.bg;
    ctx.fillRect(OX, OY + ST_H, drawnW, TB_H);
    ctx.fillStyle = TH_IS_DARK ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    ctx.fillRect(OX, OY + ST_H + TB_H - 1, drawnW, 1);

    const midY = OY + ST_H + TB_H / 2;

    // Back chevron
    ctx.fillStyle = TH.text;
    ctx.font = `${Math.round(26*S)}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("‹", OX + Math.round(10*S), midY);

    // Avatar
    const avX = OX + Math.round(44*S);
    ctx.fillStyle = TH_IS_DARK ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";
    ctx.beginPath();
    ctx.arc(avX, midY, AV_R, 0, Math.PI*2);
    ctx.fill();
    ctx.font = `${Math.round(AV_R * 1.1)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(contactEmoji.value || "👤", avX, midY + Math.round(1*S));

    // Name / status
    const nx = OX + Math.round(70*S);
    ctx.textAlign = "left";
    ctx.fillStyle = TH.text;
    ctx.font = `700 ${Math.round(14*S)}px Inter, system-ui, sans-serif`;
    ctx.fillText(contactNameEl.value || "Contact", nx, midY - Math.round(7*S));
    ctx.font = `${Math.round(11*S)}px Inter, system-ui, sans-serif`;
    ctx.globalAlpha = 0.6;
    ctx.fillText(contactStatus.value || "online", nx, midY + Math.round(8*S));
    ctx.globalAlpha = 1;

    // Call icon
    ctx.font = `${Math.round(18*S)}px Arial`;
    ctx.textAlign = "right";
    ctx.fillStyle = TH.text;
    ctx.fillText("📞", OX + drawnW - Math.round(14*S), midY);
  }

  function drawInputBar() {
    const iy = OY + drawnH - IN_H;
    ctx.fillStyle = TH.bg;
    ctx.fillRect(OX, iy, drawnW, IN_H);
    ctx.fillStyle = TH_IS_DARK ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    ctx.fillRect(OX, iy, drawnW, 1);

    ctx.font = `${Math.round(22*S)}px Arial`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("😊", OX + Math.round(10*S), iy + IN_H/2);

    const fx = OX + Math.round(42*S);
    const fw = drawnW - Math.round(88*S);
    const fh = Math.round(36*S);
    const fy = iy + (IN_H - fh) / 2;
    ctx.fillStyle = TH_IS_DARK ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
    rrect(fx, fy, fw, fh, Math.round(18*S), Math.round(18*S), Math.round(18*S), Math.round(18*S));
    ctx.fill();
    ctx.fillStyle = TH.text;
    ctx.globalAlpha = 0.3;
    ctx.font = `${Math.round(12*S)}px Inter, system-ui, sans-serif`;
    ctx.fillText("Message…", fx + Math.round(12*S), iy + IN_H/2);
    ctx.globalAlpha = 1;

    const sx = OX + drawnW - Math.round(34*S);
    const sy = iy + IN_H / 2;
    ctx.fillStyle = "#25d366";
    ctx.beginPath();
    ctx.arc(sx, sy, Math.round(18*S), 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.round(14*S)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText("▶", sx + Math.round(1*S), sy + Math.round(1*S));
  }

  // ── Per-bubble draw ───────────────────────────────
  function drawBubble(i, progress) {
    const msg = messages[i];
    const m   = measured[i];
    const by  = bubbleY[i];
    const isMe = msg.type === "me";
    if (progress <= 0) return;

    const scale = 0.92 + 0.08 * progress;
    ctx.save();
    ctx.globalAlpha = progress;

    // ── Typing indicator ──
    if (m.isTyping) {
      const bx = THEM_BX;
      ctx.translate(bx + m.w/2, by + m.h/2);
      ctx.scale(scale, scale);
      ctx.translate(-(bx + m.w/2), -(by + m.h/2));
      ctx.fillStyle = THEM_COL;
      rrect(bx, by, m.w, m.h, BR, BR, BR, Math.round(4*S));
      ctx.fill();
      const t = Date.now() / 380;
      const dotR = Math.round(4*S);
      for (let d = 0; d < 3; d++) {
        const doff = Math.sin(t + d * 1.15) * Math.round(3*S);
        const dx = bx + Math.round((13 + d * 14) * S);
        ctx.fillStyle = THEM_TEXT;
        ctx.globalAlpha = progress * (0.5 + 0.5 * Math.max(0, Math.sin(t + d * 1.15)));
        ctx.beginPath();
        ctx.arc(dx, by + m.h/2 + doff, dotR, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
      // Avatar for typing
      ctx.save();
      ctx.globalAlpha = progress;
      const avCX = OX + PAD + AV_R;
      ctx.fillStyle = TH_IS_DARK ? "rgba(80,80,100,0.35)" : "rgba(160,160,180,0.35)";
      ctx.beginPath();
      ctx.arc(avCX, by + m.h/2, AV_R, 0, Math.PI*2);
      ctx.fill();
      ctx.font = `${Math.round(AV_R)}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(contactEmoji.value || "👤", avCX, by + m.h/2 + Math.round(1*S));
      ctx.restore();
      return;
    }

    // ── Big emoji ──
    if (m.isEmoji) {
      const eSz = Math.round(48*S);
      ctx.font = `${eSz}px Arial`;
      ctx.textBaseline = "top";
      const ecx = isMe ? OX + drawnW - PAD - eSz/2 : THEM_BX + eSz/2;
      ctx.translate(ecx, by + eSz/2);
      ctx.scale(scale, scale);
      ctx.translate(-ecx, -(by + eSz/2));
      ctx.textAlign = isMe ? "right" : "left";
      ctx.fillText(msg.text, isMe ? OX + drawnW - PAD : THEM_BX, by);
      ctx.restore();
      return;
    }

    // ── Regular bubble ──
    const bx = isMe ? OX + drawnW - PAD - m.w : THEM_BX;
    const cx = bx + m.w/2;
    const cy = by + m.h/2;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);

    // Bubble bg
    ctx.fillStyle = isMe ? ME_COL : THEM_COL;
    const tailR = Math.round(4*S);
    if (isMe) {
      rrect(bx, by, m.w, m.h, BR, BR, tailR, BR);
    } else {
      rrect(bx, by, m.w, m.h, BR, BR, BR, tailR);
    }
    ctx.fill();

    // Text
    ctx.fillStyle = isMe ? ME_TEXT : THEM_TEXT;
    ctx.font = `${FSIZE}px Inter, system-ui, sans-serif`;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    m.lines.forEach((line, li) => {
      ctx.fillText(line, bx + BP_H, by + BP_V + li * LH_PX);
    });

    // Read ticks (me)
    if (isMe) {
      ctx.globalAlpha = progress * 0.5;
      ctx.fillStyle = ME_TEXT;
      ctx.font = `${Math.round(9*S)}px Arial`;
      ctx.textAlign = "right";
      ctx.fillText("✓✓", bx + m.w - Math.round(5*S), by + m.h - Math.round(13*S));
    }

    ctx.restore();

    // Avatar (them) — drawn outside transform so it's not scaled
    if (!isMe) {
      ctx.save();
      ctx.globalAlpha = progress;
      const avCX = OX + PAD + AV_R;
      const avCY = by + m.h/2;
      ctx.fillStyle = TH_IS_DARK ? "rgba(80,80,100,0.35)" : "rgba(160,160,180,0.35)";
      ctx.beginPath();
      ctx.arc(avCX, avCY, AV_R, 0, Math.PI*2);
      ctx.fill();
      ctx.font = `${Math.round(AV_R)}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(contactEmoji.value || "👤", avCX, avCY + Math.round(1*S));
      ctx.restore();
    }
  }

  // ── Animation state ───────────────────────────────
  const POP_DUR  = 260;
  const DELAY    = Number(delayEl.value) || 900;
  let curMsg     = 0;
  let phase      = "wait";     // wait → pop → hold → done
  let phaseT     = 0;
  let prevTS     = null;
  let animRunning = true;

  // ── Main RAF loop ─────────────────────────────────
  function frame(ts) {
    if (!animRunning) return;
    if (!prevTS) prevTS = ts;
    const dt = Math.min(ts - prevTS, 64); // cap delta to avoid huge jumps
    prevTS = ts;
    phaseT += dt;

    // State machine
    if (phase === "wait" && phaseT >= 700) {
      phase = "pop"; phaseT = 0;
    } else if (phase === "pop") {
      if (phaseT >= POP_DUR) { phase = "hold"; phaseT = 0; }
    } else if (phase === "hold") {
      const holdDur = messages[curMsg]?.type === "typing" ? DELAY * 1.5 : DELAY;
      if (phaseT >= holdDur) {
        curMsg++;
        if (curMsg >= messages.length) { phase = "done"; phaseT = 0; }
        else { phase = "pop"; phaseT = 0; }
      }
    } else if (phase === "done" && phaseT >= 1400) {
      animRunning = false;
      recorder.stop();
      return;
    }

    const popProg = phase === "pop" ? Math.min(1, phaseT / POP_DUR) : (phase === "hold" || phase === "done" ? 1 : 0);

    // ── Draw frame ──
    drawOuter();
    drawChatBg();

    // Clip to chat message area
    ctx.save();
    ctx.beginPath();
    ctx.rect(OX, CHAT_TOP - Math.round(4*S), drawnW, (CHAT_BOT - CHAT_TOP) + Math.round(8*S));
    ctx.clip();

    for (let i = 0; i <= curMsg && i < messages.length; i++) {
      const prog = i < curMsg ? 1 : popProg;
      drawBubble(i, prog);
    }

    ctx.restore();

    if (document.getElementById("showStatusBar")?.checked) {
      drawStatusBar();
    }

    if (document.getElementById("showTopBar")?.checked) {
      drawTopbar();
    }

    if (document.getElementById("showBottomBar")?.checked) {
      drawInputBar();
    }

    requestAnimationFrame(frame);
  }

  recorder.start();
  requestAnimationFrame(frame);
});

/* ─── INIT ───────────────────────────────────────── */
renderEditor();
applyColors();
applyStageSize();
applyBgOpacity();
playPreview();
