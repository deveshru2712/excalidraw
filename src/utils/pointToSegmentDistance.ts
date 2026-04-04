function isPointNearSegment(
  pointA: Point,
  pointB: Point,
  mouseX: number,
  mouseY: number,
  eraserRadius: number
): boolean {
  const numerator =
    (mouseX - pointA.x) * (pointB.x - pointA.x) +
    (mouseY - pointA.y) * (pointB.y - pointA.y);

  const denominator = (pointB.x - pointA.x) ** 2 + (pointB.y - pointA.y) ** 2;

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
    (projectionPoint.x - mouseX) ** 2 + (projectionPoint.y - mouseY) ** 2
  );
  if (distance <= eraserRadius) {
    return true;
  }
  return false;
}

export default isPointNearSegment;
