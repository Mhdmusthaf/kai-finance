import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, fonts, space } from '../theme/theme';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { ListRow } from '../components/ListRow';
import { Icon } from '../components/Icon';
import { AmountText } from '../components/AmountText';

export const ActivityScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
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
        {/* Day Group 1: Today */}
        <View style={styles.dayGroupHeader}>
          <Text style={styles.dayTitle}>Today, 4 Oct</Text>
          <Text style={styles.dayTotal}>Spent ₹590</Text>
        </View>

        <Card variant="default" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
          <ListRow
            title="Metro recharge"
            subtitle="8:40 am · Paytm Wallet"
            amount={50000}
            icon={<Icon name="expense" size={20} color={colors.forest} />}
            iconBgColor={colors.softGreen}
            showDivider
          />
          <ListRow
            title="Movie · PVR"
            subtitle="6:00 pm · HDFC Savings"
            amount={90000}
            icon={<Icon name="expense" size={20} color={colors.forest} />}
            iconBgColor={colors.softGreen}
          />
        </Card>

        {/* Day Group 2: Yesterday */}
        <View style={styles.dayGroupHeader}>
          <Text style={styles.dayTitle}>Yesterday, 3 Oct</Text>
          <Text style={styles.dayTotal}>Spent ₹12,140</Text>
        </View>

        <Card variant="default" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
          <ListRow
            title="Dinner · Truffles"
            subtitle="9:00 pm · HDFC Savings · Voice entry"
            amount={50000}
            icon={<Icon name="mic" size={20} color={colors.forest} />}
            iconBgColor={colors.softGreen}
            showDivider
          />
          <ListRow
            title="HDFC card bill"
            subtitle="10:00 am · HDFC Savings → Millennia Card"
            amount={1240000}
            amountColor="forest"
            icon={<Icon name="card" size={20} color={colors.forest} />}
            iconBgColor={colors.lightGray}
            rightElement={
              <Text style={{ fontFamily: fonts.caption, color: colors.gray, marginTop: 2 }}>
                Card Payment (Not spending)
              </Text>
            }
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
});
