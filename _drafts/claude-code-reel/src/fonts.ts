import { loadFont as loadRubik } from "@remotion/google-fonts/Rubik";
import { loadFont as loadHeebo } from "@remotion/google-fonts/Heebo";
import { staticFile } from "remotion";

const rubikInfo = loadRubik();
const heeboInfo = loadHeebo();

export const rubikFamily = rubikInfo.fontFamily;
export const heeboFamily = heeboInfo.fontFamily;

// Load Playpen Sans Hebrew (local file)
const playpenStyle = document.createElement("style");
playpenStyle.textContent = `
  @font-face {
    font-family: 'Playpen Sans Hebrew';
    src: url('${staticFile("PlaypenSansHebrew.ttf")}') format('truetype');
    font-weight: 400;
    font-style: normal;
  }
`;
document.head.appendChild(playpenStyle);

export const playpenFamily = "'Playpen Sans Hebrew'";
