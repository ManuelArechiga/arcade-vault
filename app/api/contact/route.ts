import { Resend } from "resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const msg = typeof body?.msg === "string" ? body.msg.trim() : "";

  if (!name || !email || !msg) {
    return Response.json({ ok: false, error: "Todos los campos son obligatorios." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: "El correo electrónico no tiene un formato válido." }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: process.env.CONTACT_TO_EMAIL as string,
      subject: `Nuevo mensaje de contacto — ${name}`,
      text: `De: ${name} <${email}>\n\n${msg}`,
    });

    if (error) {
      return Response.json({ ok: false, error: "No se pudo enviar el mensaje. Intenta de nuevo." }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "No se pudo enviar el mensaje. Intenta de nuevo." }, { status: 502 });
  }
}
