function el(tag, attrs={}, children=[]) {
  const n = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  for (const c of children) n.append(c);
  return n;
}

function initChineseBrandName(){
  const variants = [
    {
      text:"张家维",
      lang:"zh-Hans",
      fontStyles:[
        {className:"brand-name-zh--sans"},
        {className:"brand-name-zh--song"},
        {className:"brand-name-zh--kai"},
        {className:"brand-name-zh--fangsong"},
        {className:"brand-name-zh--caoshu", family:"Liu Jian Mao Cao"},
        {className:"brand-name-zh--xingkai", family:"Ma Shan Zheng"},
        {className:"brand-name-zh--xingshu", family:"Zhi Mang Xing"},
        {className:"brand-name-zh--handwritten", family:"Long Cang"}
      ]
    },
    {
      text:"張家維",
      lang:"zh-Hant",
      fontStyles:[
        {className:"brand-name-zh--noto-sans-tc", family:"Noto Sans TC"},
        {className:"brand-name-zh--noto-serif-tc", family:"Noto Serif TC"},
        {className:"brand-name-zh--huninn", family:"Huninn"},
        {className:"brand-name-zh--goround-tc", family:"Chiron GoRound TC"},
        {className:"brand-name-zh--bpmf-kai", family:"Bpmf Zihi Kai Std"},
        {className:"brand-name-zh--marker-gothic", family:"LXGW Marker Gothic"},
        {className:"brand-name-zh--jason-xingkai"},
        {className:"brand-name-zh--iansui", family:"Iansui"},
        {className:"brand-name-zh--wenkai-tc", family:"LXGW WenKai TC"}
      ]
    }
  ];
  const choose = options => options[Math.floor(Math.random() * options.length)];
  const brandLinks = Array.from(document.querySelectorAll(".brand .site-title a")).filter(brandLink=>
    brandLink.textContent.trim() === "Jia Wei Zhang" && !brandLink.querySelector(".brand-name-zh")
  );
  if (!brandLinks.length) return;

  const variant = choose(variants);
  const fontStyle = choose(variant.fontStyles);
  if (fontStyle.family){
    const fontKey = `${variant.lang}-${fontStyle.className}`;
    if (!document.querySelector(`link[data-brand-font="${fontKey}"]`)){
      const stylesheet = new URL("https://fonts.googleapis.com/css2");
      stylesheet.searchParams.set("family", fontStyle.family);
      stylesheet.searchParams.set("text", variant.text);
      stylesheet.searchParams.set("display", "swap");
      document.head.append(el("link", {
        rel:"stylesheet",
        href:stylesheet.toString(),
        "data-brand-font":fontKey
      }));
    }
  }

  brandLinks.forEach(brandLink=>{
    brandLink.append(el("span", {
      class:`brand-name-zh ${fontStyle.className}`,
      lang:variant.lang
    }, [variant.text]));
  });
}

function initNamePronunciations(){
  const pronunciations = Array.from(document.querySelectorAll("[data-pronunciation]"));
  if (!pronunciations.length) return;

  const players = pronunciations.map(pronunciation=>({
    button:pronunciation.querySelector("[data-pronunciation-play]"),
    audio:pronunciation.querySelector("[data-pronunciation-audio]"),
    action:pronunciation.querySelector("[data-pronunciation-action]"),
    status:pronunciation.querySelector("[data-pronunciation-status]")
  })).filter(player=>player.button && player.audio);
  let requestedPlayer = null;
  let playRequest = 0;

  const setPlaying = (player, isPlaying)=>{
    player.button.classList.toggle("is-playing", isPlaying);
    if (player.action) player.action.textContent = isPlaying ? "Playing…" : "Play";
  };

  const announce = (player, message)=>{
    if (player.status) player.status.textContent = message;
  };

  const stopOthers = activePlayer=>{
    players.forEach(player=>{
      if (player === activePlayer) return;
      player.audio.pause();
      player.audio.currentTime = 0;
      setPlaying(player, false);
    });
  };

  players.forEach(player=>{
    player.button.addEventListener("click", async ()=>{
      const requestId = ++playRequest;
      requestedPlayer = player;
      stopOthers(player);
      player.audio.pause();
      player.audio.currentTime = 0;
      try {
        await player.audio.play();
      } catch (error) {
        if (requestId !== playRequest || error?.name === "AbortError") return;
        requestedPlayer = null;
        setPlaying(player, false);
        announce(player, "The pronunciation audio could not be played.");
      }
    });

    player.audio.addEventListener("play", ()=>{
      if (requestedPlayer !== player){
        player.audio.pause();
        player.audio.currentTime = 0;
        setPlaying(player, false);
        return;
      }
      stopOthers(player);
      setPlaying(player, true);
      const label = player.button.getAttribute("aria-label") || "Play pronunciation";
      announce(player, label.replace(/^Play\b/, "Playing") + ".");
    });

    player.audio.addEventListener("pause", ()=>setPlaying(player, false));
    player.audio.addEventListener("ended", ()=>{
      if (requestedPlayer === player) requestedPlayer = null;
      setPlaying(player, false);
      announce(player, "Pronunciation finished.");
    });
    player.audio.addEventListener("error", ()=>{
      if (requestedPlayer === player){
        requestedPlayer = null;
        playRequest += 1;
      }
      setPlaying(player, false);
      player.button.disabled = true;
      player.button.setAttribute("aria-label", "Pronunciation audio unavailable");
      if (player.action) player.action.textContent = "Unavailable";
      announce(player, "The pronunciation audio is unavailable.");
    });
  });

  window.addEventListener("pagehide", ()=>{
    requestedPlayer = null;
    playRequest += 1;
    players.forEach(player=>player.audio.pause());
  });
}

