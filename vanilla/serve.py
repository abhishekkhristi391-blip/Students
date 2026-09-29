#!/usr/bin/env python3
"""Static dev/prod server with the security headers and cache policy the app
assumes. Python's stock `http.server` sends no cache headers at all, which
makes every reload re-download every module.

    python3 serve.py            # http://localhost:8080
    python3 serve.py 9000

NOT a substitute for a real host. For Firebase Hosting / Netlify / Cloudflare,
set the same headers in firebase.json / _headers / Pages config — see DEPLOY.md.
"""
import functools
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))

# Content-Security-Policy. Kept in sync with the <meta> policy in index.html;
# a browser enforces the INTERSECTION of both, so they must agree.
#
# script-src needs no nonce and no hash: the app has zero inline <script> tags.
# js/firebase.js imports the Firebase SDK by full CDN URL and re-exports it, so
# there is no import map and nothing for CSP to block.
#
# Domain list derived from what this app actually loads:
#   gstatic.com          Firebase JS SDK, loaded as ES modules from js/firebase.js
#   apis.google.com      Google Analytics, only if firebase/analytics is ever
#                        imported (it is not today)
#   *.googleapis.com     Auth (identitytoolkit, securetoken, www), Firestore REST,
#                        firebaseinstallations
#   *.firebaseio.com     Firestore, REST + wss for the realtime listeners
#   accounts.google.com  Google sign-in popup (frame-src)
#   *.firebaseapp.com    the authDomain the popup is hosted on
SECURITY_HEADERS = {
    "Content-Security-Policy": None,  # built per-request in Handler.csp()
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=(), payment=(), usb=()",
    "X-Frame-Options": "DENY",
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",  # Google popup sign-in
}

# Long cache only for content-hashed-ish filenames and the shell. HTML must
# stay revalidated or a deploy never reaches anyone.
IMMUTABLE = ("/icons/", "/fonts/")


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".json": "application/json",
        ".webmanifest": "application/manifest+json",
        ".svg": "image/svg+xml",
    }

    def csp(self):
        return "; ".join([            "default-src 'self'",
            # the only inline script is the import map; authorised by hash
            f"script-src 'self'"
            " https://www.gstatic.com https://apis.google.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https://lh3.googleusercontent.com"
            " https://*.googleusercontent.com",
            "connect-src 'self'"
            " https://*.googleapis.com"
            " https://*.firebaseio.com"
            " wss://*.firebaseio.com"
            " https://www.gstatic.com"
            " https://apis.google.com"
            " https://www.googleapis.com"
            " https://www.google-analytics.com"
            " https://*.google-analytics.com"
            " https://region1.google-analytics.com"
            " https://accounts.google.com"
            " https://*.firebaseapp.com"
            " https://*.googleusercontent.com",
            "frame-src https://accounts.google.com https://*.firebaseapp.com"
            " https://*.web.app",
            "worker-src 'self' blob:",
            "form-action 'self'",
            "base-uri 'self'",
            "object-src 'none'",
            "frame-ancestors 'none'",
            "upgrade-insecure-requests",
        ])

    def send_head(self):
        if self.path.split("?")[0] in ("/", "/index.html"):
            try:
                with open(os.path.join(ROOT, "index.html"), "rb") as f:
                    data = f.read()
            except OSError:
                pass
            else:
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(data)))
                # end_headers() emits the security + cache headers
                self.end_headers()
                if self.command != "HEAD":
                    self.wfile.write(data)
                return None
        return super().send_head()

    def end_headers(self):
        for k, v in SECURITY_HEADERS.items():
            if v is None:
                v = self.csp()
            self.send_header(k, v)

        path = self.path.split("?")[0]
        if path.startswith(IMMUTABLE):
            self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        elif path.endswith((".html", "/") or "") or path == "":
            # index.html: revalidate, or a deploy is invisible
            self.send_header("Cache-Control", "no-cache")
        elif path == "/sw.js":
            # a stale SW pins the whole app to an old version
            self.send_header("Cache-Control", "no-cache")
        elif path.endswith((".json", ".webmanifest")):
            # manifest drives the installed icon/name — must not go stale
            self.send_header("Cache-Control", "no-cache")
        elif path.endswith((".js", ".css")):
            # must-revalidate still means "trust me for an hour": a module
            # edited locally is then served from the HTTP cache and fails to
            # parse. no-cache keeps the 304 fast path, just never a stale hit.
            self.send_header("Cache-Control", "no-cache")
        else:
            self.send_header("Cache-Control", "public, max-age=3600")
        self.send_header("Service-Worker-Allowed", "/")
        super().end_headers()

    def log_message(self, fmt, *a):
        sys.stderr.write("%s\n" % (fmt % a))


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    handler = functools.partial(Handler, directory=ROOT)
    httpd = ThreadingHTTPServer(("0.0.0.0", port), handler)
    print(f"serving {ROOT}")
    print(f"  http://localhost:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
