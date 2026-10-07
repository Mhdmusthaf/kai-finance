import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors, shadow, size } from '../theme/theme';
import { Icon } from './Icon';

interface VoiceButtonProps {
  onPress: () => void;
  isListening?: boolean;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  onPress,
  isListening = false,
}) => {
  const fabSize = size.fab; // 62pt

  return (
    <View style={styles.wrapper}>
      {/* Glow ring if listening */}
      {isListening && <View style={styles.glowRing} />}

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.container}
      >
        <Svg width={fabSize} height={fabSize} viewBox="0 0 62 62">
          <Defs>
            <RadialGradient id="voiceGrad" cx="30%" cy="30%" r="70%">
              <Stop offset="0%" stopColor="#1F7A5A" />
              <Stop offset="70%" stopColor="#0B3D2E" />
              <Stop offset="100%" stopColor="#072C20" />
            </RadialGradient>
          </Defs>

          {/* Main Round Forest Gradient Body */}
          <Circle cx="31" cy="31" r="30" fill="url(#voiceGrad)" stroke="#17805A" strokeWidth="1" />

          {/* Top-Right Leaf Accent */}
          <Path
            d="M 44 8 C 54 0 58 12 50 16 C 44 18 40 12 44 8 Z"
            fill={colors.mint}
          />
        </Svg>

        <View style={styles.iconOverlay}>
          <Icon name="mic" size={26} color={colors.mint} strokeWidth={2.2} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: size.tabBar + 12,
    right: 20,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: size.fab,
    height: size.fab,
    borderRadius: 31,
    ...shadow.fab,
  },
  iconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: size.fab + 16,
    height: size.fab + 16,
    borderRadius: 39,
    borderWidth: 2,
    borderColor: colors.mint,
    backgroundColor: 'rgba(62, 209, 160, 0.2)',
  },
});
