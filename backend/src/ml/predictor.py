from abc import ABC, abstractmethod
from dataclasses import dataclass

Box = tuple[int, int, int, int]  # x, y, w, h


@dataclass
class Prediction:
    text: str
    probabilities: dict[str, float]
    box: Box


class AbstractPredictor(ABC):
    """Base class for every model that predicts the content of an image."""

    @property
    @abstractmethod
    def model_version(self) -> str:
        """Return the version of the model."""

    @abstractmethod
    def predict(self, image: bytes) -> list[Prediction]:
        """Take the raw image bytes and return the detected digits."""


class DummyPredictor(AbstractPredictor):
    """Placeholder: ignores the image and always returns the dummy digits."""

    def __init__(self) -> None:
        super().__init__()
        self.model = "mock"
        self.dummy = ["2", "5", "0", "0", "0", "0"]

    @property
    def model_version(self) -> str:
        return self.model

    def predict(self, image: bytes) -> list[Prediction]:
        return [
            Prediction(text=d, probabilities={d: 1.0}, box=(0, 0, 0, 0))
            for d in self.dummy
        ]
