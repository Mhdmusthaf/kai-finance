import React from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, fonts, space } from '../theme/theme';
import { Card } from '../components/Card';
import { ListRow } from '../components/ListRow';
import { Icon } from '../components/Icon';
import { SectionHeader } from '../components/SectionHeader';

export const MyMoneyScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>My Money</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SectionHeader title="Accounts & Cards" />
        <Card variant="default" style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
          <ListRow
            title="HDFC Savings"
            subtitle="Primary account · •••• 4821"
            amount={8230000}
            icon={<Icon name="bank" size={20} color={colors.forest} />}
            iconBgColor={colors.softGreen}
            showDivider
          />
          <ListRow
            title="SBI Savings"
            subtitle="Salary account · •••• 1190"
            amount={4820000}
            icon={<Icon name="bank" size={20} color={colors.forest} />}
            iconBgColor={colors.softGreen}
            showDivider
          />
          <ListRow
            title="SBI SimplyClick Card"
            subtitle="Limit ₹75,000 · Due 7 Oct"
            amount={1824000}
            amountColor="error"
            icon={<Icon name="card" size={20} color={colors.errorText} />}
            iconBgColor={colors.errorBg}
          />
        </Card>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.offWhite },
  header: { height: 56, paddingHorizontal: 20, justifyContent: 'center' },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.forest },
  scrollContent: { paddingHorizontal: space.screenX },
});
