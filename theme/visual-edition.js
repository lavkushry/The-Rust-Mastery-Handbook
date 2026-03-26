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

    const gridDiv = document.createElement("div");
    gridDiv.className = isPart ? "part-spread__grid" : "chapter-hero__grid";

    const textDiv = document.createElement("div");

    const eyebrowDiv = document.createElement("div");
    eyebrowDiv.className = isPart ? "part-spread__eyebrow" : "chapter-hero__eyebrow";
    eyebrowDiv.textContent = eyebrow;

    const titleH1 = document.createElement("h1");
    titleH1.className = isPart ? "part-spread__title" : "chapter-hero__title";
    titleH1.textContent = title;

    const hookP = document.createElement("p");
    hookP.className = isPart ? "part-spread__hook" : "chapter-hero__hook";
    hookP.textContent = shortHook;

    const metaDiv = document.createElement("div");
    metaDiv.className = isPart ? "part-spread__meta" : "chapter-hero__meta";

    const pill1Span = document.createElement("span");
    pill1Span.className = isPart ? "part-spread__pill" : "chapter-hero__pill";
    pill1Span.textContent = pillLabel;

    const pill2Span = document.createElement("span");
    pill2Span.className = isPart ? "part-spread__pill" : "chapter-hero__pill";
    pill2Span.textContent = conceptKey;

    metaDiv.appendChild(pill1Span);
    metaDiv.appendChild(pill2Span);

    textDiv.appendChild(eyebrowDiv);
    textDiv.appendChild(titleH1);
    textDiv.appendChild(hookP);
    textDiv.appendChild(metaDiv);

    const artDiv = document.createElement("div");
    artDiv.setAttribute("aria-hidden", "true");
    artDiv.innerHTML = `
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
    `;

    gridDiv.appendChild(textDiv);
    gridDiv.appendChild(artDiv);

    hero.appendChild(gridDiv);

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

        const numDiv = document.createElement("div");
        numDiv.className = "concept-card__num";
        numDiv.textContent = index + 1;

        const textP = document.createElement("p");
        textP.className = "concept-card__text";
        textP.textContent = item.textContent.trim();

        card.appendChild(numDiv);
        card.appendChild(textP);

        grid.appendChild(card);
      });

      next.replaceWith(grid);
    });
  }

  function enhanceMemoryHooks(main) {
    const headings = Array.from(main.querySelectorAll("h2, h3"));
    headings.forEach((heading) => {
      if (!/memory hook/i.test(heading.textContent || "")) {
        return;
      }

      const next = heading.nextElementSibling;
      if (!next || next.tagName !== "P") {
        return;
      }

      const panel = document.createElement("section");
      panel.className = "memory-hook-panel";

      const artDiv = document.createElement("div");
      artDiv.className = "memory-hook-panel__art";
      artDiv.setAttribute("aria-hidden", "true");
      artDiv.innerHTML = `
        <svg class="svg-frame" viewBox="0 0 220 120" role="img" aria-label="Memory hook illustration">
          <rect x="10" y="10" width="200" height="100" rx="22" fill="color-mix(in srgb, var(--chapter-accent, var(--compiler)) 10%, white 90%)" stroke="color-mix(in srgb, var(--chapter-accent, var(--compiler)) 60%, white 40%)" stroke-width="3"></rect>
          <circle cx="60" cy="60" r="22" fill="var(--chapter-accent, var(--compiler))"></circle>
          <path d="M96 58 H 166" stroke="var(--chapter-accent, var(--compiler))" stroke-width="8" stroke-linecap="round"></path>
          <path d="M96 78 H 142" stroke="color-mix(in srgb, var(--chapter-accent, var(--compiler)) 55%, white 45%)" stroke-width="8" stroke-linecap="round"></path>
        </svg>
      `;

      const bodyDiv = document.createElement("div");
      bodyDiv.className = "memory-hook-panel__body";
      bodyDiv.appendChild(next.cloneNode(true));

      panel.appendChild(artDiv);
      panel.appendChild(bodyDiv);

      next.replaceWith(panel);
    });
  }

  function enhanceFlashcardDecks(main) {
    const headings = Array.from(main.querySelectorAll("h2, h3"));
    headings.forEach((heading) => {
      if (!/flashcard deck/i.test(heading.textContent || "")) {
        return;
      }

      const next = heading.nextElementSibling;
      if (!next || next.tagName !== "TABLE") {
        return;
      }

      const rows = Array.from(next.querySelectorAll("tbody tr"));
      if (rows.length === 0) {
        return;
      }

      const deck = document.createElement("div");
      deck.className = "flashcard-grid";

      rows.forEach((row, index) => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 2) {
          return;
        }

        const card = document.createElement("article");
        card.className = "flashcard";

        const frontDiv = document.createElement("div");
        frontDiv.className = "flashcard__front";

        const indexDiv = document.createElement("div");
        indexDiv.className = "flashcard__index";
        indexDiv.textContent = `Card ${index + 1}`;

        const questionP = document.createElement("p");
        questionP.className = "flashcard__question";
        questionP.innerHTML = cells[0].innerHTML; // Safe because it's sourced from Markdown rendering

        frontDiv.appendChild(indexDiv);
        frontDiv.appendChild(questionP);

        const backDiv = document.createElement("div");
        backDiv.className = "flashcard__back";

        const answerLabel = document.createElement("div");
        answerLabel.className = "flashcard__answer-label";
        answerLabel.textContent = "Answer";

        const answerP = document.createElement("p");
        answerP.className = "flashcard__answer";
        answerP.innerHTML = cells[1].innerHTML; // Safe because it's sourced from Markdown rendering

        backDiv.appendChild(answerLabel);
        backDiv.appendChild(answerP);

        card.appendChild(frontDiv);
        card.appendChild(backDiv);

        deck.appendChild(card);
      });

      next.replaceWith(deck);
    });
  }

  function enhanceCheatSheets(main) {
    const headings = Array.from(main.querySelectorAll("h2, h3"));
    headings.forEach((heading) => {
      if (!/chapter cheat sheet/i.test(heading.textContent || "")) {
        return;
      }

      const next = heading.nextElementSibling;
      if (!next || next.tagName !== "TABLE") {
        return;
      }

      next.classList.add("visual-table", "cheat-sheet-table");
      const panel = document.createElement("section");
      panel.className = "cheat-sheet-panel";
      next.replaceWith(panel);
      panel.appendChild(next);
    });
  }

  function styleTables(main) {
    main.querySelectorAll("table").forEach((table) => {
      table.classList.add("visual-table");
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
    enhanceMemoryHooks(main);
    enhanceFlashcardDecks(main);
    enhanceCheatSheets(main);
    styleTables(main);
    createHero(main, title, concept.color, concept.key);
  });
})();