function renderPub(p, headingTag="h3"){
  const meta = el("div",{class:"meta"},[]);
  if (p.authors && p.authors.length){
  p.authors.forEach((a, i) => {
    if (i > 0) meta.append(document.createTextNode(", "));
    if (a.url){
      meta.append(el("a", { href: a.url, target: "_blank", rel: "noopener" }, [a.name]));
    } else {
      meta.append(document.createTextNode(a.name));
    }
  });
}

  if (p.status){
    meta.append(document.createTextNode(" · "));
    meta.append(el("span",{class:"badge"},[p.status]));
  }
  if (p.venue){ meta.append(document.createTextNode(" · " + p.venue)); }
  if (p.year){ meta.append(document.createTextNode(" · " + String(p.year))); }

  const links = [];
  const map = {ssrn:"SSRN", pdf:"PDF", appendix:"Appendix", slides:"Slides", code:"Code", data:"Data"};
  for (const k of Object.keys(map)){
    if (p.links && p.links[k]){
      links.push(el("a",{href:p.links[k], target:"_blank", rel:"noopener"},[map[k]]));
    }
  }

  return el("article",{class:"pub"},[
    el(headingTag,{class:"title"},[p.title]),
    meta,
    ...((p.topics||[]).length ? [el("div",{class:"topics"},[`Topics: ${p.topics.join(", ")}`])] : []),
    ...(p.takeaway ? [el("div",{class:"takeaway"},[p.takeaway])] : []),
    ...(links.length ? [el("div",{class:"links"},links)] : [])
  ]);
}

async function loadPubs(){
  const res = await fetch("/assets/js/pubs.json");
  if (!res.ok) throw new Error(`Could not load publications (${res.status})`);
  return await res.json();
}

function applyFilters(pubs, q, status){
  const qq = (q||"").trim().toLowerCase();
  return pubs.filter(p=>{
    const hay = [
      p.title,
      (p.authors||[]).map(a=>a.name).join(" "),
      p.venue||"",
      (p.topics||[]).join(" "),
      (p.tags||[]).join(" "),
      p.status||""
    ].join(" ").toLowerCase();
    const okQ = !qq || hay.includes(qq);
    const okS = !status || status==="All" || (p.status===status);
    return okQ && okS;
  });
}

async function initPubsPage(){
  const container = document.getElementById("pub-list");
  if (!container) return;

  let pubs;
  try {
    pubs = await loadPubs();
  } catch (error) {
    return;
  }
  const statuses = ["All", ...Array.from(new Set(pubs.map(p=>p.status).filter(Boolean)))];

  const qInput = document.getElementById("q");
  const sSelect = document.getElementById("status");

  sSelect.innerHTML = "";
  for (const s of statuses){
    sSelect.append(el("option",{value:s},[s]));
  }

  function rerender(){
    const filtered = applyFilters(pubs, qInput.value, sSelect.value);
    container.innerHTML = "";
    for (const p of filtered){
      container.append(renderPub(p, "h2"));
    }
    const c = document.getElementById("count");
    if (c) c.textContent = String(filtered.length);
  }

  qInput.addEventListener("input", rerender);
  sSelect.addEventListener("change", rerender);
  rerender();
}

async function initHomePubs(){
  const container = document.getElementById("home-pub-list");
  if (!container) return;

  let pubs;
  try {
    pubs = await loadPubs();
  } catch (error) {
    return;
  }
  container.replaceChildren();
  for (const p of pubs.filter(p=>p.showOnHome)){
    container.append(renderPub(p, "h3"));
  }
}

document.addEventListener("DOMContentLoaded", ()=>{
  initChineseBrandName();
  initNamePronunciations();
  const normalizePath = value=>value.replace(/\/+$/,"") || "/";
  const path = normalizePath(location.pathname);
  document.querySelectorAll("nav a").forEach(a=>{
    const href = normalizePath(a.getAttribute("href"));
    const isActive = href==="/" ? path==="/" : path===href || path.startsWith(`${href}/`);
    if (isActive){
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });
  initPubsPage();
  initHomePubs();
});
