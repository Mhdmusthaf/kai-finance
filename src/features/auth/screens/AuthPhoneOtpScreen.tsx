import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { colors, fonts, space } from '../../../theme/theme';
import { Button } from '../../../components/Button';
import { Icon } from '../../../components/Icon';
import { BottomSheet } from '../../../components/BottomSheet';
import { Mascot } from '../../../components/Mascot';

interface AuthPhoneOtpProps {
  onSuccess: (phone: string) => void;
}

export const AuthPhoneOtpScreen: React.FC<AuthPhoneOtpProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('+91 98000 00000');
  const [otp, setOtp] = useState('123456');
  const [timer, setTimer] = useState(30);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = () => {
    setStep('otp');
    setTimer(30);
  };

  const handleVerifyOtp = () => {
    onSuccess(phone);
  };

  const handleGoogleAuth = () => {
    onSuccess('aditi.sharma@gmail.com');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {step === 'otp' && (
          <TouchableOpacity onPress={() => setStep('phone')} style={styles.backBtn}>
            <Icon name="close" size={24} color={colors.forest} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {step === 'phone' ? (
          <>
            <Text style={styles.title}>Welcome to KAI Money OS</Text>
            <Text style={styles.subtitle}>
              Log in with your phone number, Google, or QR code to sync your account.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.prefix}>🇮🇳</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="+91 90000 00000"
                placeholderTextColor={colors.muted}
              />
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.line} />
              <Text style={styles.orText}>OR CONTINUE WITH</Text>
              <View style={styles.line} />
            </View>

            {/* Google & QR Login Buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleGoogleAuth}
                style={styles.socialBtn}
              >
                <Text style={styles.socialBtnText}>🌐 Google Account</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowQrModal(true)}
                style={styles.socialBtn}
              >
                <Icon name="search" size={18} color={colors.forest} />
                <Text style={[styles.socialBtnText, { marginLeft: 8 }]}>QR Sync</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>Verify 6-digit OTP</Text>
            <Text style={styles.subtitle}>
              Sent code to {phone}. Check your SMS messages.
            </Text>

            <View style={styles.otpRow}>
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <View key={idx} style={[styles.otpBox, otp.length === idx && styles.otpBoxActive]}>
                  <Text style={styles.otpDigit}>{otp[idx] || ''}</Text>
                </View>
              ))}
            </View>

            {/* Hidden Input for Keyboard capture */}
            <TextInput
              style={styles.hiddenInput}
              value={otp}
              onChangeText={(text) => {
                if (text.length <= 6) setOtp(text);
              }}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            <View style={styles.resendRow}>
              {timer > 0 ? (
                <Text style={styles.resendText}>Resend code in {timer}s</Text>
              ) : (
                <TouchableOpacity onPress={handleSendOtp}>
                  <Text style={styles.resendLink}>Resend OTP code</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          title={step === 'phone' ? 'Send OTP Code' : 'Verify & Continue'}
          onPress={step === 'phone' ? handleSendOtp : handleVerifyOtp}
        />
      </View>

      {/* QR Code Sync Scanner Modal */}
      <BottomSheet
        visible={showQrModal}
        onClose={() => setShowQrModal(false)}
        title="QR Code Device Sync"
      >
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <Mascot expression="insight" size={120} />
          <Text style={{ fontFamily: fonts.display, fontSize: 18, color: colors.forest, marginTop: 16 }}>
            Scan Web QR Code
          </Text>
          <Text style={{ fontFamily: fonts.ui, fontSize: 13, color: colors.gray, textAlign: 'center', marginTop: 6, marginBottom: 20 }}>
            Open app.kai.money on your browser to pair your phone instantly.
          </Text>
          <Button
            title="Simulate QR Auth Pair"
            onPress={() => {
              setShowQrModal(false);
              onSuccess('aditi.sharma@gmail.com');
            }}
            style={{ width: '100%' }}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
    justifyContent: 'space-between',
  },
  header: {
    height: 56,
    paddingHorizontal: space.screenX,
    justifyContent: 'center',
  },
  backBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: space.screenX,
    paddingTop: 20,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.forest,
  },
  subtitle: {
    fontFamily: fonts.ui,
    fontSize: 15,
    color: colors.gray,
    marginTop: 8,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  prefix: {
    fontSize: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: fonts.uiBold,
    fontSize: 18,
    color: colors.forest,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  orText: {
    fontFamily: fonts.uiHeavy,
    fontSize: 11,
    color: colors.muted,
    marginHorizontal: 12,
  },
  socialRow: {    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBtnText: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.forest,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: {
    borderColor: colors.forest,
    borderWidth: 2,
  },
  otpDigit: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.forest,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  resendRow: {
    marginTop: 24,
    alignItems: 'center',
  },
  resendText: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.gray,
  },
  resendLink: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: colors.deepMint,
  },
  footer: {
    paddingHorizontal: space.screenX,
    paddingBottom: 24,
  },
});
