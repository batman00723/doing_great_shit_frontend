const fs = require('fs');
const newShader = `<ShaderGradient {...{
  animate: "on",
  axesHelper: "off",
  bgColor1: "#000000",
  bgColor2: "#000000",
  brightness: 1.5,
  cAzimuthAngle: 250,
  cDistance: 1.5,
  cPolarAngle: 140,
  cameraZoom: 5,
  color1: "#005000",
  color2: "#4d2023",
  color3: "#00009b",
  destination: "onCanvas",
  embedMode: "off",
  envPreset: "city",
  format: "gif",
  fov: 45,
  frameRate: 10,
  gizmoHelper: "hide",
  grain: "off",
  lightType: "env",
  pixelDensity: 1.3,
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  range: "disabled",
  rangeEnd: 40,
  rangeStart: 0,
  reflection: 0.5,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 140,
  shader: "defaults",
  type: "sphere",
  uAmplitude: 4.9,
  uDensity: 2.3,
  uFrequency: 5.5,
  uSpeed: 0.1,
  uStrength: 0.7,
  uTime: 0,
  wireframe: false,
  zoomOut: true
}} />`;

let login = fs.readFileSync('src/app/login/page.tsx', 'utf8');
login = login.replace(/<ShaderGradient \{\.\.\.\{[\s\S]*?\}\}\s*\/>/g, newShader);
fs.writeFileSync('src/app/login/page.tsx', login);

let register = fs.readFileSync('src/app/register/page.tsx', 'utf8');
register = register.replace(/<ShaderGradient \{\.\.\.\{[\s\S]*?\}\}\s*\/>/g, newShader);
fs.writeFileSync('src/app/register/page.tsx', register);
