import numpy as np
from typing import List, Tuple, Optional
from app.core.config import settings

class SimilarityService:
    """
    Service to handle embedding comparisons using cosine similarity.
    """
    def __init__(self, threshold: float = 0.6):
        self.threshold = threshold

    def calculate_cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """
        Calculate cosine similarity between two vectors.
        Formula: (A . B) / (||A|| * ||B||)
        """
        # Ensure vectors are numpy arrays
        v1 = np.array(vec1)
        v2 = np.array(vec2)

        dot_product = np.dot(v1, v2)
        norm_v1 = np.linalg.norm(v1)
        norm_v2 = np.linalg.norm(v2)

        if norm_v1 == 0 or norm_v2 == 0:
            return 0.0

        return float(dot_product / (norm_v1 * norm_v2))

    def find_best_match(self, live_embedding: np.ndarray, registered_embeddings: List[Tuple[int, np.ndarray]]) -> Optional[Tuple[int, float]]:
        """
        Compare a live embedding against a list of (student_id, embedding) tuples.
        Returns: (student_id, confidence_score) if match is above threshold, else None.
        """
        best_match = None
        max_similarity = -1.0

        for student_id, reg_embedding in registered_embeddings:
            similarity = self.calculate_cosine_similarity(live_embedding, reg_embedding)

            if similarity > max_similarity:
                max_similarity = similarity
                best_match = student_id

        if best_match and max_similarity >= self.threshold:
            return best_match, max_similarity

        return None
