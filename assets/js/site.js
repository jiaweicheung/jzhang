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

function renderPub(p){
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
  const map = {pdf:"PDF", appendix:"Appendix", slides:"Slides", code:"Code", data:"Data"};
  for (const k of Object.keys(map)){
    if (p.links && p.links[k]) links.push(el("a",{href:p.links[k]},[map[k]]));
  }

  return el("div",{class:"pub"},[
    el("div",{class:"title"},[p.title]),
    meta,
    ...(p.takeaway ? [el("div",{class:"takeaway"},[p.takeaway])] : []),
    ...(links.length ? [el("div",{class:"links"},links)] : [])
  ]);
}

async function loadPubs(){
  const res = await fetch("/assets/js/pubs.json", {cache:"no-store"});
  return await res.json();
}

function applyFilters(pubs, q, status){
  const qq = (q||"").trim().toLowerCase();
  return pubs.filter(p=>{
    const hay = [
      p.title,
      (p.authors||[]).join(" "),
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

  const pubs = await loadPubs();
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
    for (const p of filtered.sort((a,b)=> (b.year||0)-(a.year||0))){
      container.append(renderPub(p));
    }
    const c = document.getElementById("count");
    if (c) c.textContent = String(filtered.length);
  }

  qInput.addEventListener("input", rerender);
  sSelect.addEventListener("change", rerender);
  rerender();
}

document.addEventListener("DOMContentLoaded", ()=>{
  const path = location.pathname.replace(/\/+$/,"");
  document.querySelectorAll("nav a").forEach(a=>{
    const href = a.getAttribute("href").replace(/\/+$/,"");
    if ((href==="/" && (path==="" || path==="/")) || (href!=="/" && path.startsWith(href))) a.classList.add("active");
  });
  initPubsPage();
});
