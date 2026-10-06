# Design patterns

Patterns that are in the code today. When a new one lands, add a row with the file and the symbol.

| Pattern              | Where                                                                                        | Why                                                                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Factory              | `create_predictor` in `backend/src/ml/factory.py`                                            | Builds the predictor named by its argument or by the `ML_PREDICTOR` environment variable, so switching models doesn't touch the route.       |
| Strategy             | `AbstractPredictor` in `backend/src/ml/predictor.py`                                         | Every model has the same `predict` and `model_version`, so `/predict` works with any of them.                                                |
| Dependency injection | `get_predictor` in `backend/src/app/main.py`, `capped_image` in `backend/src/app/uploads.py` | FastAPI `Depends` hands the route its predictor and the checked image bytes, so the route doesn't build them itself.                         |
| Repository           | `InMemoryCaptureSessionRepository` in `backend/src/app/capture/repository.py`                | All storage of phone capture sessions goes through it, so `CaptureService` doesn't know where they live.                                     |
| Service layer        | `CaptureService` in `backend/src/app/capture/service.py`                                     | Holds the session rules (random ids, 30 minute expiry, one photo at a time), so the routes in `backend/src/app/capture/router.py` stay thin. |
| Adapter              | `LoadingOrb` in `frontend/src/components/ui/loading-orb.tsx`                                 | The only import of `thinking-orbs`, so the animation library can be swapped in one place.                                                    |

## Predictor classes

```mermaid
classDiagram
    class AbstractPredictor {
        <<abstract>>
        +str model_version
        +predict(bytes image) list[DigitResult]
    }
    class DummyPredictor {
        +str model_version
        +predict(bytes image) list[DigitResult]
    }
    class KnnPredictor {
	    +str model_version
	    +predict(bytes image) list[DigitResult]
    }
    class factory {
        <<module>>
        +create_predictor(name) AbstractPredictor
    }
    AbstractPredictor <|-- DummyPredictor
    AbstractPredictor <|-- KnnPredictor
    factory ..> AbstractPredictor : creates
```
