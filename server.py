from http.server import SimpleHTTPRequestHandler, HTTPServer

PORT = 5000

class Handler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        return

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', PORT), Handler)
    print(f"Serving on http://0.0.0.0:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()
        print("Server stopped")
