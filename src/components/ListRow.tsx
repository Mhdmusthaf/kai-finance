import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, fonts, radius, size } from '../theme/theme';
import { AmountText, AmountColor } from './AmountText';

interface ListRowProps {
  title: string;
  subtitle?: string;
  amount?: number;            // in paise
  amountColor?: AmountColor;
  icon?: React.ReactNode;
  iconBgColor?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showDivider?: boolean;
  style?: ViewStyle;
}

export const ListRow: React.FC<ListRowProps> = ({
  title,
  subtitle,
  amount,
  amountColor = 'forest',
  icon,
  iconBgColor = colors.softGreen,
  onPress,
  rightElement,
  showDivider = false,
  style,
}) => {
  const content = (
    <View style={[styles.container, showDivider && styles.divider, style]}>
      {icon && (
        <View style={[styles.iconChip, { backgroundColor: iconBgColor }]}>
          {icon}
        </View>
      )}

      <View style={styles.textContainer}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightContainer}>
        {amount !== undefined && (
          <AmountText amount={amount} color={amountColor} size="md" />
        )}
        {rightElement}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.88} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  iconChip: {
    width: size.iconChip,
    height: size.iconChip,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.uiBold,
    fontSize: 15,
    color: colors.charcoal,
  },
  subtitle: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.gray,
    marginTop: 2,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 10,
  },
});
