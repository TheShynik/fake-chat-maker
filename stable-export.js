(() => {
  const $ = id => document.getElementById(id);

  const THEMES = {
    whatsapp: { top: "#1f2c34", text: "#fff", input: "#1f2c34" },
    imessage: { top: "#f2f2f7", text: "#000", input: "#f2f2f7" },
    telegram: { top: "#527da3", text: "#fff", input: "#527da3" },
    dark: { top: "#1a1a2e", text: "#fff", input: "#1a1a2e" },
  };

  const BG = {
    "wa-classic": "#0b141a",
    "wa-beige": "#ece5dd",
    galaxy: "#0a0e27",
    white: "#f5f5f5",
    "green-screen": "#00ff00",
    dark: "#1a1a1a",
  };

  const OUTER_BG = {
    "wa-classic": "#080d10",
    "wa-beige": "#d4c9c0",
    galaxy: "#020408",
    white: "#dadada",
    "green-screen": "#00cc00",
    dark: "#0a0a0a",
  };

  function getCurrentTheme() {
    const phone = $("phone");
    if (phone?.classList.contains("theme-imessage")) return "imessage";
    if (phone?.classList.contains("theme-telegram")) return "telegram";
    if (phone?.classList.contains("theme-dark")) return "dark";
    return "whatsapp";
  }

  function getCurrentBg() {
    const stage = $("stage");
    const cls = [...(stage?.classList || [])].find(c => c.startsWith("bg-"));
    return cls ? cls.replace("bg-", "") : "wa-classic";
  }

  function getMessagesFromEditor() {
    const rows = [...document.querySelectorAll(".msg-row")];
    const result = rows.map(row => {
      const badge = row.querySelector(".msg-sender-badge");
      const label = badge?.textContent?.trim()?.toLowerCase() || "them";
      const textarea = row.querySelector("textarea");

      if (label.includes("typing")) return { type: "typing", text: "" };
      return {
        type: label.includes("me") ? "me" : "them",
        text: textarea?.value || "",
      };
    });

    return result.length ? result : [
      { type: "them", text: "Hey!" },
      { type: "me", text: "Hi!" },
    ];
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  function luminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    return 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
  }

  function rgbaFromInput(inputId, alpha = 1) {
    const hex = $(inputId)?.value || "#ffffff";
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function textColorFor(inputId) {
    const hex = $(inputId)?.value || "#ffffff";
    return luminance(hex) > 0.4 ? "#111" : "#fff";
  }

  function isOnlyEmoji(str) {
    const s = (str || "").trim();
    if (!s) return false;
    return /^([^\p{L}\p{N}]|\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\s)+$/u.test(s) && s.length <= 8;
  }

  function supportedFormat() {
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

  function roundedRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }

  function wrapText(ctx, text, maxWidth) {
    const words = String(text || "").split(/\s+/);
    const lines = [];
    let line = "";

    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  }

  function drawBackground(ctx, bg, x, y, w, h) {
    ctx.fillStyle = BG[bg] || BG["wa-classic"];
    ctx.fillRect(x, y, w, h);

    if (bg === "wa-classic") {
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = "#1f2c34";
      for (let yy = y; yy < y + h; yy += 56) {
        for (let xx = x; xx < x + w; xx += 56) {
          ctx.beginPath();
          ctx.arc(xx + 28, yy + 28, 14, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  function drawStaticUI(ctx, dims, theme, bg) {
    const { x, y, w, h, S, statusH, topH, inputH } = dims;
    const th = THEMES[theme] || THEMES.whatsapp;

    drawBackground(ctx, bg, x, y, w, h);

    if ($("showStatusBar")?.checked) {
      ctx.fillStyle = th.top;
      ctx.fillRect(x, y, w, statusH);
      ctx.fillStyle = th.text;
      ctx.font = `600 ${Math.max(10, 11 * S)}px Inter, system-ui, sans-serif`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.fillText("9:41", x + 18 * S, y + statusH / 2);
      ctx.textAlign = "right";
      ctx.globalAlpha = 0.75;
      ctx.fillText("WiFi  🔋", x + w - 16 * S, y + statusH / 2);
      ctx.globalAlpha = 1;
    }

    if ($("showTopBar")?.checked) {
      const ty = y + statusH;
      ctx.fillStyle = th.top;
      ctx.fillRect(x, ty, w, topH);
      ctx.fillStyle = th.text;
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.font = `${Math.max(22, 26 * S)}px Arial`;
      ctx.fillText("‹", x + 12 * S, ty + topH / 2);

      const avR = 18 * S;
      const avX = x + 45 * S;
      const avY = ty + topH / 2;
      ctx.fillStyle = th.text === "#fff" ? "rgba(255,255,255,.15)" : "rgba(0,0,0,.12)";
      ctx.beginPath();
      ctx.arc(avX, avY, avR, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `${Math.max(16, 20 * S)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText($("contactEmoji")?.value || "👤", avX, avY + 1 * S);

      ctx.textAlign = "left";
      ctx.fillStyle = th.text;
      ctx.font = `700 ${Math.max(12, 14 * S)}px Inter, system-ui, sans-serif`;
      ctx.fillText($("contactName")?.value || "Contact", x + 72 * S, avY - 7 * S);
      ctx.font = `${Math.max(10, 11 * S)}px Inter, system-ui, sans-serif`;
      ctx.globalAlpha = 0.65;
      ctx.fillText($("contactStatus")?.value || "online", x + 72 * S, avY + 9 * S);
      ctx.globalAlpha = 1;
    }

    if ($("showBottomBar")?.checked) {
      const iy = y + h - inputH;
      ctx.fillStyle = th.input;
      ctx.fillRect(x, iy, w, inputH);
      ctx.font = `${Math.max(18, 22 * S)}px Arial`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("😊", x + 12 * S, iy + inputH / 2);

      const fx = x + 42 * S;
      const fy = iy + 16 * S;
      const fw = w - 90 * S;
      const fh = 36 * S;
      ctx.fillStyle = th.text === "#fff" ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.08)";
      roundedRect(ctx, fx, fy, fw, fh, 18 * S);
      ctx.fill();
      ctx.fillStyle = th.text;
      ctx.globalAlpha = 0.35;
      ctx.font = `${Math.max(10, 12 * S)}px Inter, system-ui, sans-serif`;
      ctx.fillText("Message…", fx + 12 * S, iy + inputH / 2);
      ctx.globalAlpha = 1;
    }
  }

  function measureMessages(ctx, messages, dims) {
    const fontSize = Number($("fontSize")?.value || 17) * dims.S;
    const lineH = fontSize * 1.38;
    const maxW = dims.w * 0.74;
    const padX = 12 * dims.S;
    const padY = 9 * dims.S;

    ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;

    return messages.map(msg => {
      if (msg.type === "typing") return { w: 60 * dims.S, h: 38 * dims.S, typing: true };
      if (isOnlyEmoji(msg.text)) return { w: 52 * dims.S, h: 58 * dims.S, emoji: true };
      const lines = wrapText(ctx, msg.text, maxW - padX * 2);
      const textW = Math.max(...lines.map(l => ctx.measureText(l).width), 20 * dims.S);
      return {
        w: Math.min(maxW, textW + padX * 2),
        h: lines.length * lineH + padY * 2,
        lines,
      };
    });
  }

  function drawMessage(ctx, msg, measured, dims, y, progress) {
    if (progress <= 0) return;

    const fontSize = Number($("fontSize")?.value || 17) * dims.S;
    const lineH = fontSize * 1.38;
    const padX = 12 * dims.S;
    const padY = 9 * dims.S;
    const isMe = msg.type === "me";

    ctx.save();
    ctx.globalAlpha = progress;

    const scale = 0.94 + 0.06 * progress;
    const x = isMe ? dims.x + dims.w - dims.pad - measured.w : dims.x + dims.pad;
    const cx = x + measured.w / 2;
    const cy = y + measured.h / 2;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);

    if (measured.emoji) {
      ctx.font = `${48 * dims.S}px Arial`;
      ctx.textBaseline = "top";
      ctx.textAlign = isMe ? "right" : "left";
      ctx.fillText(msg.text, isMe ? dims.x + dims.w - dims.pad : dims.x + dims.pad, y);
      ctx.restore();
      return;
    }

    const alpha = Number($("bubbleOpacity")?.value || 100) / 100;
    const fill = msg.type === "me" ? rgbaFromInput("myColor", alpha) : rgbaFromInput("theirColor", alpha);
    const text = msg.type === "me" ? textColorFor("myColor") : textColorFor("theirColor");

    ctx.fillStyle = fill;
    roundedRect(ctx, x, y, measured.w, measured.h, 18 * dims.S);
    ctx.fill();

    if (measured.typing) {
      ctx.fillStyle = text;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(x + (17 + i * 13) * dims.S, y + measured.h / 2, 3.5 * dims.S, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    ctx.fillStyle = text;
    ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    measured.lines.forEach((line, i) => {
      ctx.fillText(line, x + padX, y + padY + i * lineH);
    });

    ctx.restore();
  }

  function stableExport() {
    const exportBtn = $("exportBtn");
    const status = $("exportStatus");
    if (!exportBtn || exportBtn.disabled) return;

    const format = supportedFormat();
    if (!format) {
      if (status) {
        status.style.display = "block";
        status.textContent = "❌ No supported video format. Try Chrome or Edge.";
      }
      return;
    }

    const stage = $("stage");
    const stageW = stage?.offsetWidth || 390;
    const stageH = stage?.offsetHeight || 844;
    const resVal = $("exportRes")?.value || "1920x1080";
    const posVal = $("exportPos")?.value || "center";
    let canvasW, canvasH;
    if (resVal === "source") [canvasW, canvasH] = [stageW, stageH];
    else [canvasW, canvasH] = resVal.split("x").map(Number);

    const S = Math.min(canvasW / stageW, canvasH / stageH);
    const drawnW = Math.round(stageW * S);
    const drawnH = Math.round(stageH * S);
    const p = 24;
    const pos = {
      center: [(canvasW - drawnW) / 2, (canvasH - drawnH) / 2],
      left: [p, (canvasH - drawnH) / 2],
      right: [canvasW - drawnW - p, (canvasH - drawnH) / 2],
      "top-left": [p, p],
      "top-right": [canvasW - drawnW - p, p],
      "bottom-left": [p, canvasH - drawnH - p],
      "bottom-right": [canvasW - drawnW - p, canvasH - drawnH - p],
    }[posVal] || [(canvasW - drawnW) / 2, (canvasH - drawnH) / 2];

    const dims = {
      x: Math.round(pos[0]),
      y: Math.round(pos[1]),
      w: drawnW,
      h: drawnH,
      S,
      statusH: $("showStatusBar")?.checked ? 28 * S : 0,
      topH: $("showTopBar")?.checked ? 60 * S : 0,
      inputH: $("showBottomBar")?.checked ? 68 * S : 0,
      pad: 12 * S,
    };

    const canvas = document.createElement("canvas");
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext("2d");
    const stream = canvas.captureStream(60);
    const chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType: format.mime, videoBitsPerSecond: 35_000_000 });

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
      if (status) {
        status.style.display = "block";
        status.textContent = `✅ Done! ${canvasW}×${canvasH} ${format.label}`;
      }
    };

    exportBtn.disabled = true;
    exportBtn.textContent = "⏺ Recording…";
    if (status) {
      status.style.display = "block";
      status.textContent = "⏳ Rendering stable video…";
    }

    const messages = getMessagesFromEditor();
    const measured = measureMessages(ctx, messages, dims);
    const chatTop = dims.y + dims.statusH + dims.topH + 12 * S;
    const chatBot = dims.y + dims.h - dims.inputH - 12 * S;
    const ys = new Array(messages.length);
    let y = chatBot - measured[measured.length - 1].h;
    ys[ys.length - 1] = y;
    for (let i = messages.length - 2; i >= 0; i--) {
      const gap = messages[i].type === messages[i + 1].type ? 6 * S : 14 * S;
      y -= measured[i].h + gap;
      ys[i] = y;
    }
    const overflow = chatTop - ys[0];
    if (overflow > 0) ys.forEach((_, i) => ys[i] += overflow);

    const delay = Number($("delayInput")?.value || 900);
    const popDur = 260;
    const total = 700 + messages.length * delay + 1800;
    const start = performance.now();
    const bg = getCurrentBg();
    const theme = getCurrentTheme();

    recorder.start();

    function frame(now) {
      const elapsed = now - start;
      ctx.fillStyle = OUTER_BG[bg] || OUTER_BG["wa-classic"];
      ctx.fillRect(0, 0, canvasW, canvasH);
      drawStaticUI(ctx, dims, theme, bg);

      const active = Math.max(0, elapsed - 700);
      const current = Math.min(messages.length - 1, Math.floor(active / delay));

      ctx.save();
      ctx.beginPath();
      ctx.rect(dims.x, chatTop - 4 * S, dims.w, chatBot - chatTop + 8 * S);
      ctx.clip();

      for (let i = 0; i <= current && i < messages.length; i++) {
        const local = active - i * delay;
        const progress = i < current ? 1 : Math.min(1, Math.max(0, local / popDur));
        drawMessage(ctx, messages[i], measured[i], dims, ys[i], progress);
      }

      ctx.restore();

      if (elapsed < total) requestAnimationFrame(frame);
      else recorder.stop();
    }

    requestAnimationFrame(frame);
  }

  function patchButton() {
    const oldBtn = $("exportBtn");
    if (!oldBtn || oldBtn.dataset.stableCleanExport === "true") return;
    const newBtn = oldBtn.cloneNode(true);
    newBtn.dataset.stableCleanExport = "true";
    oldBtn.replaceWith(newBtn);
    newBtn.addEventListener("click", stableExport);
  }

  document.addEventListener("DOMContentLoaded", patchButton);
})();
