import cv2
import numpy as np
from insightface.app import FaceAnalysis
from typing import List

class FaceRecognizer:
    """
    Wrapper for ArcFace embedding generation using InsightFace.
    """
    def __init__(self, model_name="buffalo_l"):
        # Initialize FaceAnalysis
        self.app = FaceAnalysis(name=model_name, providers=['CPU'])
        self.app.prepare(ctx_id=0, det_size=(640, 640))

    def get_embedding(self, image: np.ndarray, bbox: List[int]) -> np.ndarray:
        """
        Extract embedding for a specific face bounding box.
        """
        faces = self.app.get(image)

        # Find the face that matches the provided bbox
        for face in faces:
            face_bbox = face.bbox.astype(int)
            if np.array_equal(face_bbox, bbox):
                return face.embedding

        raise ValueError("Face embedding not found for the provided bounding box")
