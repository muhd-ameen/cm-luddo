export const buildFallbackAvatar = (name: string, color = "#1d3557") => {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 96;
  const ctx = canvas.getContext("2d");

  if (!ctx) return "";

  const grd = ctx.createLinearGradient(0, 0, 96, 96);
  grd.addColorStop(0, color);
  grd.addColorStop(1, "#0f172a");

  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 96, 96);

  ctx.fillStyle = "#f8fafc";
  ctx.font = "700 34px Manrope";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, 48, 50);

  return canvas.toDataURL("image/png");
};
