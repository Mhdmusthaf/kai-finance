import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, fonts, radius, size } from '../theme/theme';

export type ChipVariant = 'default' | 'selected' | 'statusSuccess' | 'statusWarning' | 'statusError' | 'category';

interface ChipProps {
  label: string;
  selected?: boolean;
  variant?: ChipVariant;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  variant = 'default',
  onPress,
  icon,
  style,
}) => {
  const getContainerStyle = (): ViewStyle => {
    if (selected || variant === 'selected') {
      return {
        backgroundColor: colors.forest,
        borderColor: colors.forest,
      };
    }
    switch (variant) {
      case 'statusSuccess':
        return { backgroundColor: colors.successBg, borderColor: colors.softGreen };
      case 'statusWarning':
        return { backgroundColor: colors.warningBg, borderColor: '#FFE2B8' };
      case 'statusError':
        return { backgroundColor: colors.errorBg, borderColor: '#FFC8BD' };
      case 'category':
        return { backgroundColor: colors.lightGray, borderColor: colors.line };
      case 'default':
      default:
        return { backgroundColor: colors.lightGray, borderColor: colors.line };
    }
  };

  const getTextStyle = (): TextStyle => {
    if (selected || variant === 'selected') {
      return { color: colors.cream, fontFamily: fonts.uiBold };
    }
    switch (variant) {
      case 'statusSuccess':
        return { color: colors.successText, fontFamily: fonts.uiSemi };
      case 'statusWarning':
        return { color: colors.warningText, fontFamily: fonts.uiSemi };
      case 'statusError':
        return { color: colors.errorText, fontFamily: fonts.uiSemi };
      case 'default':
      default:
        return { color: colors.charcoal, fontFamily: fonts.uiSemi };
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={!onPress}
      onPress={onPress}
      style={[styles.chip, getContainerStyle(), style]}
    >
      {icon}
      <Text style={[styles.text, getTextStyle(), icon ? { marginLeft: 6 } : null]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    height: size.chip,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 13,
  },
});
