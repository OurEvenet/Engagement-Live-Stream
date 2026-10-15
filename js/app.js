/* ============================================================
   Gayathri & Ashen · Watch Live
   Event details live in config.js; the YouTube link in stream.json.
   ============================================================ */
(() => {
  "use strict";

  const C = window.LIVE_CONFIG;
  const $ = (s) => document.querySelector(s);
  const startD = new Date(C.start), endD = new Date(C.end);
  const SOON_MS = 30 * 60e3; // "starting soon" for the last half hour
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const toast = (m) => {
    const t = $("#toast"); t.textContent = m; t.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2400);
  };
  const pageUrl = () => C.pageUrl || location.href.split(/[?#]/)[0];

  /* ---------- Times, in Sri Lanka and in the viewer's own zone ---------- */
  const fmtTime = (d, tz) => new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: tz })
    .format(d).replace(":", ".").replace(/\s?([ap])m/i, (_, x) => " " + x.toUpperCase() + "M");
  const fmtDay = (d, tz) => new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: tz }).format(d);
  const startTime = fmtTime(startD, C.timeZone); // "9.00 AM"

  /* ---------- The YouTube link: a video, a live link, a channel or a handle ---------- */
  const ID = /^[\w-]{11}$/, CHANNEL = /^UC[\w-]{22}$/;
  function parseYouTube(raw) {
    raw = String(raw || "").trim();
    if (!raw) return null;
    if (ID.test(raw)) return { kind: "video", id: raw };
    if (CHANNEL.test(raw)) return { kind: "channel", id: raw };
    let u;
    try { u = new URL(/^https?:\/\//i.test(raw) ? raw : "https://" + raw); } catch (e) { return null; }
    const host = u.hostname.replace(/^(www|m|music)\./, "");
    const parts = u.pathname.split("/").filter(Boolean);
    if (host === "youtu.be" && ID.test(parts[0] || "")) return { kind: "video", id: parts[0] };
    if (!/(^|\.)youtube(-nocookie)?\.com$/.test(host)) return null;
    const v = u.searchParams.get("v");
    if (v && ID.test(v)) return { kind: "video", id: v };
    if (["live", "embed", "shorts", "v"].includes(parts[0]) && ID.test(parts[1] || "")) return { kind: "video", id: parts[1] };
    if (parts[0] === "embed" && parts[1] === "live_stream" && CHANNEL.test(u.searchParams.get("channel") || "")) return { kind: "channel", id: u.searchParams.get("channel") };
    if (parts[0] === "channel" && CHANNEL.test(parts[1] || "")) return { kind: "channel", id: parts[1] };
    if (parts[0] && parts[0].startsWith("@")) return { kind: "handle", id: parts[0] };
    return null;
  }
  function embedUrl(src) {
    const common = "autoplay=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3";
    return src.kind === "video"
      ? `https://www.youtube-nocookie.com/embed/${src.id}?${common}`
      : `https://www.youtube.com/embed/live_stream?channel=${src.id}&${common}`;
  }
  function watchUrl(src) {
    if (src.kind === "video") return `https://www.youtube.com/watch?v=${src.id}`;
    if (src.kind === "channel") return `https://www.youtube.com/channel/${src.id}/live`;
    return `https://www.youtube.com/${src.id}/live`;
  }

  /* ---------- Where we are in the day ---------- */
  const phase = (now = Date.now()) => now < startD - SOON_MS ? "before" : now < startD ? "soon" : now < endD ? "live" : "after";

  let source = null, sourceKey = null, lastPhase = null;

  function renderScreen() {
    const screen = $("#screen"), holding = $("#holding");
    const old = screen.querySelector("iframe");
    const embeddable = source && source.kind !== "handle";
    if (embeddable) {
      const url = embedUrl(source);
      if (!old || old.dataset.src !== url) {
        const f = document.createElement("iframe");
        f.src = url; f.dataset.src = url;
        f.title = `${C.couple} · ${C.occasion} live stream`;
        f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        f.allowFullscreen = true;
        f.referrerPolicy = "strict-origin-when-cross-origin";
        if (old) old.replaceWith(f); else screen.appendChild(f);
      }
      holding.hidden = true;
    } else {
      if (old) old.remove();
      holding.hidden = false;
    }
    const yt = $("#ytLink");
    if (source) { yt.href = watchUrl(source); yt.removeAttribute("aria-disabled"); }
    else { yt.removeAttribute("href"); yt.setAttribute("aria-disabled", "true"); }
    $("#hint").hidden = !embeddable;
    paintStatus();
  }

  /* status chip in the hero, the label on the frame and the words on the holding card */
  function paintStatus() {
    const p = phase(), has = !!source, handle = has && source.kind === "handle";
    const shortDay = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: C.timeZone }).format(startD);
    const S = {
      before: { tone: "idle", text: `Live from ${startTime} · ${shortDay}`, cap: startTime },
      soon:   { tone: "soon", text: "Starting soon", cap: "Soon" },
      live:   has ? { tone: "live", text: "Live now", cap: "Live" } : { tone: "soon", text: "Starting any moment", cap: "Soon" },
      after:  has ? { tone: "done", text: "Watch the replay", cap: "Replay" } : { tone: "done", text: "Thank you for watching", cap: "With love" }
    }[p];
    $("#status").dataset.tone = S.tone; $("#statusText").textContent = S.text;
    $("#capLive").dataset.tone = S.tone; $("#capLiveText").textContent = S.cap;

    const title = $("#holdTitle"), sub = $("#holdSub"), btn = $("#holdBtn");
    btn.hidden = !handle;
    if (handle) {
      title.textContent = "We're on YouTube";
      sub.textContent = "Tap below to watch the stream in the YouTube app or website.";
      btn.href = watchUrl(source);
    } else if (p === "before") {
      title.textContent = "We'll be live soon";
      sub.textContent = `The video appears right here at ${startTime}, ${C.timeZoneName}. No need to refresh.`;
    } else if (p === "soon" || p === "live") {
      title.textContent = "Starting any moment";
      sub.textContent = "Stay on this page. The video will appear here by itself.";
    } else {
      title.textContent = "Thank you for watching";
      sub.textContent = `With love, ${C.couple}`;
    }
  }

  /* ---------- stream.json: checked on a timer so open pages switch over by themselves ---------- */
  const params = new URLSearchParams(location.search);
  const override = params.get("v") || params.get("youtube") || params.get("live");

  function applyStream(data) {
    const next = parseYouTube(data.youtube);
    const key = next ? next.kind + ":" + next.id : "";
    const notice = String(data.notice || "").trim();
    const n = $("#notice");
    n.textContent = notice; n.hidden = !notice;
    if (key !== sourceKey) {
      const first = sourceKey === null;
      source = next; sourceKey = key;
      renderScreen();
      if (!first && next) toast("The live stream is here");
    }
  }

  let checking = false;
  async function checkStream() {
    if (checking) return;
    checking = true;
    try {
      const r = await fetch(`stream.json?t=${Date.now()}`, { cache: "no-store" });
      if (!r.ok) throw new Error(r.status);
      const data = await r.json();
      if (override) data.youtube = override;
      applyStream(data);
    } catch (e) {
      if (sourceKey === null) applyStream({ youtube: override || "" });
    } finally { checking = false; }
  }
  checkStream();
  setInterval(() => { if (!document.hidden) checkStream(); }, Math.max(10, C.streamCheckEvery || 30) * 1000);

  /* ---------- Countdown ---------- */
  const setNum = (el, v) => {
    if (el.textContent === v) return;
    el.textContent = v;
    el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump");
  };
  function tick() {
    const p = phase();
    if (p !== lastPhase) { lastPhase = p; paintStatus(); $("#countSec").hidden = p === "live" || p === "after"; }
    let ms = startD - Date.now();
    if (ms <= 0) return;
    const d = Math.floor(ms / 864e5); ms -= d * 864e5;
    const h = Math.floor(ms / 36e5); ms -= h * 36e5;
    const m = Math.floor(ms / 6e4); ms -= m * 6e4;
    const s = Math.floor(ms / 1e3);
    setNum($("#cdD"), String(d)); setNum($("#cdH"), String(h).padStart(2, "0"));
    setNum($("#cdM"), String(m).padStart(2, "0")); setNum($("#cdS"), String(s).padStart(2, "0"));
  }
  tick(); setInterval(tick, 1000);

  /* For family abroad: the start time in their own time zone */
  (() => {
    let tz;
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return; }
    if (!tz) return;
    const theirs = fmtDay(startD, tz) + " " + fmtTime(startD, tz);
    if (theirs === fmtDay(startD, C.timeZone) + " " + startTime) return;
    const place = tz.split("/").pop().replace(/_/g, " ");
    const el = $("#localTime");
    el.textContent = `That's ${fmtTime(startD, tz)} on ${fmtDay(startD, tz)} where you are (${place}).`;
    el.hidden = false;
  })();

  /* ---------- Calendar reminders to watch ---------- */
  const utc = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const calTitle = `Watch live: ${C.couple}'s ${C.occasion.toLowerCase()}`;
  const calDetails = `Watch the ${C.occasion.toLowerCase()} of ${C.couple} live from ${C.venue}.\n\n${pageUrl()}`;
  $("#gcal").href = "https://calendar.google.com/calendar/render?" + new URLSearchParams({ action: "TEMPLATE", text: calTitle, details: calDetails, location: pageUrl(), ctz: C.timeZone }) + `&dates=${utc(startD)}/${utc(endD)}`;
  $("#ocal").href = "https://outlook.live.com/calendar/0/deeplink/compose?" + new URLSearchParams({ path: "/calendar/action/compose", rru: "addevent", subject: calTitle, startdt: startD.toISOString(), enddt: endD.toISOString(), body: calDetails, location: pageUrl() });

  /* ---------- Share ---------- */
  $("#shareBtn").addEventListener("click", async () => {
    const data = { title: `Watch live · ${C.couple}`, text: `Watch ${C.couple}'s ${C.occasion.toLowerCase()} live, from ${startTime} ${C.timeZoneName} on ${fmtDay(startD, C.timeZone)}.`, url: pageUrl() };
    if (navigator.share) {
      try { await navigator.share(data); return; } catch (e) { if (e && e.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(data.url); toast("Link copied"); }
    catch (e) { window.open(`https://wa.me/?text=${encodeURIComponent(data.text + "\n" + data.url)}`, "_blank", "noopener"); }
  });

  /* ---------- Lights off ---------- */
  const lightsBtn = $("#lightsBtn");
  const setLights = (off) => {
    document.body.classList.toggle("lights-off", off);
    lightsBtn.setAttribute("aria-pressed", off ? "true" : "false");
    lightsBtn.setAttribute("aria-label", off ? "Turn the lights back on" : "Dim the lights");
    if (off) $("#watch").scrollIntoView({ behavior: "smooth", block: "center" });
  };
  lightsBtn.addEventListener("click", () => setLights(!document.body.classList.contains("lights-off")));
  $("#lights").addEventListener("click", () => setLights(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && document.body.classList.contains("lights-off")) setLights(false); });

  /* Phones turned sideways jump to the video */
  const sideways = window.matchMedia("(orientation: landscape) and (max-height: 540px)");
  const onTurn = () => { if (sideways.matches && source) $("#watch").scrollIntoView({ behavior: "smooth", block: "start" }); };
  if (sideways.addEventListener) sideways.addEventListener("change", onTurn); else if (sideways.addListener) sideways.addListener(onTurn);

  /* ---------- Wishes on WhatsApp ---------- */
  const validPhone = (p) => /^\d{10,15}$/.test(p || "");
  try {
    const prev = JSON.parse(store.get("wish") || "null");
    if (prev && prev.name) $("#wName").value = prev.name;
  } catch (e) {}
  $("#wishForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#wName").value.trim(), msg = $("#wMsg").value.trim();
    if (!name || !msg) { $("#wErr").hidden = false; (name ? $("#wMsg") : $("#wName")).focus(); return; }
    $("#wErr").hidden = true;
    const side = document.querySelector('input[name="to"]:checked').value;
    const to = C.contacts.find((c) => c.side === side && validPhone(c.phone)) || C.contacts.find((c) => validPhone(c.phone));
    if (!to) { toast("Numbers are being added. Please try again soon."); return; }
    const text = [`Blessings for ${C.couple} 🤍`, ``, msg, ``, `— ${name}`, `(sent while watching the live stream)`].join("\n");
    store.set("wish", JSON.stringify({ name }));
    window.open(`https://wa.me/${to.phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    $("#wDone").hidden = false;
  });

  /* ---------- Live photos from the Engagement Gallery album ---------- */
  const album = (C.galleryUrl || "").replace(/\/?$/, "/");
  $("#albumLink").href = album + "#/gallery";
  const shots = $("#shots"), shown = new Map();
  const thumb = (path) => `${C.supabaseUrl}/storage/v1/object/public/${C.bucket}/${path.split("/").map(encodeURIComponent).join("/")}`;
  async function loadPhotos() {
    if (!C.supabaseUrl || !C.supabaseAnonKey) return;
    try {
      const r = await fetch(`${C.supabaseUrl}/rest/v1/photos?select=id,thumb_path,guest_name&order=created_at.desc&limit=12`, {
        headers: { apikey: C.supabaseAnonKey, Authorization: `Bearer ${C.supabaseAnonKey}`, Prefer: "count=exact" },
        cache: "no-store"
      });
      if (!r.ok) return;
      const rows = await r.json();
      const total = parseInt((r.headers.get("content-range") || "").split("/")[1], 10);
      const first = shown.size === 0;
      const keep = new Set(rows.map((p) => p.id));
      shown.forEach((el, id) => { if (!keep.has(id)) { el.remove(); shown.delete(id); } });
      rows.slice().reverse().forEach((p, i) => {
        if (shown.has(p.id) || !/^thumb\/[\w-]+\.jpg$/.test(p.thumb_path || "")) return;
        const a = document.createElement("a");
        a.className = "shot" + (first ? "" : " new");
        a.href = album + "#/gallery"; a.target = "_blank"; a.rel = "noopener";
        a.style.setProperty("--tilt", (((p.id.charCodeAt(0) + i) % 5) - 2) * 1.1 + "deg");
        const img = document.createElement("img");
        img.src = thumb(p.thumb_path); img.loading = "lazy"; img.decoding = "async";
        img.alt = p.guest_name ? `Photo by ${p.guest_name}` : "A guest's photo";
        const cap = document.createElement("span");
        cap.textContent = p.guest_name || "A guest";
        a.append(img, cap);
        shots.prepend(a); shown.set(p.id, a);
      });
      $("#shotsEmpty").hidden = shown.size > 0;
      const count = $("#shotsCount");
      if (total > 0) { count.textContent = total === 1 ? "1 photo so far" : `${total} photos so far`; count.hidden = false; }
      else count.hidden = true;
    } catch (e) { /* offline or blocked: the album link still works */ }
  }
  loadPhotos();
  setInterval(() => { if (!document.hidden) loadPhotos(); }, Math.max(10, C.photoCheckEvery || 20) * 1000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { checkStream(); loadPhotos(); } });

  /* ---------- Venue ---------- */
  $("#dirLink").href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(C.mapsQuery)}`;
  $("#inviteLink").href = C.invitationUrl;

  /* ---------- Sections drift up into place the first time they come into view ---------- */
  (() => {
    const blocks = [];
    document.querySelectorAll(".count, .sec, .foot").forEach((sec) => {
      [...sec.children].forEach((el, i) => { el.classList.add("reveal"); el.style.transitionDelay = Math.min(i, 5) * 80 + "ms"; blocks.push(el); });
    });
    if (!("IntersectionObserver" in window)) { blocks.forEach((el) => el.classList.add("in")); return; }
    const ro = new IntersectionObserver((es) => es.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); }
    }), { rootMargin: "0px 0px -6% 0px", threshold: .06 });
    blocks.forEach((el) => ro.observe(el));
    setTimeout(() => blocks.forEach((el) => el.classList.add("in")), 4000);
  })();

  /* ---------- A few eucalyptus leaves drifting behind the page ---------- */
  (() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const leafSvg = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5c-7 0-12.5 3-14.8 7.8-1.6 3.3-1 6.8.4 8.9l1.5-1.5c-.6-1.3-.9-2.9-.4-4.6 1.4 1 3.4 1.5 5.4 1.1 4.9-.9 8-5.7 7.9-11.7ZM5.2 21.4 3.8 20l5.4-5.4c1.3-1.3 3-2.6 4.8-3.5-1.4 1.2-2.8 2.5-4 3.7l-4.8 6.6Z"/></svg>';
    const layer = $("#leaves");
    [
      { left: "6%", size: 15, dur: 23, delay: 0 }, { left: "24%", size: 11, dur: 29, delay: 5 },
      { left: "45%", size: 17, dur: 26, delay: 11 }, { left: "62%", size: 12, dur: 32, delay: 3 },
      { left: "79%", size: 15, dur: 25, delay: 16 }, { left: "92%", size: 10, dur: 30, delay: 8 }
    ].forEach((l) => {
      const el = document.createElement("span");
      el.className = "leaf";
      el.style.cssText = `left:${l.left};width:${l.size}px;height:${l.size}px;animation-duration:${l.dur}s;animation-delay:-${l.delay}s`;
      el.innerHTML = leafSvg;
      layer.appendChild(el);
    });
  })();

  /* ---------- Active section in the bottom bar ---------- */
  const links = [...document.querySelectorAll(".dock a")];
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (en.isIntersecting) links.forEach((l) => l.classList.toggle("on", l.dataset.sec === en.target.id));
    }), { rootMargin: "-45% 0px -50% 0px" });
    ["watch", "wishes", "photos", "venue"].forEach((id) => io.observe(document.getElementById(id)));
  }
})();
