from typing import List, Dict
import numpy as np
from .embedding import CVEmbedder

class Matcher:
    """A class to match CVs against a job description using embeddings."""

    def __init__(self):
        """Initializes the Matcher with a CVMatchingEmbedder."""
        self.embedder = CVEmbedder(model_name='all-MiniLM-L6-v2')

    def match(self, cv_names: List[str],cv_texts: List[str], jd_text: str) -> List[Dict[str, float]]:
        """Matches a list of CVs against a single job description.

        Args:
            cv_texts (List[str]): A list of CV texts.
            jd_text (str): The job description text.

        Returns:
            List[Dict[str, float]]: A list of dictionaries, where each dictionary
                                     contains the CV text and its similarity score.
        """
        # Embed the job description
        jd_embedding = self.embedder.embed_job_description(jd_text)

        # Embed the CVs in batch
        cv_embeddings = self.embedder.batch_embed_cvs(cv_texts)

        # Compute similarity scores
        scores = self.embedder.compute_similarity(cv_embeddings, jd_embedding)

        # Prepare the results
        results = []
        for i, cv_text in enumerate(cv_texts):
            results.append({
                'filename': cv_names[i],
                'score': scores[i]
            })

        # Sort results by score in descending order
        results.sort(key=lambda x: x['score'], reverse=True)

        return results
