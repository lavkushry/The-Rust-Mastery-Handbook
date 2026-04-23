/* =========================================================
   Part 0 interactive — quiz + step-through
   ========================================================= */

(function () {
  "use strict";

  const FERRIS_SVG = `<svg class="ferris-says__avatar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 130" role="img" aria-label="Ferris the crab speaking">
<title>Ferris the Crab</title>
<g fill="#e76f3c" stroke="#c2410c" stroke-width="2" stroke-linecap="round">
<path d="M 30 90 Q 20 105 12 95" /><path d="M 38 98 Q 32 115 20 112" /><path d="M 52 105 Q 52 122 42 125" />
<path d="M 108 105 Q 108 122 118 125" /><path d="M 122 98 Q 128 115 140 112" /><path d="M 130 90 Q 140 105 148 95" />
</g>
<ellipse cx="80" cy="75" rx="52" ry="36" fill="#f4a261" stroke="#c2410c" stroke-width="2.5" />
<ellipse cx="66" cy="62" rx="16" ry="9" fill="rgba(255,236,210,0.55)" />
<g stroke="#c2410c" stroke-width="7" stroke-linecap="round" fill="none">
<path d="M 30 68 Q 14 58 10 42" /><path d="M 130 68 Q 146 58 150 42" />
</g>
<g fill="#f4a261" stroke="#c2410c" stroke-width="2.5" stroke-linejoin="round">
<path d="M 10 42 q -6 -4 -6 -12 q 0 -8 8 -8 q 8 0 12 8 q 2 4 -2 8 q 4 6 0 12 q -4 4 -12 -8 z" />
<path d="M 150 42 q 6 -4 6 -12 q 0 -8 -8 -8 q -8 0 -12 8 q -2 4 2 8 q -4 6 0 12 q 4 4 12 -8 z" />
</g>
<g stroke="#c2410c" stroke-width="2.5" stroke-linecap="round">
<line x1="68" y1="50" x2="64" y2="36" /><line x1="92" y1="50" x2="96" y2="36" />
</g>
<circle cx="64" cy="34" r="7" fill="#fff" stroke="#c2410c" stroke-width="2.5" />
<circle cx="96" cy="34" r="7" fill="#fff" stroke="#c2410c" stroke-width="2.5" />
<circle cx="65" cy="34" r="3" fill="#1a1a2e" /><circle cx="97" cy="34" r="3" fill="#1a1a2e" />
<path d="M 70 80 Q 80 88 90 80" fill="none" stroke="#c2410c" stroke-width="2.5" stroke-linecap="round" />
</svg>`;

  function hydrateFerris(root) {
    const blocks = root.querySelectorAll(".ferris-says:not([data-hydrated])");
    blocks.forEach((el) => {
      el.setAttribute("data-hydrated", "true");
      // inject avatar if missing
      if (!el.querySelector(".ferris-says__avatar")) {
        el.insertAdjacentHTML("afterbegin", FERRIS_SVG);
      }
      // apply variant class
      const variant = el.dataset.variant;
      if (variant === "warning") el.classList.add("ferris-says--warning");
      if (variant === "insight") el.classList.add("ferris-says--insight");
      // ensure body wrapper
      if (!el.querySelector(".ferris-says__body")) {
        const avatar = el.querySelector(".ferris-says__avatar");
        const body = document.createElement("div");
        body.className = "ferris-says__body";
        // move all non-avatar children in
        Array.from(el.childNodes).forEach((node) => {
          if (node !== avatar) body.appendChild(node);
        });
        el.appendChild(body);
      }
      // auto-add a speaker label if none
      const body = el.querySelector(".ferris-says__body");
      if (body && !body.querySelector(".ferris-says__name")) {
        const label = document.createElement("span");
        label.className = "ferris-says__name";
        label.textContent = variant === "warning" ? "Ferris warns" : variant === "insight" ? "Ferris insight" : "Ferris says";
        body.insertBefore(label, body.firstChild);
      }
    });
  }

  function hydrateQuizzes(root) {
    const quizzes = root.querySelectorAll(".quiz:not([data-hydrated])");
    quizzes.forEach((quiz) => {
      quiz.setAttribute("data-hydrated", "true");

      const answerIndex = Number(quiz.dataset.answer);
      const options = quiz.querySelectorAll(".quiz__options > li, .quiz__options > button");
      const explain = quiz.querySelector(".quiz__explain");
      const wrongExplain = quiz.querySelector(".quiz__explain--wrong");
      const resetBtn = quiz.querySelector(".quiz__reset");
      const letters = ["A", "B", "C", "D", "E", "F"];

      options.forEach((opt, i) => {
        // normalise li -> button
        if (opt.tagName === "LI") {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "quiz__option";
          btn.innerHTML = `<span class="quiz__marker">${letters[i] || ""}</span>${opt.innerHTML}`;
          opt.replaceWith(btn);
          opt = btn;
        } else {
          opt.classList.add("quiz__option");
          if (!opt.querySelector(".quiz__marker")) {
            opt.insertAdjacentHTML(
              "afterbegin",
              `<span class="quiz__marker">${letters[i] || ""}</span>`,
            );
          }
        }

        opt.addEventListener("click", () => {
          // ignore if already locked
          if (quiz.dataset.locked === "true") return;

          const isCorrect = i === answerIndex;
          const allOptions = quiz.querySelectorAll(".quiz__option");

          if (isCorrect) {
            quiz.dataset.locked = "true";
            opt.classList.add("quiz__option--correct");
            allOptions.forEach((o) => {
              o.disabled = true;
              if (o !== opt) o.classList.add("quiz__option--eliminated");
            });
            if (explain) explain.classList.add("is-visible");
            if (wrongExplain) wrongExplain.classList.remove("is-visible");
            if (resetBtn) resetBtn.classList.add("is-visible");
          } else {
            opt.classList.add("quiz__option--wrong", "quiz__option--eliminated");
            opt.disabled = true;
            // On first wrong answer, reveal the "think again" hint if present
            if (wrongExplain && !wrongExplain.classList.contains("is-visible")) {
              wrongExplain.classList.add("is-visible");
            }
          }
        });
      });

      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          quiz.dataset.locked = "false";
          const allOptions = quiz.querySelectorAll(".quiz__option");
          allOptions.forEach((o) => {
            o.disabled = false;
            o.classList.remove(
              "quiz__option--correct",
              "quiz__option--wrong",
              "quiz__option--eliminated",
            );
          });
          if (explain) explain.classList.remove("is-visible");
          if (wrongExplain) wrongExplain.classList.remove("is-visible");
          resetBtn.classList.remove("is-visible");
        });
      }
    });
  }

  function hydrateStepThroughs(root) {
    const steppers = root.querySelectorAll(".step-through:not([data-hydrated])");
    steppers.forEach((stepper) => {
      stepper.setAttribute("data-hydrated", "true");

      const frames = Array.from(stepper.querySelectorAll(".step-through__frame"));
      if (frames.length === 0) return;

      const prev = stepper.querySelector("[data-step-prev]");
      const next = stepper.querySelector("[data-step-next]");
      const progress = stepper.querySelector(".step-through__progress");

      let idx = 0;
      const render = () => {
        frames.forEach((f, i) => f.classList.toggle("is-active", i === idx));
        if (prev) prev.disabled = idx === 0;
        if (next) next.disabled = idx === frames.length - 1;
        if (progress) progress.textContent = `${idx + 1} / ${frames.length}`;
      };

      if (prev)
        prev.addEventListener("click", () => {
          if (idx > 0) {
            idx--;
            render();
          }
        });
      if (next)
        next.addEventListener("click", () => {
          if (idx < frames.length - 1) {
            idx++;
            render();
          }
        });

      stepper.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft" && prev) prev.click();
        if (e.key === "ArrowRight" && next) next.click();
      });

      render();
    });
  }

  function hydrate(root = document) {
    hydrateFerris(root);
    hydrateQuizzes(root);
    hydrateStepThroughs(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => hydrate());
  } else {
    hydrate();
  }
})();
