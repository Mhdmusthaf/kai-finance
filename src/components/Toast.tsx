import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, fonts, radius, shadow } from '../theme/theme';
import { Mascot } from './Mascot';

interface ToastProps {
  visible: boolean;
  message: string;
  onUndo?: () => void;
  style?: ViewStyle;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  onUndo,
  style,
}) => {
  if (!visible) return null;

  return (
    <View style={[styles.toast, style]}>
      <View style={styles.leftContainer}>
        <Mascot expression="happy" size={28} />
        <Text numberOfLines={1} style={styles.message}>
          {message}
        </Text>
      </View>
      {onUndo && (
        <TouchableOpacity activeOpacity={0.8} onPress={onUndo} style={styles.undoBtn}>
          <Text style={styles.undoText}>Undo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  toast: {
    height: 52,
    backgroundColor: colors.forest,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow.fab,
    borderWidth: 1,
    borderColor: 'rgba(62, 209, 160, 0.2)',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  message: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: colors.cream,
    marginLeft: 10,
    flex: 1,
  },
  undoBtn: {
    backgroundColor: 'rgba(62, 209, 160, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  undoText: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.mint,
  },
});
