import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { colors, fonts, space, formatINR } from '../theme/theme';
import { Card } from '../components/Card';
import { AmountText } from '../components/AmountText';
import { Chip } from '../components/Chip';
import { SectionHeader } from '../components/SectionHeader';
import { Button } from '../components/Button';
import { BottomSheet } from '../components/BottomSheet';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { useApp } from '../context/AppContext';

export const OwedScreen: React.FC = () => {
  const { debts, addDebt, settleDebt, showToast } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [direction, setDirection] = useState<'owed_to_me' | 'i_owe'>('owed_to_me');

  const owedToMe = debts.filter((d) => d.direction === 'owed_to_me' && d.status === 'open');
  const iOwe = debts.filter((d) => d.direction === 'i_owe' && d.status === 'open');
  const settled = debts.filter((d) => d.status === 'settled');

  const totalToMe = owedToMe.reduce((s, d) => s + (d.amount - d.settled), 0);
  const totalIOwe = iOwe.reduce((s, d) => s + (d.amount - d.settled), 0);
  const net = totalToMe - totalIOwe;

  const handleAdd = () => {
    const paise = Math.round((parseFloat(amount) || 500) * 100);
    addDebt({
      personName: person || 'Friend',
      direction,
      amount: paise,
      reason: reason || undefined,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    });
    setPerson('');
    setAmount('');
    setReason('');
    setDirection('owed_to_me');
    setShowAddModal(false);
  };

  const renderDebtRow = (id: string, name: string, amt: number, paid: number, dir: 'owed_to_me' | 'i_owe', reasonText?: string, dateText?: string, isSettled?: boolean, showDivider?: boolean) => (
    <View key={id} style={[styles.debtRow, showDivider && styles.divider]}>
      <View style={[styles.avatar, { backgroundColor: dir === 'owed_to_me' ? colors.softGreen : colors.errorBg }]}>
        <Text style={[styles.avatarText, { color: dir === 'owed_to_me' ? colors.forest : colors.errorText }]}>
          {name.slice(0, 1).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.debtName}>{name}</Text>
        <Text style={styles.debtMeta}>
          {dir === 'owed_to_me' ? 'Owes you' : 'You owe them'}
          {reasonText ? ` · ${reasonText}` : ''}{dateText ? ` · ${dateText}` : ''}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <AmountText amount={amt - paid} size="md" color={dir === 'owed_to_me' ? 'deepMint' : 'error'} />
        {!isSettled && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => settleDebt(id)}
            style={styles.settleBtn}
          >
            <Text style={styles.settleBtnText}>Settle up</Text>
          </TouchableOpacity>
        )}
        {isSettled && <Chip label="Settled" variant="statusSuccess" style={{ marginTop: 4 }} />}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Owed</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addBtn}>
          <Icon name="money" size={16} color={colors.cream} />
          <Text style={styles.addBtnText}>Add Debt</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="hero" style={{ marginBottom: 18 }}>
          <Text style={styles.netLabel}>{net >= 0 ? 'YOU ARE OWED NET' : 'YOU OWE NET'}</Text>
          <AmountText amount={Math.abs(net)} size="display" color="cream" style={{ marginTop: 6 }} />
          <Text style={styles.netSub}>
            {formatINR(totalToMe / 100)} expected in · {formatINR(totalIOwe / 100)} promised out
          </Text>
        </Card>

        {debts.length === 0 ? (
          <EmptyState
            title="No money between people"
            description="Track what friends owe you and what you owe — settle up in one tap."
            mascotExpression="sleeping"
            ctaLabel="Add First Debt"
            onCtaPress={() => setShowAddModal(true)}
          />
        ) : (
          <>
            {owedToMe.length > 0 && (
              <>
                <SectionHeader title="Owed to you" />
                <Card variant="default" style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
                  {owedToMe.map((d, idx) =>
                    renderDebtRow(d.id, d.personName, d.amount, d.settled, d.direction, d.reason, d.date, false, idx < owedToMe.length - 1)
                  )}
                </Card>
              </>
            )}

            {iOwe.length > 0 && (
              <>
                <SectionHeader title="You owe" />
                <Card variant="default" style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
                  {iOwe.map((d, idx) =>
                    renderDebtRow(d.id, d.personName, d.amount, d.settled, d.direction, d.reason, d.date, false, idx < iOwe.length - 1)
                  )}
                </Card>
              </>
            )}

            {settled.length > 0 && (
              <>
                <SectionHeader title="Settled" />
                <Card variant="default" style={{ padding: 0, overflow: 'hidden' }}>
                  {settled.map((d, idx) =>
                    renderDebtRow(d.id, d.personName, d.amount, d.settled, d.direction, d.reason, d.date, true, idx < settled.length - 1)
                  )}
                </Card>
              </>
            )}
          </>
        )}
        <View style={{ height: 110 }} />
      </ScrollView>

      <BottomSheet visible={showAddModal} onClose={() => setShowAddModal(false)} title="Track Money Between People">
        <View style={{ paddingTop: 8 }}>
          <Text style={styles.inputLabel}>Direction</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            <Chip
              label="They owe me"
              selected={direction === 'owed_to_me'}
              onPress={() => setDirection('owed_to_me')}
            />
            <Chip
              label="I owe them"
              selected={direction === 'i_owe'}
              onPress={() => setDirection('i_owe')}
            />
          </View>

          <Text style={styles.inputLabel}>Person</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. Rahul"
            placeholderTextColor={colors.muted}
            value={person}
            onChangeText={setPerson}
          />

          <Text style={styles.inputLabel}>Amount (₹)</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. 1200"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={styles.inputLabel}>Reason (optional)</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. Goarkipe trip"
            placeholderTextColor={colors.muted}
            value={reason}
            onChangeText={setReason}
          />

          <Button title="Save Debt" onPress={handleAdd} style={{ marginTop: 20 }} />
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
  netLabel: { fontFamily: fonts.uiBold, color: colors.mint, fontSize: 12, letterSpacing: 0.8 },
  netSub: { fontFamily: fonts.ui, color: colors.sage, marginTop: 6, fontSize: 13 },
  debtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.displayBold, fontSize: 17 },
  debtName: { fontFamily: fonts.uiBold, fontSize: 15, color: colors.charcoal },
  debtMeta: { fontFamily: fonts.ui, fontSize: 12, color: colors.gray, marginTop: 2 },
  settleBtn: {
    backgroundColor: colors.softGreen,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 4,
  },
  settleBtnText: { fontFamily: fonts.uiBold, fontSize: 11, color: colors.successText },
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
