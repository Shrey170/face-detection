# Face Recognition System

A high-performance Face Recognition System built with Python, OpenCV, and Deep Learning. This system is designed to identify and verify individuals in real-time using convolutional neural networks (CNNs), with a strong emphasis on data security.

## Key Features

- **Deep Learning Integration**: Utilizes state-of-the-art CNN-based face detection and 128-dimensional feature extraction for high accuracy.
- **Real-time & Static Recognition**: Processes live video streams via webcam or verifies identities from stored static images.
- **Encrypted Storage**: Ensures absolute data privacy by encrypting facial embeddings using symmetric AES encryption (Fernet) before storing them in the local SQLite database.
- **Threshold-based Verification**: Employs mathematical Euclidean distance thresholding to prevent false positives and verify identities securely.
- **Cyberpunk HUD**: Features a custom-built, futuristic OpenCV targeting interface with live FPS telemetry.

## Tech Stack

- **Python 3**
- **OpenCV** (`opencv-python`): Real-time computer vision and HUD rendering.
- **Face_Recognition / Dlib**: CNN feature extraction.
- **Cryptography**: Encrypted biometric storage.
- **SQLite**: Local database management.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Shrey170/face-detection.git
   cd face-detection/python_app
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   
   pip install -r requirements.txt
   ```
   *(Note: Installing on Windows may require Visual Studio C++ Build Tools or a precompiled dlib wheel).*

## Usage

### 1. Register a User
To register your face into the encrypted database:
```bash
python main.py --register "Your Name"
```
*(Press 's' to scan your face and save securely).*

### 2. Live Webcam Verification
To start the real-time recognition stream:
```bash
python main.py --recognize
```

### 3. Static Image Verification
To run recognition against a stored photo:
```bash
python main.py --image path/to/photo.jpg
```

### 4. Enable CNN Mode (Optional)
For maximum accuracy (recommended if you have a GPU), append the `--cnn` flag:
```bash
python main.py --recognize --cnn
```

## Security Note

This repository is configured to strictly ignore the `secret.key` and `face_data.db` files. **Never** commit your `secret.key` to version control, as it is required to decrypt the biometric facial embeddings.
