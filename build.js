const fs = require("fs");
const path = require("path");
const less = require("less");

const THEMES = [
  {
    name: "greensteam",
    less: path.join(__dirname, "styles/greensteam/greensteam.less"),
    out: path.join(__dirname, "dist/greensteam.css"),
    assetDir: path.join(__dirname, "styles/greensteam"),
  },
  {
    name: "blacksteam",
    less: path.join(__dirname, "styles/blacksteam/blacksteam.less"),
    out: path.join(__dirname, "dist/blacksteam.css"),
    assetDir: path.join(__dirname, "styles/blacksteam"),
  },
];

const ASSET_EXTS = [".png"];

function getBase64(filePath) {
  const data = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1);
  return `data:image/${ext};base64,${data.toString("base64")}`;
}

function inlineAssets(css, assetDir) {
  return css.replace(/url\(["']?([^"')]+)["']?\)/g, (match, assetPath) => {
    if (assetPath.startsWith("data:") || assetPath.startsWith("http"))
      return match;
    const abs = path.resolve(assetDir, assetPath);
    if (fs.existsSync(abs) && ASSET_EXTS.includes(path.extname(abs))) {
      return `url('${getBase64(abs)}')`;
    }
    return match;
  });
}

async function buildTheme(theme) {
  const lessContent = fs.readFileSync(theme.less, "utf8");
  const output = await less.render(lessContent, {
    paths: [path.dirname(theme.less)],
    filename: path.basename(theme.less),
  });
  const inlined = inlineAssets(output.css, theme.assetDir);
  fs.mkdirSync(path.dirname(theme.out), { recursive: true });
  fs.writeFileSync(theme.out, inlined);
  console.log(`Built ${theme.name} to ${theme.out}`);
}

async function main() {
  for (const theme of THEMES) {
    await buildTheme(theme);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
