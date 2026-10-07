import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { colors, fonts, space } from '../theme/theme';
import { Card } from '../components/Card';
import { AmountText } from '../components/AmountText';
import { ListRow } from '../components/ListRow';
import { SectionHeader } from '../components/SectionHeader';
import { Mascot } from '../components/Mascot';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import { BottomSheet } from '../components/BottomSheet';
import { useApp } from '../context/AppContext';

interface HomeScreenProps {
  onOpenGallery?: () => void;
  onOpenVoice?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenGallery,
  onOpenVoice,
}) => {
  const {
    accounts,
    cards,
    transactions,
    balanceHidden,
    setBalanceHidden,
    addTransaction,
  } = useApp();

  // Modals state
  const [activeModal, setActiveModal] = useState<'expense' | 'income' | 'transfer' | 'card_pay' | 'search' | 'notifications' | null>(null);
  
  // Quick Action Form state
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('Food & Dining');
  const [formAccount, setFormAccount] = useState('HDFC Savings');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Dining out +18% higher', time: 'Today', unread: true },
    { id: '2', title: 'BESCOM Electricity bill due tomorrow', time: 'Yesterday', unread: true },
    { id: '3', title: 'Salary ₹1,40,000 credited to SBI', time: 'Oct 1', unread: false },
  ]);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const handleQuickActionSubmit = () => {
    const rawVal = parseFloat(formAmount) || 500;
    const amountInPaise = Math.round(rawVal * 100);

    if (activeModal === 'expense') {
      addTransaction({
        title: formTitle || 'Expense',
        subtitle: `${formCategory} · ${formAccount}`,
        amount: amountInPaise,
        type: 'expense',
        icon: 'expense',
        iconBgColor: colors.softGreen,
        account: formAccount,
      });
    } else if (activeModal === 'income') {
      addTransaction({
        title: formTitle || 'Income Credit',
        subtitle: `Salary / Credit · ${formAccount}`,
        amount: amountInPaise,
        type: 'income',
        amountColor: 'deepMint',
        icon: 'income',
        iconBgColor: colors.softGreen,
        account: formAccount,
      });
    } else if (activeModal === 'transfer') {
      addTransaction({
        title: formTitle || 'Account Transfer',
        subtitle: 'HDFC Savings → SBI Savings',
        amount: amountInPaise,
        type: 'transfer',
        amountColor: 'forest',
        icon: 'transfer',
        iconBgColor: colors.lightGray,
        account: formAccount,
      });
    } else if (activeModal === 'card_pay') {
      addTransaction({
        title: 'Credit Card Bill Payment',
        subtitle: 'HDFC Savings → Millennia Card',
        amount: amountInPaise,
        type: 'card_pay',
        amountColor: 'forest',
        icon: 'card',
        iconBgColor: colors.lightGray,
        account: formAccount,
      });
    }

    // Reset Form
    setFormTitle('');
    setFormAmount('');
    setActiveModal(null);
  };

  const filteredTransactions = transactions.filter((tx) =>
    tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar / Greeting */}
      <View style={styles.topBar}>
        <View style={styles.greetingRow}>
          <Mascot expression="waving" size={48} />
          <View style={styles.greetingText}>
            <Text style={styles.subGreeting}>Good morning</Text>
            <Text style={styles.userName}>Aditi Sharma</Text>
          </View>
        </View>

        <View style={styles.topIcons}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.iconCircle}
            onPress={() => setActiveModal('search')}
          >
            <Icon name="search" size={20} color={colors.forest} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.iconCircle, { marginLeft: 10 }]}
            onPress={() => setActiveModal('notifications')}
          >
            <Icon name="bell" size={20} color={colors.forest} />
            {notifications.some((n) => n.unread) && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner to Component Gallery */}
        {onOpenGallery && (
          <TouchableOpacity activeOpacity={0.9} onPress={onOpenGallery} style={styles.galleryBanner}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="reports" size={20} color={colors.forest} />
              <Text style={styles.galleryBannerText}>
                Open Component Gallery (Phase 1 Review)
              </Text>
            </View>
            <Icon name="income" size={16} color={colors.forest} style={{ transform: [{ rotate: '90deg' }] }} />
          </TouchableOpacity>
        )}

        {/* Balance Hero Card */}
        <Card variant="hero" style={styles.heroCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.heroLabel}>TOTAL BALANCE</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setBalanceHidden(!balanceHidden)}
              style={styles.eyeBtn}
            >
              <Icon name="security" size={18} color={balanceHidden ? colors.mint : colors.sage} />
            </TouchableOpacity>
          </View>

          {balanceHidden ? (
            <Text style={[styles.heroAmountText, { color: colors.cream }]}>••••••••</Text>
          ) : (
            <AmountText amount={totalBalance} size="display" color="cream" style={styles.heroAmount} />
          )}

          <Text style={styles.heroSubtext}>
            +14% since last month · 43% of income spent
          </Text>

          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: '43%' }]} />
          </View>

          <View style={styles.heroStatsRow}>
            <View>
              <Text style={styles.statLabel}>Spent this month</Text>
              <AmountText amount={602000} size="md" color="white" />
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.statLabel}>Earned this month</Text>
              <AmountText amount={14000000} size="md" color="mint" signed />
            </View>
          </View>
        </Card>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsRow}>
          {[
            { label: 'Expense', icon: 'expense' as const, key: 'expense' as const },
            { label: 'Income', icon: 'income' as const, key: 'income' as const },
            { label: 'Transfer', icon: 'transfer' as const, key: 'transfer' as const },
            { label: 'Pay Card', icon: 'card' as const, key: 'card_pay' as const },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.8}
              onPress={() => setActiveModal(item.key)}
              style={styles.quickActionItem}
            >
              <View style={styles.quickActionIcon}>
                <Icon name={item.icon} size={20} color={colors.forest} />
              </View>
              <Text style={styles.quickActionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KAI Noticed Insight */}
        <Card variant="insight" style={styles.insightCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Mascot expression="insight" size={44} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.insightHeadline}>KAI noticed: Dining +18%</Text>
              <Text style={styles.insightDetail}>
                You spent ₹4,800 on dining this week compared to ₹3,200 last week.
              </Text>
            </View>
          </View>
        </Card>

        {/* Recent Activity Feed */}
        <SectionHeader title="Recent Activity" actionLabel="See all" />
        <Card variant="default" style={{ padding: 0, overflow: 'hidden' }}>
          {transactions.map((tx, idx) => (
            <ListRow
              key={tx.id}
              title={tx.title}
              subtitle={tx.subtitle}
              amount={tx.amount}
              amountColor={tx.amountColor}
              icon={<Icon name={tx.icon as any} size={20} color={colors.forest} />}
              iconBgColor={tx.iconBgColor}
              showDivider={idx < transactions.length - 1}
            />
          ))}
        </Card>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* QUICK ACTION FORM MODAL */}
      <BottomSheet
        visible={activeModal === 'expense' || activeModal === 'income' || activeModal === 'transfer' || activeModal === 'card_pay'}
        onClose={() => setActiveModal(null)}
        title={
          activeModal === 'expense'
            ? 'Add Expense'
            : activeModal === 'income'
            ? 'Add Income'
            : activeModal === 'transfer'
            ? 'Transfer Money'
            : 'Pay Card Bill'
        }
      >
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Title / Description</Text>
          <TextInput
            style={styles.formInput}
            placeholder={
              activeModal === 'expense'
                ? 'e.g. Dinner at Truffles'
                : activeModal === 'income'
                ? 'e.g. Freelance Payment'
                : 'e.g. HDFC to SBI'
            }
            placeholderTextColor={colors.muted}
            value={formTitle}
            onChangeText={setFormTitle}
          />

          <Text style={styles.inputLabel}>Amount (₹)</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. 500"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={formAmount}
            onChangeText={setFormAmount}
          />

          <Text style={styles.inputLabel}>Account</Text>
          <View style={styles.chipOptionRow}>
            {['HDFC Savings', 'SBI Savings'].map((acc) => (
              <TouchableOpacity
                key={acc}
                onPress={() => setFormAccount(acc)}
                style={[
                  styles.chipOption,
                  formAccount === acc && styles.chipOptionActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipOptionText,
                    formAccount === acc && styles.chipOptionTextActive,
                  ]}
                >
                  {acc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Confirm & Save"
            onPress={handleQuickActionSubmit}
            style={{ marginTop: 20 }}
          />
        </View>
      </BottomSheet>

      {/* SEARCH MODAL */}
      <BottomSheet
        visible={activeModal === 'search'}
        onClose={() => setActiveModal(null)}
        title="Search Transactions"
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Icon name="search" size={20} color={colors.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search expenses, salary, merchant..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>

          <ScrollView style={{ maxHeight: 300, marginTop: 12 }}>
            {filteredTransactions.map((tx) => (
              <ListRow
                key={tx.id}
                title={tx.title}
                subtitle={tx.subtitle}
                amount={tx.amount}
                icon={<Icon name={tx.icon as any} size={18} color={colors.forest} />}
                iconBgColor={colors.softGreen}
                showDivider
              />
            ))}
          </ScrollView>
        </View>
      </BottomSheet>

      {/* NOTIFICATIONS MODAL */}
      <BottomSheet
        visible={activeModal === 'notifications'}
        onClose={() => setActiveModal(null)}
        title="Notifications"
      >
        <View style={{ paddingVertical: 8 }}>
          {notifications.map((n) => (
            <View key={n.id} style={styles.notifRow}>
              <Icon name="bell" size={20} color={colors.forest} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                <Text style={styles.notifTime}>{n.time}</Text>
              </View>
              {n.unread && <View style={styles.notifUnreadBadge} />}
            </View>
          ))}

          <Button
            title="Mark All as Read"
            variant="ghost"
            onPress={() => {
              setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
            }}
            style={{ marginTop: 16 }}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.offWhite },
  topBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.screenX,
    backgroundColor: colors.offWhite,
  },
  greetingRow: { flexDirection: 'row', alignItems: 'center' },
  greetingText: { marginLeft: 10 },
  subGreeting: { fontFamily: fonts.ui, fontSize: 12, color: colors.gray },
  userName: { fontFamily: fonts.display, fontSize: 18, color: colors.forest },
  topIcons: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.errorText,
  },
  scrollContent: { paddingHorizontal: space.screenX, paddingTop: 8 },
  galleryBanner: {
    backgroundColor: colors.softGreen,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.leaf + '44',
  },
  galleryBannerText: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: colors.forest,
    marginLeft: 10,
  },
  heroCard: { marginBottom: space.sectionGap },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroLabel: { fontFamily: fonts.uiBold, fontSize: 12, color: colors.mint, letterSpacing: 0.8 },
  eyeBtn: { padding: 4 },
  heroAmount: { marginTop: 8, marginBottom: 6 },
  heroAmountText: { fontFamily: fonts.display, fontSize: 32, marginVertical: 12 },
  heroSubtext: { fontFamily: fonts.ui, fontSize: 13, color: colors.sage },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    marginVertical: 16,
    overflow: 'hidden',
  },
  progressBar: { height: '100%', backgroundColor: colors.mint, borderRadius: 3 },
  heroStatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statLabel: { fontFamily: fonts.ui, fontSize: 12, color: colors.sage, marginBottom: 2 },
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.sectionGap },
  quickActionItem: { alignItems: 'center', flex: 1 },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionLabel: { fontFamily: fonts.uiSemi, fontSize: 12, color: colors.charcoal },
  insightCard: { marginBottom: space.sectionGap },
  insightHeadline: { fontFamily: fonts.display, fontSize: 15, color: colors.forest },
  insightDetail: { fontFamily: fonts.ui, fontSize: 13, color: colors.gray, marginTop: 2 },

  // Modal Styles
  formContainer: { paddingTop: 8 },
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
  chipOptionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  chipOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
  },
  chipOptionActive: { backgroundColor: colors.forest },
  chipOptionText: { fontFamily: fonts.uiSemi, fontSize: 13, color: colors.gray },
  chipOptionTextActive: { color: colors.cream },

  searchContainer: { paddingVertical: 8 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, marginLeft: 10, fontFamily: fonts.ui, fontSize: 15, color: colors.forest },

  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  notifTitle: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.forest },
  notifTime: { fontFamily: fonts.ui, fontSize: 12, color: colors.gray, marginTop: 2 },
  notifUnreadBadge: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.leaf },
});
