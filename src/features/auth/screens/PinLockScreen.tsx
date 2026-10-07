import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors, fonts, space } from '../../../theme/theme';
import { Button } from '../../../components/Button';
import { Icon } from '../../../components/Icon';
import { Mascot } from '../../../components/Mascot';

interface PinLockProps {
  onUnlock: () => void;
}

export const PinLockScreen: React.FC<PinLockProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        setTimeout(() => {
          onUnlock();
        }, 200);
      }
    }
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Mascot expression="default" size={100} />
        <Text style={styles.title}>Enter 4-Digit PIN</Text>
        <Text style={styles.subtitle}>Unlock KAI to view your finances</Text>

        {/* PIN Dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((idx) => (
            <View
              key={idx}
              style={[styles.dot, pin.length > idx && styles.activeDot]}
            />
          ))}
        </View>

        {/* 12-key Keypad */}
        <View style={styles.keypadGrid}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'faceId', '0', 'backspace'].map((key) => {
            if (key === 'faceId') {
              return (
                <TouchableOpacity
                  key={key}
                  onPress={onUnlock}
                  style={styles.keyCell}
                >
                  <Icon name="security" size={26} color={colors.forest} />
                </TouchableOpacity>
              );
            }
            if (key === 'backspace') {
              return (
                <TouchableOpacity
                  key={key}
                  onPress={handleDelete}
                  style={styles.keyCell}
                >
                  <Icon name="close" size={22} color={colors.forest} />
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                key={key}
                onPress={() => handleKeyPress(key)}
                style={styles.keyCell}
              >
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: space.screenX,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.forest,
    marginTop: 20,
  },
  subtitle: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.gray,
    marginTop: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 32,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.forest,
  },
  activeDot: {
    backgroundColor: colors.forest,
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280,
    justifyContent: 'center',
    gap: 16,
    marginTop: 10,
  },
  keyCell: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.forest,
  },
});
