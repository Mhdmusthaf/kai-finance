import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { colors, fonts, space } from '../theme/theme';
import { Card } from '../components/Card';
import { AmountText } from '../components/AmountText';
import { ListRow } from '../components/ListRow';
import { SectionHeader } from '../components/SectionHeader';
import { Mascot } from '../components/Mascot';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';

interface HomeScreenProps {
  onOpenGallery?: () => void;
  onOpenVoice?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenGallery,
  onOpenVoice,
}) => {
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
          <TouchableOpacity activeOpacity={0.8} style={styles.iconCircle}>
            <Icon name="search" size={20} color={colors.forest} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={[styles.iconCircle, { marginLeft: 10 }]}>
            <Icon name="bell" size={20} color={colors.forest} />
            <View style={styles.unreadDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner to Component Gallery for Prompt 0 Reviewers */}
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
            <TouchableOpacity style={styles.eyeBtn}>
              <Icon name="security" size={16} color={colors.sage} />
            </TouchableOpacity>
          </View>

          <AmountText amount={14250000} size="display" color="cream" style={styles.heroAmount} />

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

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          {[
            { label: 'Expense', icon: 'expense' as const },
            { label: 'Income', icon: 'income' as const },
            { label: 'Transfer', icon: 'transfer' as const },
            { label: 'Pay Card', icon: 'card' as const },
          ].map((item) => (
            <TouchableOpacity key={item.label} activeOpacity={0.8} style={styles.quickActionItem}>
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
            <Mascot expression="insight" size={40} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.insightHeadline}>KAI noticed: Dining +18%</Text>
              <Text style={styles.insightDetail}>
                You spent ₹4,800 on dining this week compared to ₹3,200 last week.
              </Text>
            </View>
          </View>
        </Card>

        {/* Recent Activity */}
        <SectionHeader title="Recent Activity" actionLabel="See all" />
        <Card variant="default" style={{ padding: 0, overflow: 'hidden' }}>
          <ListRow
            title="Dinner · Truffles"
            subtitle="Yesterday, 9:00 pm · HDFC Savings"
            amount={50000}
            icon={<Icon name="expense" size={20} color={colors.forest} />}
            iconBgColor={colors.softGreen}
            showDivider
          />
          <ListRow
            title="Big Basket"
            subtitle="Oct 3, 1:00 pm · HDFC Millennia"
            amount={342000}
            icon={<Icon name="card" size={20} color={colors.forest} />}
            iconBgColor={colors.softGreen}
            showDivider
          />
          <ListRow
            title="Salary · Acme Corp"
            subtitle="Oct 1, 9:00 am · SBI Savings"
            amount={14000000}
            amountColor="deepMint"
            icon={<Icon name="income" size={20} color={colors.deepMint} />}
            iconBgColor={colors.softGreen}
          />
        </Card>

        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  topBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.screenX,
    backgroundColor: colors.offWhite,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    marginLeft: 10,
  },
  subGreeting: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.gray,
  },
  userName: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.forest,
  },
  topIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  scrollContent: {
    paddingHorizontal: space.screenX,
    paddingTop: 8,
  },
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
  heroCard: {
    marginBottom: space.sectionGap,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLabel: {
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: colors.mint,
    letterSpacing: 0.8,
  },
  eyeBtn: {
    padding: 4,
  },
  heroAmount: {
    marginTop: 8,
    marginBottom: 6,
  },
  heroSubtext: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.sage,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    marginVertical: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.mint,
    borderRadius: 3,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.sage,
    marginBottom: 2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: space.sectionGap,
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
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
  quickActionLabel: {
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    color: colors.charcoal,
  },
  insightCard: {
    marginBottom: space.sectionGap,
  },
  insightHeadline: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.forest,
  },
  insightDetail: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.gray,
    marginTop: 2,
  },
});
