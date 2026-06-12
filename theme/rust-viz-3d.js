/*
 * Rust Memory Visualization Engine — 3D renderer
 * -----------------------------------------------
 * Renders any rust-viz scenario as a live Three.js scene: stack frames become
 * floating platforms, variables become containers, heap allocations become
 * glowing energy cores, and pointers become animated energy flows between them.
 *
 * Loaded on every page but inert until a learner presses the "3D" toggle on a
 * simulation, at which point Three.js is fetched once from a CDN. If the fetch
 * fails (offline readers, strict networks), the 2D engine remains in charge —
 * 3D is a pure enhancement on top of the same scenario JSON.
 */
(() => {
  const THREE_CDN = "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

  const STATE_COLORS = {
    owner: 0xe63946,
    copy: 0x74c69d,
    moved: 0x9a6b3f,
    borrow: 0x5fa8d3,
    "borrow-mut": 0xf4a261,
    dropped: 0x6d6875,
    shadowed: 0x64748b,
    error: 0xff2d55,
    plain: 0x8fa3c8,
  };

  const FADED_STATES = new Set(["moved", "dropped", "shadowed"]);

  let threePromise = null;
  function loadThree() {
    threePromise ||= import(THREE_CDN);
    return threePromise;
  }

  function shorten(text, max) {
    if (typeof text !== "string") return "";
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
  }

  function makeLabelTexture(T, lines, accentCss) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 192;
    const g = canvas.getContext("2d");

    g.fillStyle = "rgba(8, 13, 28, 0.82)";
    const r = 28;
    g.beginPath();
    g.roundRect(4, 4, canvas.width - 8, canvas.height - 8, r);
    g.fill();
    g.strokeStyle = accentCss;
    g.lineWidth = 5;
    g.stroke();

    g.textAlign = "center";
    g.fillStyle = "#f8fafc";
    g.font = "700 44px 'JetBrains Mono', monospace";
    g.fillText(shorten(lines[0] || "", 22), canvas.width / 2, lines[1] ? 82 : 112);
    if (lines[1]) {
      g.fillStyle = "rgba(248, 250, 252, 0.75)";
      g.font = "400 32px 'JetBrains Mono', monospace";
      g.fillText(shorten(lines[1], 30), canvas.width / 2, 142);
    }

    const texture = new T.CanvasTexture(canvas);
    texture.anisotropy = 4;
    return texture;
  }

  function makeLabelSprite(T, lines, colorHex, width) {
    const accentCss = `#${colorHex.toString(16).padStart(6, "0")}`;
    const material = new T.SpriteMaterial({
      map: makeLabelTexture(T, lines, accentCss),
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    const sprite = new T.Sprite(material);
    sprite.renderOrder = 10;
    sprite.scale.set(width, width * 0.375, 1);
    return sprite;
  }

  function makeGlowTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const g = canvas.getContext("2d");
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,255,255,0.85)");
    grad.addColorStop(0.35, "rgba(255,255,255,0.25)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return canvas;
  }

  async function mount(sceneEl, scenario, options = {}) {
    const T = await loadThree();
    const reducedMotion = Boolean(options.reducedMotion);

    const width = sceneEl.clientWidth || 800;
    const height = sceneEl.clientHeight || 400;

    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    sceneEl.appendChild(renderer.domElement);

    const scene = new T.Scene();
    scene.fog = new T.Fog(0x0b1020, 24, 60);

    const camera = new T.PerspectiveCamera(42, width / height, 0.1, 200);
    camera.position.set(0, 6.4, 15.5);
    camera.lookAt(0, 0.3, 0);

    scene.add(new T.AmbientLight(0x8899bb, 0.85));
    const key = new T.DirectionalLight(0xffffff, 1.5);
    key.position.set(6, 12, 8);
    scene.add(key);
    const coolFill = new T.PointLight(0x3a86ff, 60, 40);
    coolFill.position.set(-8, 5, 6);
    scene.add(coolFill);
    const warmFill = new T.PointLight(0xe76f51, 45, 40);
    warmFill.position.set(8, 4, -3);
    scene.add(warmFill);

    // Starfield backdrop.
    const starGeo = new T.BufferGeometry();
    const starPositions = new Float32Array(450 * 3);
    for (let i = 0; i < starPositions.length; i += 3) {
      const radius = 35 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = Math.abs(radius * Math.cos(phi)) - 8;
      starPositions[i + 2] = -Math.abs(radius * Math.sin(phi) * Math.sin(theta)) - 5;
    }
    starGeo.setAttribute("position", new T.BufferAttribute(starPositions, 3));
    scene.add(new T.Points(starGeo, new T.PointsMaterial({ color: 0xbcd0ff, size: 0.09, transparent: true, opacity: 0.8 })));

    const grid = new T.GridHelper(50, 50, 0x33415a, 0x1b2436);
    grid.position.y = -2.6;
    grid.material.transparent = true;
    grid.material.opacity = 0.35;
    scene.add(grid);

    const glowTexture = new T.CanvasTexture(makeGlowTexture());

    // Column banners.
    const [leftLabel, rightLabel] = scenario.columns || ["Stack", "Heap"];
    const leftBanner = makeLabelSprite(T, [leftLabel.toUpperCase()], 0x2d6a4f, 3.4);
    leftBanner.position.set(-4.4, 4.9, 0);
    scene.add(leftBanner);
    const rightBanner = makeLabelSprite(T, [rightLabel.toUpperCase()], 0xe76f51, 3.4);
    rightBanner.position.set(4.4, 4.9, 0);
    scene.add(rightBanner);

    const state = {
      entries: new Map(), // key → { group, kind, targetPos, targetOpacity, materials, dying }
      flows: [],          // { from, to, color, line, dots }
      time: 0,
      pointerX: 0,
      pointerY: 0,
      raf: null,
      disposed: false,
    };

    function entryWorldPos(key) {
      const entry = state.entries.get(key);
      return entry ? entry.group.position : null;
    }

    function fadeMaterials(entry, opacity) {
      entry.targetOpacity = opacity;
    }

    function removeEntry(key, entry) {
      entry.dying = true;
      fadeMaterials(entry, 0);
    }

    function collectMaterials(group) {
      const materials = [];
      group.traverse((node) => {
        if (node.material) {
          node.material.transparent = true;
          materials.push(node.material);
        }
      });
      return materials;
    }

    function buildVarBox(variable) {
      const color = STATE_COLORS[variable.state || "owner"] ?? STATE_COLORS.plain;
      const group = new T.Group();
      const isError = variable.state === "error";

      const box = new T.Mesh(
        new T.BoxGeometry(1.9, 0.55, 1.0),
        new T.MeshStandardMaterial({
          color,
          metalness: 0.35,
          roughness: 0.3,
          emissive: color,
          emissiveIntensity: isError ? 0.7 : 0.3,
          transparent: true,
        }),
      );
      group.add(box);

      const glow = new T.Sprite(new T.SpriteMaterial({ map: glowTexture, color, transparent: true, opacity: 0.4, depthWrite: false }));
      glow.scale.set(2.6, 1.6, 1);
      group.add(glow);

      const label = makeLabelSprite(T, [variable.name, variable.value], color, 3.1);
      label.position.set(0, variable._labelY ?? 1.0, 0.2);
      group.add(label);

      group.userData.spin = isError;
      return group;
    }

    function buildPlatform(frame, varCount) {
      const group = new T.Group();
      const depth = 1.5 + Math.ceil(varCount / 2) * 0.6;
      const slab = new T.Mesh(
        new T.BoxGeometry(5.4, 0.28, depth + 1.2),
        new T.MeshStandardMaterial({
          color: 0x16302b,
          metalness: 0.5,
          roughness: 0.45,
          emissive: 0x2d6a4f,
          emissiveIntensity: frame.state === "closing" ? 0.05 : 0.22,
          transparent: true,
        }),
      );
      group.add(slab);

      const label = makeLabelSprite(T, [frame.frame || "frame"], 0x52b788, 2.9);
      label.position.set(-1.4, 0.02, (depth + 1.2) / 2 + 0.65);
      group.add(label);
      return group;
    }

    function buildCore(block) {
      const freed = block.state === "freed";
      const color = freed ? 0x6d6875 : 0xe76f51;
      const group = new T.Group();

      const core = new T.Mesh(
        new T.IcosahedronGeometry(0.62, 1),
        new T.MeshStandardMaterial({
          color,
          metalness: 0.6,
          roughness: 0.25,
          emissive: color,
          emissiveIntensity: freed ? 0.05 : 0.85,
          wireframe: freed,
          transparent: true,
        }),
      );
      core.userData.bob = !freed;
      group.add(core);

      if (!freed) {
        const glow = new T.Sprite(new T.SpriteMaterial({ map: glowTexture, color: 0xff9b73, transparent: true, opacity: 0.55, depthWrite: false }));
        glow.scale.set(3.2, 3.2, 1);
        group.add(glow);
      }

      const label = makeLabelSprite(T, [block.label || "allocation", block.value], color, 3.4);
      label.position.set(0, 1.35, 0);
      group.add(label);
      return group;
    }

    function clearFlows() {
      state.flows.forEach((flow) => {
        scene.remove(flow.line);
        flow.line.geometry.dispose();
        flow.dots.forEach((dot) => scene.remove(dot));
      });
      state.flows = [];
    }

    function addFlow(fromKey, toKey, stateName) {
      const color = STATE_COLORS[stateName] ?? STATE_COLORS.plain;
      const geometry = new T.BufferGeometry().setFromPoints([new T.Vector3(), new T.Vector3()]);
      const line = new T.Line(geometry, new T.LineBasicMaterial({ color, transparent: true, opacity: 0.45 }));
      scene.add(line);
      const dots = [];
      for (let i = 0; i < 4; i++) {
        const dot = new T.Mesh(
          new T.SphereGeometry(0.09, 8, 8),
          new T.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 }),
        );
        scene.add(dot);
        dots.push(dot);
      }
      state.flows.push({ from: fromKey, to: toKey, line, dots, phase: Math.random() });
    }

    function upsert(key, kind, targetPos, build, restyle) {
      let entry = state.entries.get(key);
      if (entry && entry.kind === kind && !entry.dying) {
        restyle(entry);
      } else {
        if (entry) {
          removeEntry(key, entry);
          state.entries.delete(key);
        }
        const group = build();
        group.position.copy(targetPos);
        group.scale.setScalar(0.01);
        scene.add(group);
        entry = { group, kind, materials: collectMaterials(group), targetOpacity: 1, dying: false };
        state.entries.set(key, entry);
      }
      entry.targetPos = targetPos.clone();
      entry.targetScale = 1;
      return entry;
    }

    function rebuildLabel(entry, lines, color, width, position) {
      const old = entry.group.userData.dynamicLabel;
      if (old) {
        entry.group.remove(old);
        old.material.map.dispose();
        old.material.dispose();
      }
      const label = makeLabelSprite(T, lines, color, width);
      label.position.copy(position);
      entry.group.add(label);
      entry.group.userData.dynamicLabel = label;
      entry.materials = collectMaterials(entry.group);
    }

    function update(step) {
      const seen = new Set();
      clearFlows();

      const frames = step.stack || [];
      let y = 2.3;
      const varAnchors = new Map(); // viz id → key

      frames.forEach((frame, fi) => {
        const vars = frame.vars || [];
        const rows = Math.max(1, Math.ceil(vars.length / 2));
        const frameKey = `f:${fi}:${frame.frame}`;
        seen.add(frameKey);
        const platformPos = new T.Vector3(-4.4, y - rows * 0.35, 0);
        const platformEntry = upsert(frameKey, "frame", platformPos, () => buildPlatform(frame, vars.length), () => {});
        fadeMaterials(platformEntry, frame.state === "closing" ? 0.35 : 1);

        vars.forEach((variable, vi) => {
          const row = Math.floor(vi / 2);
          const col = vi % 2;
          const single = vi === vars.length - 1 && col === 0 && vars.length % 2 === 1;
          const x = -4.4 + (single ? 0 : col === 0 ? -1.35 : 1.35);
          const pos = new T.Vector3(x, platformPos.y + 0.6, row * 1.6 - (rows - 1) * 0.8);
          const varKey = `v:${fi}:${vi}:${variable.name}:${variable.state || "owner"}`;
          seen.add(varKey);
          // Back rows get taller label stalks so they clear the row in front.
          const labelY = 0.95 + (rows - 1 - row) * 0.55;
          const entry = upsert(varKey, "var", pos, () => buildVarBox({ ...variable, _labelY: labelY }), (existing) => {
            rebuildLabel(existing, [variable.name, variable.value], STATE_COLORS[variable.state || "owner"] ?? STATE_COLORS.plain, 3.1, new T.Vector3(0, labelY, 0.2));
          });
          fadeMaterials(entry, FADED_STATES.has(variable.state) ? 0.3 : 1);

          if (variable.id) {
            varAnchors.set(variable.id, varKey);
          }
          if (variable.points) {
            entry.group.userData.points = variable.points;
            entry.group.userData.flowState = variable.state || "owner";
            entry.group.userData.flowKey = varKey;
          } else {
            entry.group.userData.points = null;
          }
        });

        y = platformPos.y - rows * 0.5 - 1.85;
      });

      const blocks = step.heap || [];
      const blockAnchors = new Map();
      let coreY = blocks.length > 2 ? 2.6 : 1.9;
      blocks.forEach((block, bi) => {
        const blockKey = `h:${bi}:${block.label}:${block.state || "alive"}`;
        seen.add(blockKey);
        const pos = new T.Vector3(4.4, coreY, 0);
        const entry = upsert(blockKey, "core", pos, () => buildCore(block), (existing) => {
          rebuildLabel(existing, [block.label || "allocation", block.value], block.state === "freed" ? 0x6d6875 : 0xe76f51, 3.4, new T.Vector3(0, 1.35, 0));
        });
        fadeMaterials(entry, block.state === "freed" ? 0.35 : 1);
        if (block.id) {
          blockAnchors.set(block.id, blockKey);
        }
        coreY -= 2.3;
      });

      // Flows: pointer arrows become traveling energy.
      frames.forEach((frame, fi) => {
        (frame.vars || []).forEach((variable, vi) => {
          if (!variable.points) return;
          const fromKey = `v:${fi}:${vi}:${variable.name}:${variable.state || "owner"}`;
          const toKey = blockAnchors.get(variable.points) || varAnchors.get(variable.points);
          if (toKey && seen.has(fromKey)) {
            addFlow(fromKey, toKey, variable.state || "owner");
          }
        });
      });

      // Anything not seen this step fades out and is removed.
      state.entries.forEach((entry, key) => {
        if (!seen.has(key) && !entry.dying) {
          removeEntry(key, entry);
        }
      });
    }

    function animate() {
      if (state.disposed) return;
      state.raf = requestAnimationFrame(animate);
      state.time += reducedMotion ? 0 : 0.016;
      const t = state.time;

      state.entries.forEach((entry, key) => {
        entry.group.position.lerp(entry.targetPos, 0.1);
        const targetScale = entry.dying ? 0.01 : entry.targetScale;
        const scale = entry.group.scale.x + (targetScale - entry.group.scale.x) * 0.14;
        entry.group.scale.setScalar(scale);
        entry.materials.forEach((material) => {
          material.opacity += (entry.targetOpacity - material.opacity) * 0.12;
        });
        if (entry.dying && scale < 0.05) {
          scene.remove(entry.group);
          state.entries.delete(key);
        }
        entry.group.children.forEach((child) => {
          if (child.userData.bob && !reducedMotion) {
            child.position.y = Math.sin(t * 1.6 + entry.group.position.y) * 0.12;
            child.rotation.y = t * 0.5;
          }
        });
      });

      state.flows.forEach((flow) => {
        const from = entryWorldPos(flow.from);
        const to = entryWorldPos(flow.to);
        if (!from || !to) return;
        const mid = new T.Vector3().addVectors(from, to).multiplyScalar(0.5);
        mid.y += 1.4;
        const curve = new T.QuadraticBezierCurve3(from.clone(), mid, to.clone());
        flow.line.geometry.setFromPoints(curve.getPoints(24));
        flow.dots.forEach((dot, i) => {
          const progress = reducedMotion
            ? (i + 1) / (flow.dots.length + 1)
            : (t * 0.35 + flow.phase + i / flow.dots.length) % 1;
          dot.position.copy(curve.getPoint(progress));
        });
      });

      if (!reducedMotion) {
        camera.position.x += (state.pointerX * 1.6 - camera.position.x) * 0.04;
        camera.position.y += (5.2 + state.pointerY * 0.9 - camera.position.y) * 0.04;
        camera.lookAt(0, 0.6, 0);
      }

      renderer.render(scene, camera);
    }

    function onPointerMove(event) {
      const rect = sceneEl.getBoundingClientRect();
      state.pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      state.pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * -2;
    }

    function onResize() {
      const w = sceneEl.clientWidth || width;
      const h = sceneEl.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    sceneEl.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    animate();

    return {
      update,
      dispose() {
        state.disposed = true;
        if (state.raf) cancelAnimationFrame(state.raf);
        sceneEl.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("resize", onResize);
        clearFlows();
        scene.traverse((node) => {
          node.geometry?.dispose?.();
          if (node.material) {
            node.material.map?.dispose?.();
            node.material.dispose?.();
          }
        });
        renderer.dispose();
        renderer.domElement.remove();
      },
    };
  }

  window.RustViz3D = { mount };
})();
