import cv2
import argparse
import time
import numpy as np
from crypto_utils import CryptoManager
from database import DatabaseManager
from face_detector import FaceDetector
from recognizer import FaceRecognizer

def load_known_faces(db, crypto):
    users = db.get_all_users()
    known_encodings = []
    known_names = []
    
    for name, encrypted_emb in users:
        decrypted_emb = crypto.decrypt_embedding(encrypted_emb)
        known_encodings.append(decrypted_emb)
        known_names.append(name)
        
    return known_names, known_encodings

def draw_cyberpunk_hud(frame, fps=None):
    """Draws a futuristic HUD overlay on the main frame."""
    h, w = frame.shape[:2]
    
    # Draw secure connection text
    cv2.putText(frame, "SYS: FACE RECOGNITION V1.0", (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 1)
    cv2.putText(frame, "ENCRYPTED STORAGE: SECURE", (20, 55), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 1)
    cv2.putText(frame, "DEEP LEARNING MODEL: ACTIVE", (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 1)
    
    # Draw FPS
    if fps:
        cv2.putText(frame, f"FPS: {int(fps)}", (w - 120, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 243, 255), 2)
        
    # Draw decorative border corners
    color = (0, 243, 255) # Cyberpunk cyan
    thickness = 3
    length = 40
    # Top Left
    cv2.line(frame, (10, 10), (10 + length, 10), color, thickness)
    cv2.line(frame, (10, 10), (10, 10 + length), color, thickness)
    # Top Right
    cv2.line(frame, (w - 10, 10), (w - 10 - length, 10), color, thickness)
    cv2.line(frame, (w - 10, 10), (w - 10, 10 + length), color, thickness)
    # Bottom Left
    cv2.line(frame, (10, h - 10), (10 + length, h - 10), color, thickness)
    cv2.line(frame, (10, h - 10), (10, h - 10 - length), color, thickness)
    # Bottom Right
    cv2.line(frame, (w - 10, h - 10), (w - 10 - length, h - 10), color, thickness)
    cv2.line(frame, (w - 10, h - 10), (w - 10, h - 10 - length), color, thickness)

def draw_face_box(frame, top, right, bottom, left, name):
    """Draws a stylized bounding box and name tag for a detected face."""
    # Choose color based on recognition (Green for match, Red for Unknown)
    is_unknown = (name == "Unknown")
    color = (0, 0, 255) if is_unknown else (0, 255, 0)
    
    # Draw corners instead of full box for a modern look
    length = 20
    thickness = 2
    
    # Top Left
    cv2.line(frame, (left, top), (left + length, top), color, thickness)
    cv2.line(frame, (left, top), (left, top + length), color, thickness)
    # Top Right
    cv2.line(frame, (right, top), (right - length, top), color, thickness)
    cv2.line(frame, (right, top), (right, top + length), color, thickness)
    # Bottom Left
    cv2.line(frame, (left, bottom), (left + length, bottom), color, thickness)
    cv2.line(frame, (left, bottom), (left, bottom - length), color, thickness)
    # Bottom Right
    cv2.line(frame, (right, bottom), (right - length, bottom), color, thickness)
    cv2.line(frame, (right, bottom), (right, bottom - length), color, thickness)

    # Draw semi-transparent background for text
    overlay = frame.copy()
    cv2.rectangle(overlay, (left, bottom), (right, bottom + 35), color, cv2.FILLED)
    alpha = 0.6
    cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)
    
    # Add Text
    font = cv2.FONT_HERSHEY_DUPLEX
    display_text = "TARGET UNKNOWN" if is_unknown else f"ID MATCH: {name.upper()}"
    cv2.putText(frame, display_text, (left + 6, bottom + 25), font, 0.6, (255, 255, 255), 1)

def register_user(name, model="hog"):
    print(f"[*] Registering user '{name}'...")
    print("[*] Please look at the camera. Press 's' to capture and save, or 'q' to quit.")
    
    cap = cv2.VideoCapture(0)
    detector = FaceDetector(model=model)
    db = DatabaseManager()
    crypto = CryptoManager()
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("[!] Failed to grab frame from camera.")
            break
            
        display_frame = frame.copy()
        draw_cyberpunk_hud(display_frame)
        cv2.putText(display_frame, f"REGISTERING: {name}", (20, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
        cv2.putText(display_frame, "Press 's' to scan face, 'q' to quit", (20, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
        
        cv2.imshow("Neural Face Registration", display_frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('s'):
            print("[*] Capturing and extracting deep learning features...")
            face_locations, face_encodings = detector.get_face_encodings(frame)
            if len(face_encodings) == 0:
                print("[!] No face detected! Try again.")
            elif len(face_encodings) > 1:
                print("[!] Multiple faces detected! Please ensure only one face is in the frame.")
            else:
                embedding = face_encodings[0]
                encrypted_emb = crypto.encrypt_embedding(embedding)
                db.add_user(name, encrypted_emb)
                print(f"[+] User {name} registered securely via encrypted storage!")
                break
        elif key == ord('q'):
            print("[-] Registration cancelled.")
            break
            
    cap.release()
    cv2.destroyAllWindows()

def run_recognition(model="hog", image_path=None):
    print("[*] Initializing Deep Learning Face Recognition System...")
    
    detector = FaceDetector(model=model)
    recognizer = FaceRecognizer(tolerance=0.55)
    db = DatabaseManager()
    crypto = CryptoManager()
    
    known_names, known_encodings = load_known_faces(db, crypto)
    if not known_names:
        print("[!] No users registered in encrypted database. Please register a user first using --register.")
        return
        
    print(f"[*] Loaded {len(known_names)} authorized identities from encrypted storage.")
    
    # Process a static image if provided
    if image_path:
        print(f"[*] Processing stored image: {image_path}")
        frame = cv2.imread(image_path)
        if frame is None:
            print("[!] Error loading image. Check path.")
            return
            
        face_locations, face_encodings = detector.get_face_encodings(frame)
        draw_cyberpunk_hud(frame)
        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            name = recognizer.recognize_face(face_encoding, known_encodings, known_names)
            draw_face_box(frame, top, right, bottom, left, name)
            
        cv2.imshow('Face Recognition System [Static Image]', frame)
        print("[*] Press any key in the image window to exit.")
        cv2.waitKey(0)
        cv2.destroyAllWindows()
        return

    # Real-time Video Stream processing
    print("[*] Starting live video stream processing...")
    print("[*] Press 's' to save a snapshot, 'q' to quit.")
    cap = cv2.VideoCapture(0)
    
    prev_time = time.time()
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("[!] Failed to grab frame from camera.")
            break
            
        # FPS calculation
        curr_time = time.time()
        fps = 1 / (curr_time - prev_time) if (curr_time - prev_time) > 0 else 0
        prev_time = curr_time
            
        # Detect and encode faces using CNN/HOG
        face_locations, face_encodings = detector.get_face_encodings(frame)
        
        # Draw UI overlay
        draw_cyberpunk_hud(frame, fps)
        
        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            # Threshold-based verification
            name = recognizer.recognize_face(face_encoding, known_encodings, known_names)
            draw_face_box(frame, top, right, bottom, left, name)

        cv2.imshow('Neural Face Recognition HUD', frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('s'):
            filename = f"capture_{int(time.time())}.jpg"
            cv2.imwrite(filename, frame)
            print(f"[+] Snapshot saved to {filename}")

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Face Recognition System with Encrypted Storage")
    parser.add_argument('--register', type=str, help="Register a new user with the given name")
    parser.add_argument('--recognize', action='store_true', help="Run real-time face recognition from webcam")
    parser.add_argument('--image', type=str, help="Run face recognition on a stored static image")
    parser.add_argument('--cnn', action='store_true', help="Use CNN model for detection (slower but more accurate). Default is HOG.")
    
    args = parser.parse_args()
    model_type = "cnn" if args.cnn else "hog"
    
    if args.register:
        register_user(args.register, model=model_type)
    elif args.recognize:
        run_recognition(model=model_type)
    elif args.image:
        run_recognition(model=model_type, image_path=args.image)
    else:
        parser.print_help()
