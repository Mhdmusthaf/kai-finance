import React from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  Path,
  G,
  Rect,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { colors } from '../theme/theme';

export type MascotExpression =
  | 'default'
  | 'listening'
  | 'thinking'
  | 'insight'
  | 'happy'
  | 'celebrating'
  | 'reminder'
  | 'concerned'
  | 'sleeping'
  | 'waving';

interface MascotProps {
  expression?: MascotExpression;
  size?: number;
}

export const Mascot: React.FC<MascotProps> = ({
  expression = 'default',
  size = 120,
}) => {
  const vbSize = 200;

  const renderExpressionFeatures = () => {
    switch (expression) {
      case 'listening':
        return (
          <>
            {/* Wide, attentive 3D eyes */}
            <Circle cx="74" cy="98" r="15" fill="#06241B" />
            <Circle cx="126" cy="98" r="15" fill="#06241B" />
            <Circle cx="78" cy="92" r="6" fill="#FFFFFF" />
            <Circle cx="130" cy="92" r="6" fill="#FFFFFF" />
            <Circle cx="81" cy="95" r="2.5" fill="#FFFFFF" opacity={0.8} />
            <Circle cx="133" cy="95" r="2.5" fill="#FFFFFF" opacity={0.8} />

            {/* O-mouth listening */}
            <Ellipse cx="100" cy="123" rx="7" ry="9" fill="#06241B" />
            <Ellipse cx="100" cy="120" rx="4" ry="4" fill="#126B4B" opacity={0.5} />

            {/* 3D Sound waves around head */}
            <Path d="M 22 100 Q 15 80 22 60" stroke={colors.mint} strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <Path d="M 14 105 Q 6 80 14 55" stroke={colors.leaf} strokeWidth="3" strokeLinecap="round" fill="none" opacity={0.7} />
            <Path d="M 178 100 Q 185 80 178 60" stroke={colors.mint} strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <Path d="M 186 105 Q 194 80 186 55" stroke={colors.leaf} strokeWidth="3" strokeLinecap="round" fill="none" opacity={0.7} />
          </>
        );

      case 'thinking':
        return (
          <>
            {/* 3D Eyes looking up */}
            <Circle cx="74" cy="94" r="13" fill="#06241B" />
            <Circle cx="126" cy="94" r="13" fill="#06241B" />
            <Circle cx="77" cy="88" r="5" fill="#FFFFFF" />
            <Circle cx="129" cy="88" r="5" fill="#FFFFFF" />

            {/* Puzzled mouth */}
            <Path d="M 88 124 Q 100 118 112 124" stroke="#06241B" strokeWidth="3.5" strokeLinecap="round" fill="none" />

            {/* 3D Hand on chin */}
            <Circle cx="134" cy="132" r="11" fill="url(#hand3dGrad)" stroke="#ECE7DC" strokeWidth="1.5" />

            {/* Thought bubble 3D spheres */}
            <Circle cx="145" cy="56" r="4.5" fill={colors.lavender} />
            <Circle cx="156" cy="42" r="8" fill={colors.lavender} />
            <Circle cx="170" cy="24" r="12" fill="url(#lavender3dGrad)" />
          </>
        );

      case 'insight':
        return (
          <>
            {/* Sparkling 3D eyes */}
            <Circle cx="74" cy="98" r="14" fill="#06241B" />
            <Circle cx="126" cy="98" r="14" fill="#06241B" />
            <Circle cx="78" cy="93" r="5.5" fill="#FFFFFF" />
            <Circle cx="130" cy="93" r="5.5" fill="#FFFFFF" />

            {/* Warm smile */}
            <Path d="M 86 118 Q 100 130 114 118" stroke="#06241B" strokeWidth="4" strokeLinecap="round" fill="none" />

            {/* 3D Star / Sparkle Overhead */}
            <G transform="translate(100, 26)">
              <Path d="M 0 -14 L 4 -4 L 14 0 L 4 4 L 0 14 L -4 4 L -14 0 L -4 -4 Z" fill="url(#peach3dGrad)" />
              <Circle cx="0" cy="0" r="3" fill="#FFFFFF" />
            </G>
          </>
        );

      case 'happy':
        return (
          <>
            {/* Crescent happy 3D eyes */}
            <Path d="M 60 98 Q 74 82 88 98" stroke="#06241B" strokeWidth="5" strokeLinecap="round" fill="none" />
            <Path d="M 112 98 Q 126 82 140 98" stroke="#06241B" strokeWidth="5" strokeLinecap="round" fill="none" />

            {/* Open smile */}
            <Path d="M 82 116 Q 100 138 118 116 Z" fill="#06241B" />
            <Path d="M 90 127 Q 100 135 110 127" fill={colors.peach} />
          </>
        );

      case 'celebrating':
        return (
          <>
            {/* Joyful eyes */}
            <Path d="M 60 98 Q 74 82 88 98" stroke="#06241B" strokeWidth="5" strokeLinecap="round" fill="none" />
            <Path d="M 112 98 Q 126 82 140 98" stroke="#06241B" strokeWidth="5" strokeLinecap="round" fill="none" />

            {/* Smile */}
            <Path d="M 84 116 Q 100 134 116 116 Z" fill="#06241B" />

            {/* 3D Party Hat */}
            <Path d="M 85 45 L 100 8 L 115 45 Z" fill="url(#peach3dGrad)" stroke={colors.forest} strokeWidth="1.5" />
            <Circle cx="100" cy="8" r="6" fill={colors.mint} />
            <Circle cx="94" cy="30" r="3" fill={colors.leaf} />
            <Circle cx="106" cy="24" r="3.5" fill={colors.cream} />
          </>
        );

      case 'reminder':
        return (
          <>
            {/* Friendly eyes */}
            <Circle cx="74" cy="98" r="13" fill="#06241B" />
            <Circle cx="126" cy="98" r="13" fill="#06241B" />
            <Circle cx="77" cy="94" r="4.5" fill="#FFFFFF" />
            <Circle cx="129" cy="94" r="4.5" fill="#FFFFFF" />

            {/* Gentle smile */}
            <Path d="M 88 118 Q 100 126 112 118" stroke="#06241B" strokeWidth="3.5" strokeLinecap="round" fill="none" />

            {/* 3D Bell Icon */}
            <G transform="translate(160, 48)">
              <Path d="M -8 10 Q -8 0 0 -2 Q 8 0 8 10 L 11 18 L -11 18 Z" fill="url(#peach3dGrad)" />
              <Circle cx="0" cy="21" r="3" fill={colors.forest} />
            </G>
          </>
        );

      case 'concerned':
        return (
          <>
            {/* Concerned eyebrows & eyes */}
            <Path d="M 64 81 L 84 87" stroke="#06241B" strokeWidth="3.5" strokeLinecap="round" />
            <Path d="M 136 81 L 116 87" stroke="#06241B" strokeWidth="3.5" strokeLinecap="round" />
            <Circle cx="74" cy="100" r="14" fill="#06241B" />
            <Circle cx="126" cy="100" r="14" fill="#06241B" />
            <Circle cx="76" cy="96" r="4.5" fill="#FFFFFF" />
            <Circle cx="128" cy="96" r="4.5" fill="#FFFFFF" />

            {/* Downward curve mouth */}
            <Path d="M 86 127 Q 100 117 114 127" stroke="#06241B" strokeWidth="4" strokeLinecap="round" fill="none" />
          </>
        );

      case 'sleeping':
        return (
          <>
            {/* Sleepy closed eyes */}
            <Path d="M 64 98 Q 74 106 84 98" stroke="#06241B" strokeWidth="4" strokeLinecap="round" fill="none" />
            <Path d="M 116 98 Q 126 106 136 98" stroke="#06241B" strokeWidth="4" strokeLinecap="round" fill="none" />

            <Circle cx="100" cy="120" r="3" fill="#06241B" />

            {/* ZZZ Floating Bubbles */}
            <Path d="M 142 58 L 157 58 L 142 73 L 157 73" stroke={colors.gray} strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <Path d="M 162 38 L 172 38 L 162 48 L 172 48" stroke={colors.gray} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        );

      case 'waving':
        return (
          <>
            {/* Big happy 3D eyes */}
            <Circle cx="74" cy="98" r="14" fill="#06241B" />
            <Circle cx="126" cy="98" r="14" fill="#06241B" />
            <Circle cx="78" cy="93" r="5" fill="#FFFFFF" />
            <Circle cx="130" cy="93" r="5" fill="#FFFFFF" />

            {/* Open smile */}
            <Path d="M 84 116 Q 100 133 116 116 Z" fill="#06241B" />

            {/* 3D Waving hand */}
            <G transform="translate(162, 92)">
              <Circle cx="0" cy="0" r="11" fill="url(#hand3dGrad)" stroke="#ECE7DC" strokeWidth="1.5" />
              <Path d="M 6 -12 Q 14 -22 6 -32" stroke={colors.leaf} strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </G>
          </>
        );

      case 'default':
      default:
        return (
          <>
            {/* Friendly 3D Eyes with dual highlights */}
            <Circle cx="74" cy="98" r="14" fill="#06241B" />
            <Circle cx="126" cy="98" r="14" fill="#06241B" />
            <Circle cx="78" cy="93" r="5" fill="#FFFFFF" />
            <Circle cx="130" cy="93" r="5" fill="#FFFFFF" />
            <Circle cx="81" cy="96" r="2" fill="#FFFFFF" opacity={0.8} />
            <Circle cx="133" cy="96" r="2" fill="#FFFFFF" opacity={0.8} />

            {/* Happy small smile */}
            <Path d="M 88 118 Q 100 126 112 118" stroke="#06241B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </>
        );
    }
  };

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${vbSize} ${vbSize}`}>
        <Defs>
          {/* Main 3D Sphere Body Radial Gradient */}
          <RadialGradient
            id="sphere3d"
            cx="35%"
            cy="30%"
            rx="65%"
            ry="65%"
            fx="30%"
            fy="25%"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="25%" stopColor="#FFFDF9" stopOpacity="1" />
            <Stop offset="65%" stopColor="#F5EFE4" stopOpacity="1" />
            <Stop offset="90%" stopColor="#E6DDCF" stopOpacity="1" />
            <Stop offset="100%" stopColor="#D4C8B5" stopOpacity="1" />
          </RadialGradient>

          {/* 3D Leaf Gradient */}
          <LinearGradient id="leaf3d" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#3ED1A0" />
            <Stop offset="40%" stopColor="#22A06B" />
            <Stop offset="100%" stopColor="#0B3D2E" />
          </LinearGradient>

          {/* 3D Hand Gradient */}
          <RadialGradient id="hand3dGrad" cx="35%" cy="30%" r="65%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="70%" stopColor="#F5EFE4" />
            <Stop offset="100%" stopColor="#DDD3C3" />
          </RadialGradient>

          {/* 3D Peach Accent */}
          <LinearGradient id="peach3dGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFD6C2" />
            <Stop offset="50%" stopColor="#FFB89A" />
            <Stop offset="100%" stopColor="#E88F6D" />
          </LinearGradient>

          {/* 3D Lavender Accent */}
          <LinearGradient id="lavender3dGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E9E3FF" />
            <Stop offset="50%" stopColor="#C7B6FF" />
            <Stop offset="100%" stopColor="#9B80F0" />
          </LinearGradient>

          {/* 3D Floor Shadow */}
          <RadialGradient id="floorShadow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#06241B" stopOpacity="0.35" />
            <Stop offset="60%" stopColor="#06241B" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="#06241B" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* 3D Ambient Floor Shadow */}
        <Ellipse cx="100" cy="176" rx="54" ry="12" fill="url(#floorShadow)" />

        {/* Outer Mint Glow Ring */}
        <Circle cx="100" cy="108" r="68" fill={colors.mint} opacity={0.2} />
        <Circle cx="100" cy="108" r="65" fill={colors.softGreen} opacity={0.3} />

        {/* Main 3D Volumetric Body Sphere */}
        <Circle cx="100" cy="108" r="62" fill="url(#sphere3d)" stroke="#ECE7DC" strokeWidth="1.5" />

        {/* Top 3D Specular Highlight Gloss */}
        <Ellipse cx="80" cy="66" rx="22" ry="11" fill="#FFFFFF" opacity={0.65} transform="rotate(-20, 80, 66)" />

        {/* 3D Feet with Shadow Depth */}
        <Ellipse cx="76" cy="167" rx="17" ry="7.5" fill="#E8DEC9" />
        <Ellipse cx="76" cy="165" rx="16" ry="6.5" fill="url(#sphere3d)" />

        <Ellipse cx="124" cy="167" rx="17" ry="7.5" fill="#E8DEC9" />
        <Ellipse cx="124" cy="165" rx="16" ry="6.5" fill="url(#sphere3d)" />

        {/* 3D Hands */}
        {expression !== 'thinking' && (
          <Circle cx="39" cy="116" r="10" fill="url(#hand3dGrad)" stroke="#ECE7DC" strokeWidth="1" />
        )}
        {expression !== 'thinking' && expression !== 'waving' && (
          <Circle cx="161" cy="116" r="10" fill="url(#hand3dGrad)" stroke="#ECE7DC" strokeWidth="1" />
        )}

        {/* 3D Leaf on top of head */}
        <G transform="translate(100, 46) rotate(15)">
          {/* Stem */}
          <Path d="M 0 0 Q -5 12 -2 18" stroke={colors.forest} strokeWidth="3.5" strokeLinecap="round" fill="none" />
          {/* 3D Shaded Leaf */}
          <Path d="M 0 0 C 18 -28 38 -18 32 6 C 22 22 -6 18 0 0 Z" fill="url(#leaf3d)" />
          {/* Leaf Specular Rib */}
          <Path d="M 0 0 Q 16 -6 30 2" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity={0.8} fill="none" />
        </G>

        {/* Render Facial Expression Features */}
        {renderExpressionFeatures()}
      </Svg>
    </View>
  );
};
