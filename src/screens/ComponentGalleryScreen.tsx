import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { colors, fonts, space } from '../theme/theme';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { AmountText } from '../components/AmountText';
import { ListRow } from '../components/ListRow';
import { SectionHeader } from '../components/SectionHeader';
import { EmptyState } from '../components/EmptyState';
import { Skeleton } from '../components/Skeleton';
import { BottomSheet } from '../components/BottomSheet';
import { Toast } from '../components/Toast';
import { Mascot, MascotExpression } from '../components/Mascot';
import { Icon, IconName } from '../components/Icon';

const MASCOT_EXPRESSIONS: MascotExpression[] = [
  'default', 'listening', 'thinking', 'insight', 'happy',
  'celebrating', 'reminder', 'concerned', 'sleeping', 'waving',
];

const ICONS_LIST: IconName[] = [
  'bank', 'cash', 'card', 'money', 'income', 'expense', 'transfer', 'savings', 'netWorth',
  'bills', 'emi', 'loan', 'insurance', 'investment', 'sip', 'goals',
  'calendar', 'documents', 'insights', 'notifications', 'profile', 'reports', 'security', 'settings', 'voice',
];

interface GalleryProps {
  onBack?: () => void;
}

export const ComponentGalleryScreen: React.FC<GalleryProps> = ({ onBack }) => {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [selectedChip, setSelectedChip] = useState('Month');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Icon name="close" size={24} color={colors.forest} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>KAI Component Gallery</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. Mascot Expressions */}
        <SectionHeader title="1. Mascot (10 Expressions)" />
        <Card variant="default" style={styles.cardSpacing}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {MASCOT_EXPRESSIONS.map((expr) => (
              <View key={expr} style={styles.mascotItem}>
                <Mascot expression={expr} size={84} />
                <Text style={styles.mascotLabel}>{expr}</Text>
              </View>
            ))}
          </ScrollView>
        </Card>

        {/* 2. Icon Set */}
        <SectionHeader title="2. Icon System (SVGs)" />
        <Card variant="default" style={styles.cardSpacing}>
          <View style={styles.iconGrid}>
            {ICONS_LIST.map((name) => (
              <View key={name} style={styles.iconItem}>
                <View style={styles.iconBox}>
                  <Icon name={name} size={22} color={colors.forest} />
                </View>
                <Text numberOfLines={1} style={styles.iconLabel}>
                  {name}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* 3. Buttons */}
        <SectionHeader title="3. Buttons" />
        <Card variant="default" style={styles.cardSpacing}>
          <View style={styles.gapVertical}>
            <Button title="Primary Button (56pt)" onPress={() => setToastVisible(true)} />
            <Button title="Secondary Button (52pt)" variant="secondary" onPress={() => setSheetVisible(true)} />
            <Button title="Ghost Button" variant="ghost" onPress={() => {}} />
            <Button title="Destructive Action" variant="destructive" onPress={() => {}} />
          </View>
        </Card>

        {/* 4. AmountText */}
        <SectionHeader title="4. AmountText (formatINR & Tabular)" />
        <Card variant="default" style={styles.cardSpacing}>
          <View style={styles.gapVertical}>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Display (Hero balance):</Text>
              <AmountText amount={8230000} size="display" color="forest" />
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Income (Positive deepMint):</Text>
              <AmountText amount={14000000} size="lg" color="deepMint" signed />
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Expense (Forest):</Text>
              <AmountText amount={286000} size="md" color="forest" />
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Overdue (Error text):</Text>
              <AmountText amount={1824000} size="md" color="error" />
            </View>
          </View>
        </Card>

        {/* 5. Chips & Filters */}
        <SectionHeader title="5. Chips & Status" />
        <Card variant="default" style={styles.cardSpacing}>
          <View style={styles.chipRow}>
            {['Month', 'Week', 'Year'].map((item) => (
              <Chip
                key={item}
                label={item}
                selected={selectedChip === item}
                onPress={() => setSelectedChip(item)}
                style={styles.chipMargin}
              />
            ))}
          </View>
          <View style={[styles.chipRow, { marginTop: 12 }]}>
            <Chip label="Paid" variant="statusSuccess" style={styles.chipMargin} />
            <Chip label="Due in 3 days" variant="statusWarning" style={styles.chipMargin} />
            <Chip label="Overdue" variant="statusError" style={styles.chipMargin} />
          </View>
        </Card>

        {/* 6. Cards & Hero Cards */}
        <SectionHeader title="6. Cards & Surfaces" />
        <Card variant="hero" style={styles.cardSpacing}>
          <Text style={{ fontFamily: fonts.uiBold, color: colors.mint, fontSize: 13 }}>
            TOTAL BALANCE
          </Text>
          <AmountText amount={14250000} size="xl" color="cream" style={{ marginTop: 6 }} />
          <Text style={{ fontFamily: fonts.ui, color: colors.sage, marginTop: 4 }}>
            +14% since last month · ₹1,40,000 earned this month
          </Text>
        </Card>

        <Card variant="insight" style={styles.cardSpacing}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Mascot expression="insight" size={36} />
            <Text style={{ fontFamily: fonts.display, fontSize: 16, color: colors.forest, marginLeft: 10 }}>
              KAI noticed: Dining is +18%
            </Text>
          </View>
          <Text style={{ fontFamily: fonts.ui, fontSize: 13, color: colors.gray, marginTop: 6 }}>
            You spent ₹4,800 on dining out this week compared to ₹3,200 last week.
          </Text>
        </Card>

        {/* 7. ListRows */}
        <SectionHeader title="7. ListRows" />
        <Card variant="default" style={{ padding: 0, overflow: 'hidden' }}>
          <ListRow
            title="Dinner · Truffles"
            subtitle="Food & Dining · SBI Card"
            amount={50000}
            icon={<Icon name="expense" size={20} color={colors.forest} />}
            iconBgColor={colors.softGreen}
            showDivider
          />
          <ListRow
            title="Salary · Acme Corp"
            subtitle="Income · SBI Savings"
            amount={14000000}
            amountColor="deepMint"
            icon={<Icon name="income" size={20} color={colors.deepMint} />}
            iconBgColor={colors.softGreen}
            showDivider
          />
          <ListRow
            title="HDFC Savings"
            subtitle="•••• 4821"
            amount={8230000}
            icon={<Icon name="bank" size={20} color={colors.forest} />}
            iconBgColor={colors.lightGray}
          />
        </Card>

        {/* 8. Skeletons */}
        <SectionHeader title="8. Skeleton Loaders" />
        <Card variant="default" style={styles.cardSpacing}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Skeleton width={44} height={44} borderRadius={16} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Skeleton width="60%" height={16} style={{ marginBottom: 6 }} />
              <Skeleton width="40%" height={12} />
            </View>
            <Skeleton width={70} height={20} />
          </View>
        </Card>

        {/* 9. EmptyState */}
        <SectionHeader title="9. EmptyState" />
        <EmptyState
          title="No transactions yet"
          description="Talk to KAI or tap the mic button to log your first expense in 3 seconds."
          mascotExpression="sleeping"
          ctaLabel="Log First Expense"
          onCtaPress={() => setToastVisible(true)}
        />

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Interactive Toast Preview */}
      <View style={styles.toastContainer}>
        <Toast
          visible={toastVisible}
          message="₹500 Dinner added"
          onUndo={() => setToastVisible(false)}
        />
      </View>

      {/* Interactive Bottom Sheet Preview */}
      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title="Confirm Transaction"
      >
        <Text style={{ fontFamily: fonts.ui, color: colors.gray, marginBottom: 16 }}>
          KAI parsed a simple voice entry:
        </Text>
        <Card variant="default" style={{ marginBottom: 20 }}>
          <ListRow
            title="Dinner"
            subtitle="Food & Dining · HDFC Savings"
            amount={50000}
            icon={<Icon name="mic" size={20} color={colors.forest} />}
          />
        </Card>
        <Button
          title="Confirm & Save"
          onPress={() => {
            setSheetVisible(false);
            setToastVisible(true);
          }}
        />
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.white,
  },
  backBtn: {
    marginRight: 12,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.forest,
  },
  scrollContent: {
    padding: space.screenX,
  },
  cardSpacing: {
    marginBottom: space.sectionGap,
  },
  mascotItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 90,
  },
  mascotLabel: {
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  iconItem: {
    width: '20%',
    alignItems: 'center',
    marginVertical: 8,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconLabel: {
    fontFamily: fonts.uiSemi,
    fontSize: 10,
    color: colors.gray,
    textAlign: 'center',
  },
  gapVertical: {
    gap: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.gray,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chipMargin: {
    marginRight: 8,
    marginBottom: 8,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
  },
});
