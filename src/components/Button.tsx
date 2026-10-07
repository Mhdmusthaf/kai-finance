import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, fonts, radius, size } from '../theme/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'lg' | 'md' | 'sm';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  buttonSize?: ButtonSize;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  buttonSize = 'lg',
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getContainerStyle = (): ViewStyle => {
    let baseHeight = size.buttonLg;
    if (buttonSize === 'md') baseHeight = size.buttonMd;
    if (buttonSize === 'sm') baseHeight = size.buttonSm;

    switch (variant) {
      case 'secondary':
        return {
          height: baseHeight,
          backgroundColor: colors.lightGray,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: colors.line,
        };
      case 'ghost':
        return {
          height: baseHeight,
          backgroundColor: 'transparent',
          borderRadius: radius.pill,
        };
      case 'destructive':
        return {
          height: baseHeight,
          backgroundColor: colors.errorBg,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: colors.errorText + '33',
        };
      case 'primary':
      default:
        return {
          height: baseHeight,
          backgroundColor: disabled ? colors.muted : colors.forest,
          borderRadius: radius.pill,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'secondary':
        return {
          fontFamily: fonts.uiBold,
          fontSize: 16,
          color: colors.forest,
        };
      case 'ghost':
        return {
          fontFamily: fonts.uiBold,
          fontSize: 15,
          color: colors.deepMint,
        };
      case 'destructive':
        return {
          fontFamily: fonts.uiBold,
          fontSize: 16,
          color: colors.errorText,
        };
      case 'primary':
      default:
        return {
          fontFamily: fonts.uiHeavy,
          fontSize: 16,
          color: colors.cream,
        };
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, getContainerStyle(), style]}
    >
      {icon}
      <Text style={[styles.text, getTextStyle(), textStyle, icon ? { marginLeft: 8 } : null]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    minHeight: 44,
  },
  text: {
    textAlign: 'center',
  },
});
