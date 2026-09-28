from abc import ABC, abstractmethod


class AbstractPredictor(ABC):
    """Base class for every model that predicts the content of an image."""

    @property
    @abstractmethod
    def model_version(self) -> str:
        """Return the version of the model."""

    @abstractmethod
    def predict(self, image: bytes) -> float:
        """Take the raw image bytes and return a prediction."""


class DummyPredictor(AbstractPredictor):
    """Placeholder: ignores the image and always returns the dummy value."""

    def __init__(self) -> None:
        super().__init__()
        self.model = "mock"
        self.dummy = 250_000.0

    @property
    def model_version(self):
        return self.model

    def predict(self, image: bytes) -> float:
        return self.dummy
