function GetElementToMove(
  ctx: CanvasRenderingContext2D,
  elements: DrawingElement[],
  eraserX: number,
  eraserY: number,
  threshold: number
): string | null {
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    // Handle text element
    if (element.type === "text") {
      const textElement = element as TextElement;
      const textWidth = ctx.measureText(textElement.content).width;

      const isInside =
        textElement.point.x < eraserX &&
        eraserX < textElement.point.x + textWidth &&
        textElement.point.y - textElement.fontSize < eraserY &&
        eraserY < textElement.point.y;

      if (isInside) {
        return textElement.id;
      }
    } else {
      // Handle pencil element
      const pencilElement = element as PencilElement;

      for (let j = 1; j < pencilElement.points.length; j++) {
        const pointA = pencilElement.points[j];
        const pointB = pencilElement.points[j - 1];

        const numerator =
          (eraserX - pointA.x) * (pointB.x - pointA.x) +
          (eraserY - pointA.y) * (pointB.y - pointA.y);

        const denominator =
          (pointB.x - pointA.x) ** 2 + (pointB.y - pointA.y) ** 2;

        let t = numerator / denominator;
        t = Math.max(0, Math.min(1, t));

        const segmentVector: Point = {
          x: pointB.x - pointA.x,
          y: pointB.y - pointA.y,
        };

        const projectionPoint: Point = {
          x: pointA.x + t * segmentVector.x,
          y: pointA.y + t * segmentVector.y,
        };

        const distance = Math.sqrt(
          (projectionPoint.x - eraserX) ** 2 +
            (projectionPoint.y - eraserY) ** 2
        );

        if (distance <= threshold) {
          return pencilElement.id;
        }
      }
    }
  }

  return null;
}

export default GetElementToMove;
