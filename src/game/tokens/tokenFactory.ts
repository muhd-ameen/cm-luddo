import type Phaser from "phaser";

export const createToken = (
  scene: Phaser.Scene,
  textureKey: string,
  fallbackLabel: string,
  tintHex: number,
  size: number
) => {
  const container = scene.add.container(0, 0);

  if (scene.textures.exists(textureKey)) {
    const portrait = scene.add.image(0, 0, textureKey);
    portrait.setDisplaySize(size, size);
    container.add(portrait);
  } else {
    const fallbackBg = scene.add.rectangle(0, 0, size, size, tintHex, 1);
    const label = scene.add.text(0, 0, fallbackLabel, {
      fontFamily: "Manrope",
      fontSize: `${Math.max(14, Math.round(size * 0.32))}px`,
      color: "#ffffff",
      fontStyle: "700"
    });
    label.setOrigin(0.5);
    container.add([fallbackBg, label]);
  }

  return container;
};
