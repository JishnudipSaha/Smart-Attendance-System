import cv2
import numpy as np
from insightface.app import FaceAnalysis
from typing import List, Tuple

class FaceDetector:
    """
    Wrapper for RetinaFace detection using InsightFace.
    """
    def __init__(self, model_name="buffalo_l"):
        # Initialize FaceAnalysis with detection only
        self.app = FaceAnalysis(name=model_name, providers=['CPU'])
        self.app.prepare(ctx_id=0, det_size=(640, 640))

    def detect_faces(self, image: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """
        Detect faces and return bounding boxes.
        Returns: List of (x1, y1, x2, y2)
        """
        faces = self.app.get(image)
        bboxes = [face.bbox.astype(int) for face in faces]
        return bboxes
