# LiveGuard — MOSIP Decode 2026

**Problem Statement:** Face Liveness Detection and Presentation Attack Detection for Registration and Biometric Authentication

## 1. Project Overview

LiveGuard is a prototype exploring a webcam-based face detection and guided movement challenge workflow for biometric registration and authentication.

The prototype detects faces in a live camera feed and guides a user through a simple head-movement challenge.

## 2. Features

- Webcam access through the browser
- Face detection using MediaPipe
- Face count checking
- Guided head-movement challenge
- Challenge timeout and retry handling
- Flask API for processing camera frames

## 3. Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python, Flask
- **Face Detection:** MediaPipe
- **Image Processing:** OpenCV
- **Numerical Processing:** NumPy

## 4. Project Structure

```text
Live Guard/
├── app.py
├── liveness.py
├── requirements.txt
├── README.md
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js
```

## 5. Installation and Setup

### Prerequisites

- Python 3.12
- Google Chrome or another modern browser
- A working webcam

### Install dependencies

Open a terminal in the project folder and run:

```bash
pip install -r requirements.txt
```

### Start the application

```bash
python app.py
```

Open the following address in your browser:

```text
http://127.0.0.1:5000
```

Allow camera access, start the camera, and follow the on-screen challenge instructions.

## 6. Current Limitations

The current version demonstrates face detection and basic face-position movement checks. It does not provide validated presentation attack detection (PAD), and successful movement must not be treated as proof of liveness.

Integration with MOSIP Desktop and Android Registration Clients has not yet been demonstrated.

## 7. Future Improvements

- Integrate and evaluate a suitable face anti-spoofing model.
- Test against printed photographs and replayed videos.
- Evaluate performance under different lighting and camera conditions.
- Investigate integration with MOSIP Registration Clients.
- Improve accessibility and user guidance.

## 8. Project Status

**Prototype:** Basic webcam face detection and guided movement workflow implemented.

**Disclaimer:** This is a development prototype, not a production-ready biometric security system.
