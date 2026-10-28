
import cv2
import mediapipe as mp


class FaceDetector:
    def __init__(self):
        self.face_detection = (
            mp.solutions.face_detection.FaceDetection(
                model_selection=0,
                min_detection_confidence=0.6
            )
        )

    def detect_faces(self, frame):
        rgb_frame = cv2.cvtColor(
            frame, cv2.COLOR_BGR2RGB
        )

        results = self.face_detection.process(rgb_frame)
        faces = []

        if results.detections:
            height, width, _ = frame.shape

            for detection in results.detections:
                box = detection.location_data.relative_bounding_box

                x = max(0, int(box.xmin * width))
                y = max(0, int(box.ymin * height))
                w = int(box.width * width)
                h = int(box.height * height)

                faces.append({
                    "x": x,
                    "y": y,
                    "width": w,
                    "height": h,
                    "confidence": round(
                        detection.score[0], 3
                    )
                })

        return faces

    def close(self):
        self.face_detection.close()

