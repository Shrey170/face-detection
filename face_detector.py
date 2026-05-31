import face_recognition
import cv2

class FaceDetector:
    """
    Implements face detection and feature extraction (128-d embeddings) using Deep Learning.
    Supports both HOG (fast) and CNN (high accuracy) models.
    """
    def __init__(self, model="cnn"):
        self.model = model

    def get_face_encodings(self, frame):
        """
        Finds faces in a BGR OpenCV frame and returns their bounding boxes and 128-d encodings.
        """
        # Convert BGR (OpenCV) to RGB (face_recognition)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Find face locations and encodings
        face_locations = face_recognition.face_locations(rgb_frame, model=self.model)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
        
        return face_locations, face_encodings
