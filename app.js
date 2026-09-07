const STORAGE_KEY = "noctuary.rohini-ray.v1";
const MAX_PAGES = 10;
const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];

const CLOTHS = [
  { id: "midnight", color: "#1b2748" },
  { id: "burgundy", color: "#5a1630" },
  { id: "forest", color: "#163528" },
  { id: "dusk", color: "#6a3a4e" },
  { id: "ink", color: "#17141c" },
  { id: "sage", color: "#4d5b46" },
];

const STARS = [
  { id: "four", label: "4-point" },
  { id: "five", label: "5-point" },
  { id: "six", label: "6-point" },
  { id: "sparkle", label: "Sparkle" },
];

const FLOWERS = [
  { id: "rose", label: "Rose" },
  { id: "daisy", label: "Daisy" },
  { id: "tulip", label: "Tulip" },
  { id: "lotus", label: "Lotus" },
];

const FLOWER_COLORS = ["#e8a0b4", "#f3d67b", "#f4f0e6", "#c45c6a", "#8ec5a2", "#c9a6e0"];
const EMOJIS = ["🌙", "⭐", "✨", "💫", "🦋", "💌", "🗝️", "🕯️", "🌸", "🌺", "🌻", "🌷"];

const state = loadState();
let tool = { kind: "star", id: "five" };
let flowerColor = FLOWER_COLORS[0];
let selectedId = null;
let spread = 0;
let dragging = null;
let readOnly = false;

const el = {
  cover: document.getElementById("cover"),
  layer: document.getElementById("ornament-layer"),
  titleDisplay: document.getElementById("cover-title-display"),
  titleInput: document.getElementById("journal-title"),
  clothSwatches: document.getElementById("cloth-swatches"),
  starTools: document.getElementById("star-tools"),
  flowerTools: document.getElementById("flower-tools"),
  flowerSwatches: document.getElementById("flower-swatches"),
  emojiTools: document.getElementById("emoji-tools"),
  pagesSpread: document.getElementById("pages-spread"),
  pager: document.getElementById("pager"),
  atelier: document.getElementById("atelier"),
  leftPage: document.getElementById("left-page"),
  rightPage: document.getElementById("right-page"),
  leftIndex: document.getElementById("left-index"),
  rightIndex: document.getElementById("right-index"),
  leftCount: document.getElementById("left-count"),
  rightCount: document.getElementById("right-count"),
  spreadLabel: document.getElementById("spread-label"),
  shareLink: document.getElementById("share-link"),
  copyStatus: document.getElementById("copy-status"),
  readerBanner: document.getElementById("reader-banner"),
};

function emptyPages() {
  return Array.from({ length: MAX_PAGES }, () => "");
}

function defaultState() {
  return {
    title: "My Secret Journal",
    cloth: "midnight",
    ornaments: [],
    pages: emptyPages(),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      ...defaultState(),
      ...parsed,
      pages: Array.from({ length: MAX_PAGES }, (_, i) => parsed.pages?.[i] || ""),
    };
  } catch {
    return defaultState();
  }
}

function save() {
  if (readOnly) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid() {
  return crypto.randomUUID();
}

function starPath(kind, size) {
  const cx = size / 2;
  const cy = size / 2;
  if (kind === "sparkle") {
    return `<path d="M${cx} 4 L${cx + 4} ${cy - 6} L${size - 4} ${cy} L${cx + 4} ${cy + 6} L${cx} ${size - 4} L${cx - 4} ${cy + 6} L4 ${cy} L${cx - 4} ${cy - 6} Z" />`;
  }
  const points = kind === "four" ? 4 : kind === "six" ? 6 : 5;
  const outer = size * 0.46;
  const inner = kind === "four" ? size * 0.16 : size * 0.2;
  const coords = [];
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / points) * i - Math.PI / 2;
    coords.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return `<polygon points="${coords.join(" ")}" />`;
}

