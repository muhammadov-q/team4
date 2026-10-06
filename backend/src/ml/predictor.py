from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class DigitResult:
    digit: int
    probabilities: dict[int, float]
    box: tuple[int, int, int, int]  # x, y, w, h


class AbstractPredictor(ABC):
    """Base class for every model that predicts the content of an image."""

    @property
    @abstractmethod
    def model_version(self) -> str:
        """Return the version of the model."""

    @abstractmethod
    def predict(self, image: bytes) -> list[DigitResult]:
        """Take the raw image bytes and return the detected digits."""


class DummyPredictor(AbstractPredictor):
    """Placeholder: ignores the image and always returns the dummy digits."""

    def __init__(self) -> None:
        super().__init__()
        self.model = "mock"
        self.dummy = [2, 5, 0, 0, 0, 0]

    @property
    def model_version(self):
        return self.model

    def predict(self, image: bytes) -> list[DigitResult]:
        return [
            DigitResult(digit=d, probabilities={d: 1.0}, box=(0, 0, 0, 0))
            for d in self.dummy
        ]
