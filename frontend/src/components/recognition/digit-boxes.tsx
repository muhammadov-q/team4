import { boxToPercent, hasBox, type DigitPrediction, type ImageSize } from '@/lib/digits'

interface DigitBoxesProps {
  predictions: DigitPrediction[]
  image: ImageSize
}

export function DigitBoxes({ predictions, image }: DigitBoxesProps) {
  return (
    <>
      {predictions
        .filter((prediction) => hasBox(prediction.box))
        .map((prediction, index) => {
          const box = boxToPercent(prediction.box, image)
          return (
            <div
              key={index}
              aria-hidden
              data-testid="digit-box"
              className="absolute rounded-sm shadow-[0_0_0_3px_rgb(0_0_0/0.45)] ring-2 ring-primary"
              style={{
                left: `${box.left}%`,
                top: `${box.top}%`,
                width: `${box.width}%`,
                height: `${box.height}%`,
              }}
            >
              <span className="absolute bottom-full -left-0.5 rounded-t-sm bg-primary px-1 py-0.5 font-mono text-caption leading-none text-primary-foreground">
                {prediction.digit}
              </span>
            </div>
          )
        })}
    </>
  )
}
