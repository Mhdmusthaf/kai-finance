import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { colors, fonts, space } from '../theme/theme';
import { Card } from '../components/Card';
import { ListRow } from '../components/ListRow';
import { Icon } from '../components/Icon';
import { SectionHeader } from '../components/SectionHeader';
import { Button } from '../components/Button';
import { BottomSheet } from '../components/BottomSheet';
import { useApp } from '../context/AppContext';

export const MyMoneyScreen: React.FC = () => {
  const { accounts, cards, addAccount, addCard } = useApp();
  const [showAddModal, setShowAddModal] = useState<false | 'account' | 'card'>(false);
  const [title, setTitle] = useState('');
  const [balance, setBalance] = useState('');
  const [lastDigits, setLastDigits] = useState('5544');

  const handleAddObject = () => {
    const raw = parseFloat(balance) || 50000;
    const amountInPaise = Math.round(raw * 100);

    if (showAddModal === 'account') {
      addAccount({
        title: title || 'ICICI Savings',
        subtitle: `Secondary Account · •••• ${lastDigits}`,
        balance: amountInPaise,
        icon: 'bank',
        accountNumber: lastDigits,
      });
    } else if (showAddModal === 'card') {
      addCard({
        title: title || 'HDFC Regalia Card',
        subtitle: `Limit ₹1,50,000 · Due 15th`,
        outstanding: amountInPaise,
        limit: 15000000,
        dueDate: '15th',
      });
    }

    setTitle('');
    setBalance('');
    setShowAddModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>My Money</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => setShowAddModal('account')} style={styles.addBtn}>
            <Icon name="bank" size={16} color={colors.cream} />
            <Text style={styles.addBtnText}>+ Bank</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAddModal('card')} style={styles.addBtn}>
            <Icon name="card" size={16} color={colors.cream} />
            <Text style={styles.addBtnText}>+ Card</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Accounts Section */}
        <SectionHeader title="Accounts & Cards" />
        <Card variant="default" style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
          {accounts.map((acc, idx) => (
            <ListRow
              key={acc.id}
              title={acc.title}
              subtitle={acc.subtitle}
              amount={acc.balance}
              icon={<Icon name="bank" size={20} color={colors.forest} />}
              iconBgColor={colors.softGreen}
              showDivider={idx < accounts.length - 1 || cards.length > 0}
            />
          ))}

          {cards.map((card, idx) => (
            <ListRow
              key={card.id}
              title={card.title}
              subtitle={card.subtitle}
              amount={card.outstanding}
              amountColor="error"
              icon={<Icon name="card" size={20} color={colors.errorText} />}
              iconBgColor={colors.errorBg}
              showDivider={idx < cards.length - 1}
            />
          ))}
        </Card>

        {/* Investments Section */}
        <SectionHeader title="Investments & SIPs" />
        <Card variant="default" style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
          <ListRow
            title="SBI Bluechip Fund"
            subtitle="Invested ₹1.5L · Val ₹1.78L"
            amount={17840000}
            amountColor="deepMint"
            icon={<Icon name="investment" size={20} color={colors.deepMint} />}
            iconBgColor={colors.softGreen}
            showDivider
          />
          <ListRow
            title="Parag Parikh Flexi Cap"
            subtitle="Invested ₹1.2L · Val ₹1.42L"
            amount={14290000}
            amountColor="deepMint"
            icon={<Icon name="investment" size={20} color={colors.deepMint} />}
            iconBgColor={colors.softGreen}
          />
        </Card>

        {/* Loans Section */}
        <SectionHeader title="Loans & Commitments" />
        <Card variant="default" style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
          <ListRow
            title="Car Loan · HDFC Bank"
            subtitle="EMI ₹14,931/mo on 5th"
            amount={36980000}
            amountColor="forest"
            icon={<Icon name="loan" size={20} color={colors.forest} />}
            iconBgColor={colors.lightGray}
          />
        </Card>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Add Bank Account or Card Modal */}
      <BottomSheet
        visible={!!showAddModal}
        onClose={() => setShowAddModal(false)}
        title={showAddModal === 'account' ? 'Add Bank Account' : 'Add Credit Card'}
      >
        <View style={{ paddingTop: 8 }}>
          <Text style={styles.inputLabel}>Name / Bank Title</Text>
          <TextInput
            style={styles.formInput}
            placeholder={showAddModal === 'account' ? 'e.g. ICICI Savings' : 'e.g. HDFC Regalia'}
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.inputLabel}>
            {showAddModal === 'account' ? 'Current Balance (₹)' : 'Current Outstanding (₹)'}
          </Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. 50000"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={balance}
            onChangeText={setBalance}
          />

          <Text style={styles.inputLabel}>Last 4 Digits</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. 4821"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            maxLength={4}
            value={lastDigits}
            onChangeText={setLastDigits}
          />

          <Button
            title={showAddModal === 'account' ? 'Save Account' : 'Save Credit Card'}
            onPress={handleAddObject}
            style={{ marginTop: 20 }}
          />
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addBtnText: { fontFamily: fonts.uiBold, fontSize: 11, color: colors.cream, marginLeft: 4 },
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
