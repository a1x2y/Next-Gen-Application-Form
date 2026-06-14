/* Next Gen Education — Admission (vanilla JS port, 1:1 visuals) */
(() => {
  "use strict";

  const COURSES = [
    "DIT ( Diploma Of IT )","Microsoft Office","Primavera P6","Web Development",
    "Graphics Designing","Video Editing","TikTok Automation","eBay / Etsy Course","YouTube Automation","Cyber Security",
    "Basic Computer Course","Education Consultancy",
  ];
  const LANGUAGES = [
    "IELTS Preparation","PTE Preperation","Spoken English","German Language",
    "Korean Language","Chinese Language","Arabic Language","Persian Language","Japenese Language",
  ];

  // Mother's name removed per request
  const STEPS = [
    { type: "intro" },
    { type: "photo" },
    { type: "text", key: "fullName",       q: "What is your full name?", placeholder: "Type your name" },
    { type: "text", key: "fatherName",     q: "Father's name", placeholder: "Father's name" },
    { type: "choice", key: "gender",       q: "Gender", options: ["Male","Female","Other"], columns: 3 },
    { type: "text", key: "dob",            q: "Date of birth", input: "date" },
    { type: "text", key: "cnic",           q: "CNIC or B-Form", placeholder: "00000-0000000-0" },
    { type: "text", key: "mobile",         q: "Mobile number", input: "tel", placeholder: "0XXX-XXXXXXX" },
    { type: "text", key: "whatsapp",       q: "WhatsApp number", input: "tel", placeholder: "03XX-XXXXXXX" },
    { type: "text", key: "email",          q: "Email address", input: "email", placeholder: "you@email.com" },
    { type: "text", key: "address",        q: "Current address", input: "textarea", placeholder: "House, street, area" },
    { type: "text", key: "city",           q: "City", placeholder: "City" },
    { type: "choice", key: "qualification",q: "Highest qualification", options: ["Matric","FSC","ICS","ICOM","DAE","BA/BSc","Other"], columns: 3 },
    { type: "text", key: "institution",    q: "School or college name", placeholder: "Institution" },
    { type: "text", key: "passingYear",    q: "Passing year", input: "number", placeholder: "e.g. 2023" },
    { type: "text", key: "marks",          q: "Marks obtained", input: "number", placeholder: "e.g. 850" },
    { type: "text", key: "totalMarks",     q: "Total marks", input: "number", placeholder: "e.g. 1100" },
    { type: "multi", key: "courses",       q: "Choose your courses", sub: "Select one or more programs", options: COURSES, min: 0 },
    { type: "multi", key: "languages",     q: "Choose languages", sub: "Optional — pick any languages you'd like to learn", options: LANGUAGES },
    // Weekend removed; Morning disabled for now
    { type: "choice", key: "batch",        q: "Batch preference", options: ["Morning","Evening"], disabledOptions: ["Morning"], columns: 2 },
    { type: "text", key: "guardianName",   q: "Guardian's name", placeholder: "Guardian name" },
    { type: "text", key: "guardianMobile", q: "Guardian's mobile", input: "tel", placeholder: "03XX-XXXXXXX" },
    { type: "text", key: "emergency",      q: "Emergency contact", input: "tel", placeholder: "03XX-XXXXXXX" },
    { type: "review" },
  ];

  const STORAGE_KEY = "nge_admission_draft_v2";
  const THEME_KEY   = "nge_theme";

  /* -------------- state -------------- */
  const state = {
    data: {},
    step: 0,
    theme: "light",
    hasDraft: false,
    success: null, // {message}
  };

  /* -------------- helpers -------------- */
  const $app = () => document.getElementById("app");
  const h = (tag, attrs = {}, ...children) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
      else if (k === "html") el.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === "checked" || k === "disabled" || k === "autofocus") { if (v) el.setAttribute(k, ""); }
      else if (k.startsWith("data-")) el.setAttribute(k, v);
      else if (k === "ref" && typeof v === "function") v(el);
      else el.setAttribute(k, v);
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      el.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
    }
    return el;
  };

  const update = (k, v) => { state.data[k] = v; persist(); };
  const persist = () => { if (state.step > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: state.data, step: state.step })); };

  const goto = (i) => { state.step = Math.max(0, Math.min(i, STEPS.length - 1)); render(); };
  const next = () => goto(state.step + 1);
  const back = () => goto(state.step - 1);

  const setTheme = (t) => {
    state.theme = t;
    document.documentElement.classList.toggle("dark", t === "dark");
    localStorage.setItem(THEME_KEY, t);
    render();
  };

  const generateApplicantId = () => `NG-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const showSuccess = (message, after, duration = 2300) => {
    state.success = { message };
    render();
    setTimeout(() => {
      const overlay = document.querySelector(".backdrop-blur-overlay");
      if (overlay) overlay.classList.add("is-leaving");
      setTimeout(() => { state.success = null; render(); after && after(); }, 350);
    }, duration);
  };

  /* -------------- top bar -------------- */
  function TopBar() {
    const total = STEPS.length - 1;
    const showProgress = state.step > 0 && state.step < total;
    const progress = state.step === 0 ? 0 : Math.round((state.step / total) * 100);
    return h("header", { class: "sticky top-0 z-20 px-5 py-3.5 backdrop-blur-xl border-b", style: { background: "color-mix(in oklab, var(--background) 60%, transparent)", borderColor: "var(--border)" } },
      h("div", { class: "max-w-5xl mx-auto flex items-center gap-4" },
        h("div", { class: "font-semibold tracking-tight text-[15px]" }, "Next Gen Education"),
        showProgress && h("div", { class: "flex-1 flex items-center gap-3 min-w-0" },
          h("div", { class: "flex-1 h-1 rounded-full overflow-hidden", style: { background: "var(--surface-2)" } },
            h("div", { class: "h-full transition-all duration-500", style: { background: "var(--accent)", width: `${progress}%` } })
          ),
          h("span", { class: "text-xs tabular-nums shrink-0", style: { color: "var(--muted-foreground)" } }, `${state.step}/${total}`),
        ),
        h("div", { class: "ml-auto flex items-center gap-2" },
          h("button", { class: "btn-ghost text-sm", "aria-label": "Toggle theme",
            onClick: () => setTheme(state.theme === "light" ? "dark" : "light") },
            state.theme === "light" ? "🌙" : "☀️"),
        )
      )
    );
  }

  /* -------------- screens -------------- */
  function IntroScreen() {
    return h("div", { class: "text-center py-12" },
      h("h1", { class: "text-5xl sm:text-7xl font-semibold tracking-tighter mb-5 leading-[1.02]" },
        "Next Gen", h("br"),
        h("span", { class: "bg-clip-text text-transparent", style: { backgroundImage: "linear-gradient(to right, var(--accent), oklch(0.65 0.22 320))" } }, "Admission.")
      ),
      h("p", { class: "text-lg sm:text-xl max-w-xl mx-auto mb-10", style: { color: "var(--muted-foreground)" } },
        "Let's get you enrolled in a few simple steps. Designed to be fast, beautiful and effortless."),
      h("div", { class: "flex flex-wrap items-center justify-center gap-3" },
        h("button", { class: "btn-primary", onClick: () => { localStorage.removeItem(STORAGE_KEY); state.data = {}; goto(1); } }, "Start Application →"),
        state.hasDraft && h("button", { class: "btn-secondary", onClick: () => {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) { const p = JSON.parse(raw); state.data = p.data || {}; goto(p.step || 1); }
        } }, "Resume Draft"),
      )
    );
  }

  function StepShell(q, sub, body, footer) {
    return h("div", { class: "py-6" },
      h("h2", { class: "text-3xl sm:text-5xl font-semibold tracking-tighter mb-3 leading-tight" }, q),
      sub && h("p", { class: "text-base mb-8", style: { color: "var(--muted-foreground)" } }, sub),
      h("div", { class: "mb-8" }, body),
      footer
    );
  }

  function NavRow({ onBack, onNext, onSkip, nextDisabled, nextLabel = "Continue" }) {
    return h("div", { class: "flex flex-wrap items-center gap-3 mt-6" },
      onBack && h("button", { class: "btn-ghost", onClick: onBack }, "← Back"),
      h("div", { class: "flex-1" }),
      onSkip && h("button", { class: "btn-ghost", onClick: onSkip }, "Skip"),
      onNext && h("button", { class: "btn-primary", disabled: nextDisabled, onClick: onNext }, nextLabel),
    );
  }

  function TextStep(step) {
    let inputEl;
    const onKey = (e) => { 
      if (step.input === "number" && !/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Tab") {
        e.preventDefault();
        return;
      }
      if (e.key === "Enter" && step.input !== "textarea") { 
        e.preventDefault(); 
        const val = (inputEl.value || "").trim();
        if (step.key === "cnic" && val !== "" && !/^\d{5}-\d{7}-\d{1}$/.test(val)) return;
        if ((step.key === "mobile" || step.key === "whatsapp" || step.key === "guardianMobile" || step.key === "emergency") && val !== "" && !/^03\d{2}-\d{7}$/.test(val)) return;
        next(); 
      } 
    };
    const setVal = (v) => {
      if (step.key === "cnic") {
        let digits = v.replace(/\D/g, "");
        if (digits.length > 13) digits = digits.substring(0, 13);
        let formatted = "";
        if (digits.length > 0) formatted += digits.substring(0, Math.min(digits.length, 5));
        if (digits.length > 5) formatted += "-" + digits.substring(5, Math.min(digits.length, 12));
        if (digits.length > 12) formatted += "-" + digits.substring(12, 13);
        inputEl.value = formatted;
        update(step.key, formatted);
      } else if (step.key === "mobile" || step.key === "whatsapp" || step.key === "guardianMobile" || step.key === "emergency") {
        let digits = v.replace(/\D/g, "");
        if (digits.length > 11) digits = digits.substring(0, 11);
        let formatted = "";
        if (digits.length > 0) formatted += digits.substring(0, Math.min(digits.length, 4));
        if (digits.length > 4) formatted += "-" + digits.substring(4);
        inputEl.value = formatted;
        update(step.key, formatted);
      } else {
        update(step.key, v);
      }
      renderNextBtn();
    };
    const renderNextBtn = () => {
      const nextBtn = document.querySelector(".btn-primary");
      if (!nextBtn) return;
      const val = (inputEl.value || "").trim();
      let invalid = false;
      if (step.key === "cnic" && val !== "" && !/^\d{5}-\d{7}-\d{1}$/.test(val)) invalid = true;
      if ((step.key === "mobile" || step.key === "whatsapp" || step.key === "guardianMobile" || step.key === "emergency") && val !== "" && !/^03\d{2}-\d{7}$/.test(val)) invalid = true;
      if (invalid) nextBtn.setAttribute("disabled", ""); else nextBtn.removeAttribute("disabled");
    };
    const body = step.input === "textarea"
      ? h("textarea", { class: "field", style: { minHeight: "120px", resize: "none" }, placeholder: step.placeholder || "", onInput: (e) => setVal(e.target.value), onKeydown: onKey, ref: (el) => inputEl = el }, state.data[step.key] || "")
      : (() => {
          const el = h("input", { type: step.input === "number" ? "text" : (step.input || "text"), class: "field", placeholder: step.placeholder || "", onInput: (e) => setVal(e.target.value), onKeydown: onKey, ref: (el) => inputEl = el });
          el.value = state.data[step.key] || "";
          return el;
        })();
    setTimeout(() => { if (inputEl) { inputEl.focus(); renderNextBtn(); } }, 100);
    return StepShell(step.q, step.sub, body, NavRow({ onBack: back, onNext: () => {
      const val = (inputEl.value || "").trim();
      if (step.key === "cnic" && val !== "" && !/^\d{5}-\d{7}-\d{1}$/.test(val)) return;
      if ((step.key === "mobile" || step.key === "whatsapp" || step.key === "guardianMobile" || step.key === "emergency") && val !== "" && !/^03\d{2}-\d{7}$/.test(val)) return;
      next();
    }, onSkip: next }));
  }

  function ChoiceStep(step) {
    const value = state.data[step.key] || "";
    const disabled = new Set(step.disabledOptions || []);
    const body = h("div", { class: "grid gap-3", style: { gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gridAutoRows: "1fr" } },
      step.options.map((o) => h("button", {
        class: "option-card text-base",
        "data-selected": value === o ? "true" : "false",
        disabled: disabled.has(o),
        title: disabled.has(o) ? "Currently unavailable" : "",
        onClick: () => { if (disabled.has(o)) return; update(step.key, o); setTimeout(next, 220); },
      }, o + (disabled.has(o) ? " (unavailable)" : "")))
    );
    return StepShell(step.q, step.sub, body, NavRow({ onBack: back, onSkip: next }));
  }

  function MultiStep(step) {
    const value = (state.data[step.key] || []).slice();
    let query = "";
    const wrap = h("div");

    const renderInner = () => {
      wrap.innerHTML = "";
      const filtered = step.options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));
      const toggle = (o) => {
        const i = value.indexOf(o);
        if (i >= 0) value.splice(i, 1); else value.push(o);
        update(step.key, value.slice());
        renderInner();
      };

      wrap.appendChild(
        StepShell(step.q, step.sub,
          h("div", {},
            (() => {
              const inp = h("input", {
                placeholder: "Search…",
                class: "w-full mb-4 px-5 py-3 rounded-2xl glass text-base outline-none transition",
                onInput: (e) => { query = e.target.value; renderInner(); },
              });
              inp.value = query;
              setTimeout(() => inp.focus(), 60);
              return inp;
            })(),
            value.length > 0 && h("div", { class: "flex flex-wrap gap-2 mb-5 pop-in" },
              value.map((v) => h("span", { class: "chip" }, v,
                h("button", { class: "ml-1 opacity-60 hover:opacity-100", "aria-label": `Remove ${v}`, onClick: () => toggle(v) }, "×")
              ))
            ),
            h("div", { class: "grid gap-3 overflow-y-auto pr-1", style: { gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", maxHeight: "55vh" } },
              filtered.length === 0
                ? [h("div", { class: "text-sm", style: { color: "var(--muted-foreground)" } }, "No results.")]
                : filtered.map((o) => {
                    const selected = value.includes(o);
                    const btn = h("button", { class: "option-card text-sm", "data-selected": selected ? "true" : "false", onClick: () => toggle(o) },
                      h("span", { class: "absolute top-2.5 right-3 w-5 h-5 rounded-full border-2 grid place-items-center text-[11px]",
                        style: {
                          borderColor: selected ? "var(--accent)" : "var(--border)",
                          background: selected ? "var(--accent)" : "transparent",
                          color: "white",
                        } }, selected ? "✓" : ""),
                      o
                    );
                    return btn;
                  })
            )
          ),
          h("div", { class: "flex flex-wrap items-center gap-3 mt-6" },
            h("button", { class: "btn-ghost", onClick: back }, "← Back"),
            h("div", { class: "flex-1 text-xs hidden sm:block", style: { color: "var(--muted-foreground)" } }, `${value.length} selected`),
            h("button", { class: "btn-ghost", onClick: next }, "Skip"),
            h("button", { class: "btn-primary", onClick: () => showSuccess(`${step.key === "courses" ? "Courses" : "Languages"} saved`, next, 2300) },
              value.length > 0 ? `Continue (${value.length})` : "Continue"),
          )
        )
      );
    };
    renderInner();
    return wrap;
  }

  /* -------------- Photo, Camera, Crop -------------- */
  function PhotoStep() {
    const value = state.data.photo;
    let fileInput;

    const setPhoto = (v) => { update("photo", v); render(); };

    const onFile = (f) => {
      if (!f) return;
      const r = new FileReader();
      r.onload = () => openCrop(r.result);
      r.readAsDataURL(f);
    };

    const body = value
      ? h("div", { class: "flex flex-col items-center gap-5 pop-in" },
          h("img", { src: value, alt: "Preview", class: "w-48 h-48 object-cover rounded-3xl shadow-2xl ring-1", style: { ringColor: "var(--border)" } }),
          h("button", { class: "btn-secondary text-sm", onClick: () => setPhoto("") }, "Replace photo"),
        )
      : h("div", { class: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
          h("button", { class: "option-card aspect-[4/3]", onClick: openCamera },
            h("span", { class: "text-4xl" }, "📷"),
            h("span", { class: "text-lg font-semibold" }, "Use Camera"),
            h("span", { class: "text-xs", style: { color: "var(--muted-foreground)" } }, "Take photo in-app"),
          ),
          h("button", { class: "option-card aspect-[4/3]", onClick: () => fileInput.click() },
            h("span", { class: "text-4xl" }, "🖼️"),
            h("span", { class: "text-lg font-semibold" }, "Browse Photos"),
            h("span", { class: "text-xs", style: { color: "var(--muted-foreground)" } }, "Upload from device"),
          ),
          (fileInput = h("input", { type: "file", accept: "image/*", class: "hidden", style: { display: "none" }, onChange: (e) => onFile(e.target.files[0]) })),
        );

    const footer = h("div", { class: "flex items-center justify-between mt-6" },
      h("button", { class: "btn-ghost", onClick: next }, "Skip"),
      h("button", { class: "btn-primary", disabled: !value, onClick: () => showSuccess("Photo saved", next, 2300) }, "Continue")
    );

    function openCamera() {
      const modal = h("div", { class: "fixed inset-0 z-50 grid place-items-center p-4 fade-in",
        style: { background: "oklch(0 0 0 / 0.5)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" } });
      let stream;
      const errEl = h("div", { class: "absolute inset-0 grid place-items-center text-white text-sm p-6 text-center", style: { display: "none" } });
      const video = h("video", { autoplay: "", playsinline: "", muted: "", class: "w-full h-full object-cover", style: { transform: "scaleX(-1)" } });
      const captureBtn = h("button", { class: "btn-primary", disabled: true, onClick: () => {
        const size = Math.min(video.videoWidth, video.videoHeight);
        const sx = (video.videoWidth - size) / 2, sy = (video.videoHeight - size) / 2;
        const c = document.createElement("canvas");
        c.width = 720; c.height = 720;
        const ctx = c.getContext("2d");
        ctx.translate(c.width, 0); ctx.scale(-1, 1);
        ctx.drawImage(video, sx, sy, size, size, 0, 0, 720, 720);
        close();
        openCrop(c.toDataURL("image/jpeg", 0.92));
      } }, "Capture");
      const close = () => { stream && stream.getTracks().forEach((t) => t.stop()); modal.remove(); };

      modal.appendChild(h("div", { class: "glass-strong rounded-[28px] p-5 sm:p-6 w-full max-w-md pop-in" },
        h("div", { class: "flex items-center justify-between mb-4" },
          h("div", { class: "font-semibold text-lg" }, "Take a photo"),
          h("button", { class: "btn-ghost text-sm", onClick: close }, "Close")
        ),
        h("div", { class: "relative rounded-2xl overflow-hidden bg-black aspect-square" }, video, errEl,
          h("div", { class: "absolute inset-0 pointer-events-none ring-2 rounded-2xl", style: { boxShadow: "0 0 0 2px oklch(1 0 0 / 0.3) inset" } })
        ),
        h("div", { class: "flex items-center justify-center gap-4 mt-5" },
          h("button", { class: "btn-ghost", onClick: close }, "Cancel"), captureBtn
        )
      ));
      document.body.appendChild(modal);

      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } }, audio: false })
        .then((s) => {
          stream = s; video.srcObject = s;
          video.onloadedmetadata = () => { captureBtn.disabled = false; };
        })
        .catch((e) => { errEl.style.display = "grid"; errEl.textContent = e?.message || "Camera unavailable"; });
    }

    function openCrop(src) {
      const BOX = 280;
      let imgW = 0, imgH = 0, scale = 1, ox = 0, oy = 0;
      let drag = null;

      const img = h("img", { src, alt: "", draggable: "false", class: "absolute top-1/2 left-1/2 max-w-none" });
      const range = h("input", { type: "range", min: "0.1", max: "4", step: "0.001", class: "flex-1", style: { accentColor: "var(--accent)" } });

      const apply = () => {
        img.style.width = (imgW * scale) + "px";
        img.style.height = (imgH * scale) + "px";
        img.style.transform = `translate(calc(-50% + ${ox}px), calc(-50% + ${oy}px))`;
      };

      img.onload = () => {
        imgW = img.naturalWidth; imgH = img.naturalHeight;
        const minScale = BOX / Math.min(imgW, imgH);
        range.min = minScale; range.max = minScale * 4; range.value = minScale;
        scale = minScale; ox = 0; oy = 0; apply();
      };
      range.addEventListener("input", () => { scale = parseFloat(range.value); apply(); });

      const cropBox = h("div", { class: "relative mx-auto rounded-3xl overflow-hidden bg-black touch-none select-none",
        style: { width: BOX + "px", height: BOX + "px", cursor: "grab" },
        onPointerdown: (e) => { e.target.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, ox, oy }; },
        onPointermove: (e) => { if (!drag) return; ox = drag.ox + (e.clientX - drag.x); oy = drag.oy + (e.clientY - drag.y); apply(); },
        onPointerup: () => { drag = null; }, onPointercancel: () => { drag = null; },
      }, img, h("div", { class: "absolute inset-0 pointer-events-none rounded-3xl", style: { boxShadow: "0 0 0 2px oklch(1 0 0 / 0.4) inset" } }));

      const modal = h("div", { class: "fixed inset-0 z-50 grid place-items-center p-4 fade-in",
        style: { background: "oklch(0 0 0 / 0.5)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" } });
      const close = () => modal.remove();
      const confirm = () => {
        const OUT = 640;
        const c = document.createElement("canvas"); c.width = OUT; c.height = OUT;
        const ctx = c.getContext("2d");
        const renderedW = imgW * scale, renderedH = imgH * scale;
        const imgLeft = (BOX - renderedW) / 2 + ox;
        const imgTop = (BOX - renderedH) / 2 + oy;
        const sx = (-imgLeft) / scale, sy = (-imgTop) / scale, sSize = BOX / scale;
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, OUT, OUT);
        ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, OUT, OUT);
        close();
        setPhoto(c.toDataURL("image/jpeg", 0.9));
      };
      modal.appendChild(h("div", { class: "glass-strong rounded-[28px] p-5 sm:p-6 w-full max-w-md pop-in" },
        h("div", { class: "flex items-center justify-between mb-4" },
          h("div", { class: "font-semibold text-lg" }, "Adjust photo"),
          h("button", { class: "btn-ghost text-sm", onClick: close }, "Cancel")
        ),
        cropBox,
        h("div", { class: "mt-5 flex items-center gap-3" },
          h("span", { class: "text-xs", style: { color: "var(--muted-foreground)" } }, "Zoom"),
          range
        ),
        h("div", { class: "flex items-center justify-end gap-3 mt-5" },
          h("button", { class: "btn-ghost", onClick: close }, "Cancel"),
          h("button", { class: "btn-primary", onClick: confirm }, "Use Photo"),
        )
      ));
      document.body.appendChild(modal);
    }

    return StepShell("Let's begin with your photo.", "A clear face photo helps us prepare your ID.", body, footer);
  }

  /* -------------- Review -------------- */
  function ReviewStep() {
    // step indices must match STEPS positions (after removing mother)
    const fields = [
      { label: "Full Name",       val: state.data.fullName || "",       step: 2 },
      { label: "Father",          val: state.data.fatherName || "",     step: 3 },
      { label: "Gender",          val: state.data.gender || "",         step: 4 },
      { label: "Date of Birth",   val: state.data.dob || "",            step: 5 },
      { label: "CNIC / B-Form",   val: state.data.cnic || "",           step: 6 },
      { label: "Mobile",          val: state.data.mobile || "",         step: 7 },
      { label: "WhatsApp",        val: state.data.whatsapp || "",       step: 8 },
      { label: "Email",           val: state.data.email || "",          step: 9 },
      { label: "Address",         val: state.data.address || "",        step: 10 },
      { label: "City",            val: state.data.city || "",           step: 11 },
      { label: "Qualification",   val: state.data.qualification || "",  step: 12 },
      { label: "Institution",     val: state.data.institution || "",    step: 13 },
      { label: "Passing Year",    val: state.data.passingYear || "",    step: 14 },
      { label: "Marks",           val: state.data.marks || "",          step: 15 },
      { label: "Total Marks",     val: state.data.totalMarks || "",     step: 16 },
      { label: "Batch",           val: state.data.batch || "",          step: 19 },
      { label: "Guardian Name",   val: state.data.guardianName || "",   step: 20 },
      { label: "Guardian Mobile", val: state.data.guardianMobile || "", step: 21 },
      { label: "Emergency",       val: state.data.emergency || "",      step: 22 },
    ];
    const filled = fields.filter((f) => f.val).length;
    const pct = Math.round((filled / fields.length) * 100);
    const onEdit = (i) => goto(i);
    const d = state.data;

    return h("div", { class: "py-4" },
      h("h2", { class: "text-4xl sm:text-5xl font-semibold tracking-tighter mb-3" }, "Review your application."),
      h("p", { class: "mb-8", style: { color: "var(--muted-foreground)" } }, "Take one last look before we generate your admission form."),

      h("div", { class: "glass rounded-3xl p-6 sm:p-8 mb-6" },
        h("div", { class: "flex items-center gap-5 mb-6" },
          d.photo
            ? h("img", { src: d.photo, alt: "", class: "w-20 h-20 rounded-2xl object-cover ring-1" })
            : h("div", { class: "w-20 h-20 rounded-2xl grid place-items-center text-2xl", style: { background: "var(--surface-2)" } }, "👤"),
          h("div", { class: "flex-1 min-w-0" },
            h("div", { class: "text-xl font-semibold truncate" }, d.fullName || "Applicant"),
            h("div", { class: "text-sm truncate", style: { color: "var(--muted-foreground)" } },
              `${(d.courses?.length || 0) + (d.languages?.length || 0)} programs · ${d.batch || "—"}`)
          ),
          h("div", { class: "text-right" },
            h("div", { class: "text-3xl font-semibold tabular-nums" }, `${pct}%`),
            h("div", { class: "text-xs", style: { color: "var(--muted-foreground)" } }, "Completed"),
          )
        ),

        ((d.courses?.length || d.languages?.length) ? h("div", { class: "mb-6 space-y-3" },
          d.courses?.length ? h("div", {},
            h("div", { class: "text-xs uppercase tracking-wider font-semibold mb-2", style: { color: "var(--muted-foreground)" } }, "Courses"),
            h("div", { class: "flex flex-wrap gap-2" }, d.courses.map((c) => h("span", { class: "chip" }, c)))
          ) : null,
          d.languages?.length ? h("div", {},
            h("div", { class: "text-xs uppercase tracking-wider font-semibold mb-2", style: { color: "var(--muted-foreground)" } }, "Languages"),
            h("div", { class: "flex flex-wrap gap-2" }, d.languages.map((c) => h("span", { class: "chip" }, c)))
          ) : null,
          h("button", { class: "text-xs hover:underline", style: { color: "var(--accent)" }, onClick: () => onEdit(17) }, "Edit selections"),
        ) : null),

        h("div", { class: "grid sm:grid-cols-2 gap-x-6" },
          fields.map((f) => h("button", { class: "group text-left flex justify-between items-center py-2.5 border-b gap-3",
            style: { borderColor: "var(--border)" }, onClick: () => onEdit(f.step) },
            h("div", { class: "min-w-0" },
              h("div", { class: "text-xs", style: { color: "var(--muted-foreground)" } }, f.label),
              f.val
                ? h("div", { class: "text-sm font-medium truncate" }, f.val)
                : h("div", { class: "text-sm font-medium truncate italic", style: { color: "var(--muted-foreground)" } }, "Not provided"),
            ),
            h("span", { class: "opacity-0 group-hover:opacity-100 text-xs transition shrink-0", style: { color: "var(--accent)" } }, "Edit"),
          ))
        )
      ),

      h("div", {
        class: "mb-4 rounded-2xl flex items-center justify-between p-4 border tracking-tight pop-in",
        style: {
          background: "color-mix(in oklab, var(--accent) 8%, var(--background))",
          borderColor: "color-mix(in oklab, var(--accent) 35%, transparent)"
        }
      },
        h("div", { class: "flex items-center gap-3" },
          h("span", { class: "text-xl" }, "📝"),
          h("div", {},
            h("div", { class: "text-sm font-semibold", style: { color: "var(--accent)" } }, "Hard Copy Submission Required"),
            h("div", { class: "text-xs opacity-75", style: { color: "var(--muted-foreground)" } }, "Secure your spot! Candidates must submit a printed hard copy of the generated form at Next Gen.")
          )
        )
      ),

      h("div", {
        class: "mb-5 rounded-2xl flex items-center justify-between p-4 border tracking-tight pop-in",
        style: {
          background: "color-mix(in oklab, #10b981 8%, var(--background))",
          borderColor: "color-mix(in oklab, #10b981 35%, transparent)"
        }
      },
        h("div", { class: "flex items-center gap-3" },
          h("span", { class: "text-xl" }, "💵"),
          h("div", {},
            h("div", { class: "text-sm font-semibold text-emerald-600 dark:text-emerald-400" }, "Admission Form Processing Fee"),
            h("div", { class: "text-xs opacity-75", style: { color: "var(--muted-foreground)" } }, "Free")
          )
        ),
        h("div", { class: "text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums" }, "PKR 0")
      ),

      h("div", { class: "flex flex-wrap items-center gap-3" },
        h("button", { class: "btn-ghost", onClick: back }, "← Back"),
        h("div", { class: "flex-1" }),
        h("button", { class: "btn-primary", onClick: onSubmit }, "Generate Admission Form ↓"),
      )
    );
  }

  function onSubmit() {
    const id = state.data.applicantId || generateApplicantId();
    state.data.applicantId = id; persist();
    showSuccess("Admission form generated", () => generatePDF(state.data), 2400);
  }

  /* -------------- Success overlay -------------- */
  function SuccessOverlay() {
    const circle = h("circle", { class: "faceid-circle", cx: "50", cy: "50", r: "46" });
    const check  = h("path",   { class: "faceid-checkmark", d: "M31 52 L44 65 L70 36" });
    // SVG needs the SVG namespace — recreate via createElementNS:
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "faceid-svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    const c2 = document.createElementNS(svgNS, "circle");
    c2.setAttribute("class", "faceid-circle"); c2.setAttribute("cx", "50"); c2.setAttribute("cy", "50"); c2.setAttribute("r", "46");
    const p2 = document.createElementNS(svgNS, "path");
    p2.setAttribute("class", "faceid-checkmark"); p2.setAttribute("d", "M31 52 L44 65 L70 36");
    svg.appendChild(c2); svg.appendChild(p2);

    const TIMING = { circleForward: 600, checkmarkForward: 350, hold: 900, checkmarkReverse: 300, circleReverse: 500 };
    setTimeout(() => {
      c2.style.setProperty("--duration", `${TIMING.circleForward}ms`);
      c2.classList.add("animate-forward");
    }, 0);
    setTimeout(() => {
      p2.style.setProperty("--duration", `${TIMING.checkmarkForward}ms`);
      p2.classList.add("animate-forward");
    }, TIMING.circleForward);
    const totalForward = TIMING.circleForward + TIMING.checkmarkForward;
    setTimeout(() => {
      p2.style.setProperty("--duration", `${TIMING.checkmarkReverse}ms`);
      p2.classList.remove("animate-forward");
      setTimeout(() => {
        c2.style.setProperty("--duration", `${TIMING.circleReverse}ms`);
        c2.classList.remove("animate-forward");
      }, TIMING.checkmarkReverse);
    }, totalForward + TIMING.hold);

    return h("div", { class: "backdrop-blur-overlay" },
      h("div", { class: "faceid-card slide-in" },
        h("div", { class: "faceid-anim" }, svg),
        h("div", { class: "faceid-message" }, state.success.message),
      )
    );
  }

  /* -------------- PDF (html2canvas-pro + jsPDF, auto-download) -------------- */
  const PDF_STYLES = `
    .ng-pdf { font-family: -apple-system, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif; color: #1c1c1e; line-height: 1.4; -webkit-font-smoothing: antialiased; }
    .ng-pdf .ng-pdf * { box-sizing: border-box; margin: 0; padding: 0; }
    .ng-pdf .form-page { background:#fff; width:850px; min-height:1180px; padding:50px 60px 70px; position:relative; display:flex; flex-direction:column; }
    .ng-pdf .form-content { flex:1; }
    .ng-pdf .header-container { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #111; padding-bottom:16px; margin-bottom:25px; gap:20px; }
    .ng-pdf .institution-info { flex:1; }
    .ng-pdf .institution-info h1 { font-size:22px; font-weight:700; color:#111; letter-spacing:-0.5px; text-transform:uppercase; margin-bottom:4px; }
    .ng-pdf .institution-info p { font-size:13px; color:#636366; font-weight:400; }
    .ng-pdf .institution-info .address-line { margin-top:6px; font-size:11px; color:#636366; line-height:1.5; }
    .ng-pdf .meta-info { text-align:right; font-size:13px; white-space:nowrap; flex-shrink:0; }
    .ng-pdf .meta-info div { margin-bottom:6px; }
    .ng-pdf .meta-label { font-weight:600; color:#555; }
    .ng-pdf .document-title-bar { border:1px solid #111; color:#111; text-align:center; padding:8px; font-size:14px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:25px; }
    .ng-pdf .profile-container { display:flex; gap:25px; align-items:flex-start; }
    .ng-pdf .personal-info-block { flex:1; }
    .ng-pdf .photo-placement-box { width:130px; height:130px; border:1.5px dashed #a1a1aa; background:#f8fafc; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:6px; color:#636366; font-size:10px; font-weight:600; border-radius:4px; flex-shrink:0; overflow:hidden; }
    .ng-pdf .photo-placement-box img { width:100%; height:100%; object-fit:cover; border-radius:3px; }
    .ng-pdf .photo-placement-box span { margin-top:4px; font-size:8px; text-transform:uppercase; letter-spacing:0.5px; color:#a1a1aa; font-weight:500; }
    .ng-pdf .section-title { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#111; background:#f2f2f7; padding:6px 10px; margin:22px 0 12px; }
    .ng-pdf .data-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:12px 20px; }
    .ng-pdf .grid-item { display:flex; flex-direction:column; }
    .ng-pdf .grid-item.col-2 { grid-column:span 2; }
    .ng-pdf .grid-item.col-3 { grid-column:span 3; }
    .ng-pdf .grid-item.col-4 { grid-column:span 4; }
    .ng-pdf .label { font-size:10px; text-transform:uppercase; letter-spacing:0.5px; color:#636366; font-weight:600; margin-bottom:4px; }
    .ng-pdf .value-box { border-bottom:1px solid #cbd5e1; padding:4px 0 6px; font-size:14px; font-weight:500; min-height:24px; word-break:break-word; }
    .ng-pdf .word-style-table { width:100%; border-collapse:collapse; margin-top:5px; border:1px solid #7f8c8d; }
    .ng-pdf .word-style-table th { background:#f8fafc; color:#111; font-size:11px; text-transform:uppercase; font-weight:700; text-align:left; padding:10px; border:1px solid #7f8c8d; }
    .ng-pdf .word-style-table td { padding:10px; font-size:13px; font-weight:500; border:1px solid #7f8c8d; }
    .ng-pdf .word-style-table tr:nth-child(even) { background:#fafafa; }
    .ng-pdf .word-style-table td.index-col { width:60px; text-align:center; color:#1c1c1e; font-weight:600; }
    .ng-pdf .declaration-box { padding:5px 0; margin-top:10px; }
    .ng-pdf .declaration-statement { display:flex; align-items:flex-start; margin-bottom:12px; font-size:12px; color:#1c1c1e; line-height:1.5; }
    .ng-pdf .declaration-statement .bullet { margin-right:10px; font-size:14px; line-height:12px; color:#555; }
    .ng-pdf .signature-container { display:grid; grid-template-columns:repeat(3, 1fr); gap:50px; margin-top:50px; text-align:center; }
    .ng-pdf .sig-box { border-top:1px solid #1c1c1e; padding-top:8px; font-size:11px; text-transform:uppercase; font-weight:600; letter-spacing:0.5px; color:#636366; }
    .ng-pdf .page-footer-wrapper { display:flex; justify-content:space-between; align-items:center; border-top:1px solid #e5e5ea; padding-top:15px; margin-top:30px; }
    .ng-pdf .footer-branding { font-size:10px; font-weight:500; color:#636366; letter-spacing:0.3px; }
    .ng-pdf .footer-branding span { color:#aeaeb2; margin:0 6px; }
    .ng-pdf .page-badge { background:#f2f2f7; color:#1c1c1e; padding:4px 10px; font-size:10px; font-weight:600; border-radius:12px; border:1px solid #e5e5ea; letter-spacing:0.5px; }
  `;

  function esc(v) {
    const s = (v == null || v === "") ? "" : String(v);
    return s.replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m]));
  }

  function buildPdfDom(d) {
    const dateStr = new Date().toLocaleDateString("en-GB");
    const appId = d.applicantId || generateApplicantId();
    const marksNum = Number(d.marks), totalNum = Number(d.totalMarks);
    const pct = (marksNum && totalNum) ? ((marksNum / totalNum) * 100).toFixed(2) + "%" : "—";
    const val = (v) => esc(v && String(v).trim() ? v : "—");
    const marks = (d.marks || d.totalMarks) ? `${esc(d.marks || "—")} / ${esc(d.totalMarks || "—")}` : "—";
    const courses = Array.isArray(d.courses) ? d.courses : [];
    const languages = Array.isArray(d.languages) ? d.languages : [];

    const photoHTML = d.photo
      ? `<img src="${esc(d.photo)}" alt="Applicant Photo"/>`
      : `AFFIX PHOTO<span>Passport Size<br/>Blue Background</span>`;

    const courseRows = courses.length
      ? courses.map((c, i) => `<tr><td class="index-col">${i + 1}</td><td>${esc(c)}</td></tr>`).join("")
      : `<tr><td class="index-col">—</td><td><em style="color:#94a3b8">No courses selected</em></td></tr>`;

    const languageRows = languages.length
      ? languages.map((c, i) => `<tr><td class="index-col">${i + 1}</td><td>${esc(c)}</td></tr>`).join("")
      : `<tr><td class="index-col">—</td><td><em style="color:#94a3b8">No languages selected</em></td></tr>`;

    const page1 = `
      <div class="form-page">
        <div class="form-content">
          <div class="header-container">
            <div class="institution-info">
              <h1>Next Gen Education System</h1>
              <p>Learn. Grow. Succeed.</p>
              <div class="address-line">
                Main National Park Road, Gulistan Colony, Rawalpindi, Pakistan<br/>
                Phone: 0337-48000-21
              </div>
            </div>
            <div class="meta-info">
              <div><span class="meta-label">Applicant ID:</span> ${esc(appId)}</div>
              <div><span class="meta-label">Date:</span> ${esc(dateStr)}</div>
            </div>
          </div>

          <div class="document-title-bar">Admission Form</div>

          <div class="section-title">Personal Information</div>
          <div class="profile-container">
            <div class="personal-info-block">
              <div class="data-grid">
                <div class="grid-item col-2"><div class="label">Full Name</div><div class="value-box">${val(d.fullName)}</div></div>
                <div class="grid-item col-2"><div class="label">Father's Name</div><div class="value-box">${val(d.fatherName)}</div></div>
                <div class="grid-item col-2"><div class="label">Gender</div><div class="value-box">${val(d.gender)}</div></div>
                <div class="grid-item col-2"><div class="label">Date of Birth</div><div class="value-box">${val(d.dob)}</div></div>
              </div>
            </div>
            <div class="photo-placement-box">${photoHTML}</div>
          </div>

          <div class="data-grid" style="margin-top:14px;">
            <div class="grid-item col-4"><div class="label">CNIC / B-Form Number</div><div class="value-box">${val(d.cnic)}</div></div>
          </div>

          <div class="section-title">Contact Details</div>
          <div class="data-grid">
            <div class="grid-item col-2"><div class="label">Mobile Number</div><div class="value-box">${val(d.mobile)}</div></div>
            <div class="grid-item col-2"><div class="label">WhatsApp Number</div><div class="value-box">${val(d.whatsapp)}</div></div>
            <div class="grid-item col-2"><div class="label">Email Address</div><div class="value-box">${val(d.email)}</div></div>
            <div class="grid-item col-2"><div class="label">City</div><div class="value-box">${val(d.city)}</div></div>
            <div class="grid-item col-4"><div class="label">Permanent Address</div><div class="value-box">${val(d.address)}</div></div>
          </div>

          <div class="section-title">Academic Background</div>
          <div class="data-grid">
            <div class="grid-item col-2"><div class="label">Qualification</div><div class="value-box">${val(d.qualification)}</div></div>
            <div class="grid-item col-2"><div class="label">Institution</div><div class="value-box">${val(d.institution)}</div></div>
            <div class="grid-item"><div class="label">Passing Year</div><div class="value-box">${val(d.passingYear)}</div></div>
            <div class="grid-item col-2"><div class="label">Marks Obtained</div><div class="value-box">${marks}</div></div>
            <div class="grid-item"><div class="label">Percentage</div><div class="value-box">${esc(pct)}</div></div>
          </div>

          <div class="section-title">Guardian &amp; Emergency Contact</div>
          <div class="data-grid">
            <div class="grid-item col-2"><div class="label">Guardian Name</div><div class="value-box">${val(d.guardianName)}</div></div>
            <div class="grid-item"><div class="label">Guardian Mobile</div><div class="value-box">${val(d.guardianMobile)}</div></div>
            <div class="grid-item"><div class="label">Emergency Contact</div><div class="value-box">${val(d.emergency)}</div></div>
          </div>
        </div>

        <div class="page-footer-wrapper">
          <div class="footer-branding">Next Gen Education System <span>•</span> Learn. Grow. Succeed.</div>
          <div class="page-badge">PAGE 1 OF 2</div>
        </div>
      </div>`;

    const page2 = `
      <div class="form-page">
        <div class="form-content">
          <div class="header-container">
            <div class="institution-info">
              <h1>Next Gen Education System</h1>
              <p>Admission Application Form Supplement</p>
            </div>
            <div class="meta-info">
              <div><span class="meta-label">Applicant ID:</span> ${esc(appId)}</div>
            </div>
          </div>

          <div class="section-title">Selected Courses</div>
          <table class="word-style-table">
            <thead><tr><th style="width:60px;">Sr. No.</th><th>Program / Selected Course</th></tr></thead>
            <tbody>${courseRows}</tbody>
          </table>

          <div class="section-title">Selected Languages</div>
          <table class="word-style-table">
            <thead><tr><th style="width:60px;">Sr. No.</th><th>Program / Selection</th></tr></thead>
            <tbody>${languageRows}</tbody>
          </table>

          <div class="section-title">Batch Preference</div>
          <div class="data-grid">
            <div class="grid-item col-4"><div class="label">Preferred Batch / Timing</div><div class="value-box">${val(d.batch)}</div></div>
          </div>

          <div class="section-title">Declaration Statements</div>
          <div class="declaration-box">
            <div class="declaration-statement"><span class="bullet">▪</span>I hereby declare that the information provided above is true and correct to the best of my knowledge.</div>
            <div class="declaration-statement"><span class="bullet">▪</span>I agree to abide by all rules, regulations, and policies of Next Gen Education System.</div>
            <div class="declaration-statement"><span class="bullet">▪</span>I understand that any false information may lead to cancellation of admission without refund.</div>
          </div>

          <div class="signature-container">
            <div class="sig-box">Student Signature</div>
            <div class="sig-box">Guardian Signature</div>
            <div class="sig-box">Admission Officer</div>
          </div>
        </div>

        <div class="page-footer-wrapper">
          <div class="footer-branding">Next Gen Education System <span>•</span> Learn. Grow. Succeed.</div>
          <div class="page-badge">PAGE 2 OF 2</div>
        </div>
      </div>`;

    return { appId, html: `<style>${PDF_STYLES}</style><div class="ng-pdf">${page1}${page2}</div>` };
  }

  async function generatePDF(d) {
    if (!window.html2canvas || !window.jspdf) {
      alert("PDF libraries failed to load. Check your internet connection and try again.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const { appId, html } = buildPdfDom(d);

    // Off-screen, on-DOM container so html2canvas can measure layout.
    const stage = document.createElement("div");
    stage.style.cssText = "position:fixed; left:-99999px; top:0; width:850px; background:#fff; z-index:-1;";
    stage.innerHTML = html;
    document.body.appendChild(stage);

    try {
      // Wait for the photo image (data URL) to be ready before rasterizing.
      const imgs = Array.from(stage.querySelectorAll("img"));
      await Promise.all(imgs.map((img) => img.complete ? null : new Promise((res) => { img.onload = img.onerror = res; })));

      const pages = Array.from(stage.querySelectorAll(".form-page"));
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pages.length; i++) {
        const canvas = await window.html2canvas(pages[i], {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
          logging: false,
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        // Fit width; crop height if it overflows a single A4.
        const ratio = canvas.height / canvas.width;
        let renderW = pageW;
        let renderH = pageW * ratio;
        if (renderH > pageH) { renderH = pageH; renderW = pageH / ratio; }
        if (i > 0) pdf.addPage();
        const offsetX = (pageW - renderW) / 2;
        pdf.addImage(imgData, "JPEG", offsetX, 0, renderW, renderH);
      }

      pdf.save(`${appId}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Could not generate PDF: " + (err && err.message ? err.message : err));
    } finally {
      stage.remove();
    }
  }


  /* -------------- main render -------------- */
  function render() {
    const root = $app();
    root.innerHTML = "";
    root.appendChild(TopBar());

    const current = STEPS[state.step];
    const main = h("main", { class: "flex-1 flex items-center justify-center px-5 py-10" });
    const slide = h("div", { class: "slide-in w-full max-w-3xl" });
    let body;
    switch (current.type) {
      case "intro":  body = IntroScreen(); break;
      case "photo":  body = PhotoStep(); break;
      case "text":   body = TextStep(current); break;
      case "choice": body = ChoiceStep(current); break;
      case "multi":  body = MultiStep(current); break;
      case "review": body = ReviewStep(); break;
    }
    slide.appendChild(body);
    main.appendChild(slide);
    root.appendChild(main);

    root.appendChild(h("footer", { class: "px-6 py-5 text-center text-xs", style: { color: "var(--muted-foreground)" } },
      "Next Gen Education System · Rawalpindi · 0337-48000-21"
    ));

    if (state.success) root.appendChild(SuccessOverlay());
  }

  /* -------------- init -------------- */
  function init() {
    const stored = localStorage.getItem(THEME_KEY);
    const sysDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    state.theme = stored === "light" || stored === "dark" ? stored : (sysDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", state.theme === "dark");
    state.hasDraft = !!localStorage.getItem(STORAGE_KEY);
    render();
  }
  document.addEventListener("DOMContentLoaded", init);
})();