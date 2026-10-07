import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TabBar, TabKey } from './components/TabBar';
import { VoiceButton } from './components/VoiceButton';
import { HomeScreen } from './screens/HomeScreen';
import { ActivityScreen } from './screens/ActivityScreen';
import { UpcomingScreen } from './screens/UpcomingScreen';
import { InsightsScreen } from './screens/InsightsScreen';
import { MyMoneyScreen } from './screens/MyMoneyScreen';
import { ComponentGalleryScreen } from './screens/ComponentGalleryScreen';
import { SplashScreen } from './features/auth/screens/SplashScreen';
import { OnboardingScreen } from './features/auth/screens/OnboardingScreen';
import { AuthPhoneOtpScreen } from './features/auth/screens/AuthPhoneOtpScreen';
import { PinLockScreen } from './features/auth/screens/PinLockScreen';
import { BottomSheet } from './components/BottomSheet';
import { Button } from './components/Button';
import { Mascot } from './components/Mascot';
import { Text } from 'react-native';
import { colors, fonts } from './theme/theme';

type AuthStage = 'splash' | 'onboarding' | 'auth_otp' | 'pin_lock' | 'authenticated';

export const AppNavigator: React.FC = () => {
  const [stage, setStage] = useState<AuthStage>('splash');
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [showGallery, setShowGallery] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // 1. Splash Screen Stage
  if (stage === 'splash') {
    return <SplashScreen onFinish={() => setStage('onboarding')} />;
  }

  // 2. Onboarding Stage (9 steps)
  if (stage === 'onboarding') {
    return <OnboardingScreen onComplete={() => setStage('auth_otp')} />;
  }

  // 3. Auth Phone OTP Stage
  if (stage === 'auth_otp') {
    return <AuthPhoneOtpScreen onSuccess={() => setStage('pin_lock')} />;
  }

  // 4. PIN Lock / Biometrics Stage
  if (stage === 'pin_lock') {
    return <PinLockScreen onUnlock={() => setStage('authenticated')} />;
  }

  // 5. Component Gallery View (Phase 1 Reviewer Mode)
  if (showGallery) {
    return <ComponentGalleryScreen onBack={() => setShowGallery(false)} />;
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'activity':
        return <ActivityScreen />;
      case 'upcoming':
        return <UpcomingScreen />;
      case 'insights':
        return <InsightsScreen />;
      case 'myMoney':
        return <MyMoneyScreen />;
      case 'home':
      default:
        return (
          <HomeScreen
            onOpenGallery={() => setShowGallery(true)}
            onOpenVoice={() => setShowVoiceModal(true)}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Active Tab Screen */}
      {renderActiveScreen()}

      {/* Voice FAB Button - Floats above every tab in bottom right */}
      <VoiceButton onPress={() => setShowVoiceModal(true)} />

      {/* Bottom Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      {/* Voice Modal Sheet */}
      <BottomSheet
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        title="Voice Entry (KAI)"
      >
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <Mascot expression="listening" size={120} />
          <Text style={{ fontFamily: fonts.display, fontSize: 20, color: colors.forest, marginTop: 16 }}>
            Listening...
          </Text>
          <Text style={{ fontFamily: fonts.ui, fontSize: 14, color: colors.gray, textAlign: 'center', marginTop: 6, marginBottom: 20 }}>
            "Spent 500 on dinner yesterday with HDFC card"
          </Text>
          <Button
            title="Simulate Voice Parse"
            onPress={() => setShowVoiceModal(false)}
            style={{ width: '100%' }}
          />
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
});
