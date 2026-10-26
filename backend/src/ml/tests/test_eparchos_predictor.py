import pytest

from ml.eparchos_predictor import (
    XML_PATH,
    EparchosPredictor,
    parse_page_xml,
    polygon_to_box,
)
from ml.predictor import AbstractPredictor, Prediction

NS_2013 = "http://schema.primaresearch.org/PAGE/gts/pagecontent/2013-07-15"
NS_2019 = "http://schema.primaresearch.org/PAGE/gts/pagecontent/2019-07-15"


def word(text: str | None, points: str | None, word_id: str = "w") -> str:
    coords = f'<Coords points="{points}"/>' if points is not None else ""
    equiv = (
        f"<TextEquiv><Unicode>{text}</Unicode></TextEquiv>" if text is not None else ""
    )
    return f'<Word id="{word_id}">{coords}{equiv}</Word>'


def page(*lines: list[str], namespace: str = NS_2013) -> bytes:
    """Build a minimal PAGE document; each line is a list of <Word> strings."""
    xmlns = f' xmlns="{namespace}"' if namespace else ""
    body = "".join(
        f'<TextLine id="l{i}"><Coords points="0,0 1,1"/>{"".join(words)}'
        f"<TextEquiv><Unicode>whole line</Unicode></TextEquiv></TextLine>"
        for i, words in enumerate(lines)
    )
    return (
        f'<?xml version="1.0" encoding="utf-8"?><PcGts{xmlns}>'
        f'<Page imageFilename="p.png" imageWidth="800" imageHeight="800">'
        f'<TextRegion id="r0"><Coords points="0,0 1,1"/>{body}</TextRegion>'
        f"</Page></PcGts>"
    ).encode()


@pytest.fixture
def xml_file(tmp_path):
    """A two-line page on disk, with words stored out of order."""
    path = tmp_path / "eparchos_test.xml"
    path.write_bytes(
        page(
            [
                word("δύο", "100,10 150,10 150,40 100,40"),
                word("ἕν", "10,12 60,12 60,40 10,40"),
            ],
            [word("τρία", "10,60 80,60 80,90 10,90")],
        )
    )
    return path


# --- polygon_to_box ---------------------------------------------------------


def test_rectangle_becomes_box():
    assert polygon_to_box("182,12 300,12 300,42 182,42") == (182, 12, 118, 30)


def test_polygon_becomes_its_bounding_box():
    assert polygon_to_box("10,20 50,5 90,30 40,60") == (10, 5, 80, 55)


# --- parse_page_xml ---------------------------------------------------------


def test_returns_predictions_with_text_box_and_full_confidence():
    (result,) = parse_page_xml(page([word("καὶ", "307,12 354,12 354,42 307,42")]))
    assert result == Prediction(
        text="καὶ", probabilities={"καὶ": 1.0}, box=(307, 12, 47, 30), line=0
    )


def test_sorts_words_left_to_right_inside_a_line():
    xml = page(
        [
            word("c", "300,0 320,0 320,20 300,20"),
            word("a", "10,0 30,0 30,20 10,20"),
            word("b", "150,0 170,0 170,20 150,20"),
        ]
    )
    assert [w.text for w in parse_page_xml(xml)] == ["a", "b", "c"]


def test_keeps_lines_in_document_order():
    xml = page(
        [word("first", "500,0 520,0 520,20 500,20")],
        [word("second", "10,50 30,50 30,70 10,70")],
    )
    assert [w.text for w in parse_page_xml(xml)] == ["first", "second"]


def test_numbers_lines_from_zero():
    xml = page(
        [word("a", "0,0 10,0 10,10 0,10"), word("b", "20,0 30,0 30,10 20,10")],
        [word("c", "0,50 10,50 10,60 0,60")],
    )
    assert [(w.text, w.line) for w in parse_page_xml(xml)] == [
        ("a", 0),
        ("b", 0),
        ("c", 1),
    ]


def test_strips_whitespace_around_text():
    (result,) = parse_page_xml(page([word("  φυσι-\n ", "0,0 10,0 10,10 0,10")]))
    assert result.text == "φυσι-"


