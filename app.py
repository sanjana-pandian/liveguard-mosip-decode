
from flask import Flask, render_template, jsonify, request
from liveness import FaceDetector
import cv2
import numpy as np
import base64

app = Flask(__name__)

detector = FaceDetector()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/status")
def status():
    return jsonify({
        "project": "LiveGuard",
        "status": "running"
    })


@app.route("/api/detect", methods=["POST"])
def detect_face():
    data = request.get_json(silent=True) or {}
    image_data = data.get("image", "")

    if not image_data.startswith("data:image/"):
        return jsonify({"error": "Invalid image data"}), 400

    try:
        _, encoded = image_data.split(",", 1)
        image_bytes = base64.b64decode(encoded, validate=True)
        image_array = np.frombuffer(image_bytes, dtype=np.uint8)
        frame = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({"error": "Could not read image"}), 400

        faces = detector.detect_faces(frame)

        return jsonify({
            "face_count": len(faces),
            "faces": faces
        })

    except (ValueError, cv2.error):
        return jsonify({"error": "Could not process image"}), 400


if __name__ == "__main__":
    app.run(debug=True)

