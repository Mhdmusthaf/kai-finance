import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { colors, type, formatINR } from '../theme/theme';

export type AmountSize = 'sm' | 'md' | 'lg' | 'xl' | 'display';
export type AmountColor = 'forest' | 'deepMint' | 'error' | 'cream' | 'gray' | 'white';

interface AmountTextProps {
  amount: number;             // amount in paise by default (e.g. ₹500 = 50000)
  isPaise?: boolean;          // true if amount is in paise
  size?: AmountSize;
  color?: AmountColor;
  signed?: boolean;
  style?: TextStyle;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
}

export const AmountText: React.FC<AmountTextProps> = ({
  amount,
  isPaise = true,
  size = 'md',
  color = 'forest',
  signed = false,
  style,
  numberOfLines,
  adjustsFontSizeToFit = false,
}) => {
  const rupees = isPaise ? amount / 100 : amount;
  const formattedText = formatINR(rupees, { sign: signed });

  const getTextStyle = (): TextStyle => {
    let baseType: TextStyle = type.amount;
    if (size === 'sm') baseType = type.caption;
    if (size === 'md') baseType = type.amount;
    if (size === 'lg') baseType = type.amountLg;
    if (size === 'xl') baseType = type.amountXl;
    if (size === 'display') baseType = type.display;

    let textColor: string = colors.forest;
    if (color === 'deepMint') textColor = colors.deepMint;
    if (color === 'error') textColor = colors.errorText;
    if (color === 'cream') textColor = colors.cream;
    if (color === 'white') textColor = colors.white;
    if (color === 'gray') textColor = colors.gray;

    return {
      ...baseType,
      color: textColor,
    };
  };

  return (
    <Text
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      style={[getTextStyle(), style]}
    >
      {formattedText}
    </Text>
  );
};