@pytest.mark.parametrize(
    "bad_word",
    [
        word(None, "0,0 10,0 10,10 0,10"),  # no TextEquiv
        word("", "0,0 10,0 10,10 0,10"),  # empty text
        word("   ", "0,0 10,0 10,10 0,10"),  # blank text
        word("text", None),  # no Coords
        word("text", ""),  # empty points
    ],
)
def test_skips_words_without_text_or_coordinates(bad_word):
    xml = page([bad_word, word("kept", "50,0 60,0 60,10 50,10")])
    assert [w.text for w in parse_page_xml(xml)] == ["kept"]


def test_ignores_the_line_level_text():
    # Lines carry their own TextEquiv; only <Word> elements become predictions
    assert parse_page_xml(page([])) == []


@pytest.mark.parametrize("namespace", [NS_2013, NS_2019, ""])
def test_works_with_any_page_namespace(namespace):
    xml = page([word("λόγος", "0,0 10,0 10,10 0,10")], namespace=namespace)
    assert [w.text for w in parse_page_xml(xml)] == ["λόγος"]


def test_accepts_a_utf8_bom():
    xml = b"\xef\xbb\xbf" + page([word("ἀρχή", "0,0 10,0 10,10 0,10")])
    assert [w.text for w in parse_page_xml(xml)] == ["ἀρχή"]


def test_invalid_xml_raises():
    with pytest.raises(Exception):  # noqa: B017 - ParseError subclasses SyntaxError
        parse_page_xml(b"<PcGts><Page>")


# --- EparchosPredictor ------------------------------------------------------


def test_is_an_abstract_predictor(xml_file):
    assert isinstance(EparchosPredictor(xml_file), AbstractPredictor)


def test_model_version_comes_from_the_file_name(xml_file):
    assert EparchosPredictor(xml_file).model_version == "eparchos-test"


@pytest.mark.parametrize("image", [b"", b"not an image", bytes(10_000)])
def test_ignores_the_image(xml_file, image):
    predictor = EparchosPredictor(xml_file)
    assert [w.text for w in predictor.predict(image)] == ["ἕν", "δύο", "τρία"]


def test_returns_a_fresh_copy_each_call(xml_file):
    predictor = EparchosPredictor(xml_file)
    first = predictor.predict(b"img")
    first[0].text = "changed"
    first.clear()
    assert [w.text for w in predictor.predict(b"img")] == ["ἕν", "δύο", "τρία"]


def test_missing_file_raises(tmp_path):
    with pytest.raises(FileNotFoundError):
        EparchosPredictor(tmp_path / "missing.xml")


# --- The real page shipped with the repo ------------------------------------


@pytest.fixture(scope="module")
def real_words():
    return EparchosPredictor().predict(b"")


def test_real_page_model_version():
    assert EparchosPredictor().model_version == "eparchos-6791"


def test_real_page_has_all_139_words(real_words):
    assert len(real_words) == 139


def test_real_page_starts_with_the_first_word_on_the_page(real_words):
    # "Ἐπιλύσεις" is stored last in its line in the XML, but is read first
    assert [w.text for w in real_words[:3]] == ["Ἐπιλύσεις", "σύντομοι", "καὶ"]
    assert real_words[0].box == (59, 14, 106, 39)  # "59,14 165,14 165,53 59,53"


def test_real_page_has_16_lines_in_reading_order(real_words):
    lines = [w.line for w in real_words]
    assert lines == sorted(lines)
    assert set(lines) == set(range(16))


def test_real_page_boxes_fit_inside_the_image(real_words):
    for w in real_words:
        x, y, width, height = w.box
        assert x >= 0 and y >= 0 and width > 0 and height > 0
        assert x + width <= 788 and y + height <= 805


def test_real_page_rebuilds_the_line_texts():
    """Joined words must match each <TextLine>'s own text (except stray marks)."""
    import xml.etree.ElementTree as ET

    root = ET.parse(XML_PATH).getroot()
    for line in root.findall(".//{*}TextLine"):
        line_xml = ET.tostring(line)
        line_text = line.findtext("{*}TextEquiv/{*}Unicode")
        assert line_text is not None, f"line {line.get('id')} has no text"
        expected = line_text.split()
        got = [w.text for w in parse_page_xml(b"<PcGts>" + line_xml + b"</PcGts>")]
        assert got == expected[: len(got)]
