import json
import unicodedata
from abc import ABC, abstractmethod
from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path

GLOSSARY_PATH = Path(__file__).resolve().parent / "data" / "glossary.json"

EDGE_MARKS = ".,;:·-´ʹ'’\u0387\u037e"


@dataclass(frozen=True)
class Gloss:
    lemma: str
    translation: str
    definition: str


def normalize(word: str) -> str:
    stripped = unicodedata.normalize("NFC", word).strip(EDGE_MARKS).lower()
    # A final acute is written grave when another word follows, so read both as acute
    decomposed = unicodedata.normalize("NFD", stripped).replace("\u0300", "\u0301")
    return unicodedata.normalize("NFC", decomposed)


class AbstractTranslator(ABC):
    @abstractmethod
    def translate(self, words: Sequence[str]) -> list[Gloss | None]: ...


class GlossaryTranslator(AbstractTranslator):
    """Placeholder: a hand-written glossary covering the words of Eparchos page 6791."""

    def __init__(self, glossary_path: Path = GLOSSARY_PATH) -> None:
        entries = json.loads(glossary_path.read_text(encoding="utf-8"))
        self.glossary = {
            normalize(form): Gloss(**entry) for form, entry in entries.items()
        }

    def translate(self, words: Sequence[str]) -> list[Gloss | None]:
        return [self.glossary.get(normalize(word)) for word in words]
