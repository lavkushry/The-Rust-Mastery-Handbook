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
    { key: "learning objective", className: "callout--learning-objective", icon: "🎯" },
  ];

  function pickConcept(text) {
    const match = conceptMap.find((entry) => entry.match.test(text));
    return match ?? { key: "compiler", color: "var(--compiler)" };
  }

  function createHero(main, title, accent, conceptKey) {
    if (!title || main.querySelector(".chapter-hero, .part-spread")) {
      return;
    }

    const firstHeading = main.querySelector("h1");
    // Ensure we don't accidentally enhance non-standard pages
    if (!firstHeading) {
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

    const grid = document.createElement("div");
    grid.className = isPart ? "part-spread__grid" : "chapter-hero__grid";

    const content = document.createElement("div");

    const eyebrowDiv = document.createElement("div");
    eyebrowDiv.className = isPart ? "part-spread__eyebrow" : "chapter-hero__eyebrow";
    eyebrowDiv.textContent = eyebrow;
    content.appendChild(eyebrowDiv);

    const titleH1 = document.createElement("h1");
    titleH1.className = isPart ? "part-spread__title" : "chapter-hero__title";
    titleH1.textContent = title;
    content.appendChild(titleH1);

    const hookP = document.createElement("p");
    hookP.className = isPart ? "part-spread__hook" : "chapter-hero__hook";
    hookP.textContent = shortHook;
    content.appendChild(hookP);

    const meta = document.createElement("div");
    meta.className = isPart ? "part-spread__meta" : "chapter-hero__meta";

    const pill1 = document.createElement("span");
    pill1.className = isPart ? "part-spread__pill" : "chapter-hero__pill";
    pill1.textContent = pillLabel;
    meta.appendChild(pill1);

    const pill2 = document.createElement("span");
    pill2.className = isPart ? "part-spread__pill" : "chapter-hero__pill";
    pill2.textContent = conceptKey;
    meta.appendChild(pill2);

    content.appendChild(meta);
    grid.appendChild(content);

    const illustration = document.createElement("div");
    illustration.setAttribute("aria-hidden", "true");

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "svg-frame");
    svg.setAttribute("viewBox", "0 0 520 360");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Concept signature illustration");

    const defs = document.createElementNS(svgNS, "defs");
    const linearGradient = document.createElementNS(svgNS, "linearGradient");
    linearGradient.setAttribute("id", "heroGradient");
    linearGradient.setAttribute("x1", "0%");
    linearGradient.setAttribute("y1", "0%");
    linearGradient.setAttribute("x2", "100%");
    linearGradient.setAttribute("y2", "100%");

    const stop1 = document.createElementNS(svgNS, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "rgba(255,255,255,0.18)");
    linearGradient.appendChild(stop1);

    const stop2 = document.createElementNS(svgNS, "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "rgba(255,255,255,0.02)");
    linearGradient.appendChild(stop2);

    defs.appendChild(linearGradient);
    svg.appendChild(defs);

    const rect1 = document.createElementNS(svgNS, "rect");
    rect1.setAttribute("x", "24");
    rect1.setAttribute("y", "24");
    rect1.setAttribute("width", "472");
    rect1.setAttribute("height", "312");
    rect1.setAttribute("rx", "28");
    rect1.setAttribute("fill", "url(#heroGradient)");
    rect1.setAttribute("stroke", "rgba(255,255,255,0.18)");
    svg.appendChild(rect1);

    const circle1 = document.createElementNS(svgNS, "circle");
    circle1.setAttribute("cx", "124");
    circle1.setAttribute("cy", "120");
    circle1.setAttribute("r", "46");
    circle1.setAttribute("fill", "rgba(255,255,255,0.14)");
    svg.appendChild(circle1);

    const circle2 = document.createElementNS(svgNS, "circle");
    circle2.setAttribute("cx", "124");
    circle2.setAttribute("cy", "120");
    circle2.setAttribute("r", "20");
    circle2.style.fill = accent;
    svg.appendChild(circle2);

    const rect2 = document.createElementNS(svgNS, "rect");
    rect2.setAttribute("x", "188");
    rect2.setAttribute("y", "82");
    rect2.setAttribute("width", "240");
    rect2.setAttribute("height", "18");
    rect2.setAttribute("rx", "9");
    rect2.setAttribute("fill", "rgba(255,255,255,0.14)");
    svg.appendChild(rect2);

    const rect3 = document.createElementNS(svgNS, "rect");
    rect3.setAttribute("x", "188");
    rect3.setAttribute("y", "116");
    rect3.setAttribute("width", "176");
    rect3.setAttribute("height", "14");
    rect3.setAttribute("rx", "7");
    rect3.setAttribute("fill", "rgba(255,255,255,0.12)");
    svg.appendChild(rect3);

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", "M120 174 L202 230 L312 160 L404 238");
    path.style.stroke = accent;
    path.setAttribute("stroke-width", "6");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-linecap", "round");
    svg.appendChild(path);

    const circle3 = document.createElementNS(svgNS, "circle");
    circle3.setAttribute("cx", "202");
    circle3.setAttribute("cy", "230");
    circle3.setAttribute("r", "12");
    circle3.style.fill = accent;
    svg.appendChild(circle3);

    const circle4 = document.createElementNS(svgNS, "circle");
    circle4.setAttribute("cx", "312");
    circle4.setAttribute("cy", "160");
    circle4.setAttribute("r", "12");
    circle4.setAttribute("fill", "#ffffff");
    svg.appendChild(circle4);

    const circle5 = document.createElementNS(svgNS, "circle");
    circle5.setAttribute("cx", "404");
    circle5.setAttribute("cy", "238");
    circle5.setAttribute("r", "12");
    circle5.style.fill = accent;
    svg.appendChild(circle5);

    const rect4 = document.createElementNS(svgNS, "rect");
    rect4.setAttribute("x", "84");
    rect4.setAttribute("y", "260");
    rect4.setAttribute("width", "124");
    rect4.setAttribute("height", "34");
    rect4.setAttribute("rx", "17");
    rect4.setAttribute("fill", "rgba(255,255,255,0.12)");
    rect4.setAttribute("stroke", "rgba(255,255,255,0.14)");
    svg.appendChild(rect4);

    const rect5 = document.createElementNS(svgNS, "rect");
    rect5.setAttribute("x", "224");
    rect5.setAttribute("y", "260");
    rect5.setAttribute("width", "204");
    rect5.setAttribute("height", "34");
    rect5.setAttribute("rx", "17");
    rect5.setAttribute("fill", "rgba(255,255,255,0.08)");
    rect5.setAttribute("stroke", "rgba(255,255,255,0.14)");
    svg.appendChild(rect5);

    illustration.appendChild(svg);
    grid.appendChild(illustration);
    hero.appendChild(grid);

    firstHeading.insertAdjacentElement("afterend", hero);
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
      if (!match || blockquote.classList.contains("callout")) {
        return;
      }

      blockquote.classList.add("callout", match.className);
      const label = document.createElement("div");
      label.className = "callout__label";
      label.textContent = `${match.icon} ${raw.replace(/:$/, "")}`;
      firstParagraph.replaceWith(label);
    });
  }

  function getNextSignificantSibling(element) {
    let next = element.nextElementSibling;
    while (next && (next.tagName === "BR" || next.tagName === "HR" || next.classList.contains("anchor") || (next.tagName === "P" && next.textContent.trim() === ""))) {
      next = next.nextElementSibling;
    }
    return next;
  }

  function cardifyRememberOnlyThree(main, headings) {
    const resolvedHeadings = headings || main.querySelectorAll("h2, h3");
    resolvedHeadings.forEach((heading) => {
      if (!/if you remember only 3 things/i.test(heading.textContent || "")) {
        return;
      }

      if (heading.nextElementSibling?.classList.contains("concept-card-row")) {
         return;
      }

      const next = getNextSignificantSibling(heading);
      if (!next || next.tagName !== "UL" || next.children.length !== 3) {
        return;
      }

      const grid = document.createElement("div");
      grid.className = "concept-card-row";

      Array.from(next.children).forEach((item, index) => {
        const card = document.createElement("article");
        card.className = "concept-card";

        const num = document.createElement("div");
        num.className = "concept-card__num";
        num.textContent = (index + 1).toString();
        card.appendChild(num);

        const text = document.createElement("div");
        text.className = "concept-card__text";
        text.innerHTML = item.innerHTML;
        card.appendChild(text);

        grid.appendChild(card);
      });

      next.replaceWith(grid);
    });
  }

  function enhanceMemoryHooks(main, headings) {
    const resolvedHeadings = headings || main.querySelectorAll("h2, h3");
    resolvedHeadings.forEach((heading) => {
      if (!/memory hook/i.test(heading.textContent || "")) {
        return;
      }

      if (heading.nextElementSibling?.classList.contains("memory-hook-panel")) {
        return;
      }

      const next = getNextSignificantSibling(heading);
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
          <rect x="10" y="10" width="200" height="100" rx="22" style="fill: color-mix(in srgb, var(--chapter-accent, var(--compiler)) 10%, white 90%); stroke: color-mix(in srgb, var(--chapter-accent, var(--compiler)) 60%, white 40%);" stroke-width="3"></rect>
          <circle cx="60" cy="60" r="22" style="fill: var(--chapter-accent, var(--compiler));"></circle>
          <path d="M96 58 H 166" style="stroke: var(--chapter-accent, var(--compiler));" stroke-width="8" stroke-linecap="round"></path>
          <path d="M96 78 H 142" style="stroke: color-mix(in srgb, var(--chapter-accent, var(--compiler)) 55%, white 45%);" stroke-width="8" stroke-linecap="round"></path>
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

  function enhanceFlashcardDecks(main, headings) {
    const resolvedHeadings = headings || main.querySelectorAll("h2, h3");
    resolvedHeadings.forEach((heading) => {
      if (!/flashcard deck/i.test(heading.textContent || "")) {
        return;
      }

      if (heading.nextElementSibling?.classList.contains("flashcard-grid")) {
         return;
      }

      const next = getNextSignificantSibling(heading);
      if (!next || next.tagName !== "TABLE") {
        return;
      }

      const rows = next.querySelectorAll("tbody tr");
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

        const questionP = document.createElement("div");
        questionP.className = "flashcard__question";
        questionP.innerHTML = cells[0].innerHTML; // Safe because it's sourced from Markdown rendering

        frontDiv.appendChild(indexDiv);
        frontDiv.appendChild(questionP);

        const backDiv = document.createElement("div");
        backDiv.className = "flashcard__back";

        const answerLabel = document.createElement("div");
        answerLabel.className = "flashcard__answer-label";
        answerLabel.textContent = "Answer";

        const answerP = document.createElement("div");
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

  function enhanceCheatSheets(main, headings) {
    const resolvedHeadings = headings || main.querySelectorAll("h2, h3");
    resolvedHeadings.forEach((heading) => {
      if (!/chapter cheat sheet/i.test(heading.textContent || "")) {
        return;
      }

      if (heading.nextElementSibling?.classList.contains("cheat-sheet-panel")) {
         return;
      }

      const next = getNextSignificantSibling(heading);
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

      // Wrap in a scrollable container if not already wrapped, so wide tables
      // scroll horizontally on narrow viewports instead of overflowing the page.
      if (!table.parentElement?.classList.contains("visual-table-wrapper")) {
        const wrapper = document.createElement("div");
        wrapper.className = "visual-table-wrapper";
        table.replaceWith(wrapper);
        wrapper.appendChild(table);
      }
    });
  }

  function initFlashcardFlip(main) {
    main.querySelectorAll('.flashcard-grid').forEach(deck => {
      const cards = deck.querySelectorAll('.flashcard');
      if (cards.length === 0) return;
      let reviewedCount = 0;

      // Add counter
      const counter = document.createElement('div');
      counter.className = 'fc-counter';
      counter.textContent = `0 / ${cards.length} reviewed`;
      deck.insertBefore(counter, deck.firstChild);

      cards.forEach((card, i) => {
        // Wrap existing front/back in an inner container for 3D flip
        const front = card.querySelector('.flashcard__front');
        const back = card.querySelector('.flashcard__back');
        if (!front || !back) return;

        // Only wrap if not already wrapped
        if (!card.querySelector('.flashcard__inner')) {
          const inner = document.createElement('div');
          inner.className = 'flashcard__inner';
          inner.appendChild(front);
          inner.appendChild(back);
          card.appendChild(inner);
        }

        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', 'Flashcard — press Enter to flip');

        const flip = () => {
          const wasFlipped = card.classList.contains('flipped');
          card.classList.toggle('flipped');
          if (!wasFlipped && !card.classList.contains('seen')) {
            reviewedCount++;
            counter.textContent = `${reviewedCount} / ${cards.length} reviewed`;
            card.classList.add('seen');
            try {
              const key = `fc_${window.location.pathname}_${i}`;
              localStorage.setItem(key, '1');
            } catch (e) { /* localStorage unavailable */ }
          }
        };

        card.addEventListener('click', flip);
        card.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
          if (e.key === 'ArrowRight' && cards[i + 1]) cards[i + 1].focus();
          if (e.key === 'ArrowLeft' && cards[i - 1]) cards[i - 1].focus();
        });

        // Restore seen state
        try {
          if (localStorage.getItem(`fc_${window.location.pathname}_${i}`)) {
            card.classList.add('seen');
            reviewedCount++;
          }
        } catch (e) { /* localStorage unavailable */ }
      });

      counter.textContent = `${reviewedCount} / ${cards.length} reviewed`;
    });
  }

  function initProgressTracker(main) {
    const STORAGE_KEY = 'rmh_progress';
    const chapterPath = window.location.pathname;

    function getProgress() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
      catch { return {}; }
    }

    function setProgress(p) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }
      catch { /* localStorage unavailable */ }
    }

    // Only show on chapter pages, not index pages
    const h1 = main.querySelector('h1');
    if (!h1 || /^PART\s+\d+/i.test(h1.textContent)) return;

    const progress = getProgress();
    const isDone = progress[chapterPath];

    const cta = document.createElement('div');
    cta.className = 'progress-cta';

    if (isDone) {
      const span = document.createElement('span');
      span.className = 'progress-done';
      span.textContent = '✓ Chapter complete — well done!';
      cta.appendChild(span);

      const unBtn = document.createElement('button');
      unBtn.className = 'progress-unmark';
      unBtn.textContent = 'unmark';
      unBtn.addEventListener('click', () => {
        const p = getProgress();
        delete p[chapterPath];
        setProgress(p);
        location.reload();
      });
      cta.appendChild(unBtn);
    } else {
      const btn = document.createElement('button');
      btn.className = 'progress-btn';
      btn.textContent = 'Mark chapter complete ✓';
      btn.addEventListener('click', () => {
        const p = getProgress();
        p[chapterPath] = true;
        setProgress(p);
        location.reload();
      });
      cta.appendChild(btn);

      const hint = document.createElement('div');
      hint.style.cssText = 'font-size:0.75rem;opacity:0.4;margin-top:0.5rem;';
      hint.textContent = 'Saves your progress in this browser';
      cta.appendChild(hint);
    }

    main.appendChild(cta);

    // Inject checkmarks into sidebar
    setTimeout(() => {
      const prog = getProgress();
      document.querySelectorAll('#sidebar .sidebar-scrollbox a[href]').forEach(link => {
        try {
          const href = new URL(link.href, window.location.href).pathname;
          if (prog[href]) {
            link.style.position = 'relative';
            link.style.paddingRight = '1.25rem';
            const dot = document.createElement('span');
            dot.className = 'sidebar-check';
            dot.textContent = '✓';
            link.appendChild(dot);
          }
        } catch { /* ignore bad URLs */ }
      });
    }, 150);
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
    initFlashcardFlip(main);
    initProgressTracker(main);
  });
})();
