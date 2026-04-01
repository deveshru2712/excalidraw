function ApplyStrokeStyle(
  ctx: CanvasRenderingContext2D,
  style: string,
  width: number,
) {
  if (style === "solid") {
    ctx.setLineDash([]);
  } else if (style === "dashed") {
    ctx.setLineDash([width * 4, width * 2]);
  } else if (style === "dotted") {
    ctx.setLineDash([width, width * 2]);
  }
}

export default ApplyStrokeStyle;
