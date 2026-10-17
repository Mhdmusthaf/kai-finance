import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';
import { TabBar, TabKey } from './components/TabBar';
import { VoiceButton } from './components/VoiceButton';
import { HomeScreen } from './screens/HomeScreen';
import { ActivityScreen } from './screens/ActivityScreen';
import { UpcomingScreen } from './screens/UpcomingScreen';
import { InsightsScreen } from './screens/InsightsScreen';
import { MyMoneyScreen } from './screens/MyMoneyScreen';
import { GoalsScreen } from './screens/GoalsScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { MeScreen } from './screens/MeScreen';
import { OwedScreen } from './screens/OwedScreen';
import { NetWorthScreen } from './screens/NetWorthScreen';
import { TransactionDetailScreen } from './screens/TransactionDetailScreen';
import { TransactionItem } from './context/AppContext';
import { ComponentGalleryScreen } from './screens/ComponentGalleryScreen';
import { SplashScreen } from './features/auth/screens/SplashScreen';
import { OnboardingScreen } from './features/auth/screens/OnboardingScreen';
import { AuthPhoneOtpScreen } from './features/auth/screens/AuthPhoneOtpScreen';
import { PinLockScreen } from './features/auth/screens/PinLockScreen';
import { BottomSheet } from './components/BottomSheet';
import { Button } from './components/Button';
import { Mascot } from './components/Mascot';
import { Toast } from './components/Toast';
import { Icon } from './components/Icon';
import { colors, fonts } from './theme/theme';
import { AppProvider, useApp } from './context/AppContext';

