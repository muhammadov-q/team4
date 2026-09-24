from abc import ABC, abstractmethod


class AbstractPredictor(ABC):
    """Base class for every model that predicts the content of an image."""

    def __init__(self) -> None:
        self.model = ""

    @abstractmethod
    def predict(self, image: bytes) -> float:
        """Take the raw image bytes and return a prediction."""

class DummyPredictor(AbstractPredictor):
    """Placeholder: ignores the image and always returns the dummy value."""

    def __init__(self) -> None:
        super().__init__()
        self.model = "mock"
        self.dummy = 250_000.0

    def predict(self, image: bytes) -> float:
        return self.dummy