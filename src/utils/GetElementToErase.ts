function GetElementToErase(
  ctx: CanvasRenderingContext2D,
  elements: DrawingElement[],
  eraserX: number,
  eraserY: number,
  eraserRadius: number,
): string[] {
  const res: string[] = [];
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].type === "text") {
      // for the text element
      const elem = elements[i] as TextElement;
      const width = ctx.measureText(elem.content).width;

      if (
        elem.point.x < eraserX &&
        eraserX < elem.point.x + width &&
        elem.point.y - elem.fontSize < eraserY &&
        eraserY < elem.point.y
      ) {
        res.push(elem.id);
      }
    } else {
      // for free hand element
      const elem = elements[i] as PencilElement;

      for (let j = 0; j < elem.points.length; j++) {
        const point = elem.points[j];
        const isContacted = Math.sqrt(
          (point.x - eraserX) ** 2 + (point.y - eraserY) ** 2,
        );
        if (isContacted < eraserRadius) {
          res.push(elements[i].id);
          break;
        }
      }
    }
  }
  return res;
}

export default GetElementToErase;
