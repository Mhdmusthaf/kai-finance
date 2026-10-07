import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors, fonts, space } from '../../../theme/theme';
import { Mascot, MascotExpression } from '../../../components/Mascot';
import { Button } from '../../../components/Button';
import { Icon } from '../../../components/Icon';

interface Step {
  id: string;
  title: string;
  subtitle: string;
  mascot: MascotExpression;
  buttonLabel: string;
}

const STEPS: Step[] = [
  {
    id: 'welcome',
    title: 'Meet KAI, your Money OS',
    subtitle: 'A calm, voice-first financial assistant that organizes your cash, bills, cards, investments, and goals in one place.',
    mascot: 'waving',
    buttonLabel: 'Get Started',
  },
  {
    id: 'moneyos',
    title: 'Every Rupee Tracked Automatically',
    subtitle: 'KAI links your accounts, schedule upcoming EMIs and bills, and keeps every balance updated in real-time.',
    mascot: 'happy',
    buttonLabel: 'Next',
  },
  {
    id: 'voice',
    title: 'Just Say What You Spent',
    subtitle: '"Spent 500 on dinner with HDFC card". KAI records it in 3 seconds with instant Undo.',
    mascot: 'listening',
    buttonLabel: 'Try Voice Demo',
  },
  {
    id: 'currency',
    title: 'Designed for India (INR)',
    subtitle: 'Full support for Indian digit grouping (₹1,40,000), paise precision, and multi-currency when you travel.',
    mascot: 'insight',
    buttonLabel: 'Continue',
  },
  {
    id: 'profile',
    title: 'Personalized For You',
    subtitle: 'Whether you are salaried, freelancing, or managing a household, KAI adapts to your money style.',
    mascot: 'reminder',
    buttonLabel: 'Continue',
  },
  {
    id: 'objects',
    title: 'All Your Accounts in Sync',
    subtitle: 'Track Savings, Credit Cards, Mutual Funds, Fixed Deposits, Health Insurance and Loans effortlessly.',
    mascot: 'thinking',
    buttonLabel: 'Continue',
  },
  {
    id: 'goals',
    title: 'Reach Your Dream Goals',
    subtitle: 'Set up emergency funds, trip savings, or house down payments with smart monthly targets.',
    mascot: 'celebrating',
    buttonLabel: 'Continue',
  },
  {
    id: 'account',
    title: 'Bank-Grade Privacy & Security',
    subtitle: 'Your data is encrypted on your device and locked behind your Face ID or 4-digit PIN.',
    mascot: 'default',
    buttonLabel: 'Create Account',
  },
  {
    id: 'done',
    title: 'You are All Set!',
    subtitle: 'Welcome to your new financial clarity. Let us log your phone number to get started.',
    mascot: 'happy',
    buttonLabel: 'Go to Phone Login',
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const step = STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar with Step Indicators & Skip */}
      <View style={styles.topBar}>
        <View style={styles.indicators}>
          {STEPS.map((s, idx) => (
            <View
              key={s.id}
              style={[
                styles.dot,
                idx === currentStep ? styles.activeDot : idx < currentStep ? styles.passedDot : null,
              ]}
            />
          ))}
        </View>
        {currentStep < STEPS.length - 1 && (
          <TouchableOpacity activeOpacity={0.8} onPress={onComplete}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Slide Content */}
      <View style={styles.content}>
        <Mascot expression={step.mascot} size={150} />
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.subtitle}>{step.subtitle}</Text>
      </View>

      {/* Footer Controls */}
      <View style={styles.footer}>
        <Button title={step.buttonLabel} onPress={handleNext} style={styles.btn} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
    justifyContent: 'space-between',
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.screenX,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.line,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.forest,
  },
  passedDot: {
    backgroundColor: colors.leaf,
  },
  skipText: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: colors.gray,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.screenX * 1.5,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.forest,
    textAlign: 'center',
    marginTop: 32,
  },
  subtitle: {
    fontFamily: fonts.ui,
    fontSize: 15,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: space.screenX,
    paddingBottom: 24,
  },
  btn: {
    width: '100%',
  },
});
