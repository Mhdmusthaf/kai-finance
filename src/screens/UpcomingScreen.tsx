import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { colors, fonts, space } from '../theme/theme';
import { Card } from '../components/Card';
import { ListRow } from '../components/ListRow';
import { Chip } from '../components/Chip';
import { Icon } from '../components/Icon';
import { SectionHeader } from '../components/SectionHeader';
import { AmountText } from '../components/AmountText';
import { Button } from '../components/Button';
import { BottomSheet } from '../components/BottomSheet';
import { useApp } from '../context/AppContext';

export const UpcomingScreen: React.FC = () => {
  const { upcomingBills, markBillPaid, addUpcomingBill } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('15 Oct');

  const dueBills = upcomingBills.filter((b) => b.status === 'due');
  const totalCommitted = dueBills.reduce((sum, b) => sum + b.amount, 0);

  const handleAddBill = () => {
    const raw = parseFloat(amount) || 1000;
    addUpcomingBill({
      title: title || 'Scheduled Utility Bill',
      subtitle: `Due ${dueDate} · HDFC Savings`,
      amount: Math.round(raw * 100),
      dueDate,
      icon: 'bills',
    });
    setTitle('');
    setAmount('');
    setShowAddModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Upcoming</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addBtn}>
          <Icon name="calendar" size={18} color={colors.cream} />
          <Text style={styles.addBtnText}>Schedule Bill</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Total Committed Card */}
        <Card variant="hero" style={{ marginBottom: 18 }}>
          <Text style={{ fontFamily: fonts.uiBold, color: colors.peach, fontSize: 12, letterSpacing: 0.8 }}>
            COMMITTED THIS MONTH
          </Text>
          <AmountText amount={totalCommitted} size="xl" color="cream" style={{ marginTop: 6 }} />
          <Text style={{ fontFamily: fonts.ui, color: colors.sage, marginTop: 4 }}>
            {dueBills.length} bills & SIPs due in the next 7 days
          </Text>
        </Card>

        <SectionHeader title="Needs Attention" />
        <Card variant="default" style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
          {upcomingBills.map((bill, idx) => (
            <ListRow
              key={bill.id}
              title={bill.title}
              subtitle={bill.subtitle}
              amount={bill.amount}
              amountColor={bill.status === 'paid' ? 'deepMint' : 'error'}
              icon={<Icon name={bill.icon as any} size={20} color={bill.status === 'paid' ? colors.deepMint : colors.errorText} />}
              iconBgColor={bill.status === 'paid' ? colors.softGreen : colors.errorBg}
              showDivider={idx < upcomingBills.length - 1}
              rightElement={
                bill.status === 'paid' ? (
                  <Chip label="Paid ✅" variant="statusSuccess" style={{ marginTop: 4 }} />
                ) : (
                  <TouchableOpacity activeOpacity={0.8} onPress={() => markBillPaid(bill.id)}>
                    <Chip label="Mark Paid" variant="statusWarning" style={{ marginTop: 4 }} />
                  </TouchableOpacity>
                )
              }
            />
          ))}
        </Card>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Schedule Bill Modal */}
      <BottomSheet
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Schedule Upcoming Bill"
      >
        <View style={{ paddingTop: 8 }}>
          <Text style={styles.inputLabel}>Bill / Subscription Name</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. Wi-Fi Bill · Airtel"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.inputLabel}>Amount (₹)</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. 999"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={styles.inputLabel}>Due Date</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. 15 Oct"
            placeholderTextColor={colors.muted}
            value={dueDate}
            onChangeText={setDueDate}
          />

          <Button title="Schedule Bill" onPress={handleAddBill} style={{ marginTop: 20 }} />
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
  scrollContent: { paddingHorizontal: space.screenX },
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
