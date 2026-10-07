import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Path, G, Rect } from 'react-native-svg';
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

  // Eyes and mouth details per expression
  const renderExpressionFeatures = () => {
    switch (expression) {
      case 'listening':
        return (
          <>
            {/* Wide, attentive eyes */}
            <Circle cx="75" cy="98" r="16" fill="#06241B" />
            <Circle cx="125" cy="98" r="16" fill="#06241B" />
            <Circle cx="80" cy="92" r="6" fill="#FFFFFF" />
            <Circle cx="130" cy="92" r="6" fill="#FFFFFF" />
            {/* O-mouth listening */}
            <Ellipse cx="100" cy="122" rx="6" ry="8" fill="#06241B" />
            {/* Sound waves around head */}
            <Path d="M 25 100 Q 20 80 25 60" stroke={colors.mint} strokeWidth="4" strokeLinecap="round" fill="none" />
            <Path d="M 175 100 Q 180 80 175 60" stroke={colors.mint} strokeWidth="4" strokeLinecap="round" fill="none" />
          </>
        );
      case 'thinking':
        return (
          <>
            {/* Eyes looking up */}
            <Circle cx="75" cy="95" r="14" fill="#06241B" />
            <Circle cx="125" cy="95" r="14" fill="#06241B" />
            <Circle cx="78" cy="89" r="5" fill="#FFFFFF" />
            <Circle cx="128" cy="89" r="5" fill="#FFFFFF" />
            {/* Puzzled mouth */}
            <Path d="M 90 125 Q 100 120 110 125" stroke="#06241B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            {/* Hand on chin */}
            <Circle cx="135" cy="135" r="10" fill="#FCFBF8" stroke="#ECE7DC" strokeWidth="2" />
            {/* Thought bubble */}
            <Circle cx="145" cy="55" r="4" fill={colors.lavender} />
            <Circle cx="155" cy="42" r="7" fill={colors.lavender} />
          </>
        );
      case 'insight':
        return (
          <>
            {/* Sparkling eyes */}
            <Circle cx="75" cy="98" r="14" fill="#06241B" />
            <Circle cx="125" cy="98" r="14" fill="#06241B" />
            <Circle cx="79" cy="93" r="5" fill="#FFFFFF" />
            <Circle cx="129" cy="93" r="5" fill="#FFFFFF" />
            {/* Smile */}
            <Path d="M 88 118 Q 100 130 112 118" stroke="#06241B" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Star overhead */}
            <Path d="M 100 25 L 104 35 L 115 35 L 106 42 L 109 52 L 100 45 L 91 52 L 94 42 L 85 35 L 96 35 Z" fill={colors.lavender} />
          </>
        );
      case 'happy':
        return (
          <>
            {/* Crescent happy eyes */}
            <Path d="M 62 98 Q 75 84 88 98" stroke="#06241B" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <Path d="M 112 98 Q 125 84 138 98" stroke="#06241B" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            {/* Big open smile */}
            <Path d="M 82 116 Q 100 138 118 116 Z" fill="#06241B" />
            <Path d="M 90 128 Q 100 136 110 128" fill="#FFB89A" />
          </>
        );
      case 'celebrating':
        return (
          <>
            {/* Joyful eyes */}
            <Path d="M 62 98 Q 75 84 88 98" stroke="#06241B" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <Path d="M 112 98 Q 125 84 138 98" stroke="#06241B" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            {/* Smile */}
            <Path d="M 85 116 Q 100 134 115 116 Z" fill="#06241B" />
            {/* Party Hat */}
            <Path d="M 85 45 L 100 10 L 115 45 Z" fill={colors.peach} stroke={colors.forest} strokeWidth="2" />
            <Circle cx="100" cy="10" r="5" fill={colors.mint} />
          </>
        );
      case 'reminder':
        return (
          <>
            {/* Kind eyes */}
            <Circle cx="75" cy="98" r="13" fill="#06241B" />
            <Circle cx="125" cy="98" r="13" fill="#06241B" />
            <Circle cx="78" cy="94" r="4.5" fill="#FFFFFF" />
            <Circle cx="128" cy="94" r="4.5" fill="#FFFFFF" />
            {/* Gentle smile */}
            <Path d="M 90 118 Q 100 126 110 118" stroke="#06241B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            {/* Bell icon next to mascot */}
            <Path d="M 155 50 Q 155 42 162 42 Q 169 42 169 50 L 172 58 L 152 58 Z" fill={colors.peach} />
          </>
        );
      case 'concerned':
        return (
          <>
            {/* Concerned eyebrows & eyes */}
            <Path d="M 65 82 L 85 88" stroke="#06241B" strokeWidth="3" strokeLinecap="round" />
            <Path d="M 135 82 L 115 88" stroke="#06241B" strokeWidth="3" strokeLinecap="round" />
            <Circle cx="75" cy="100" r="14" fill="#06241B" />
            <Circle cx="125" cy="100" r="14" fill="#06241B" />
            <Circle cx="77" cy="96" r="4.5" fill="#FFFFFF" />
            <Circle cx="127" cy="96" r="4.5" fill="#FFFFFF" />
            {/* Downward curve mouth */}
            <Path d="M 88 126 Q 100 116 112 126" stroke="#06241B" strokeWidth="4" strokeLinecap="round" fill="none" />
          </>
        );
      case 'sleeping':
        return (
          <>
            {/* Closed sleepy eyes u u */}
            <Path d="M 65 98 Q 75 106 85 98" stroke="#06241B" strokeWidth="4" strokeLinecap="round" fill="none" />
            <Path d="M 115 98 Q 125 106 135 98" stroke="#06241B" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Small neutral mouth */}
            <Circle cx="100" cy="120" r="3" fill="#06241B" />
            {/* ZZZ */}
            <Path d="M 140 60 L 155 60 L 140 75 L 155 75" stroke={colors.gray} strokeWidth="3" strokeLinecap="round" fill="none" />
            <Path d="M 160 40 L 170 40 L 160 50 L 170 50" stroke={colors.gray} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        );
      case 'waving':
        return (
          <>
            {/* Big happy eyes */}
            <Circle cx="75" cy="98" r="14" fill="#06241B" />
            <Circle cx="125" cy="98" r="14" fill="#06241B" />
            <Circle cx="79" cy="93" r="5" fill="#FFFFFF" />
            <Circle cx="129" cy="93" r="5" fill="#FFFFFF" />
            {/* Open smile */}
            <Path d="M 85 116 Q 100 132 115 116 Z" fill="#06241B" />
            {/* Waving hand */}
            <Circle cx="160" cy="100" r="10" fill="#FCFBF8" stroke="#ECE7DC" strokeWidth="2" />
            <Path d="M 168 85 Q 175 75 168 65" stroke={colors.leaf} strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        );
      case 'default':
      default:
        return (
          <>
            {/* Regular big friendly eyes */}
            <Circle cx="75" cy="98" r="14" fill="#06241B" />
            <Circle cx="125" cy="98" r="14" fill="#06241B" />
            <Circle cx="79" cy="93" r="5" fill="#FFFFFF" />
            <Circle cx="129" cy="93" r="5" fill="#FFFFFF" />
            {/* Happy small smile */}
            <Path d="M 90 118 Q 100 126 110 118" stroke="#06241B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </>
        );
    }
  };

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${vbSize} ${vbSize}`}>
        {/* Soft Outer Mint Glow / Shadow Ring */}
        <Circle cx="100" cy="108" r="72" fill={colors.mint} opacity={0.25} />
        <Circle cx="100" cy="108" r="68" fill={colors.softGreen} opacity={0.4} />

        {/* Main Body (Soft Cream Sphere) */}
        <Circle cx="100" cy="108" r="62" fill="#FCFBF8" stroke="#ECE7DC" strokeWidth="2.5" />

        {/* Feet */}
        <Ellipse cx="76" cy="166" rx="16" ry="7" fill="#F2EFE8" />
        <Ellipse cx="124" cy="166" rx="16" ry="7" fill="#F2EFE8" />

        {/* Hands */}
        {expression !== 'thinking' && (
          <Circle cx="40" cy="116" r="9" fill="#FCFBF8" stroke="#ECE7DC" strokeWidth="1.5" />
        )}
        {expression !== 'thinking' && expression !== 'waving' && (
          <Circle cx="160" cy="116" r="9" fill="#FCFBF8" stroke="#ECE7DC" strokeWidth="1.5" />
        )}

        {/* The Leaf on top of head */}
        <G transform="translate(100, 46) rotate(15)">
          <Path d="M 0 0 C 15 -25 35 -15 30 5 C 20 20 -5 15 0 0 Z" fill={colors.leaf} />
          <Path d="M 0 0 Q 15 -5 28 2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity={0.7} />
          {/* Stem */}
          <Path d="M 0 0 Q -4 10 -2 16" stroke={colors.forest} strokeWidth="3" strokeLinecap="round" fill="none" />
        </G>

        {/* Facial Expression & Extras */}
        {renderExpressionFeatures()}
      </Svg>
    </View>
  );
};