function flowerSvg(kind, color, size) {
  if (kind === "rose") {
    return `<circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.18}" fill="${color}" />
      <circle cx="${size * 0.35}" cy="${size * 0.4}" r="${size * 0.16}" fill="${color}" opacity=".85"/>
      <circle cx="${size * 0.65}" cy="${size * 0.4}" r="${size * 0.16}" fill="${color}" opacity=".85"/>
      <circle cx="${size * 0.38}" cy="${size * 0.62}" r="${size * 0.15}" fill="${color}" opacity=".8"/>
      <circle cx="${size * 0.62}" cy="${size * 0.62}" r="${size * 0.15}" fill="${color}" opacity=".8"/>`;
  }
  if (kind === "daisy") {
    let petals = "";
    for (let i = 0; i < 10; i += 1) {
      const a = (Math.PI * 2 * i) / 10;
      const x = size / 2 + Math.cos(a) * size * 0.22;
      const y = size / 2 + Math.sin(a) * size * 0.22;
      petals += `<ellipse cx="${x}" cy="${y}" rx="${size * 0.09}" ry="${size * 0.16}" fill="${color}" transform="rotate(${(a * 180) / Math.PI} ${x} ${y})" />`;
    }
    return `${petals}<circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.12}" fill="#f3d67b" />`;
  }
  if (kind === "tulip") {
    return `<path d="M${size / 2} ${size * 0.18} C${size * 0.18} ${size * 0.3} ${size * 0.15} ${size * 0.7} ${size / 2} ${size * 0.82} C${size * 0.85} ${size * 0.7} ${size * 0.82} ${size * 0.3} ${size / 2} ${size * 0.18} Z" fill="${color}" />
      <path d="M${size / 2} ${size * 0.82} L${size / 2} ${size * 0.96}" stroke="#6a8f62" stroke-width="3" />`;
  }
  return `<ellipse cx="${size / 2}" cy="${size * 0.55}" rx="${size * 0.28}" ry="${size * 0.16}" fill="${color}" />
    <ellipse cx="${size / 2}" cy="${size * 0.42}" rx="${size * 0.22}" ry="${size * 0.14}" fill="${color}" opacity=".9"/>
    <circle cx="${size / 2}" cy="${size * 0.48}" r="${size * 0.08}" fill="#f7e7b4" />`;
}

