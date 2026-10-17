import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Switch, TextInput } from 'react-native';
import { colors, fonts, space } from '../theme/theme';
import { Card } from '../components/Card';
import { Icon, IconName } from '../components/Icon';
import { SectionHeader } from '../components/SectionHeader';
import { Button } from '../components/Button';
import { BottomSheet } from '../components/BottomSheet';
import { useApp } from '../context/AppContext';

interface MenuRow {
  icon: IconName;
  label: string;
  detail?: string;
  onPress?: () => void;
}

export const MeScreen: React.FC<{ onOpenNotifications?: () => void }> = ({ onOpenNotifications }) => {
  const { settings, updateSettings, showToast } = useApp();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [name, setName] = useState('Aditi Sharma');
  const [phone, setPhone] = useState('+91 98450 12345');

  const toggleBiometric = (value: boolean) => {
    updateSettings({ biometricEnabled: value });
    showToast(value ? 'Biometric unlock enabled' : 'Biometric unlock disabled');
  };

  const mainMenu: MenuRow[] = [
    { icon: 'notifications', label: 'Notifications', detail: 'Alerts & reminders', onPress: onOpenNotifications },
    { icon: 'security', label: 'Security & Privacy', detail: 'PIN, biometrics, data' },
    { icon: 'reports', label: 'Reports & Exports', detail: 'Monthly statements' },
    { icon: 'settings', label: 'Preferences', detail: 'Currency & language' },
  ];

  const helpMenu: MenuRow[] = [
    { icon: 'profile', label: 'Help & Support', detail: 'FAQs and contact' },
    { icon: 'documents', label: 'About KAI', detail: 'Version 1.0.0' },
  ];

  const renderMenuCard = (rows: MenuRow[], showDividers: boolean) => (
    <Card variant="default" style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
      {rows.map((row, idx) => (
        <TouchableOpacity
          key={row.label}
          activeOpacity={0.8}
          onPress={row.onPress}
          disabled={!row.onPress}
          style={[styles.menuRow, showDividers && idx < rows.length - 1 && styles.menuDivider]}
        >
          <View style={styles.menuIconChip}>
            <Icon name={row.icon} size={20} color={colors.forest} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuLabel}>{row.label}</Text>
            {row.detail ? <Text style={styles.menuDetail}>{row.detail}</Text> : null}
          </View>
          <Icon name="income" size={16} color={colors.gray} style={{ transform: [{ rotate: '90deg' }] }} />
        </TouchableOpacity>
      ))}
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Me</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <Card variant="default" style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.profileName}>{name}</Text>
            <Text style={styles.profilePhone}>{phone}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.8} onPress={() => setShowEditProfile(true)} style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </Card>

        {/* Quick Toggles */}
        <SectionHeader title="Quick Settings" />
        <Card variant="default" style={{ paddingVertical: 4, marginBottom: 18 }}>
          <View style={[styles.toggleRow, styles.menuDivider]}>
            <View style={[styles.menuIconChip, { backgroundColor: colors.softGreen }]}>
              <Icon name="security" size={18} color={colors.forest} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.menuLabel}>Biometric Unlock</Text>
              <Text style={styles.menuDetail}>Use fingerprint or face ID</Text>
            </View>
            <Switch
              value={settings?.biometricEnabled ?? false}
              onValueChange={toggleBiometric}
              trackColor={{ true: colors.leaf, false: colors.line }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={[styles.menuIconChip, { backgroundColor: colors.softGreen }]}>
              <Icon name="cash" size={18} color={colors.forest} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.menuLabel}>Hide Balances</Text>
              <Text style={styles.menuDetail}>Blur amounts on Home</Text>
            </View>
            <Switch
              value={false}
              onValueChange={() => showToast('Use the eye button on the Home card')}
              trackColor={{ true: colors.leaf, false: colors.line }}
              thumbColor={colors.white}
            />
          </View>
        </Card>

        {/* Main Menu */}
        <SectionHeader title="Account" />
        {renderMenuCard(mainMenu, true)}

        <SectionHeader title="Support" />
        {renderMenuCard(helpMenu, true)}

        <Button
          title="Sign Out"
          variant="destructive"
          onPress={() => showToast('Signed out (demo)')}
          style={{ marginTop: 8 }}
        />
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Edit Profile Sheet */}
      <BottomSheet visible={showEditProfile} onClose={() => setShowEditProfile(false)} title="Edit Profile">
        <View style={{ paddingTop: 8 }}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.formInput}
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.muted}
          />
          <Text style={styles.inputLabel}>Phone</Text>
          <TextInput
            style={styles.formInput}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor={colors.muted}
          />
          <Button
            title="Save Profile"
            onPress={() => {
              setShowEditProfile(false);
              showToast('Profile updated');
            }}
            style={{ marginTop: 20 }}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.offWhite },
  header: { height: 56, paddingHorizontal: 20, justifyContent: 'center' },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.forest },
  scrollContent: { paddingHorizontal: space.screenX },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingVertical: 18,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.cream },
  profileName: { fontFamily: fonts.display, fontSize: 19, color: colors.forest },
  profilePhone: { fontFamily: fonts.ui, fontSize: 13, color: colors.gray, marginTop: 2 },
  editBtn: {
    backgroundColor: colors.softGreen,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  editBtnText: { fontFamily: fonts.uiBold, fontSize: 12, color: colors.successText },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  menuIconChip: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontFamily: fonts.uiBold, fontSize: 15, color: colors.charcoal },
  menuDetail: { fontFamily: fonts.ui, fontSize: 12, color: colors.gray, marginTop: 2 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  inputLabel: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.forest, marginTop: 12, marginBottom: 6 },
  formInput: {
    height: 50,
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontFamily: fonts.uiBold,
    fontSize: 16,
    color: colors.forest,
  },
});
