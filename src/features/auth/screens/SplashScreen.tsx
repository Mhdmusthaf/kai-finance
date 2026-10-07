import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, fonts } from '../../../theme/theme';
import { Mascot } from '../../../components/Mascot';

interface SplashProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Mascot expression="waving" size={140} />
        <Text style={styles.title}>KAI</Text>
        <Text style={styles.subtitle}>Your Money OS</Text>
      </View>
      <Text style={styles.footer}>Voice-first Personal Finance</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 48,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 48,
    color: colors.cream,
    marginTop: 20,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: fonts.uiBold,
    fontSize: 18,
    color: colors.mint,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  footer: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.sage,
  },
});
