import React from "react";
import { AbsoluteFill, Series, Audio, staticFile, Img, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Scene1Intro } from "./scenes/Scene1Intro";
import { Scene2Wrong } from "./scenes/Scene2Wrong";
import { Scene3Right } from "./scenes/Scene3Right";
import { Scene4Product } from "./scenes/Scene4Product";
import { Scene8Numbers } from "./scenes/Scene8Numbers";
import { Scene9Quote } from "./scenes/Scene9Quote";
import { Scene10CTA } from "./scenes/Scene10CTA";
import { FONTS, COLORS } from "./styles";

// Meytal intro scene with her photo
const MeytalIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const photoScale = spring({ frame, fps, from: 0.5, to: 1, config: { damping: 8, mass: 0.5 } });
  const photoOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const nameOpacity = interpolate(frame, [15, 25], [0, 1], { extrapolateRight: "clamp" });
  const nameY = spring({ frame: Math.max(0, frame - 15), fps, from: 30, to: 0, config: { damping: 10 } });
  const titleOpacity = interpolate(frame, [30, 40], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(145deg, #FFFFFF 0%, #E0F5F0 30%, #FFF8EE 55%, #FFF0E0 80%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Heebo', sans-serif", direction: "rtl", gap: 24,
    }}>
      {/* Photo */}
      <div style={{
        width: 280, height: 280, borderRadius: "50%", overflow: "hidden",
        border: `5px solid ${COLORS.tealAccent}`,
        boxShadow: "0 20px 60px rgba(44,186,160,0.2)",
        transform: `scale(${photoScale})`, opacity: photoOpacity,
      }}>
        <Img src={staticFile("meytal.jpeg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      {/* Name */}
      <div style={{
        fontFamily: "'Rubik', sans-serif", fontSize: 52, fontWeight: 800,
        color: COLORS.textDark, opacity: nameOpacity, transform: `translateY(${nameY}px)`,
      }}>
        מיטל פלג
      </div>
      {/* Title */}
      <div style={{
        fontFamily: "'Heebo', sans-serif", fontSize: 32, fontWeight: 500,
        color: COLORS.orange, opacity: titleOpacity,
      }}>
        מורה | חדשנות חינוכית
      </div>
    </AbsoluteFill>
  );
};

export const ClaudeCodeReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFF8EE" }}>
      {/* Background music */}
      <Audio src={staticFile("music.mp3")} volume={0.25} />

      <Series>
        {/* Scene 0: Meytal intro — 2 sec = 60 frames */}
        <Series.Sequence durationInFrames={60}>
          <MeytalIntro />
        </Series.Sequence>

        {/* Scene 1: Hook — 3.5 sec = 105 frames */}
        <Series.Sequence durationInFrames={105}>
          <Scene1Intro />
        </Series.Sequence>

        {/* Scene 2: Wrong — 3 sec = 90 frames */}
        <Series.Sequence durationInFrames={90}>
          <Scene2Wrong />
        </Series.Sequence>

        {/* Scene 3: Right — 3 sec = 90 frames */}
        <Series.Sequence durationInFrames={90}>
          <Scene3Right />
        </Series.Sequence>

        {/* Product 1: Games — 4 sec = 120 frames */}
        <Series.Sequence durationInFrames={120}>
          <Scene4Product
            screenshot="screenshots/games.png"
            title="מחולל משחקים"
            subtitle="12 סוגי משחקים בלחיצה"
            variant={1}
          />
        </Series.Sequence>

        {/* Product 2: Wheel — 4 sec = 120 frames */}
        <Series.Sequence durationInFrames={120}>
          <Scene4Product
            screenshot="screenshots/wheel.png"
            title="גלגל המזל"
            subtitle="פעילות פתיחה אינטראקטיבית"
            variant={2}
          />
        </Series.Sequence>

        {/* Product 3: Website — 4 sec = 120 frames */}
        <Series.Sequence durationInFrames={120}>
          <Scene4Product
            screenshot="screenshots/website.png"
            title="אתר הדרכות מלא"
            subtitle="בינה מלאכותית מעצימה מורים"
            variant={3}
          />
        </Series.Sequence>

        {/* Product 4: Design Studio — 4 sec = 120 frames */}
        <Series.Sequence durationInFrames={120}>
          <Scene4Product
            screenshot="screenshots/design-studio.png"
            title="סטודיו עיצוב"
            subtitle="פלטות, פונטים, סגנונות"
            variant={4}
          />
        </Series.Sequence>

        {/* Numbers — 3.5 sec = 105 frames */}
        <Series.Sequence durationInFrames={105}>
          <Scene8Numbers />
        </Series.Sequence>

        {/* Quote — 3 sec = 90 frames */}
        <Series.Sequence durationInFrames={90}>
          <Scene9Quote />
        </Series.Sequence>

        {/* CTA — 4 sec = 120 frames */}
        <Series.Sequence durationInFrames={120}>
          <Scene10CTA />
        </Series.Sequence>
      </Series>

      {/* Learni watermark — persistent top-right corner */}
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 40,
          fontFamily: FONTS.heading,
          fontSize: 24,
          color: "rgba(42,42,58,0.3)",
          zIndex: 100,
          pointerEvents: "none",
        }}
      >
        Learni
      </div>
    </AbsoluteFill>
  );
};
