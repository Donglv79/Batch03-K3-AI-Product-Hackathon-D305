import http.server
import socketserver
import webbrowser
import os

PORT = 8501
HTML_FILE = os.path.join(os.path.dirname(__file__), "teacher_dashboard.html")

class DashboardHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            with open(HTML_FILE, 'rb') as f:
                self.wfile.write(f.read())
        else:
            super().do_GET()

def launch():
    print(f"=== ĐANG KHỞI CHẠY TEACHER DASHBOARD THIẾT KẾ DÀNH CHO GIẢNG VIÊN ===")
    print(f"Trình duyệt tự động mở tại: http://localhost:{PORT}")
    webbrowser.open(f"http://localhost:{PORT}")
    with socketserver.TCPServer(("", PORT), DashboardHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nĐã dừng Dashboard server.")

if __name__ == "__main__":
    launch()
