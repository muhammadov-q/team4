import cv2
import numpy as np
import pytest


@pytest.fixture
def digit_image() -> bytes:
    """A real PNG: a black '7' on a white background."""
    img = np.full((200, 200), 255, dtype=np.uint8)
    cv2.putText(img, "7", (50, 160), cv2.FONT_HERSHEY_SIMPLEX, 5, 0, 15)
    ok, buffer = cv2.imencode(".png", img)
    assert ok
    return buffer.tobytes()
