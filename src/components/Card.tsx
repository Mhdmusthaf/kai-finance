import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, radius, shadow } from '../theme/theme';

export type CardVariant = 'default' | 'hero' | 'sheet' | 'insight';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  onPress,
}) => {
  const getCardStyle = (): ViewStyle => {
    switch (variant) {
      case 'hero':
        return {
          backgroundColor: colors.forest,
          borderRadius: radius.hero,
          padding: 20,
          ...shadow.hero,
        };
      case 'sheet':
        return {
          backgroundColor: colors.white,
          borderRadius: radius.sheet,
          padding: 24,
          borderWidth: 1,
          borderColor: colors.line,
          ...shadow.card,
        };
      case 'insight':
        return {
          backgroundColor: colors.softPurple,
          borderRadius: radius.card,
          padding: 18,
          borderWidth: 1,
          borderColor: colors.lavender,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.white,
          borderRadius: radius.card,
          padding: 18,
          borderWidth: 1,
          borderColor: colors.line,
          ...shadow.card,
        };
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        style={[getCardStyle(), style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
};