function ornamentMarkup(item) {
  const size = 48;
  if (item.kind === "emoji") {
    return `<span class="glyph">${item.id}</span>`;
  }
  if (item.kind === "star") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="#f7e7b4">${starPath(item.id, size)}</svg>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${flowerSvg(item.id, item.color, size)}</svg>`;
}

function renderCover() {
  el.cover.dataset.cloth = state.cloth;
  el.titleDisplay.textContent = state.title || "Untitled journal";
  el.layer.innerHTML = "";
  state.ornaments.forEach((item) => {
    const node = document.createElement("div");
    node.className = "ornament" + (item.id === selectedId ? " selected" : "");
    node.dataset.id = item.id;
    node.style.left = `${item.x}%`;
    node.style.top = `${item.y}%`;
    node.style.transform = `translate(-50%, -50%) rotate(${item.rotate || 0}deg) scale(${item.scale || 1})`;
    node.innerHTML = ornamentMarkup(item);
    el.layer.appendChild(node);
  });
}

function renderTools() {
  el.clothSwatches.innerHTML = CLOTHS.map(
    (c) =>
      `<button type="button" class="swatch${state.cloth === c.id ? " active" : ""}" data-cloth="${c.id}" style="background:${c.color}" aria-label="${c.id}"></button>`
  ).join("");

  el.starTools.innerHTML = STARS.map(
    (s) =>
      `<button type="button" class="chip${tool.kind === "star" && tool.id === s.id ? " active" : ""}" data-tool="star:${s.id}">${s.label}</button>`
  ).join("");

  el.flowerTools.innerHTML = FLOWERS.map(
    (f) =>
      `<button type="button" class="chip${tool.kind === "flower" && tool.id === f.id ? " active" : ""}" data-tool="flower:${f.id}">${f.label}</button>`
  ).join("");

  el.flowerSwatches.innerHTML = FLOWER_COLORS.map(
    (color) =>
      `<button type="button" class="swatch${flowerColor === color ? " active" : ""}" data-flower-color="${color}" style="background:${color}"></button>`
  ).join("");

  el.emojiTools.innerHTML = EMOJIS.map(
    (e) =>
      `<button type="button" class="chip${tool.kind === "emoji" && tool.id === e ? " active" : ""}" data-tool="emoji:${e}">${e}</button>`
  ).join("");
}

function pagePair() {
  const left = spread * 2;
  const right = left + 1;
  return { left, right };
}

function renderPages() {
  const { left, right } = pagePair();
  el.leftPage.value = state.pages[left] || "";
  el.rightPage.value = state.pages[right] || "";
  el.leftIndex.textContent = ROMAN[left];
  el.rightIndex.textContent = ROMAN[right] || "";
  el.leftCount.textContent = el.leftPage.value.length;
  el.rightCount.textContent = el.rightPage.value.length;
  el.spreadLabel.textContent = `Pages ${left + 1} – ${Math.min(right + 1, MAX_PAGES)} of ${MAX_PAGES}`;
  el.rightPage.closest(".leaf").hidden = right >= MAX_PAGES;
  el.leftPage.readOnly = readOnly;
  el.rightPage.readOnly = readOnly;
}

function setOpen(open) {
  document.body.classList.toggle("is-open", open);
  el.cover.hidden = open;
  el.pagesSpread.hidden = !open;
  el.pager.hidden = !open;
  document.getElementById("open-journal").textContent = open ? "Close journal" : "Open journal";
}

function percentFromEvent(event) {
  const box = el.cover.getBoundingClientRect();
  return {
    x: ((event.clientX - box.left) / box.width) * 100,
    y: ((event.clientY - box.top) / box.height) * 100,
  };
}

el.cover.addEventListener("pointerdown", (event) => {
  if (readOnly) return;
  const hit = event.target.closest(".ornament");
  if (hit) {
    selectedId = hit.dataset.id;
    dragging = {
      id: selectedId,
      pointer: event.pointerId,
    };
    hit.setPointerCapture(event.pointerId);
    renderCover();
    return;
  }
  const pos = percentFromEvent(event);
  const item = {
    id: uid(),
    kind: tool.kind,
    x: pos.x,
    y: pos.y,
    rotate: tool.kind === "star" ? Math.random() * 40 - 20 : 0,
    scale: 0.85 + Math.random() * 0.4,
  };
  if (tool.kind === "flower") item.color = flowerColor;
  state.ornaments.push(item);
  selectedId = item.id;
  save();
  renderCover();
});

el.cover.addEventListener("pointermove", (event) => {
  if (!dragging || readOnly) return;
  const item = state.ornaments.find((o) => o.id === dragging.id);
  if (!item) return;
  const pos = percentFromEvent(event);
  item.x = Math.min(96, Math.max(4, pos.x));
  item.y = Math.min(96, Math.max(4, pos.y));
  renderCover();
});

el.cover.addEventListener("pointerup", () => {
  if (dragging) {
    dragging = null;
    save();
  }
});

document.addEventListener("keydown", (event) => {
  if (readOnly) return;
  if ((event.key === "Delete" || event.key === "Backspace") && selectedId) {
    const tag = event.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    state.ornaments = state.ornaments.filter((o) => o.id !== selectedId);
    selectedId = null;
    save();
    renderCover();
  }
});

el.titleInput.addEventListener("input", () => {
  state.title = el.titleInput.value;
  save();
  renderCover();
});

el.clothSwatches.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-cloth]");
  if (!btn || readOnly) return;
  state.cloth = btn.dataset.cloth;
  save();
  renderTools();
  renderCover();
});

function onToolClick(event) {
  const btn = event.target.closest("[data-tool]");
  if (!btn) return;
  const [kind, ...rest] = btn.dataset.tool.split(":");
  tool = { kind, id: rest.join(":") };
  renderTools();
}

el.starTools.addEventListener("click", onToolClick);
el.flowerTools.addEventListener("click", onToolClick);
el.emojiTools.addEventListener("click", onToolClick);

el.flowerSwatches.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-flower-color]");
  if (!btn) return;
  flowerColor = btn.dataset.flowerColor;
  tool = { kind: "flower", id: tool.kind === "flower" ? tool.id : "rose" };
  renderTools();
});

document.getElementById("clear-ornaments").addEventListener("click", () => {
  if (readOnly) return;
  state.ornaments = [];
  selectedId = null;
  save();
  renderCover();
});

document.getElementById("open-journal").addEventListener("click", () => {
  const shouldOpen = el.pagesSpread.hidden;
  setOpen(shouldOpen);
  if (shouldOpen) renderPages();
});

function bindPage(textarea, which) {
  textarea.addEventListener("input", () => {
    const { left, right } = pagePair();
    const index = which === "left" ? left : right;
    if (index >= MAX_PAGES) return;
    state.pages[index] = textarea.value.slice(0, 1800);
    save();
    renderPages();
  });
}

bindPage(el.leftPage, "left");
bindPage(el.rightPage, "right");

document.getElementById("prev-spread").addEventListener("click", () => {
  spread = Math.max(0, spread - 1);
  renderPages();
});

document.getElementById("next-spread").addEventListener("click", () => {
  spread = Math.min(Math.ceil(MAX_PAGES / 2) - 1, spread + 1);
  renderPages();
});

function bufToB64(buf) {
  const bytes = new Uint8Array(buf);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64ToBuf(str) {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function encryptJournal() {
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(state));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  const rawKey = await crypto.subtle.exportKey("raw", key);
  return `${bufToB64(rawKey)}.${bufToB64(iv)}.${bufToB64(cipher)}`;
}

async function decryptJournal(token) {
  const [k, i, c] = token.split(".");
  const key = await crypto.subtle.importKey(
    "raw",
    b64ToBuf(k),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  const iv = new Uint8Array(b64ToBuf(i));
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, b64ToBuf(c));
  return JSON.parse(new TextDecoder().decode(plain));
}

document.getElementById("share-btn").addEventListener("click", async () => {
  if (readOnly) {
    document.getElementById("share-modal").showModal();
    return;
  }
  const token = await encryptJournal();
  const url = `${location.origin}${location.pathname}#share=${token}`;
  el.shareLink.value = url;
  el.copyStatus.hidden = true;
  document.getElementById("share-modal").showModal();
});

document.getElementById("copy-link").addEventListener("click", async () => {
  await navigator.clipboard.writeText(el.shareLink.value);
  el.copyStatus.hidden = false;
});

document.querySelectorAll("[data-open]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.getElementById(`${btn.dataset.open}-modal`).showModal();
  });
});

document.querySelectorAll("[data-close]").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.closest("dialog").close();
  });
});

async function bootFromHash() {
  const hash = location.hash;
  if (!hash.startsWith("#share=")) return false;
  try {
    const shared = await decryptJournal(hash.slice(7));
    Object.assign(state, defaultState(), shared);
    state.pages = Array.from({ length: MAX_PAGES }, (_, i) => shared.pages?.[i] || "");
    readOnly = true;
    el.readerBanner.hidden = false;
    el.atelier.querySelectorAll("button, input").forEach((node) => {
      if (node.id !== "open-journal") node.disabled = true;
    });
    document.getElementById("share-btn").hidden = true;
    return true;
  } catch {
    alert("This share link is damaged or incomplete.");
    return false;
  }
}

(async function init() {
  await bootFromHash();
  el.titleInput.value = state.title;
  renderTools();
  renderCover();
  renderPages();
  setOpen(false);
})();
