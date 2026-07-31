"use client";

import { useEffect, useState, type FormEvent } from "react";
import { HighlightIcon } from "@/components/about/highlight-icon";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HIGHLIGHTS = [
  { i: "HEART" as const, t: "HECHO CON ❤️ PARA JUGADORES", c: "magenta" },
  { i: "BROWSER" as const, t: "JUEGOS EN HTML — CORREN EN CUALQUIER NAVEGADOR", c: "cyan" },
  { i: "PLANT" as const, t: "PROYECTO EN CONSTANTE CRECIMIENTO", c: "green" },
];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

type Status = "idle" | "loading" | "sent" | "error";

export default function AboutPage() {
  useReveal();

  const [form, setForm] = useState({ name: "", email: "", msg: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [shake, setShake] = useState(false);
  const [sentName, setSentName] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.msg.trim() || !EMAIL_RE.test(form.email.trim())) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "No se pudo enviar el mensaje. Intenta de nuevo.");
        setStatus("error");
        return;
      }
      setSentName(form.name.trim());
      setStatus("sent");
    } catch {
      setErrorMsg("No se pudo enviar el mensaje. Intenta de nuevo.");
      setStatus("error");
    }
  };

  const retry = () => setStatus("idle");

  return (
    <div className="about fade-in">
      {/* ABOUT */}
      <section className="about-hero">
        <div className="kicker pixel neon-yellow">▸ ACERCA DE</div>
        <h1 className="about-title">ACERCA DE ARCADE VAULT</h1>
        <p className="about-mission">
          ARCADE VAULT nació del amor por los videojuegos clásicos. Nuestra misión es preservar y celebrar
          los arcades que definieron una generación, haciéndolos accesibles para todos, en cualquier lugar
          y sin costo.
        </p>

        <div className="highlight-row">
          {HIGHLIGHTS.map((h, i) => (
            <div key={i} className={"highlight " + h.c} style={{ transitionDelay: i * 80 + "ms" }}>
              <HighlightIcon kind={h.i} />
              <div className="hl-text pixel">{h.t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* divider banner */}
      <div className="about-divider reveal" aria-hidden="true">
        <div className="div-bar"></div>
        <div className="div-pixels">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} style={{ animationDelay: i * 80 + "ms" }}></span>
          ))}
        </div>
        <div className="div-bar"></div>
      </div>

      {/* CONTACT */}
      <section className="about-contact reveal">
        <div className="contact-grid">
          <div className="contact-intro">
            <div className="kicker pixel neon-cyan">▸ CONTACTO</div>
            <h2 className="contact-title">CONTÁCTANOS</h2>
            <p className="contact-sub">
              ¿Tienes alguna sugerencia, quieres proponer un juego, o simplemente quieres saludar?
              Escríbenos.
            </p>
            <div className="contact-tips">
              <div className="tip">
                <span className="tip-led"></span>RESPUESTA EN 24-48H
              </div>
              <div className="tip">
                <span className="tip-led y"></span>SUGERENCIAS BIENVENIDAS
              </div>
              <div className="tip">
                <span className="tip-led m"></span>SIN SPAM, JAMÁS
              </div>
            </div>
          </div>

          <form className={"contact-form" + (shake ? " shake" : "")} onSubmit={onSubmit}>
            {status === "idle" || status === "loading" ? (
              <>
                <div className="field">
                  <label>NOMBRE</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="px_kai"
                    disabled={status === "loading"}
                  />
                </div>
                <div className="field">
                  <label>CORREO ELECTRÓNICO</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="jugador@vault.gg"
                    disabled={status === "loading"}
                  />
                </div>
                <div className="field">
                  <label>MENSAJE</label>
                  <textarea
                    rows={5}
                    value={form.msg}
                    onChange={(e) => setForm({ ...form, msg: e.target.value })}
                    placeholder="Cuéntanos qué tienes en mente…"
                    disabled={status === "loading"}
                  ></textarea>
                </div>
                <button className="btn xl press" type="submit" style={{ width: "100%" }} disabled={status === "loading"}>
                  {status === "loading" ? "▶  ENVIANDO…" : "▶  ENVIAR MENSAJE"}
                </button>
              </>
            ) : status === "sent" ? (
              <div className="terminal-success">
                <div className="term-bar">
                  <span className="dot r"></span>
                  <span className="dot y"></span>
                  <span className="dot g"></span>
                  <span className="term-title">VAULT-OS // TERMINAL</span>
                </div>
                <div className="term-body">
                  <div className="line">
                    <span className="prompt">vault@arcade:~$</span> ./send_message --to=team
                  </div>
                  <div className="line dim">[OK] Conectando con servidor…</div>
                  <div className="line dim">[OK] Validando contenido…</div>
                  <div className="line dim">[OK] Transmitiendo paquete…</div>
                  <div className="line success">
                    &gt; MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS, {sentName.toUpperCase()}.
                    <span className="caret">_</span>
                  </div>
                  <div style={{ marginTop: 18 }}>
                    <button
                      className="btn ghost"
                      type="button"
                      onClick={() => {
                        setStatus("idle");
                        setForm({ name: "", email: "", msg: "" });
                      }}
                    >
                      ENVIAR OTRO MENSAJE
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="terminal-error">
                <div className="term-bar">
                  <span className="dot r"></span>
                  <span className="dot y"></span>
                  <span className="dot g"></span>
                  <span className="term-title">VAULT-OS // TERMINAL</span>
                </div>
                <div className="term-body">
                  <div className="line">
                    <span className="prompt">vault@arcade:~$</span> ./send_message --to=team
                  </div>
                  <div className="line dim">[OK] Conectando con servidor…</div>
                  <div className="line error-line">&gt; ERROR: {errorMsg}</div>
                  <div style={{ marginTop: 18 }}>
                    <button className="btn ghost" type="button" onClick={retry}>
                      REINTENTAR
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
