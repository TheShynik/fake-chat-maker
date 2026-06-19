(() => {
  const state = {
    enabled: true,
    themDataUrl: "",
    meDataUrl: "",
  };

  const $ = id => document.getElementById(id);
  const stageEl = $("stage");

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .message-avatar-controls {
        border: 1px solid var(--panel-border);
        background: rgba(255,255,255,.03);
        border-radius: 10px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .message-avatar-controls .row-input input[type="file"] {
        width: 100%;
        background: var(--input-bg);
        border: 1px solid var(--panel-border);
        border-radius: 8px;
        padding: 7px 8px;
        color: var(--text-muted);
        font-size: 12px;
      }

      .contact-avatar {
        overflow: hidden;
      }

      .contact-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .bubble-wrap.with-message-avatar {
        width: 100%;
      }

      .bubble-line {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        width: 100%;
      }

      .bubble-wrap.them .bubble-line {
        justify-content: flex-start;
      }

      .bubble-wrap.me .bubble-line {
        justify-content: flex-end;
      }

      .message-avatar {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        overflow: hidden;
        flex: 0 0 52px;
        border: 3px solid #67f3ff;
        background: rgba(255,255,255,.12);
        box-shadow: 0 4px 12px rgba(0,0,0,.28);
        display: grid;
        place-items: center;
        font-size: 24px;
      }

      .message-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .bubble-wrap.with-message-avatar .bubble,
      .bubble-wrap.with-message-avatar .typing-indicator {
        max-width: calc(78% - 60px);
      }

      .bubble-wrap.with-message-avatar .emoji-bubble {
        max-width: none;
      }
    `;
    document.head.appendChild(style);
  }

  function applyTopbarAvatar() {
    const topbarAvatar = $("topbarAvatar");
    if (!topbarAvatar) return;

    topbarAvatar.innerHTML = "";

    if (state.meDataUrl) {
      const img = document.createElement("img");
      img.src = state.meDataUrl;
      img.alt = "Top bar avatar";
      topbarAvatar.appendChild(img);
    } else {
      topbarAvatar.textContent = $("contactEmoji")?.value || "👤";
    }
  }

  function setupTopbarEmojiFallback() {
    const contactEmoji = $("contactEmoji");
    if (contactEmoji) {
      contactEmoji.addEventListener("input", () => {
        if (!state.meDataUrl) applyTopbarAvatar();
      });
    }
  }

  function injectControls() {
    const fontSizeRow = $("fontSize")?.closest(".row-input");
    if (!fontSizeRow || $("showMessageAvatars")) return;

    const controls = document.createElement("div");
    controls.className = "message-avatar-controls";
    controls.innerHTML = `
      <div class="section-label" style="margin-top:0">Message avatars</div>
      <div class="row-input">
        <label>
          <input type="checkbox" id="showMessageAvatars" checked>
          Show Message Avatars
        </label>
      </div>
      <div class="row-input">
        <label>Them Avatar PNG</label>
        <input type="file" id="themMessageAvatarUpload" accept="image/png,image/*">
      </div>
      <div class="row-input">
        <label>Me Avatar PNG</label>
        <input type="file" id="meMessageAvatarUpload" accept="image/png,image/*">
      </div>
    `;

    fontSizeRow.insertAdjacentElement("afterend", controls);

    $("showMessageAvatars").addEventListener("change", e => {
      state.enabled = e.target.checked;
      replayPreview();
    });

    setupAvatarUpload("themMessageAvatarUpload", dataUrl => {
      state.themDataUrl = dataUrl;
      replayPreview();
    });

    setupAvatarUpload("meMessageAvatarUpload", dataUrl => {
      state.meDataUrl = dataUrl;
      applyTopbarAvatar();
      replayPreview();
    });
  }

  function setupAvatarUpload(inputId, onLoad) {
    const input = $(inputId);
    if (!input) return;

    input.addEventListener("change", e => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = ev => onLoad(ev.target.result);
      reader.readAsDataURL(file);
    });
  }

  function avatarSource(type) {
    return type === "me" ? state.meDataUrl : state.themDataUrl;
  }

  function createMessageAvatar(type) {
    const avatar = document.createElement("div");
    avatar.className = `message-avatar ${type}`;

    const src = avatarSource(type);
    if (src) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `${type} avatar`;
      avatar.appendChild(img);
    } else {
      avatar.textContent = type === "me" ? "🙂" : ($("contactEmoji")?.value || "👤");
    }

    return avatar;
  }

  function shouldShowAvatarFor(msg) {
    return state.enabled && (msg.type === "them" || msg.type === "me" || msg.type === "typing");
  }

  function createBubbleWithAvatars(msg) {
    const senderType = msg.type === "typing" ? "them" : msg.type;
    const wrap = document.createElement("div");
    wrap.className = `bubble-wrap ${senderType}${shouldShowAvatarFor(msg) ? " with-message-avatar" : ""}`;

    let content;

    if (msg.type === "typing") {
      content = document.createElement("div");
      content.className = "typing-indicator";
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement("div");
        dot.className = "dot";
        content.appendChild(dot);
      }
    } else {
      content = document.createElement("div");
      const onlyEmoji = window.isOnlyEmoji ? window.isOnlyEmoji(msg.text) : false;
      content.className = `bubble ${msg.type}${onlyEmoji ? " emoji-bubble" : ""}`;
      content.textContent = msg.text;
    }

    if (!shouldShowAvatarFor(msg)) {
      wrap.appendChild(content);
      return wrap;
    }

    const line = document.createElement("div");
    line.className = `bubble-line ${senderType}`;

    if (senderType === "me") {
      line.appendChild(content);
      line.appendChild(createMessageAvatar("me"));
    } else {
      line.appendChild(createMessageAvatar("them"));
      line.appendChild(content);
    }

    wrap.appendChild(line);
    return wrap;
  }

  function replayPreview() {
    window.resetPreview?.();
    window.playPreview?.();
  }

  function patchPreview() {
    window.createBubble = createBubbleWithAvatars;
    setTimeout(replayPreview, 80);
  }

  function supportedVideoFormat() {
    const formats = [
      { mime: "video/mp4; codecs=avc1.42E01E", ext: "mp4", label: "MP4 H.264" },
      { mime: "video/mp4; codecs=avc1", ext: "mp4", label: "MP4 H.264" },
      { mime: "video/mp4", ext: "mp4", label: "MP4" },
      { mime: "video/webm; codecs=vp9", ext: "webm", label: "WebM VP9" },
      { mime: "video/webm; codecs=vp8", ext: "webm", label: "WebM VP8" },
      { mime: "video/webm", ext: "webm", label: "WebM" },
    ];

    return formats.find(f => MediaRecorder.isTypeSupported(f.mime));
  }

  function solidBg(name, outer = false) {
    const map = outer ? {
      "wa-classic": "#080d10",
      "wa-beige": "#d4c9c0",
      galaxy: "#020408",
      white: "#dadada",
      "green-screen": "#00cc00",
      dark: "#0a0a0a",
    } : {
      "wa-classic": "#0b141a",
      "wa-beige": "#ece5dd",
      galaxy: "#0a0e27",
      white: "#f5f5f5",
      "green-screen": "#00ff00",
      dark: "#1a1a1a",
    };

    return map[name] || map["wa-classic"];
  }

  async function captureStageFrame() {
    if (!window.html2canvas || !stageEl) return null;

    const previousTransform = stageEl.style.transform;
    stageEl.style.transform = "none";
    await new Promise(requestAnimationFrame);

    const frame = await html2canvas(stageEl, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    stageEl.style.transform = previousTransform;
    return frame;
  }

  async function exportWithDomCapture() {
    const exportBtn = $("exportBtn");
    const exportStatus = $("exportStatus");
    if (!exportBtn || exportBtn.disabled) return;

    const format = supportedVideoFormat();
    if (!format) {
      if (exportStatus) {
        exportStatus.style.display = "block";
        exportStatus.textContent = "❌ No supported video format. Try Chrome or Edge.";
      }
      return;
    }

    const resVal = $("exportRes")?.value || "source";
    const posVal = $("exportPos")?.value || "center";
    const bgVal = $("exportBg")?.value || "wa-classic";

    const chatW = stageEl.offsetWidth || 390;
    const chatH = stageEl.offsetHeight || 844;
    let canvasW, canvasH;

    if (resVal === "source") {
      canvasW = chatW;
      canvasH = chatH;
    } else {
      [canvasW, canvasH] = resVal.split("x").map(Number);
    }

    const scale = Math.min(canvasW / chatW, canvasH / chatH);
    const drawnW = Math.round(chatW * scale);
    const drawnH = Math.round(chatH * scale);
    const pad = 24;
    const posMap = {
      center: [Math.round((canvasW - drawnW) / 2), Math.round((canvasH - drawnH) / 2)],
      left: [pad, Math.round((canvasH - drawnH) / 2)],
      right: [canvasW - drawnW - pad, Math.round((canvasH - drawnH) / 2)],
      "top-left": [pad, pad],
      "top-right": [canvasW - drawnW - pad, pad],
      "bottom-left": [pad, canvasH - drawnH - pad],
      "bottom-right": [canvasW - drawnW - pad, canvasH - drawnH - pad],
    };
    const [ox, oy] = posMap[posVal] || posMap.center;

    const canvas = document.createElement("canvas");
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext("2d");
    const stream = canvas.captureStream(30);
    const chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType: format.mime, videoBitsPerSecond: 24_000_000 });

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: format.mime });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `chat-${canvasW}x${canvasH}.${format.ext}`;
      a.click();
      URL.revokeObjectURL(a.href);
      exportBtn.disabled = false;
      exportBtn.textContent = `⬇ Export ${format.label}`;
      if (exportStatus) {
        exportStatus.style.display = "block";
        exportStatus.textContent = `✅ Done! ${canvasW}×${canvasH} ${format.label}`;
      }
    };

    exportBtn.disabled = true;
    exportBtn.textContent = "⏺ Recording…";
    if (exportStatus) {
      exportStatus.style.display = "block";
      exportStatus.textContent = "⏳ Rendering with message avatars…";
    }

    replayPreview();
    recorder.start();

    const delay = Number($("delayInput")?.value || 900);
    const count = Array.isArray(window.messages) ? window.messages.length : document.querySelectorAll(".msg-row").length || 8;
    const duration = 900 + count * delay + 260 * count + 1800;
    const startedAt = performance.now();

    async function frame() {
      ctx.fillStyle = solidBg(bgVal, true);
      ctx.fillRect(0, 0, canvasW, canvasH);
      ctx.fillStyle = solidBg(bgVal, false);
      ctx.fillRect(ox, oy, drawnW, drawnH);

      const shot = await captureStageFrame();
      if (shot) ctx.drawImage(shot, ox, oy, drawnW, drawnH);

      if (performance.now() - startedAt < duration) {
        setTimeout(frame, 1000 / 30);
      } else {
        recorder.stop();
      }
    }

    frame();
  }

  function patchExportButton() {
    const oldBtn = $("exportBtn");
    if (!oldBtn || oldBtn.dataset.messageAvatarExport === "true") return;

    const newBtn = oldBtn.cloneNode(true);
    newBtn.dataset.messageAvatarExport = "true";
    oldBtn.replaceWith(newBtn);
    newBtn.addEventListener("click", exportWithDomCapture);
  }

  document.addEventListener("DOMContentLoaded", () => {
    injectStyles();
    setupTopbarEmojiFallback();
    injectControls();
    patchPreview();
    patchExportButton();
    applyTopbarAvatar();
  });
})();
