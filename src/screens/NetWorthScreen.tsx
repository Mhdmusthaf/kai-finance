import React from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors, fonts, space } from '../theme/theme';
import { Card } from '../components/Card';
import { AmountText } from '../components/AmountText';
import { SectionHeader } from '../components/SectionHeader';
import { Icon } from '../components/Icon';
import { useApp } from '../context/AppContext';

export const NetWorthScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { accounts, cards, loans, investments, insurance } = useApp();

  const assets = accounts.reduce((s, a) => s + a.balance, 0);
  const invested = investments.reduce((s, i) => s + i.currentValue, 0);
  const totalAssets = assets + invested;

  const cardDebt = cards.reduce((s, c) => s + c.outstanding, 0);
  const loanDebt = loans.filter((l) => l.status === 'active').reduce((s, l) => s + l.outstanding, 0);
  const totalLiabilities = cardDebt + loanDebt;

  const netWorth = totalAssets - totalLiabilities;
  const totalCover = insurance.reduce((s, p) => s + p.cover, 0);

  const gainOnInvestments = investments.reduce((s, i) => s + (i.currentValue - i.invested), 0);

  const bars = [
    { label: 'Assets', value: totalAssets, color: colors.leaf },
    { label: 'Liabilities', value: totalLiabilities, color: colors.errorText },
  ];
  const maxBar = Math.max(...bars.map((b) => b.value), 1);

  const breakdown = [
    { label: 'Bank Accounts', value: assets, icon: 'bank' as const, color: 'forest' as const, bg: colors.softGreen },
    { label: 'Investments', value: invested, icon: 'investment' as const, color: 'deepMint' as const, bg: colors.softGreen },
    { label: 'Credit Cards', value: -cardDebt, icon: 'card' as const, color: 'error' as const, bg: colors.errorBg },
    { label: 'Loans', value: -loanDebt, icon: 'loan' as const, color: 'error' as const, bg: colors.errorBg },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Icon name="close" size={20} color={colors.forest} />
        </TouchableOpacity>
        <Text style={styles.title}>Net Worth</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="hero" style={{ marginBottom: 18 }}>
          <Text style={styles.heroLabel}>TOTAL NET WORTH</Text>
          <AmountText
            amount={Math.abs(netWorth)}
            size="display"
            color="cream"
            style={{ marginTop: 6 }}
          />
          <Text style={styles.heroSub}>
            {netWorth >= 0 ? 'Positive' : 'Negative'} · {formatShort(totalAssets)} in assets vs {formatShort(totalLiabilities)} owed
          </Text>

          <View style={{ marginTop: 16 }}>
            {bars.map((b) => (
              <View key={b.label} style={styles.barRow}>
                <Text style={styles.barLabel}>{b.label}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${(b.value / maxBar) * 100}%`, backgroundColor: b.color }]} />
                </View>
                <Text style={styles.barValue}>{formatShort(b.value)}</Text>
              </View>
            ))}
          </View>
        </Card>

        <SectionHeader title="Breakdown" />
        <Card variant="default" style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
          {breakdown.map((row, idx) => (
            <View key={row.label} style={[styles.breakdownRow, idx < breakdown.length - 1 && styles.divider]}>
              <View style={[styles.iconChip, { backgroundColor: row.bg }]}>
                <Icon name={row.icon} size={18} color={colors.forest} />
              </View>
              <Text style={styles.breakdownLabel}>{row.label}</Text>
              <AmountText amount={Math.abs(row.value)} size="md" color={row.value >= 0 ? row.color : 'error'} />
            </View>
          ))}
          <View style={[styles.breakdownRow, styles.totalRow]}>
            <View style={{ width: 18 }} />
            <Text style={styles.totalLabel}>Net Worth</Text>
            <AmountText amount={Math.abs(netWorth)} size="md" color={netWorth >= 0 ? 'deepMint' : 'error'} />
          </View>
        </Card>

        <SectionHeader title="Growth" />
        <Card variant="insight" style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.iconChip, { backgroundColor: colors.white }]}>
              <Icon name="netWorth" size={20} color={colors.forest} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.insightTitle}>
                {gainOnInvestments >= 0 ? 'Investments are up' : 'Investments are down'}
              </Text>
              <Text style={styles.insightBody}>
                {gainOnInvestments >= 0 ? '+' : '-'}
                {formatShort(Math.abs(gainOnInvestments))} overall on your mutual funds and SIPs.
              </Text>
            </View>
          </View>
        </Card>

        {totalCover > 0 && (
          <Card variant="default" style={{ marginBottom: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.iconChip, { backgroundColor: colors.softGreen }]}>
                <Icon name="insurance" size={20} color={colors.forest} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.insightTitle}>Insurance Cover</Text>
                <Text style={styles.insightBody}>
                  Your policies protect your family with {formatShort(totalCover)} of total cover.
                </Text>
              </View>
            </View>
          </Card>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const formatShort = (paise: number): string => {
  const rupees = paise / 100;
  if (rupees >= 10000000) return `₹${(rupees / 10000000).toFixed(2)}Cr`;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(2)}L`;
  if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(1)}K`;
  return `₹${Math.round(rupees)}`;
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.offWhite },
  header: {
    height: 56,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.forest },
  scrollContent: { paddingHorizontal: space.screenX },
  heroLabel: { fontFamily: fonts.uiBold, color: colors.mint, fontSize: 12, letterSpacing: 0.8 },
  heroSub: { fontFamily: fonts.ui, color: colors.sage, marginTop: 6, fontSize: 13 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  barLabel: { fontFamily: fonts.ui, fontSize: 12, color: colors.sage, width: 74 },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4 },
  barValue: {
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    color: colors.cream,
    width: 64,
    textAlign: 'right',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  iconChip: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownLabel: { flex: 1, fontFamily: fonts.uiBold, fontSize: 14, color: colors.charcoal, marginLeft: 12 },
  totalRow: { backgroundColor: colors.offWhite, marginTop: 2 },
  totalLabel: {
    flex: 1,
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: colors.forest,
    marginLeft: 12,
  },
  insightTitle: { fontFamily: fonts.display, fontSize: 15, color: colors.forest },
  insightBody: { fontFamily: fonts.ui, fontSize: 13, color: colors.gray, marginTop: 2, lineHeight: 18 },
});
