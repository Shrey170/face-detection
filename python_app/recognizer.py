import face_recognition
import numpy as np

class FaceRecognizer:
    """
    Implements threshold-based verification for facial recognition.
    """
    def __init__(self, tolerance=0.55):
        """
        tolerance: Distance threshold. Lower is stricter. 0.6 is default for this library, 
        but 0.55 provides better security against false positives.
        """
        self.tolerance = tolerance

    def recognize_face(self, unknown_encoding, known_encodings, known_names):
        """
        Compares an unknown face encoding against registered encodings.
        Uses Euclidean distance for verification.
        """
        if not known_encodings:
            return "Unknown"
            
        # Calculate face distance (Euclidean distance) between unknown and all known
        face_distances = face_recognition.face_distance(known_encodings, unknown_encoding)
        
        best_match_index = np.argmin(face_distances)
        if face_distances[best_match_index] <= self.tolerance:
            return known_names[best_match_index]
            
        return "Unknown"