const AppContent: React.FC = () => {
  const {
    authStage,
    setAuthStage,
    addTransaction,
    toastMessage,
    hideToast,
    loading,
    syncError,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [showGallery, setShowGallery] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [overlay, setOverlay] = useState<
    null | 'notifications' | 'me' | 'goals' | 'owed' | 'networth' | { kind: 'txDetail'; tx: TransactionItem }
  >(null);

  // Voice assistant state
  const [voiceInput, setVoiceInput] = useState('Spent 500 on dinner yesterday with HDFC card');
  const [voiceState, setVoiceState] = useState<'listening' | 'thinking' | 'done'>('listening');

  // 1. Splash Screen Stage
  if (authStage === 'splash') {
    return <SplashScreen onFinish={() => setAuthStage('onboarding')} />;
  }

  // 2. Onboarding Stage (9 steps)
  if (authStage === 'onboarding') {
    return <OnboardingScreen onComplete={() => setAuthStage('auth_otp')} />;
  }

  // 3. Auth Phone OTP Stage
  if (authStage === 'auth_otp') {
    return <AuthPhoneOtpScreen onSuccess={() => setAuthStage('pin_lock')} />;
  }

  // 4. PIN Lock / Biometrics Stage
  if (authStage === 'pin_lock') {
    return <PinLockScreen onUnlock={() => setAuthStage('authenticated')} />;
  }

  // 5. Component Gallery View (Phase 1 Reviewer Mode)
  if (showGallery) {
    return <ComponentGalleryScreen onBack={() => setShowGallery(false)} />;
  }

  const handleVoiceParse = (textToParse?: string) => {
    const text = textToParse || voiceInput;
    setVoiceState('thinking');

    setTimeout(() => {
      // Parse transaction from voice input
      if (text.toLowerCase().includes('salary') || text.toLowerCase().includes('income')) {
        addTransaction({
          title: 'Voice Income',
          subtitle: 'Salary credit · SBI Savings',
          amount: 14000000,
          type: 'income',
          amountColor: 'deepMint',
          icon: 'income',
          iconBgColor: colors.softGreen,
          account: 'SBI Savings',
          isVoice: true,
        });
      } else {
        addTransaction({
          title: 'Dinner · Truffles',
          subtitle: 'Food & Dining · HDFC Savings · Voice',
          amount: 50000,
          type: 'expense',
          icon: 'mic',
          iconBgColor: colors.softGreen,
          account: 'HDFC Savings',
          isVoice: true,
        });
      }

      setVoiceState('done');
      setTimeout(() => {
        setShowVoiceModal(false);
        setVoiceState('listening');
      }, 500);
    }, 900);
  };

  // Full-screen overlays sit on top of the tab stack
  if (overlay) {
    if (overlay === 'notifications') {
      return (
        <NotificationsScreen
          onBack={() => setOverlay(null)}
        />
      );
    }
    if (overlay === 'me') {
      return (
        <MeScreen
          onOpenNotifications={() => setOverlay('notifications')}
        />
      );
    }
    if (overlay === 'goals') return <GoalsScreen />;
    if (overlay === 'owed') return <OwedScreen />;
    if (overlay === 'networth') return <NetWorthScreen onBack={() => setOverlay(null)} />;
    if (typeof overlay === 'object' && overlay.kind === 'txDetail') {
      return <TransactionDetailScreen transaction={overlay.tx} onBack={() => setOverlay(null)} />;
    }
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'activity':
        return <ActivityScreen onOpenTransaction={(tx) => setOverlay({ kind: 'txDetail', tx })} />;
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
            onOpenNotifications={() => setOverlay('notifications')}
            onOpenMe={() => setOverlay('me')}
            onOpenGoals={() => setOverlay('goals')}
            onOpenNetWorth={() => setOverlay('networth')}
          />
        );
    }
  };

  const showLoadOverlay = loading || !!syncError;

  return (
    <View style={styles.container}>
      {/* Active Tab Screen */}
      {renderActiveScreen()}

      {/* Data Loading / Sync Error Banner */}
      {showLoadOverlay && (
        <View style={styles.syncBanner} pointerEvents="none">
          <Text style={styles.syncBannerText}>
            {loading ? 'Loading your money…' : 'Connection issue — showing last loaded data'}
          </Text>
        </View>
      )}

      {/* Voice FAB Button - Floats above tabs */}
      <VoiceButton onPress={() => setShowVoiceModal(true)} />

      {/* Bottom Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'insights') setOverlay(null);
        }}
      />

      {/* Owed quick access: long-press not available, add via Insights header link */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setOverlay('owed')}
        style={styles.owedFab}
      >
        <Icon name="money" size={20} color={colors.cream} />
      </TouchableOpacity>

      {/* Floating Toast Notification */}
      <View style={styles.toastContainer}>
        <Toast visible={!!toastMessage} message={toastMessage || ''} onUndo={hideToast} />
      </View>

      {/* Interactive Voice Modal Sheet */}
      <BottomSheet
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        title="Voice Entry (KAI AI)"
      >
        <View style={{ alignItems: 'center', paddingVertical: 12 }}>
          <Mascot expression={voiceState === 'thinking' ? 'thinking' : voiceState === 'done' ? 'celebrating' : 'listening'} size={120} />
          
          <Text style={{ fontFamily: fonts.display, fontSize: 20, color: colors.forest, marginTop: 12 }}>
            {voiceState === 'thinking' ? 'KAI is parsing...' : voiceState === 'done' ? 'Recorded!' : 'Listening...'}
          </Text>

          {/* Voice Input Box */}
          <View style={styles.voiceInputBox}>
            <TextInput
              style={styles.voiceTextInput}
              value={voiceInput}
              onChangeText={setVoiceInput}
              placeholder="Say what you spent..."
              placeholderTextColor={colors.muted}
              multiline
            />
          </View>

          {/* Preset Voice Prompts */}
          <View style={styles.presetRow}>
            <Text style={{ fontFamily: fonts.ui, color: colors.gray, marginBottom: 8 }}>
              Try tapping a voice prompt:
            </Text>
            {[
              'Spent 500 on dinner yesterday with HDFC card',
              'Salary credited 1,40,000 to SBI',
              'Paid 2,430 electricity bill',
            ].map((prompt) => (
              <TouchableOpacity
                key={prompt}
                activeOpacity={0.8}
                onPress={() => {
                  setVoiceInput(prompt);
                  handleVoiceParse(prompt);
                }}
                style={styles.promptChip}
              >
                <Text style={styles.promptChipText}>"{prompt}"</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Log Voice Expense"
            onPress={() => handleVoiceParse()}
            style={{ width: '100%', marginTop: 16 }}
          />
        </View>
      </BottomSheet>
    </View>
  );
};

export const AppNavigator: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  syncBanner: {
    position: 'absolute',
    top: 12,
    left: 20,
    right: 20,
    backgroundColor: colors.forest,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    zIndex: 998,
  },
  syncBannerText: {
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: colors.cream,
    textAlign: 'center',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 96,
    left: 20,
    right: 20,
    zIndex: 999,
  },
  owedFab: {
    position: 'absolute',
    bottom: 108,
    left: 20,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 95,
  },
  voiceInputBox: {
    width: '100%',
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  voiceTextInput: {
    fontFamily: fonts.uiBold,
    fontSize: 15,
    color: colors.forest,
    minHeight: 48,
  },
  presetRow: {
    width: '100%',
    alignItems: 'flex-start',
  },
  promptChip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
    width: '100%',
  },
  promptChipText: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.deepMint,
  },
});
