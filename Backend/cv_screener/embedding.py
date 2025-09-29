from typing import List, Union, Dict
import numpy as np
from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim
import torch

class CVEmbedder:
    """A base class for generating embeddings for CVs and job descriptions."""

    def __init__(self, model_name: str):
        """
        Initializes the embedder with a SentenceTransformer model.

        Args:
            model_name (str): The name of the SentenceTransformer model to use.
        """
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = SentenceTransformer(model_name, device=self.device)

    def embed_cv(self, cv_text: str) -> np.ndarray:
        """
        Generates an embedding for a single CV.

        Args:
            cv_text (str): The text of the CV.

        Returns:
            np.ndarray: The embedding vector.
        """
        return self.model.encode(cv_text, convert_to_numpy=True)

    def batch_embed_cvs(self, cv_texts: List[str]) -> np.ndarray:
        """
        Generates embeddings for a batch of CVs.

        Args:
            cv_texts (List[str]): A list of CV texts.

        Returns:
            np.ndarray: A matrix of embedding vectors.
        """
        return self.model.encode(cv_texts, convert_to_numpy=True)

    def embed_job_description(self, jd_text: str) -> np.ndarray:
        """
        Generates an embedding for a job description.

        Args:
            jd_text (str): The text of the job description.

        Returns:
            np.ndarray: The embedding vector.
        """
        return self.model.encode(jd_text, convert_to_numpy=True)

    @staticmethod
    def compute_similarity(embeddings1: np.ndarray, embeddings2: np.ndarray) -> np.ndarray:
        """
        Computes cosine similarity between two sets of embeddings.

        Args:
            embeddings1 (np.ndarray): The first set of embeddings.
            embeddings2 (np.ndarray): The second set of embeddings.

        Returns:
            np.ndarray: An array of similarity scores.
        """
        # Ensure embeddings2 is 2D for batch processing
        if len(embeddings2.shape) == 1:
            embeddings2 = embeddings2.reshape(1, -1)

        return cos_sim(embeddings1, embeddings2).numpy().flatten()

class CVMatchingEmbedder(CVEmbedder):
    """An embedder specifically tuned for matching CVs to job descriptions."""

    def __init__(self):
        """Initializes the embedder with a cross-encoder model suitable for semantic matching."""
        # Using a model known for good performance on semantic textual similarity
        super().__init__('all-MiniLM-L6-v2')

class FastEmbedder(CVEmbedder):
    """A fast embedder for quick processing, sacrificing some quality."""

    def __init__(self):
        """Initializes the embedder with a very fast model."""
        super().__init__('all-MiniLM-L6-v2') # A good balance of speed and quality

class HighQualityEmbedder(CVEmbedder):
    """A high-quality embedder for best results, at the cost of speed."""

    def __init__(self):
        """Initializes the embedder with a high-quality model."""
        super().__init__('all-roberta-large-v1')
