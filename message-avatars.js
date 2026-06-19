(() => {
  const state = {
    enabled: true,
    themDataUrl: "",
    meDataUrl: "",
  };

  const $ = id => document.getElementById(id);

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

  document.addEventListener("DOMContentLoaded", () => {
    injectStyles();
    setupTopbarEmojiFallback();
    injectControls();
    patchPreview();
    applyTopbarAvatar();
  });
})();
