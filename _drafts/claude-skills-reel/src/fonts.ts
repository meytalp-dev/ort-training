import { loadFont as loadRubik } from "@remotion/google-fonts/Rubik";
import { loadFont as loadHeebo } from "@remotion/google-fonts/Heebo";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

const rubikInfo = loadRubik();
const heeboInfo = loadHeebo();
const jetbrainsInfo = loadJetBrainsMono();

export const rubikFamily = rubikInfo.fontFamily;
export const heeboFamily = heeboInfo.fontFamily;
export const jetbrainsFamily = jetbrainsInfo.fontFamily;
