from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
 
app = Flask(__name__)
CORS(app)  # allows Node.js backend to call this service

MAX_FILE_SIZE_MB = 5
ALLOWED_EXTENSION = ".pdf"

@app.route("/", methods=["GET"])
def home():
    """Simple health check route - open this in browser to confirm server is alive."""
    return jsonify({"message": "Resume Analyzer (Python service) is running"})

@app.route("/extract-skills", methods=["POST"])
def extract_skills():
    """
    Accepts a PDF resume, extracts raw text from it.
    Postman setup: POST request, Body -> form-data, key = "resume", type = File, value = pick a PDF.
    """

    # 1. Check a file was actually sent
    if "resume" not in request.files:
        return jsonify({"status": "error", "message": "No file uploaded. Send it under key 'resume'."}), 400

    file = request.files["resume"]

    if file.filename == "":
        return jsonify({"status": "error", "message": "No file selected."}), 400


    if not file.filename.lower().endswith(ALLOWED_EXTENSION):
        return jsonify({"status": "error", "message": "Only PDF files are allowed."}), 400


    file.seek(0, 2)  # move pointer to end of file
    size_mb = file.tell() / (1024 * 1024)
    file.seek(0)  # rewind pointer back to start before reading
    if size_mb > MAX_FILE_SIZE_MB:
        return jsonify({"status": "error", "message": f"File too large. Max {MAX_FILE_SIZE_MB}MB allowed."}), 400


    try:
        reader = PdfReader(file)

        if len(reader.pages) == 0:
            return jsonify({"status": "error", "message": "PDF has no pages."}), 400

        raw_text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                raw_text += page_text + " "

        raw_text = raw_text.lower().strip()

        if not raw_text:
            return jsonify({
                "status": "error",
                "message": "Could not extract any text. PDF might be scanned/image-based."
            }), 400

    except Exception as e:
        return jsonify({"status": "error", "message": f"Failed to read PDF: {str(e)}"}), 400

    return jsonify({
        "status": "success",
        "text_length": len(raw_text),
        "text_preview": raw_text[:300]
    })


@app.errorhandler(404)
def not_found(e):
    return jsonify({"status": "error", "message": "Route not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"status": "error", "message": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
