import React from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, fonts, space } from '../theme/theme';
import { Card } from '../components/Card';
import { ListRow } from '../components/ListRow';
import { Chip } from '../components/Chip';
import { Icon } from '../components/Icon';
import { SectionHeader } from '../components/SectionHeader';
import { AmountText } from '../components/AmountText';

export const UpcomingScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Upcoming</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Total Committed Card */}
        <Card variant="hero" style={{ marginBottom: 18 }}>
          <Text style={{ fontFamily: fonts.uiBold, color: colors.peach, fontSize: 12, letterSpacing: 0.8 }}>
            COMMITTED THIS MONTH
          </Text>
          <AmountText amount={2567000} size="xl" color="cream" style={{ marginTop: 6 }} />
          <Text style={{ fontFamily: fonts.ui, color: colors.sage, marginTop: 4 }}>
            3 bills & SIPs due in the next 7 days
          </Text>
        </Card>

        <SectionHeader title="Needs Attention" />
        <Card variant="default" style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
          <ListRow
            title="Electricity · BESCOM"
            subtitle="Due tomorrow (5 Oct) · ₹2,430"
            amount={243000}
            amountColor="error"
            icon={<Icon name="bills" size={20} color={colors.errorText} />}
            iconBgColor={colors.errorBg}
            rightElement={
              <Chip label="Mark Paid" variant="statusSuccess" style={{ marginTop: 4 }} />
            }
          />
        </Card>

        <SectionHeader title="Later This Week" />
        <Card variant="default" style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
          <ListRow
            title="SBI Bluechip SIP"
            subtitle="Due Oct 5 · HDFC Savings"
            amount={500000}
            icon={<Icon name="sip" size={20} color={colors.forest} />}
            iconBgColor={colors.softGreen}
            showDivider
          />
          <ListRow
            title="SBI SimplyClick Card Bill"
            subtitle="Due Oct 7 · Min ₹1,824"
            amount={1824000}
            icon={<Icon name="card" size={20} color={colors.forest} />}
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
