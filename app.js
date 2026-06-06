// XRAG '26 — content renderer
// Loads data.json and injects content into the DOM.
// Edit data.json (no JS changes needed) to update the site.

(function () {
  "use strict";

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function getPath(obj, path) {
    return path.split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function applyBindings(data) {
    $$("[data-bind]").forEach(el => {
      const val = getPath(data, el.getAttribute("data-bind"));
      if (val != null && val !== "") el.textContent = val;
    });

    $$("[data-bind-attr]").forEach(el => {
      const spec = el.getAttribute("data-bind-attr");
      spec.split(",").forEach(pair => {
        const [attr, path] = pair.split(":").map(s => s.trim());
        const val = getPath(data, path);
        if (val != null && val !== "") el.setAttribute(attr, val);
        else if (attr === "src") el.removeAttribute("src");
      });
    });
  }

  // ---- Renderers (all emit Bootstrap-friendly HTML) ----

  function renderNav(data) {
    const host = $("[data-slot='nav']");
    if (!host || !data.nav) return;
    host.innerHTML = data.nav.map(item =>
      `<li class="nav-item"><a class="nav-link" href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`
    ).join("");
  }

  function renderSnapshot(data) {
    const host = $("[data-slot='snapshot']");
    if (!host) return;
    const w = data.workshop || {};
    const chips = [
      w.venue    && `<b>Venue</b>${escapeHtml(w.venue)}`,
      w.location && `<b>Where</b>${escapeHtml(w.location)}`,
      w.date     && `<b>When</b>${escapeHtml(w.date)}`,
      w.format   && `<b>Format</b>${escapeHtml(w.format)}`
    ].filter(Boolean);
    host.innerHTML = chips.map(c => `<span>${c}</span>`).join("");
  }

  function renderHeroActions(data) {
    const host = $("[data-slot='heroActions']");
    if (!host || !data.hero || !data.hero.ctas) return;
    host.innerHTML = data.hero.ctas.map(cta =>
      `<a class="btn-xrag ${escapeHtml(cta.style || "primary")}" href="${escapeHtml(cta.href)}">${escapeHtml(cta.label)}</a>`
    ).join("");
  }

  function renderAbout(data) {
    const paras = $("[data-slot='aboutParagraphs']");
    if (paras && data.about && data.about.paragraphs) {
      paras.innerHTML = data.about.paragraphs
        .map(p => `<p>${escapeHtml(p)}</p>`).join("");
    }

    const pillars = $("[data-slot='pillars']");
    if (pillars && data.about && data.about.pillars) {
      pillars.innerHTML = data.about.pillars.map(p => `
        <div class="col-md-6 col-lg-4">
          <article class="pillar">
            <span class="num">Area ${escapeHtml(p.number || "")}</span>
            <h3>${escapeHtml(p.title)}</h3>
            <p>${escapeHtml(p.text)}</p>
          </article>
        </div>`).join("");
    }
  }

  function renderTopics(data) {
    const host = $("[data-slot='topics']");
    if (!host || !data.topics || !data.topics.items) return;
    host.innerHTML = data.topics.items.map(t => `<li>${escapeHtml(t)};</li>`).join("");
  }

  function renderCfp(data) {
    const host = $("[data-slot='cfpCategories']");
    if (!host || !data.callForPapers || !data.callForPapers.categories) return;
    host.innerHTML = data.callForPapers.categories.map(c =>
      `<li><b>${escapeHtml(c.title)}</b> — ${escapeHtml(c.text)}</li>`
    ).join("");
  }

  function renderDates(data) {
    const host = $("[data-slot='dates']");
    if (!host || !data.importantDates || !data.importantDates.items) return;
    host.innerHTML = data.importantDates.items.map(d => `
      <article>
        <time>${escapeHtml(d.date)}</time>
        <div>
          <h3>${escapeHtml(d.title)}</h3>
          <p>${escapeHtml(d.text || "")}</p>
        </div>
      </article>`).join("");
  }

  function renderSubmission(data) {
    const sub = data.submission || {};

    const notesEl = $("[data-slot='submissionNotes']");
    if (notesEl) {
      notesEl.innerHTML = (sub.notes || []).map(n => `<li>${escapeHtml(n)}</li>`).join("");
    }

    const linkEl = $("[data-slot='submissionLink']");
    if (linkEl) {
      linkEl.innerHTML = sub.url
        ? `<a class="submission-cta" href="${escapeHtml(sub.url)}" target="_blank" rel="noopener">Open submission portal →</a>`
        : "";
    }

    const tplEl = $("[data-slot='submissionTemplates']");
    if (tplEl) {
      tplEl.innerHTML = (sub.templates || []).map(t =>
        `<li><a href="${escapeHtml(t.href)}" target="_blank" rel="noopener">${escapeHtml(t.label)}</a></li>`
      ).join("");
    }
  }

  function renderProgram(data) {
    const host = $("[data-slot='program']");
    if (!host || !data.program || !data.program.items) return;
    host.innerHTML = data.program.items.map(it => `
      <article>
        <time>${escapeHtml(it.time)}</time>
        <div>
          <h3>${escapeHtml(it.title)}</h3>
          <p>${escapeHtml(it.text || "")}</p>
        </div>
      </article>`).join("");
  }

  function renderPeople(slot, members) {
    const host = $(`[data-slot='${slot}']`);
    if (!host) return;
    if (!members || !members.length) {
      host.innerHTML = `<div class="col-12 text-center text-muted-ink">To be announced.</div>`;
      return;
    }
    host.innerHTML = members.map(m => {
      // URL-encode each path segment so spaces / accents work everywhere
      const safeImage = m.image
        ? m.image.split("/").map(encodeURIComponent).join("/")
        : "";
      const img = safeImage
        ? `<img src="${escapeHtml(safeImage)}" alt="${escapeHtml(m.name)}" onerror="this.style.display='none'">`
        : "";
      const link = m.website
        ? `<a href="${escapeHtml(m.website)}" target="_blank" rel="noopener">${escapeHtml(m.website)}</a>`
        : (m.email ? `<a href="mailto:${escapeHtml(m.email)}">${escapeHtml(m.email)}</a>` : "");
      const role = m.role
        ? `<span class="person-role">${escapeHtml(m.role)}</span>`
        : "";
      return `
        <div class="col-6 col-md-4 col-lg-3">
          <article class="person">
            ${img}
            <div class="body">
              ${role}
              <h3>${escapeHtml(m.name)}</h3>
              <p class="aff">${escapeHtml(m.affiliation || "")}</p>
              ${link}
            </div>
          </article>
        </div>`;
    }).join("");
  }

  function renderCommittee(data) {
    const host = $("[data-slot='committee']");
    if (!host) return;
    const members = (data.committee && data.committee.members) || [];
    if (!members.length) { host.innerHTML = ""; return; }
    host.innerHTML = members.map(m =>
      `<li class="col-md-6"><b>${escapeHtml(m.name)}</b> — ${escapeHtml(m.affiliation || "")}</li>`
    ).join("");
  }

  function renderSponsors(data) {
    const host = $("[data-slot='sponsors']");
    if (!host || !data.sponsors || !data.sponsors.items) return;
    host.innerHTML = data.sponsors.items.map(s => {
      // URL-encode each path segment so "università", spaces, accents, etc. work everywhere
      const safeLogo = s.logo
        ? s.logo.split("/").map(encodeURIComponent).join("/")
        : "";
      const inner = safeLogo
        ? `<img src="${escapeHtml(safeLogo)}" alt="${escapeHtml(s.name)}" loading="lazy">
           <span class="sponsor-name">${escapeHtml(s.name)}</span>`
        : `<span class="sponsor-name sponsor-name-only">${escapeHtml(s.name)}</span>`;
      const cellClass = "sponsor-tile" + (safeLogo ? "" : " no-logo");
      return s.url
        ? `<a class="${cellClass}" href="${escapeHtml(s.url)}" target="_blank" rel="noopener" title="${escapeHtml(s.name)}">${inner}</a>`
        : `<div class="${cellClass}" title="${escapeHtml(s.name)}">${inner}</div>`;
    }).join("");
  }

  function renderContact(data) {
    const c = data.contact || {};
    if (c.email) {
      const el = $("[data-bind-attr*='contact.emailHref']");
      if (el) el.setAttribute(
        "href",
        `mailto:${c.email}?subject=${encodeURIComponent((data.workshop && data.workshop.shortName) || "Workshop")}`
      );
    }
  }

  function renderFooter(data) {
    const host = $("[data-slot='footerLinks']");
    if (!host || !data.footer || !data.footer.links) return;
    host.innerHTML = data.footer.links.map(l =>
      `<a href="${escapeHtml(l.href)}" target="_blank" rel="noopener">${escapeHtml(l.label)}</a>`
    ).join("");
  }

  // ---- Nav behavior ----

  function setupMobileNavAutoClose() {
    const collapseEl = document.getElementById("siteNav");
    if (!collapseEl || !window.bootstrap) return;
    collapseEl.querySelectorAll("a.nav-link").forEach(a => {
      a.addEventListener("click", () => {
        if (collapseEl.classList.contains("show")) {
          bootstrap.Collapse.getOrCreateInstance(collapseEl).hide();
        }
      });
    });
  }

  function setupScrollSpy() {
    const links = $$(".navbar-nav .nav-link");
    if (!links.length) return;
    const sections = links
      .map(a => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = "#" + entry.target.id;
          links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === id));
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(s => observer.observe(s));
  }

  // ---- Boot ----

  function applyHeroBackground(data) {
    const heroBg = document.querySelector(".hero-bg");
    const url = data && data.workshop && data.workshop.bannerImage;
    if (!heroBg) return;
    if (!url) { heroBg.style.display = "none"; return; }
    // URL-encode the segments so spaces/accents are handled.
    const safeUrl = url.split("/").map(encodeURIComponent).join("/");
    heroBg.style.backgroundImage = `url("${safeUrl}")`;
    // Verify the image loads — if missing, hide the element entirely
    // so it doesn't reserve aspect-ratio space on mobile.
    const probe = new Image();
    probe.onerror = () => { heroBg.style.display = "none"; };
    probe.src = safeUrl;
  }

  function render(data) {
    if (data.workshop) {
      document.title = `${data.workshop.shortName} — ${data.workshop.subtitle} (${data.workshop.venue})`;
    }
    applyBindings(data);
    applyHeroBackground(data);
    renderNav(data);
    renderSnapshot(data);
    renderHeroActions(data);
    renderAbout(data);
    renderTopics(data);
    renderCfp(data);
    renderDates(data);
    renderSubmission(data);
    renderProgram(data);
    renderPeople("organizers", data.organizers && data.organizers.members);
    renderCommittee(data);
    renderSponsors(data);
    renderContact(data);
    renderFooter(data);
    setupMobileNavAutoClose();
    setupScrollSpy();
  }

  fetch("data.json", { cache: "no-store" })
    .then(r => {
      if (!r.ok) throw new Error(`Failed to load data.json (${r.status})`);
      return r.json();
    })
    .then(render)
    .catch(err => {
      console.error(err);
      const banner = document.createElement("div");
      banner.style.cssText = "padding:14px 22px;background:#e55b4a;color:#fff;text-align:center;font-weight:700;";
      banner.textContent = "Could not load data.json — if you opened index.html directly via file://, serve the folder with a local web server (see README).";
      document.body.prepend(banner);
    });
})();
