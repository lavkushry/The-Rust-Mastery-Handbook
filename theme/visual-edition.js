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
    { key: "design insight", className: "callout--design-insight", icon: "bulb" },
    { key: "expert tip", className: "callout--expert-tip", icon: "star" },
    { key: "common mistake", className: "callout--common-mistake", icon: "warning" },
    { key: "compiler says", className: "callout--compiler-says", icon: "chip" },
    { key: "memory model", className: "callout--memory-model", icon: "brain" },
    { key: "zero cost proof", className: "callout--zero-cost", icon: "bolt" },
    { key: "learning objective", className: "callout--learning-objective", icon: "target" },
  ];

  function createInlineSvgIcon(icon, ariaLabel) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.classList.add("inline-svg-icon");
    if (ariaLabel) {
      svg.setAttribute("aria-label", ariaLabel);
      svg.setAttribute("role", "img");
    }

    const makePath = (d, attrs = {}) => {
      const path = document.createElementNS(ns, "path");
      path.setAttribute("d", d);
      Object.entries(attrs).forEach(([key, value]) => path.setAttribute(key, value));
      return path;
    };

    const makeCircle = (cx, cy, r, attrs = {}) => {
      const circle = document.createElementNS(ns, "circle");
      circle.setAttribute("cx", String(cx));
      circle.setAttribute("cy", String(cy));
      circle.setAttribute("r", String(r));
      Object.entries(attrs).forEach(([key, value]) => circle.setAttribute(key, value));
      return circle;
    };

    switch (icon) {
      case "bulb":
        svg.appendChild(makeCircle(12, 10, 5, { fill: "currentColor", "fill-opacity": "0.2", stroke: "currentColor", "stroke-width": "1.5" }));
        svg.appendChild(makePath("M9 16h6M10 19h4", { stroke: "currentColor", "stroke-width": "1.7", "stroke-linecap": "round" }));
        break;
      case "star":
        svg.appendChild(makePath("M12 3.5l2.7 5.47 6.03.88-4.36 4.25 1.03 6.01L12 17.4l-5.4 2.84 1.03-6.01L3.27 9.85l6.03-.88L12 3.5z", { fill: "currentColor", "fill-opacity": "0.25", stroke: "currentColor", "stroke-width": "1.4", "stroke-linejoin": "round" }));
        break;
      case "warning":
        svg.appendChild(makePath("M12 3.8L21 19.2H3L12 3.8z", { fill: "currentColor", "fill-opacity": "0.2", stroke: "currentColor", "stroke-width": "1.5", "stroke-linejoin": "round" }));
        svg.appendChild(makePath("M12 9.2v4.8M12 17.2h.01", { stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round" }));
        break;
      case "chip":
        svg.appendChild(makePath("M8 8h8v8H8z", { fill: "currentColor", "fill-opacity": "0.2", stroke: "currentColor", "stroke-width": "1.5" }));
        svg.appendChild(makePath("M10.8 10.8h2.4v2.4h-2.4z", { fill: "currentColor" }));
        break;
      case "brain":
        svg.appendChild(makePath("M10.5 5.8a3 3 0 00-5 2.2 2.8 2.8 0 00.5 5.56A3.2 3.2 0 0010 18v-12zm3 0v12a3.2 3.2 0 004-4.44 2.8 2.8 0 00.5-5.56 3 3 0 00-5-2.2z", { fill: "currentColor", "fill-opacity": "0.18", stroke: "currentColor", "stroke-width": "1.2", "stroke-linejoin": "round" }));
        break;
      case "bolt":
        svg.appendChild(makePath("M13.2 2.8L5.5 13h5.3l-1 8.2L18.5 11h-5.1l-.2-8.2z", { fill: "currentColor", "fill-opacity": "0.22", stroke: "currentColor", "stroke-width": "1.3", "stroke-linejoin": "round" }));
        break;
      case "target":
        svg.appendChild(makeCircle(12, 12, 8.5, { fill: "none", stroke: "currentColor", "stroke-width": "1.6" }));
        svg.appendChild(makeCircle(12, 12, 4.8, { fill: "none", stroke: "currentColor", "stroke-width": "1.4" }));
        svg.appendChild(makeCircle(12, 12, 1.6, { fill: "currentColor" }));
        break;
      case "leaf":
        svg.appendChild(makePath("M19.2 4.8c-6.1.3-9.8 3-11.6 7.8-.4 1-.6 2.1-.6 3.2 1.1 0 2.2-.2 3.2-.6 4.9-1.8 7.5-5.4 7.8-11.6-.9.1-1.8.4-2.8 1.2z", { fill: "currentColor", "fill-opacity": "0.2", stroke: "currentColor", "stroke-width": "1.3", "stroke-linejoin": "round" }));
        break;
      case "gear":
        svg.appendChild(makeCircle(12, 12, 3, { fill: "none", stroke: "currentColor", "stroke-width": "1.7" }));
        svg.appendChild(makePath("M12 3.8v2.2M12 18v2.2M3.8 12H6M18 12h2.2M6.2 6.2l1.5 1.5M16.3 16.3l1.5 1.5M17.8 6.2l-1.5 1.5M7.7 16.3l-1.5 1.5", { stroke: "currentColor", "stroke-width": "1.6", "stroke-linecap": "round" }));
        break;
      case "lab":
        svg.appendChild(makePath("M9 4.4h6M10.4 4.4v4.4l-4.5 7.6A2 2 0 007.6 19h8.8a2 2 0 001.7-2.9l-4.5-7.6V4.4", { fill: "currentColor", "fill-opacity": "0.18", stroke: "currentColor", "stroke-width": "1.4", "stroke-linejoin": "round", "stroke-linecap": "round" }));
        svg.appendChild(makePath("M8.2 14.2h7.6", { stroke: "currentColor", "stroke-width": "1.4" }));
        break;
      default:
        svg.appendChild(makeCircle(12, 12, 8, { fill: "currentColor", "fill-opacity": "0.2", stroke: "currentColor", "stroke-width": "1.5" }));
    }
    return svg;
  }

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
      label.appendChild(createInlineSvgIcon(match.icon));
      const labelText = document.createElement("span");
      labelText.textContent = raw.replace(/:$/, "");
      label.appendChild(labelText);
      firstParagraph.replaceWith(label);
    });
  }

  function enhanceWideSvgReadability(main) {
    main.querySelectorAll(".visual-figure .svg-frame").forEach((svg) => {
      const viewBox = svg.getAttribute("viewBox");
      if (!viewBox) {
        return;
      }
      const dimensions = viewBox.split(/\s+/).map(Number);
      if (dimensions.length !== 4 || Number.isNaN(dimensions[2])) {
        return;
      }
      const width = dimensions[2];
      if (width >= 900) {
        svg.classList.add("svg-frame--wide");
        svg.style.setProperty("--svg-min-width", `${Math.round(Math.min(width, 1120))}px`);
      }
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

  // ══ PLAYGROUND BUTTONS ═══════════════════════════════
  function initPlaygroundButtons(main) {
    main.querySelectorAll('pre > code.language-rust').forEach(codeEl => {
      const pre = codeEl.parentElement;
      if (pre.querySelector('.playground-btn')) return;
      const code = codeEl.textContent;
      // Skip incomplete snippets (no fn main, just fragments)
      const btn = document.createElement('a');
      btn.className = 'playground-btn';
      btn.textContent = 'Run';
      btn.title = 'Open in Rust Playground';
      btn.target = '_blank';
      btn.rel = 'noopener';
      btn.href = 'https://play.rust-lang.org/?edition=2021&code=' + encodeURIComponent(code);
      pre.style.position = 'relative';
      pre.appendChild(btn);
    });
  }

  // ══ INTERACTIVE STEPPERS ═════════════════════════════
  function initSteppers(main) {
    main.querySelectorAll('.stepper').forEach(stepper => {
      const steps = stepper.querySelectorAll('.stepper-step');
      if (steps.length === 0) return;
      let current = 0;

      // Show only first step
      steps.forEach((s, i) => { s.style.display = i === 0 ? 'block' : 'none'; });

      const nav = document.createElement('div');
      nav.className = 'stepper-nav';

      const counter = document.createElement('span');
      counter.className = 'stepper-counter';
      counter.textContent = `Step 1 of ${steps.length}`;

      const prevBtn = document.createElement('button');
      prevBtn.className = 'stepper-btn';
      prevBtn.textContent = '← Prev';
      prevBtn.disabled = true;

      const nextBtn = document.createElement('button');
      nextBtn.className = 'stepper-btn';
      nextBtn.textContent = 'Next →';

      function update() {
        steps.forEach((s, i) => { s.style.display = i === current ? 'block' : 'none'; });
        counter.textContent = `Step ${current + 1} of ${steps.length}`;
        prevBtn.disabled = current === 0;
        nextBtn.disabled = current === steps.length - 1;
      }

      prevBtn.addEventListener('click', () => { if (current > 0) { current--; update(); } });
      nextBtn.addEventListener('click', () => { if (current < steps.length - 1) { current++; update(); } });

      nav.appendChild(prevBtn);
      nav.appendChild(counter);
      nav.appendChild(nextBtn);
      stepper.appendChild(nav);
    });
  }

  // ══ 3-LEVEL TABS ═════════════════════════════════════
  function initLevelTabs(main) {
    main.querySelectorAll('.level-tabs').forEach(container => {
      const panels = container.querySelectorAll('.level-panel');
      if (panels.length === 0) return;

      const tabBar = document.createElement('div');
      tabBar.className = 'level-tab-bar';

      const labels = ['Beginner', 'Engineer', 'Deep Dive'];
      const icons = ['leaf', 'gear', 'lab'];

      panels.forEach((panel, i) => {
        const tab = document.createElement('button');
        tab.className = 'level-tab' + (i === 0 ? ' level-tab--active' : '');
        const icon = createInlineSvgIcon(icons[i] || 'gear');
        icon.classList.add('level-tab__icon');
        tab.appendChild(icon);
        const text = document.createElement('span');
        text.textContent = labels[i] || panel.dataset.level || `Level ${i + 1}`;
        tab.appendChild(text);
        tab.addEventListener('click', () => {
          container.querySelectorAll('.level-tab').forEach(t => t.classList.remove('level-tab--active'));
          tab.classList.add('level-tab--active');
          panels.forEach((p, j) => { p.style.display = j === i ? 'block' : 'none'; });
        });
        tabBar.appendChild(tab);
        panel.style.display = i === 0 ? 'block' : 'none';
      });

      container.insertBefore(tabBar, container.firstChild);
    });
  }

  // ══ ANKI EXPORT ══════════════════════════════════════
  function initAnkiExport(main) {
    main.querySelectorAll('.flashcard-grid').forEach(deck => {
      if (deck.querySelector('.anki-export-btn')) return;
      const cards = deck.querySelectorAll('.flashcard');
      if (cards.length === 0) return;

      const btn = document.createElement('button');
      btn.className = 'anki-export-btn';
      btn.textContent = 'Export for Anki';
      btn.title = 'Download flashcards as tab-separated text for Anki import';
      btn.addEventListener('click', () => {
        let tsv = '';
        cards.forEach(card => {
          const q = (card.querySelector('.flashcard__question') || card.querySelector('.flashcard__front'))?.textContent?.trim() || '';
          const a = (card.querySelector('.flashcard__answer') || card.querySelector('.flashcard__back'))?.textContent?.trim() || '';
          if (q && a) tsv += q.replace(/\t/g, ' ') + '\t' + a.replace(/\t/g, ' ') + '\n';
        });
        const blob = new Blob([tsv], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'rust-flashcards.txt';
        link.click();
        URL.revokeObjectURL(url);
      });
      deck.appendChild(btn);
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
    initFlashcardFlip(main);
    initProgressTracker(main);
    initPlaygroundButtons(main);
    initSteppers(main);
    initLevelTabs(main);
    initAnkiExport(main);
    enhanceWideSvgReadability(main);
  });
})();
