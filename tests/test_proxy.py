import subprocess
import time
import requests
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
import pytest

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html')
        self.end_headers()
        self.wfile.write(b'<html><title>Example Domain</title></html>')

@pytest.fixture(scope="module")
def go_server():
    proc = subprocess.Popen(["go", "run", "server.go"], cwd=str(Path(__file__).resolve().parents[1]), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    for _ in range(20):
        try:
            requests.get("http://localhost:5000/logs")
            break
        except Exception:
            time.sleep(0.1)
    yield
    proc.terminate()
    proc.wait()

@pytest.fixture
def remote_server():
    httpd = HTTPServer(("localhost", 0), Handler)
    thread = threading.Thread(target=httpd.serve_forever)
    thread.daemon = True
    thread.start()
    yield f"http://localhost:{httpd.server_address[1]}"
    httpd.shutdown()
    thread.join()


def test_fetch_example(go_server, remote_server):
    resp = requests.post("http://localhost:5000/fetch", json={"url": remote_server})
    assert resp.status_code == 200
    assert "Example Domain" in resp.text


def test_logs_recorded(go_server, remote_server):
    headers = {"User-Agent": "test-agent"}
    requests.post("http://localhost:5000/fetch", json={"url": remote_server}, headers=headers)
    resp = requests.get("http://localhost:5000/logs")
    assert resp.status_code == 200
    logs = resp.json()
    assert any(log.get("user_agent") == "test-agent" for log in logs)
