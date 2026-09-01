import os
import sys
import io
import json
import warnings
from http.server import HTTPServer, BaseHTTPRequestHandler

warnings.filterwarnings("ignore")
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Add current dir to path
sys.path.append(os.path.dirname(__file__))
from image_forensics import run_full_forensics
from sdxl_detector import get_pipeline

# Pre-warm primary General ViT model in memory during server startup
print("[ForensicsServer] Pre-warming General ViT model into memory...", flush=True)
get_pipeline("umm-maybe/AI-image-detector")
print("[ForensicsServer] Model pre-warmed and ready in RAM!", flush=True)

class ForensicsHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            # Request can either be JSON with {"filePath": "..."} or raw image bytes
            try:
                data = json.loads(body.decode('utf-8'))
                target = data.get('filePath')
            except Exception:
                target = body

            report = run_full_forensics(target)
            resp_bytes = json.dumps(report).encode('utf-8')

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(resp_bytes)))
            self.end_headers()
            self.wfile.write(resp_bytes)
        except Exception as e:
            err_resp = json.dumps({"error": str(e), "ai_generation_score": 0.0, "forensic_verdict": "CLEAN"}).encode('utf-8')
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(err_resp)))
            self.end_headers()
            self.wfile.write(err_resp)

    def do_GET(self):
        # Health check endpoint
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "healthy", "service": "image_forensics_daemon"}).encode('utf-8'))

    def log_message(self, format, *args):
        # Suppress noisy HTTP logs
        return

def run_server(port=5005):
    try:
        HTTPServer.allow_reuse_address = True
        server_address = ('127.0.0.1', port)
        httpd = HTTPServer(server_address, ForensicsHandler)
        print(f"[ForensicsServer] Warm ML daemon listening on http://127.0.0.1:{port}", flush=True)
        httpd.serve_forever()
    except Exception as e:
        print(f"[ForensicsServer] Server error: {e}", flush=True)

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5005
    run_server(port)
