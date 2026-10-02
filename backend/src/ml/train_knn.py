from pathlib import Path

import cv2
import joblib
import numpy as np
import sklearn
from sklearn.datasets import fetch_openml
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import Normalizer

MODELS_DIRECTORY = Path(__file__).resolve().parent / "models"
MODEL_NAME = "knn_mnist.joblib"

MODELS_DIRECTORY.mkdir(parents=True, exist_ok=True)


# Load the dataset
mnist = fetch_openml("mnist_784", as_frame=False)
X_train, X_test, y_train, y_test = train_test_split(
    mnist.data, mnist.target, test_size=0.33, random_state=42
)

# Augment the dataset
rng = np.random.default_rng(42)


def random_affine(
    img, max_angle=15, max_shear=0.3, scale_range=(0.9, 1.1), max_shift=2
):
    """Random rotation, scaling, shear and shift around the image center."""
    angle = rng.uniform(-max_angle, max_angle)
    scale = rng.uniform(*scale_range)
    R = np.vstack([cv2.getRotationMatrix2D((14, 14), angle, scale), [0, 0, 1]])

    shear = rng.uniform(-max_shear, max_shear)
    S = np.array(
        [
            [1, shear, -shear * 14],  # horizontal shear, centered vertically
            [0, 1, 0],
            [0, 0, 1],
        ]
    )

    A = (S @ R)[:2]
    A[:, 2] += rng.uniform(-max_shift, max_shift, 2)
    return cv2.warpAffine(
        img, A.astype(np.float32), (28, 28), flags=cv2.INTER_LINEAR, borderValue=0
    )


def elastic(img, alpha=34, sigma=4):
    """Elastic deformation (Simard et al., 2003): smooth random displacement field."""
    dx = (
        cv2.GaussianBlur(rng.uniform(-1, 1, (28, 28)).astype(np.float32), (0, 0), sigma)
        * alpha
    )
    dy = (
        cv2.GaussianBlur(rng.uniform(-1, 1, (28, 28)).astype(np.float32), (0, 0), sigma)
        * alpha
    )
    x, y = np.meshgrid(np.arange(28, dtype=np.float32), np.arange(28, dtype=np.float32))
    return cv2.remap(img, x + dx, y + dy, cv2.INTER_LINEAR, borderValue=0)


def augment_dataset(X, y, copies=1, p_elastic=0.5):
    """Return the original data plus `copies` distorted versions of every image."""
    X_aug, y_aug = [X], [y]
    for _ in range(copies):
        out = np.empty_like(X, dtype=np.uint8)
        for i, row in enumerate(X):
            img = row.reshape(28, 28).astype(np.uint8)
            img = random_affine(img)
            if rng.random() < p_elastic:
                img = elastic(img)
            out[i] = img.ravel()
        X_aug.append(out)
        y_aug.append(y)
    return np.concatenate(X_aug), np.concatenate(y_aug)


X_train_aug, y_train_aug = augment_dataset(X_train, y_train, copies=1)


# Train the knn
knn = make_pipeline(
    Normalizer(), KNeighborsClassifier(n_neighbors=6, weights="distance")
)
knn.fit(X_train_aug, y_train_aug)


# Evaluation
result = knn.predict(X_test)

print("Accuracy :", accuracy_score(y_test, result))
print(classification_report(y_test, result))


# Export the model

joblib.dump(knn, MODELS_DIRECTORY / MODEL_NAME, compress=3)
print(sklearn.__version__)
