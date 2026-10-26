import json
import unicodedata

import pytest

from ml.eparchos_predictor import EparchosPredictor
from ml.translator import (
    GLOSSARY_PATH,
    AbstractTranslator,
    Gloss,
    GlossaryTranslator,
    normalize,
)

NATURE = {"lemma": "φύσις", "translation": "nature", "definition": "noun: nature"}


@pytest.fixture
def glossary_file(tmp_path):
    path = tmp_path / "glossary.json"
    path.write_text(json.dumps({"φύσις": NATURE}, ensure_ascii=False), "utf-8")
    return path


# --- normalize --------------------------------------------------------------


def test_grave_and_acute_spellings_match():
    assert normalize("καὶ") == normalize("καί")


@pytest.mark.parametrize("word", ["θεοῦ.", "ἐστί,", "δοῦκαν:-", "φυσι-", "α´.", "τί;"])
def test_strips_punctuation_and_marks_at_the_edges(word):
    assert normalize(word) == normalize(word.rstrip(".,:;-´"))


def test_capital_letters_match_small_ones():
    assert normalize("Ἐπιλύσεις") == normalize("ἐπιλύσεις")


def test_keeps_the_final_sigma():
    assert normalize("φύσις").endswith("ς")


def test_composed_and_decomposed_letters_match():
    decomposed = unicodedata.normalize("NFD", "ψυχή")
    assert decomposed != "ψυχή"
    assert normalize(decomposed) == normalize("ψυχή")


# --- GlossaryTranslator -----------------------------------------------------


def test_is_an_abstract_translator(glossary_file):
    assert isinstance(GlossaryTranslator(glossary_file), AbstractTranslator)


def test_returns_one_gloss_per_word_in_order(glossary_file):
    translator = GlossaryTranslator(glossary_file)
    assert translator.translate(["φύσις", "unknown", "Φύσις,"]) == [
        Gloss(**NATURE),
        None,
        Gloss(**NATURE),
    ]


def test_no_words_give_no_glosses(glossary_file):
    assert GlossaryTranslator(glossary_file).translate([]) == []


def test_missing_glossary_raises(tmp_path):
    with pytest.raises(FileNotFoundError):
        GlossaryTranslator(tmp_path / "missing.json")


def test_entry_without_a_field_raises(tmp_path):
    path = tmp_path / "glossary.json"
    path.write_text(json.dumps({"φύσις": {"lemma": "φύσις"}}), "utf-8")
    with pytest.raises(TypeError):
        GlossaryTranslator(path)


# --- The glossary shipped with the repo -------------------------------------


def test_no_two_entries_share_a_key():
    entries = json.loads(GLOSSARY_PATH.read_text("utf-8"))
    assert len({normalize(form) for form in entries}) == len(entries)


def test_every_entry_is_filled_in():
    for gloss in GlossaryTranslator().glossary.values():
        assert gloss.lemma and gloss.translation and gloss.definition


def test_every_word_on_the_eparchos_page_has_a_gloss():
    words = [w.text for w in EparchosPredictor().predict(b"")]
    glosses = GlossaryTranslator().translate(words)
    assert [w for w, g in zip(words, glosses, strict=True) if g is None] == []


def test_first_word_of_the_page():
    (gloss,) = GlossaryTranslator().translate(["Ἐπιλύσεις"])
    assert gloss is not None
    assert (gloss.lemma, gloss.translation) == ("ἐπίλυσις", "solutions")
