import cv2
import numpy as np
from app.ai.detector import FaceDetector
from app.ai.recognizer import FaceRecognizer
from typing import Optional, List, Tuple

class RecognitionPipeline:
    """
    Orchestrates Face Detection and Recognition to generate face embeddings.
    """
    def __init__(self):
        self.detector = FaceDetector()
        self.recognizer = FaceRecognizer()

    def generate_embedding(self, image_path: str) -> Optional[np.ndarray]:
        """
        Load image, detect the primary face, and return its embedding.
        """
        image = cv2.imread(image_path)
        if image is None:
            raise FileNotFoundError(f"Could not read image at {image_path}")

        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        bboxes = self.detector.detect_faces(image)
        if not bboxes:
            return None

        largest_bbox = max(bboxes, key=lambda b: (b[2]-b[0]) * (b[3]-b[1]))

        try:
            embedding = self.recognizer.get_embedding(image, largest_bbox)
            return embedding
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return None

    def process_classroom_image(self, image_path: str) -> List[Tuple[np.ndarray, np.ndarray]]:
        """
        Processes a classroom image to detect all faces and generate embeddings for each.
        Returns: List of (bounding_box, embedding)
        """
        image = cv2.imread(image_path)
        if image is None:
            raise FileNotFoundError(f"Could not read image at {image_path}")

        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        bboxes = self.detector.detect_faces(image_rgb)

        results = []
        for bbox in bboxes:
            try:
                embedding = self.recognizer.get_embedding(image_rgb, bbox)
                results.append((bbox, embedding))
            except Exception as e:
                print(f"Error generating embedding for bbox {bbox}: {e}")
                continue

        return results
