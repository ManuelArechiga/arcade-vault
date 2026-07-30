import Link from "next/link";

export default function NotFound() {
  return (
    <div className="av-404 fade-in">
      <div className="code pixel">404</div>
      <div className="title pixel">FICHA NO VÁLIDA</div>
      <p className="msg">
        La pantalla que buscas no existe en este cabinet. Puede que el juego haya sido retirado o que la dirección
        esté mal escrita.
      </p>
      <div className="actions">
        <Link href="/juegos" className="btn xl pulse">
          ▶ VOLVER AL VAULT
        </Link>
      </div>
    </div>
  );
}
