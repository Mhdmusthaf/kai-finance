import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { colors, fonts, space } from '../theme/theme';
import { Card } from '../components/Card';
import { AmountText } from '../components/AmountText';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import { useApp, TransactionItem } from '../context/AppContext';

export const TransactionDetailScreen: React.FC<{
  transaction: TransactionItem;
  onBack?: () => void;
}> = ({ transaction, onBack }) => {
  const { deleteTransaction, showToast } = useApp();

  const isDebit = transaction.type === 'expense';
  const typeLabel =
    transaction.type === 'expense' ? 'Expense' :
    transaction.type === 'income' ? 'Income' :
    transaction.type === 'transfer' ? 'Transfer' : 'Card Payment';

  const handleDelete = () => {
    deleteTransaction(transaction.id);
    showToast('Transaction deleted');
    if (onBack) onBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Icon name="close" size={20} color={colors.forest} />
        </TouchableOpacity>
        <Text style={styles.title}>Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="hero" style={{ marginBottom: 18, alignItems: 'center' }}>
          <View style={styles.heroIcon}>
            <Icon name={transaction.icon as any} size={30} color={colors.mint} />
          </View>
          <Text style={styles.typeLabel}>{typeLabel.toUpperCase()}</Text>
          <AmountText
            amount={transaction.amount}
            size="display"
            color={isDebit ? 'cream' : 'mint'}
            signed={!isDebit}
            style={{ marginTop: 4 }}
          />
          <Text style={styles.heroTitle}>{transaction.title}</Text>
        </Card>

        <Card variant="default" style={{ marginBottom: 18 }}>
          {[
            { label: 'Category', value: transaction.subtitle.split('·')[0]?.trim() || '—' },
            { label: 'Account', value: transaction.account || '—' },
            { label: 'Date', value: transaction.happenedAt || '—' },
            { label: 'Type', value: typeLabel },
            ...(transaction.isVoice ? [{ label: 'Logged via', value: 'Voice (KAI)' }] : []),
          ].map((row, idx, arr) => (
            <View key={row.label} style={[styles.detailRow, idx < arr.length - 1 && styles.divider]}>
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={styles.detailValue}>{row.value}</Text>
            </View>
          ))}
        </Card>

        <Button title="Delete Transaction" variant="destructive" onPress={handleDelete} />
        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
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
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  typeLabel: {
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: colors.mint,
    letterSpacing: 0.8,
    marginTop: 4,
  },
  heroTitle: { fontFamily: fonts.ui, fontSize: 14, color: colors.sage, marginTop: 8 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  detailLabel: { fontFamily: fonts.ui, fontSize: 14, color: colors.gray },
  detailValue: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.charcoal, textAlign: 'right', flex: 1, marginLeft: 16 },
});
