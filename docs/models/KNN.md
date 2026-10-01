# KNN
This model is a simple k-NN (6-NN) from the library scickit-learn. It have been train on an augmented dataset coming from scikit-learn to. It achieve an acceptable accuracy of around 97%.

You can found detailed information on the exploration notebook [./backend/src/ml/notebooks/KNN-exploration.ipynb](./backend/src/ml/notebooks/KNN-exploration.ipynb).

## Data
The k-NN model is train on the [MNIST dataset from scikit-learn](https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_digits.html#sklearn.datasets.load_digits). The dataset have been splitted with 33% keeped for the test and then augmented with distortion and rotations.

## Results
The accuracy is around 97%.

## Limits
It will fail to recognize a proper digit if the background is not uniforme or some artifact exist on the picture.
