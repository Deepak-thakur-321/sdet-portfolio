/* ==========================================================================
   Deepak — Portfolio — shared behaviour across all pages
   Every block is isolated in try/catch: if one CDN script fails to load
   (GSAP / ScrollTrigger / Lenis), the rest of the page still works.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const hasGsap = typeof window.gsap !== "undefined";
  const hasST = hasGsap && typeof window.ScrollTrigger !== "undefined";

  if (hasGsap && hasST) {
    try {
      gsap.registerPlugin(ScrollTrigger);
    } catch (e) {
      console.warn("ScrollTrigger register failed", e);
    }
  }

  /* ---------------- Lenis smooth scroll ---------------- */
  try {
    if (window.Lenis && hasGsap) {
      const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1 });
      if (hasST) lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  } catch (e) {
    console.warn("Lenis init failed", e);
  }

  /* ---------------- custom cursor ---------------- */
  try {
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if (dot && ring && window.matchMedia("(hover:hover)").matches) {
      let rx = 0,
        ry = 0,
        mx = 0,
        my = 0,
        started = false;
      window.addEventListener("mousemove", (e) => {
        mx = e.clientX;
        my = e.clientY;
        if (!started) {
          rx = mx;
          ry = my;
          started = true;
        }
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      });
      const tick = () => {
        rx += (mx - rx) * 0.16;
        ry += (my - ry) * 0.16;
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
        requestAnimationFrame(tick);
      };
      tick();
      document
        .querySelectorAll("a, button, .magnetic, .proj-row")
        .forEach((el) => {
          el.addEventListener("mouseenter", () =>
            ring.classList.add("is-active"),
          );
          el.addEventListener("mouseleave", () =>
            ring.classList.remove("is-active"),
          );
        });
    }
  } catch (e) {
    console.warn("Cursor init failed", e);
  }

  /* ---------------- magnetic buttons ---------------- */
  try {
    if (hasGsap) {
      document.querySelectorAll(".magnetic").forEach((el) => {
        el.addEventListener("mousemove", (e) => {
          const r = el.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top - r.height / 2;
          gsap.to(el, {
            x: x * 0.35,
            y: y * 0.45,
            duration: 0.4,
            ease: "power3.out",
          });
        });
        el.addEventListener("mouseleave", () => {
          gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1,0.4)",
          });
        });
      });
    }
  } catch (e) {
    console.warn("Magnetic buttons failed", e);
  }

  /* ---------------- mobile nav ---------------- */
  try {
    const burger = document.querySelector(".nav-burger");
    const mobileNav = document.querySelector(".mobile-nav");
    if (burger && mobileNav) {
      burger.addEventListener("click", () => {
        mobileNav.classList.toggle("open");
        burger.classList.toggle("is-open");
      });
      mobileNav.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => {
          mobileNav.classList.remove("open");
          burger.classList.remove("is-open");
        }),
      );
    }
  } catch (e) {
    console.warn("Mobile nav failed", e);
  }

  /* ---------------- scroll reveals ---------------- */
  try {
    if (hasGsap && hasST) {
      gsap.utils.toArray(".reveal").forEach((el, i) => {
        gsap.from(el, {
          opacity: 0,
          y: 28,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 92%" },
          delay: (i % 4) * 0.03,
        });
      });
    }
  } catch (e) {
    console.warn("Reveals failed", e);
  }

  /* ---------------- hero load-in sequence ---------------- */
  try {
    const heroTl = document.querySelector("[data-hero-tl]");
    if (heroTl && hasGsap) {
      gsap.from("[data-hero-word]", {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power4.out",
        stagger: 0.06,
        delay: 0.15,
      });
      gsap.from("[data-hero-sub] > *", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
        delay: 0.45,
      });
      gsap.from("[data-hero-fade]", { opacity: 0, duration: 1, delay: 0.65 });
    }
  } catch (e) {
    console.warn("Hero timeline failed", e);
  }

  /* ---------------- active nav link ----------------
     Works for /about, /about.html and the home page ("/" or "/index.html"). */
  try {
    const normalize = (p) => {
      let name = (p || "").split("?")[0].split("#")[0].split("/").pop();
      if (!name) name = "index";
      return name.replace(/\.html$/i, "").toLowerCase();
    };
    const here = normalize(location.pathname);
    document.querySelectorAll(".nav-link, .mobile-nav a").forEach((a) => {
      const href = a.getAttribute("href");
      if (href && normalize(href) === here) a.classList.add("active");
    });
  } catch (e) {
    console.warn("Active nav failed", e);
  }

  /* ---------------- page transition overlay ----------------
     Stays off-screen on load. On an internal link click it wipes down once,
     then navigates. Skips new-tab links, external links, modifier-clicks
     and same-page links. pageshow resets it when coming back via Back. */
  try {
    const overlay = document.getElementById("transition-overlay");
    if (overlay && hasGsap) {
      gsap.set(overlay, { yPercent: 101 });

      window.addEventListener("pageshow", (e) => {
        if (e.persisted) gsap.set(overlay, { yPercent: 101 });
      });

      document.querySelectorAll('a[href$=".html"]').forEach((a) => {
        a.addEventListener("click", (e) => {
          const href = a.getAttribute("href");
          if (
            !href ||
            a.target === "_blank" ||
            a.hasAttribute("download") ||
            /^(https?:)?\/\//i.test(href) ||
            e.ctrlKey ||
            e.metaKey ||
            e.shiftKey ||
            e.altKey ||
            e.button !== 0
          )
            return;

          const target = new URL(href, location.href);
          if (target.pathname === location.pathname) return;

          e.preventDefault();
          gsap
            .timeline({ onComplete: () => (window.location.href = href) })
            .to(overlay, { yPercent: 0, duration: 0.45, ease: "power3.inOut" });
        });
      });
    }
  } catch (e) {
    console.warn("Transition overlay failed", e);
  }

  /* ---------------- stat / assertion counters ---------------- */
  try {
    if (hasGsap && hasST) {
      gsap.utils.toArray("[data-count]").forEach((el) => {
        const end = parseFloat(el.getAttribute("data-count"));
        const obj = { val: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () =>
            gsap.to(obj, {
              val: end,
              duration: 1.4,
              ease: "power2.out",
              onUpdate: () => (el.textContent = Math.round(obj.val)),
            }),
        });
      });
    } else {
      document.querySelectorAll("[data-count]").forEach((el) => {
        el.textContent = el.getAttribute("data-count");
      });
    }
  } catch (e) {
    console.warn("Counters failed", e);
  }

  /* ---------------- contact form (only runs on contact page) ---------------- */
  try {
    const form = document.getElementById("contact-form");
    if (form) {
      const statusEl = document.getElementById("form-status");
      const btn = document.getElementById("submit-btn");
      const btnLabel = document.getElementById("btn-label");

      const setStatus = (msg, color) => {
        if (!statusEl) return;
        statusEl.style.color = color || "";
        statusEl.textContent = msg;
      };

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const data = Object.fromEntries(new FormData(form));

        if (!data.access_key || data.access_key.includes("YAHAN")) {
          setStatus(
            "Form is not configured yet: add your Web3Forms access key.",
            "#f87171",
          );
          return;
        }

        data.name = (data.name || "").trim();
        data.message = (data.message || "").trim();
        if (!data.message) {
          setStatus("Please write a message before sending.", "#f87171");
          return;
        }
        if (!data.subject || !data.subject.trim())
          data.subject = "Portfolio contact";

        btn.disabled = true;
        btnLabel.textContent = "Sending...";
        setStatus("");

        try {
          const res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(data),
          });
          const result = await res.json();

          if (res.ok && result.success) {
            form.reset();
            setStatus("Message sent. Thanks, I'll reply soon.", "#34d399");
          } else {
            throw new Error(result.message || "Something went wrong");
          }
        } catch (err) {
          console.warn("Form submit failed", err);
          setStatus(
            "Couldn't send. Please try again or email deepakthakur.codr@gmail.com.",
            "#f87171",
          );
        } finally {
          btn.disabled = false;
          btnLabel.textContent = "Send message";
        }
      });
    }
  } catch (e) {
    console.warn("Contact form init failed", e);
  }
});