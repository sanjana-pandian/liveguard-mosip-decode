
const video = document.getElementById("webcam");
const canvas = document.getElementById("canvas");

const cameraStatus = document.getElementById("cameraStatus");
const faceStatus = document.getElementById("faceStatus");
const challengeStatus = document.getElementById("challengeStatus");
const challengeNote = document.getElementById("challengeNote");

const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const challengeButton = document.getElementById("challengeButton");

let stream = null;
let timer = null;
let challengeTimeout = null;
let busy = false;

let challengeStage = "idle";
let startingPosition = null;
let movementDetected = false;
let faceVisible = false;

const CHALLENGE_TIME_LIMIT = 15000;
const MOVE_THRESHOLD = 0.10;
const RETURN_THRESHOLD = 0.04;

async function detectFace() {
    if (!stream || busy || video.readyState < 2) return;

    busy = true;

    try {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const response = await fetch("/api/detect", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                image: canvas.toDataURL("image/jpeg", 0.7)
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Detection failed");
        }

        if (result.face_count === 0) {
            faceVisible = false;
            faceStatus.textContent =
                "No face detected. Please face the camera.";
            return;
        }

        if (result.face_count > 1) {
            faceVisible = false;
            faceStatus.textContent =
                "Multiple faces detected. Only one person should be visible.";
            return;
        }

        faceVisible = true;
        faceStatus.textContent = "One face detected.";

        const face = result.faces[0];

        const facePosition =
            (face.x + face.width / 2) / canvas.width;

        runChallenge(facePosition);

    } catch (error) {
        faceStatus.textContent =
            "Detection error: " + error.message;
    } finally {
        busy = false;
    }
}

function runChallenge(facePosition) {
    if (
        challengeStage !== "move" &&
        challengeStage !== "return"
    ) {
        return;
    }

    if (!faceVisible) return;

    if (startingPosition === null) {
        startingPosition = facePosition;
    }

    if (challengeStage === "move") {
        challengeStatus.textContent =
            "Challenge 1 of 2: Move your head slightly sideways.";

        if (
            Math.abs(facePosition - startingPosition) >=
            MOVE_THRESHOLD
        ) {
            movementDetected = true;
            challengeStage = "return";

            challengeStatus.textContent =
                "Challenge 2 of 2: Return to your starting position.";

            challengeNote.textContent =
                "Move back to your original position.";
        }
    } else if (challengeStage === "return") {
        challengeNote.textContent =
            "Return close to your original position.";

        if (
            movementDetected &&
            Math.abs(facePosition - startingPosition) <=
            RETURN_THRESHOLD
        ) {
            completeChallenge();
        }
    }
}

function completeChallenge() {
    challengeStage = "passed";
    clearChallengeTimeout();

    challengeStatus.textContent =
        "Movement challenge completed.";

    challengeNote.textContent =
        "Basic motion check only. Presentation attack detection is not verified.";

    challengeButton.textContent = "Try Again";
    challengeButton.disabled = false;
}

function failChallenge(message) {
    challengeStage = "failed";
    clearChallengeTimeout();

    challengeStatus.textContent =
        "Challenge not completed.";

    challengeNote.textContent = message;

    challengeButton.textContent = "Try Again";
    challengeButton.disabled = false;
}

function clearChallengeTimeout() {
    if (challengeTimeout !== null) {
        clearTimeout(challengeTimeout);
        challengeTimeout = null;
    }
}

function startChallenge() {
    if (!stream) return;

    clearChallengeTimeout();

    if (!faceVisible) {
        challengeStatus.textContent =
            "Cannot start the challenge.";

        challengeNote.textContent =
            "Make sure exactly one face is visible first.";

        return;
    }

    challengeStage = "move";
    startingPosition = null;
    movementDetected = false;

    challengeButton.disabled = true;

    challengeStatus.textContent =
        "Get ready to move your head sideways.";

    challengeNote.textContent =
        "Complete both movements within 15 seconds.";

    challengeTimeout = setTimeout(() => {
        if (
            challengeStage === "move" ||
            challengeStage === "return"
        ) {
            failChallenge(
                "Time limit reached. Click Try Again to restart."
            );
        }
    }, CHALLENGE_TIME_LIMIT);
}

startButton.addEventListener("click", async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        video.srcObject = stream;
        await video.play();

        cameraStatus.textContent = "Camera is running.";

        startButton.disabled = true;
        stopButton.disabled = false;
        challengeButton.disabled = false;

        challengeStatus.textContent =
            "Camera ready. Start the challenge when one face is visible.";

        timer = setInterval(detectFace, 500);

    } catch (error) {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        stream = null;

        cameraStatus.textContent =
            "Camera access failed. Check browser permissions.";
    }
});

challengeButton.addEventListener("click", startChallenge);

stopButton.addEventListener("click", stopCamera);

function stopCamera() {
    if (timer !== null) {
        clearInterval(timer);
        timer = null;
    }

    clearChallengeTimeout();

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }

    stream = null;
    video.srcObject = null;

    challengeStage = "idle";
    startingPosition = null;
    movementDetected = false;
    faceVisible = false;

    cameraStatus.textContent = "Camera is stopped.";
    faceStatus.textContent = "Face detection has stopped.";
    challengeStatus.textContent = "Start the camera to begin.";
    challengeNote.textContent = "Follow the instructions displayed here.";

    startButton.disabled = false;
    stopButton.disabled = true;
    challengeButton.disabled = true;
    challengeButton.textContent = "Start Challenge";
}

window.addEventListener("beforeunload", () => {
    if (timer !== null) clearInterval(timer);

    clearChallengeTimeout();

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});
