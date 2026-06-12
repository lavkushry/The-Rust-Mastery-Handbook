/*
 * Rust Memory Visualization Engine
 * ---------------------------------
 * Powers the interactive Ownership Visualizer, Borrow Checker Simulator,
 * and Stack & Heap walkthroughs embedded in chapters.
 *
 * A simulation is declared in Markdown as:
 *
 *   <div class="rust-viz" data-title="..." data-accent="var(--ownership)">
 *   <script type="application/json">{ "code": [...], "steps": [...] }</script>
 *   <p class="rust-viz__fallback">Static description for no-JS / PDF readers.</p>
 *   </div>
 *
 * Each step describes the highlighted source line, the stack frames with
 * their variables, the heap blocks, and a caption. Variables may point at
 * heap blocks (by id) or at other variables (by id) — the engine draws
 * animated pointer arrows between them.
 */
(() => {
  const VAR_STATE_TAGS = {
    owner: "owner",
    copy: "copy",
    moved: "moved",
    borrow: "&shared",
    "borrow-mut": "&mut",
    dropped: "dropped",
    shadowed: "shadowed",
    error: "error",
  };

  const NOTE_LABELS = {
    error: "Compiler rejects",
    ok: "Compiler accepts",
    info: "Compiler insight",
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }

  function parseScenario(container) {
    const dataEl = container.querySelector('script[type="application/json"]');
    if (!dataEl) {
      return null;
    }
    let scenario;
    try {
      scenario = JSON.parse(dataEl.textContent);
    } catch {
      return null;
    }
    if (!Array.isArray(scenario.code) || !Array.isArray(scenario.steps) || scenario.steps.length === 0) {
      return null;
    }
    return scenario;
  }

  function renderVariable(variable, targets) {
    const row = el("div", "rust-viz__var");
    row.classList.add(`rust-viz__var--${variable.state || "owner"}`);
    if (variable.id) {
      row.dataset.vizId = variable.id;
      targets.set(variable.id, row);
    }

    const name = el("span", "rust-viz__var-name", variable.name);
    row.appendChild(name);

    if (variable.value !== undefined) {
      row.appendChild(el("span", "rust-viz__var-value", variable.value));
    }

    const tag = VAR_STATE_TAGS[variable.state || "owner"];
    if (tag) {
      row.appendChild(el("span", `rust-viz__tag rust-viz__tag--${variable.state || "owner"}`, tag));
    }

    if (variable.points) {
      row.dataset.vizPoints = variable.points;
      row.dataset.vizState = variable.state || "owner";
    }
    return row;
  }

  function renderMemory(ctx, step) {
    const targets = new Map();
    const [leftLabel, rightLabel] = ctx.scenario.columns || ["Stack", "Heap"];
    ctx.stackCol.replaceChildren(el("div", "rust-viz__col-label", leftLabel));
    ctx.heapCol.replaceChildren(el("div", "rust-viz__col-label", rightLabel));

    const frames = step.stack || [];
    if (frames.length === 0) {
      ctx.stackCol.appendChild(el("div", "rust-viz__empty", "(empty)"));
    }
    frames.forEach((frame) => {
      const frameEl = el("div", "rust-viz__frame");
      if (frame.state === "closing") {
        frameEl.classList.add("rust-viz__frame--closing");
      }
      frameEl.appendChild(el("div", "rust-viz__frame-name", frame.frame || "frame"));
      (frame.vars || []).forEach((variable) => {
        frameEl.appendChild(renderVariable(variable, targets));
      });
      ctx.stackCol.appendChild(frameEl);
    });

    const blocks = step.heap || [];
    if (blocks.length === 0) {
      ctx.heapCol.appendChild(el("div", "rust-viz__empty", ctx.scenario.columns ? "(empty)" : "(no allocations)"));
    }
    blocks.forEach((block) => {
      const blockEl = el("div", "rust-viz__heap-block");
      blockEl.classList.add(`rust-viz__heap-block--${block.state || "alive"}`);
      if (block.id) {
        blockEl.dataset.vizId = block.id;
        targets.set(block.id, blockEl);
      }
      if (block.label) {
        blockEl.appendChild(el("div", "rust-viz__heap-label", block.label));
      }
      if (block.value !== undefined) {
        blockEl.appendChild(el("div", "rust-viz__heap-value", block.value));
      }
      if (block.state === "freed") {
        blockEl.appendChild(el("span", "rust-viz__tag rust-viz__tag--freed", "freed"));
      }
      ctx.heapCol.appendChild(blockEl);
    });

    ctx.targets = targets;
  }

  function drawArrows(ctx) {
    const svg = ctx.arrows;
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    const panelRect = ctx.memoryPanel.getBoundingClientRect();
    if (panelRect.width === 0 || panelRect.height === 0) {
      return; // No layout available (hidden panel or non-visual environment).
    }
    svg.setAttribute("viewBox", `0 0 ${panelRect.width} ${panelRect.height}`);

    ctx.memoryPanel.querySelectorAll("[data-viz-points]").forEach((source) => {
      const target = ctx.targets.get(source.dataset.vizPoints);
      if (!target) {
        return;
      }
      const from = source.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const x1 = from.right - panelRect.left - 6;
      const y1 = from.top + from.height / 2 - panelRect.top;
      const sameColumn = to.left < from.right && to.right > from.left;
      const x2 = sameColumn ? to.right - panelRect.left + 6 : to.left - panelRect.left + 4;
      const y2 = to.top + to.height / 2 - panelRect.top;
      const bend = sameColumn ? Math.max(x1, x2) + 28 : (x1 + x2) / 2;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", `M ${x1} ${y1} C ${bend} ${y1}, ${bend} ${y2}, ${x2} ${y2}`);
      path.setAttribute("class", `rust-viz__arrow rust-viz__arrow--${source.dataset.vizState}`);
      path.setAttribute("fill", "none");
      svg.appendChild(path);

      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", String(x2));
      dot.setAttribute("cy", String(y2));
      dot.setAttribute("r", "4");
      dot.setAttribute("class", `rust-viz__arrow-head rust-viz__arrow-head--${source.dataset.vizState}`);
      svg.appendChild(dot);
    });
  }

  function goToStep(ctx, index) {
    ctx.current = Math.max(0, Math.min(index, ctx.scenario.steps.length - 1));
    const step = ctx.scenario.steps[ctx.current];

    ctx.codeLines.forEach((lineEl, i) => {
      const active = i + 1 === step.line;
      lineEl.classList.toggle("rust-viz__line--active", active);
      lineEl.classList.toggle("rust-viz__line--error", active && step.note?.kind === "error");
    });

    renderMemory(ctx, step);

    ctx.caption.textContent = `Step ${ctx.current + 1} of ${ctx.scenario.steps.length}: ${step.caption || ""}`;

    if (step.note) {
      ctx.note.hidden = false;
      ctx.note.className = `rust-viz__note rust-viz__note--${step.note.kind || "info"}`;
      ctx.note.replaceChildren(
        el("span", "rust-viz__note-label", NOTE_LABELS[step.note.kind] || NOTE_LABELS.info),
        el("span", "rust-viz__note-text", step.note.text),
      );
    } else {
      ctx.note.hidden = true;
      ctx.note.replaceChildren();
    }

    ctx.counter.textContent = `${ctx.current + 1} / ${ctx.scenario.steps.length}`;
    ctx.prevBtn.disabled = ctx.current === 0;
    ctx.nextBtn.disabled = ctx.current === ctx.scenario.steps.length - 1;
    if (ctx.nextBtn.disabled) {
      stopPlayback(ctx);
    }

    if (ctx.mode === "3d" && ctx.viz3d) {
      ctx.viz3d.update(step);
    }

    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => drawArrows(ctx));
    } else {
      drawArrows(ctx);
    }
  }

  function prefersReducedMotion() {
    return typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function setMode2d(ctx) {
    ctx.mode = "2d";
    ctx.memoryPanel.style.display = "";
    if (ctx.sceneEl) {
      ctx.sceneEl.style.display = "none";
    }
    ctx.modeBtn.textContent = "◆ 3D";
    ctx.modeBtn.setAttribute("aria-label", "Switch memory view to 3D");
    try {
      localStorage.setItem("rustviz_mode", "2d");
    } catch { /* localStorage unavailable */ }
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => drawArrows(ctx));
    }
  }

  async function setMode3d(ctx) {
    if (!window.RustViz3D) {
      throw new Error("3D renderer not loaded");
    }
    if (!ctx.sceneEl) {
      ctx.sceneEl = el("div", "rust-viz__scene");
      ctx.sceneEl.setAttribute("role", "img");
      ctx.sceneEl.setAttribute("aria-label", "3D visualization of the simulation's memory state");
      ctx.memoryPanel.insertAdjacentElement("afterend", ctx.sceneEl);
    }
    ctx.memoryPanel.style.display = "none";
    ctx.sceneEl.style.display = "block";
    if (!ctx.viz3d) {
      ctx.viz3d = await window.RustViz3D.mount(ctx.sceneEl, ctx.scenario, {
        reducedMotion: prefersReducedMotion(),
      });
    }
    ctx.mode = "3d";
    ctx.modeBtn.textContent = "▦ 2D";
    ctx.modeBtn.setAttribute("aria-label", "Switch memory view to 2D");
    try {
      localStorage.setItem("rustviz_mode", "3d");
    } catch { /* localStorage unavailable */ }
    ctx.viz3d.update(ctx.scenario.steps[ctx.current]);
  }

  async function toggleMode(ctx) {
    if (ctx.mode === "3d") {
      setMode2d(ctx);
      return;
    }
    const originalText = ctx.modeBtn.textContent;
    ctx.modeBtn.disabled = true;
    ctx.modeBtn.textContent = "Loading…";
    try {
      await setMode3d(ctx);
    } catch {
      ctx.memoryPanel.style.display = "";
      if (ctx.sceneEl) {
        ctx.sceneEl.style.display = "none";
      }
      ctx.modeBtn.textContent = "3D unavailable";
      setTimeout(() => {
        ctx.modeBtn.textContent = originalText;
      }, 2000);
    } finally {
      ctx.modeBtn.disabled = false;
    }
  }

  function stopPlayback(ctx) {
    if (ctx.timer) {
      clearInterval(ctx.timer);
      ctx.timer = null;
    }
    ctx.playBtn.textContent = "▶ Play";
    ctx.playBtn.setAttribute("aria-label", "Play simulation");
  }

  function togglePlayback(ctx) {
    if (ctx.timer) {
      stopPlayback(ctx);
      return;
    }
    if (ctx.current === ctx.scenario.steps.length - 1) {
      goToStep(ctx, 0);
    }
    ctx.playBtn.textContent = "❚❚ Pause";
    ctx.playBtn.setAttribute("aria-label", "Pause simulation");
    ctx.timer = setInterval(() => {
      if (ctx.current >= ctx.scenario.steps.length - 1) {
        stopPlayback(ctx);
      } else {
        goToStep(ctx, ctx.current + 1);
      }
    }, 2200);
  }

  function buildControls(ctx) {
    const controls = el("div", "rust-viz__controls");

    ctx.resetBtn = el("button", "rust-viz__btn", "⟲ Reset");
    ctx.resetBtn.type = "button";
    ctx.resetBtn.setAttribute("aria-label", "Reset simulation to first step");
    ctx.resetBtn.addEventListener("click", () => {
      stopPlayback(ctx);
      goToStep(ctx, 0);
    });

    ctx.prevBtn = el("button", "rust-viz__btn", "← Prev");
    ctx.prevBtn.type = "button";
    ctx.prevBtn.setAttribute("aria-label", "Previous step");
    ctx.prevBtn.addEventListener("click", () => {
      stopPlayback(ctx);
      goToStep(ctx, ctx.current - 1);
    });

    ctx.playBtn = el("button", "rust-viz__btn rust-viz__btn--play", "▶ Play");
    ctx.playBtn.type = "button";
    ctx.playBtn.setAttribute("aria-label", "Play simulation");
    const reducedMotion = typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      ctx.playBtn.hidden = true;
    }
    ctx.playBtn.addEventListener("click", () => togglePlayback(ctx));

    ctx.nextBtn = el("button", "rust-viz__btn rust-viz__btn--next", "Next →");
    ctx.nextBtn.type = "button";
    ctx.nextBtn.setAttribute("aria-label", "Next step");
    ctx.nextBtn.addEventListener("click", () => {
      stopPlayback(ctx);
      goToStep(ctx, ctx.current + 1);
    });

    ctx.counter = el("span", "rust-viz__counter");
    ctx.counter.setAttribute("aria-hidden", "true");

    ctx.modeBtn = el("button", "rust-viz__btn rust-viz__btn--mode", "◆ 3D");
    ctx.modeBtn.type = "button";
    ctx.modeBtn.setAttribute("aria-label", "Switch memory view to 3D");
    ctx.modeBtn.addEventListener("click", () => toggleMode(ctx));

    controls.appendChild(ctx.resetBtn);
    controls.appendChild(ctx.prevBtn);
    controls.appendChild(ctx.counter);
    controls.appendChild(ctx.nextBtn);
    controls.appendChild(ctx.playBtn);
    controls.appendChild(ctx.modeBtn);
    return controls;
  }

  function init(container) {
    const scenario = parseScenario(container);
    if (!scenario || container.classList.contains("rust-viz--ready")) {
      return;
    }

    const ctx = { container, scenario, current: 0, timer: null, targets: new Map() };
    container.classList.add("rust-viz--ready");
    if (container.dataset.accent) {
      container.style.setProperty("--viz-accent", container.dataset.accent);
    }

    const fallback = container.querySelector(".rust-viz__fallback");
    if (fallback) {
      fallback.hidden = true;
    }

    const header = el("div", "rust-viz__header");
    header.appendChild(el("div", "rust-viz__eyebrow", container.dataset.eyebrow || "Interactive Simulation"));
    if (container.dataset.title) {
      header.appendChild(el("div", "rust-viz__title", container.dataset.title));
    }
    container.appendChild(header);

    const body = el("div", "rust-viz__body");

    // Scrollable when long lines overflow (font-dependent), so it must be
    // keyboard-focusable — same pattern as the theme's table/diagram regions.
    const codePanel = el("div", "rust-viz__code");
    codePanel.setAttribute("role", "region");
    codePanel.setAttribute("aria-label", "Source code for this simulation");
    codePanel.tabIndex = 0;
    const codeList = el("ol", "rust-viz__code-lines");
    ctx.codeLines = scenario.code.map((line) => {
      const li = el("li", "rust-viz__line");
      li.appendChild(el("code", null, line === "" ? " " : line));
      codeList.appendChild(li);
      return li;
    });
    codePanel.appendChild(codeList);
    body.appendChild(codePanel);

    ctx.memoryPanel = el("div", "rust-viz__memory");
    ctx.stackCol = el("div", "rust-viz__stack");
    ctx.heapCol = el("div", "rust-viz__heap");
    ctx.arrows = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    ctx.arrows.setAttribute("class", "rust-viz__arrows");
    ctx.arrows.setAttribute("aria-hidden", "true");
    ctx.memoryPanel.appendChild(ctx.stackCol);
    ctx.memoryPanel.appendChild(ctx.heapCol);
    ctx.memoryPanel.appendChild(ctx.arrows);
    body.appendChild(ctx.memoryPanel);

    container.appendChild(body);

    ctx.note = el("div", "rust-viz__note");
    ctx.note.hidden = true;
    container.appendChild(ctx.note);

    ctx.caption = el("p", "rust-viz__caption");
    ctx.caption.setAttribute("aria-live", "polite");
    ctx.caption.setAttribute("aria-atomic", "true");
    container.appendChild(ctx.caption);

    container.appendChild(buildControls(ctx));

    container.tabIndex = 0;
    container.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        stopPlayback(ctx);
        goToStep(ctx, ctx.current + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        stopPlayback(ctx);
        goToStep(ctx, ctx.current - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        stopPlayback(ctx);
        goToStep(ctx, 0);
      }
    });

    window.addEventListener("resize", () => drawArrows(ctx), { passive: true });

    ctx.mode = "2d";
    goToStep(ctx, 0);

    // Restore a previously chosen 3D preference, quietly falling back to 2D
    // if the renderer or WebGL is unavailable.
    try {
      if (localStorage.getItem("rustviz_mode") === "3d" && window.RustViz3D) {
        setTimeout(() => {
          setMode3d(ctx).catch(() => setMode2d(ctx));
        }, 80);
      }
    } catch { /* localStorage unavailable */ }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const main = document.querySelector("#mdbook-content main");
    if (!main) {
      return;
    }
    main.querySelectorAll(".rust-viz").forEach(init);
  });
})();
