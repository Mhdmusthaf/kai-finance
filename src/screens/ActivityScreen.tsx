import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { colors, fonts, space } from '../theme/theme';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { ListRow } from '../components/ListRow';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import { BottomSheet } from '../components/BottomSheet';
import { useApp, TransactionItem } from '../context/AppContext';

export const ActivityScreen: React.FC<{ onOpenTransaction?: (tx: TransactionItem) => void }> = ({ onOpenTransaction }) => {
  const { transactions, addTransaction } = useApp();
  const [activeFilter, setActiveFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Shopping');

  const filtered = transactions.filter((tx) => {
    if (activeFilter === 'Expenses') return tx.type === 'expense';
    if (activeFilter === 'Income') return tx.type === 'income';
    if (activeFilter === 'Transfers') return tx.type === 'transfer';
    if (activeFilter === 'Card Pay') return tx.type === 'card_pay';
    return true;
  });

  const handleAdd = () => {
    const raw = parseFloat(amount) || 250;
    addTransaction({
      title: title || 'Custom Transaction',
      subtitle: `${category} · HDFC Savings`,
      amount: Math.round(raw * 100),
      type: activeFilter === 'Income' ? 'income' : 'expense',
      icon: activeFilter === 'Income' ? 'income' : 'expense',
      iconBgColor: colors.softGreen,
      account: 'HDFC Savings',
    });
    setTitle('');
    setAmount('');
    setShowAddModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addBtn}>
          <Icon name="income" size={18} color={colors.cream} style={{ transform: [{ rotate: '180deg' }] }} />
          <Text style={styles.addBtnText}>Log New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['All', 'Expenses', 'Income', 'Transfers', 'Card Pay'].map((filter) => (
            <Chip
              key={filter}
              label={filter}
              selected={activeFilter === filter}
              onPress={() => setActiveFilter(filter)}
              style={{ marginRight: 8 }}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.dayGroupHeader}>
          <Text style={styles.dayTitle}>All Transactions ({filtered.length})</Text>
          <Text style={styles.dayTotal}>Real-Time Sync</Text>
        </View>

        <Card variant="default" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
          {filtered.map((tx, idx) => (
            <TouchableOpacity key={tx.id} activeOpacity={0.8} onPress={() => onOpenTransaction && onOpenTransaction(tx)}>
              <ListRow
                title={tx.title}
                subtitle={tx.subtitle}
                amount={tx.amount}
                amountColor={tx.amountColor}
                icon={<Icon name={tx.icon as any} size={20} color={colors.forest} />}
                iconBgColor={tx.iconBgColor}
                showDivider={idx < filtered.length - 1}
              />
            </TouchableOpacity>
          ))}
        </Card>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Add Transaction Modal */}
      <BottomSheet
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Custom Activity"
      >
        <View style={{ paddingTop: 8 }}>
          <Text style={styles.inputLabel}>Title</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. Metro Recharge"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.inputLabel}>Amount (₹)</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. 250"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <Button title="Save Activity" onPress={handleAdd} style={{ marginTop: 20 }} />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.offWhite },
  header: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.forest },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.forest,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  addBtnText: { fontFamily: fonts.uiBold, fontSize: 12, color: colors.cream, marginLeft: 6 },
  filterBar: { paddingHorizontal: 20, paddingBottom: 12 },
  scrollContent: { paddingHorizontal: space.screenX },
  dayGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  dayTitle: { fontFamily: fonts.displayBold, fontSize: 15, color: colors.forest },
  dayTotal: { fontFamily: fonts.uiSemi, fontSize: 13, color: colors.gray },
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
