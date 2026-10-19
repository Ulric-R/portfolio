import json
import os
import re
import smtplib
from email.message import EmailMessage
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "5000"))
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)
SMTP_TO = os.getenv("SMTP_TO", "ulricrandrianiaina@gmail.com")
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def send_email(name: str, email: str, message: str, sent_at: str) -> None:
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASSWORD:
        raise RuntimeError(
            "Configuration SMTP incomplète. Définis SMTP_HOST, SMTP_USER, SMTP_PASSWORD et SMTP_TO."
        )

    email_message = EmailMessage()
    email_message["Subject"] = f"Nouveau message depuis le portfolio : {name}"
    email_message["From"] = SMTP_FROM or SMTP_USER
    email_message["To"] = SMTP_TO
    email_message["Reply-To"] = email
    email_message.set_content(
        "\n".join(
            [
                f"Nom : {name}",
                f"Email : {email}",
                f"Envoyé le : {sent_at}",
                "",
                "Message :",
                message,
            ]
        )
    )

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
        if SMTP_USE_TLS:
            smtp.starttls()
        smtp.login(SMTP_USER, SMTP_PASSWORD)
        smtp.send_message(email_message)


def read_json_body(handler: BaseHTTPRequestHandler):
    content_length = int(handler.headers.get("Content-Length", "0"))
    raw_body = handler.rfile.read(content_length)
    if not raw_body:
        return {}

    try:
        return json.loads(raw_body.decode("utf-8"))
    except json.JSONDecodeError:
        raise ValueError("Le corps de la requête n'est pas un JSON valide.")


class ContactHandler(BaseHTTPRequestHandler):
    def set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def send_json(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.set_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        parsed_url = urlparse(self.path)
        if parsed_url.path != "/api/contact":
            self.send_json(404, {"success": False, "error": "Route introuvable."})
            return

        try:
            data = read_json_body(self)
            name = str(data.get("name", "")).strip()
            email = str(data.get("email", "")).strip()
            message = str(data.get("message", "")).strip()
            sent_at = str(data.get("date") or "")

            if not name or not email or not message:
                self.send_json(400, {"success": False, "error": "Tous les champs sont obligatoires."})
                return

            if not EMAIL_RE.match(email):
                self.send_json(400, {"success": False, "error": "L'adresse email n'est pas valide."})
                return

            send_email(name, email, message, sent_at or "Date inconnue")
            self.send_json(200, {"success": True, "message": "Message envoyé avec succès."})
        except ValueError as exc:
            self.send_json(400, {"success": False, "error": str(exc)})
        except RuntimeError as exc:
            self.send_json(503, {"success": False, "error": str(exc)})
        except Exception as exc:  # pragma: no cover
            self.send_json(500, {"success": False, "error": f"Erreur serveur : {exc}"})

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), ContactHandler)
    print(f"Backend Python démarré sur http://{HOST}:{PORT}")
    print("Configure SMTP_HOST, SMTP_USER, SMTP_PASSWORD et SMTP_TO pour l'envoi réel.")
    server.serve_forever()
