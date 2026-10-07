import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts } from '../theme/theme';
import { Mascot, MascotExpression } from './Mascot';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  mascotExpression?: MascotExpression;
  ctaLabel?: string;
  onCtaPress?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  mascotExpression = 'sleeping',
  ctaLabel,
  onCtaPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Mascot expression={mascotExpression} size={110} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {ctaLabel && onCtaPress ? (
        <Button
          title={ctaLabel}
          onPress={onCtaPress}
          variant="primary"
          buttonSize="md"
          style={styles.cta}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    marginVertical: 12,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.forest,
    marginTop: 16,
    textAlign: 'center',
  },
  description: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  cta: {
    marginTop: 18,
    minWidth: 160,
  },
});
