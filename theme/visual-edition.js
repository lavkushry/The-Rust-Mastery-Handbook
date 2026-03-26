(() => {
  const conceptMap = [
    { key: "ownership", color: "var(--ownership)", match: /ownership|move|drop|resource/i },
    { key: "borrowing", color: "var(--borrow-shared)", match: /borrow|reference|slice/i },
    { key: "mutability", color: "var(--borrow-exclusive)", match: /mutable|mutability|aliasing/i },
    { key: "lifetimes", color: "var(--lifetime)", match: /lifetime|'static/i },
    { key: "memory", color: "var(--stack)", match: /stack|heap|memory|layout/i },
    { key: "compiler", color: "var(--compiler)", match: /compiler|borrow checker|rustc|error/i },
    { key: "async", color: "var(--async)", match: /async|future|tokio|thread|send|sync|pin/i },
    { key: "traits", color: "var(--trait)", match: /trait|generic|macro|abstraction|api design/i },
    { key: "unsafe", color: "var(--unsafe)", match: /unsafe|ffi|raw pointer/i },
    { key: "performance", color: "var(--perf)", match: /iterator|performance|zero-cost|profil/i },
  ];

  const calloutMap = [
    { key: "design insight", className: "callout--design-insight", icon: "💡" },
    { key: "expert tip", className: "callout--expert-tip", icon: "⭐" },
    { key: "common mistake", className: "callout--common-mistake", icon: "⚠️" },
    { key: "compiler says", className: "callout--compiler-says", icon: "🦀" },
    { key: "memory model", className: "callout--memory-model", icon: "🧠" },
    { key: "zero cost proof", className: "callout--zero-cost", icon: "⚡" },
  ];

  function pickConcept(text) {
    const match = conceptMap.find((entry) => entry.match.test(text));
    return match ?? { key: "compiler", color: "var(--compiler)" };
  }

  function getHeroTemplate(isPart, eyebrow, title, shortHook, pillLabel, conceptKey, accent) {
    return `
      <div class="${isPart ? "part-spread__grid" : "chapter-hero__grid"}">
        <div>
          <div class="${isPart ? "part-spread__eyebrow" : "chapter-hero__eyebrow"}">${eyebrow}</div>
          <h1 class="${isPart ? "part-spread__title" : "chapter-hero__title"}">${title}</h1>
          <p class="${isPart ? "part-spread__hook" : "chapter-hero__hook"}">${shortHook}</p>
          <div class="${isPart ? "part-spread__meta" : "chapter-hero__meta"}">
            <span class="${isPart ? "part-spread__pill" : "chapter-hero__pill"}">${pillLabel}</span>
            <span class="${isPart ? "part-spread__pill" : "chapter-hero__pill"}">${conceptKey}</span>
          </div>
        </div>
        <div aria-hidden="true">
          <svg class="svg-frame" viewBox="0 0 520 360" role="img" aria-label="Concept signature illustration">
            <defs>
              <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="rgba(255,255,255,0.18)"></stop>
                <stop offset="100%" stop-color="rgba(255,255,255,0.02)"></stop>
              </linearGradient>
            </defs>
            <rect x="24" y="24" width="472" height="312" rx="28" fill="url(#heroGradient)" stroke="rgba(255,255,255,0.18)"></rect>
            <circle cx="124" cy="120" r="46" fill="rgba(255,255,255,0.14)"></circle>
            <circle cx="124" cy="120" r="20" fill="${accent}"></circle>
            <rect x="188" y="82" width="240" height="18" rx="9" fill="rgba(255,255,255,0.14)"></rect>
            <rect x="188" y="116" width="176" height="14" rx="7" fill="rgba(255,255,255,0.12)"></rect>
            <path d="M120 174 L202 230 L312 160 L404 238" stroke="${accent}" stroke-width="6" fill="none" stroke-linecap="round"></path>
            <circle cx="202" cy="230" r="12" fill="${accent}"></circle>
            <circle cx="312" cy="160" r="12" fill="#ffffff"></circle>
            <circle cx="404" cy="238" r="12" fill="${accent}"></circle>
            <rect x="84" y="260" width="124" height="34" rx="17" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.14)"></rect>
            <rect x="224" y="260" width="204" height="34" rx="17" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.14)"></rect>
          </svg>
        </div>
      </div>
    `;
  }

  function createHero(main, title, accent, conceptKey) {
    if (!title || main.querySelector(".chapter-hero, .part-spread")) {
      return;
    }

    const intro = Array.from(main.children).find(
      (node) => node.tagName === "P" && node.textContent.trim().length > 60,
    );
    const isPart = /^PART\s+\d+/i.test(title);
    const hero = document.createElement("section");
    hero.className = isPart ? "part-spread" : "chapter-hero";
    hero.style.setProperty("--chapter-accent", accent);

    const eyebrow = isPart ? "Visual Part Opener" : "Visual Edition";
    const pillLabel = isPart ? "Part System Map" : "Concept Signature";
    const hook = intro?.textContent?.trim() ?? "";
    const shortHook = hook.length > 280 ? `${hook.slice(0, 277)}...` : hook;

    hero.innerHTML = getHeroTemplate(isPart, eyebrow, title, shortHook, pillLabel, conceptKey, accent);

    const firstHeading = main.querySelector("h1");
    if (firstHeading) {
      firstHeading.insertAdjacentElement("afterend", hero);
    } else {
      main.prepend(hero);
    }
  }

  function upgradeCallouts(main) {
    main.querySelectorAll("blockquote").forEach((blockquote) => {
      const firstParagraph = blockquote.querySelector("p");
      if (!firstParagraph) {
        return;
      }

      const raw = firstParagraph.textContent.trim();
      const lower = raw.toLowerCase();
      const match = calloutMap.find((entry) => lower === entry.key || lower.startsWith(`${entry.key}\n`) || lower.startsWith(`${entry.key}:`));
      if (!match) {
        return;
      }

      blockquote.classList.add("callout", match.className);
      const label = document.createElement("div");
      label.className = "callout__label";
      label.textContent = `${match.icon} ${raw.replace(/:$/, "")}`;
      firstParagraph.replaceWith(label);
    });
  }

  function cardifyRememberOnlyThree(main) {
    const headings = Array.from(main.querySelectorAll("h2, h3"));
    headings.forEach((heading) => {
      if (!/if you remember only 3 things/i.test(heading.textContent || "")) {
        return;
      }

      const next = heading.nextElementSibling;
      if (!next || next.tagName !== "UL" || next.children.length !== 3) {
        return;
      }

      const grid = document.createElement("div");
      grid.className = "concept-card-row";

      Array.from(next.children).forEach((item, index) => {
        const card = document.createElement("article");
        card.className = "concept-card";
        card.innerHTML = `
          <div class="concept-card__num">${index + 1}</div>
          <p class="concept-card__text">${item.textContent.trim()}</p>
        `;
        grid.appendChild(card);
      });

      next.replaceWith(grid);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const main = document.querySelector("#mdbook-content main");
    if (!main) {
      return;
    }

    const title = main.querySelector("h1")?.textContent?.trim() ?? "";
    const concept = pickConcept(title);

    main.classList.add("visual-edition-page");
    main.dataset.concept = concept.key;
    main.style.setProperty("--chapter-accent", concept.color);

    upgradeCallouts(main);
    cardifyRememberOnlyThree(main);
    createHero(main, title, concept.color, concept.key);
  });
})();
