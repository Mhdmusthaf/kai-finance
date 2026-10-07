import React from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, fonts, space } from '../theme/theme';
import { Card } from '../components/Card';
import { Mascot } from '../components/Mascot';
import { Button } from '../components/Button';
import { SectionHeader } from '../components/SectionHeader';
import { Icon } from '../components/Icon';

export const InsightsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Ask My Money Banner */}
        <Card variant="hero" style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Mascot expression="thinking" size={54} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 18, color: colors.cream }}>
                Ask My Money
              </Text>
              <Text style={{ fontFamily: fonts.ui, fontSize: 13, color: colors.sage, marginTop: 2 }}>
                "Can I afford a ₹15,000 trip next week?"
              </Text>
            </View>
          </View>
          <Button
            title="Ask KAI Anything"
            variant="secondary"
            buttonSize="md"
            style={{ marginTop: 14 }}
            onPress={() => {}}
          />
        </Card>

        <SectionHeader title="Your Monthly Insights" />

        <Card variant="insight" style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Mascot expression="insight" size={36} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 16, color: colors.forest }}>
                Dining out is 18% higher
              </Text>
              <Text style={{ fontFamily: fonts.ui, fontSize: 13, color: colors.gray, marginTop: 4 }}>
                You spent ₹4,800 on dining this month across 6 visits.
              </Text>
              <Text style={{ fontFamily: fonts.caption, color: colors.deepMint, marginTop: 8 }}>
                Basis: From your data
              </Text>
            </View>
          </View>
        </Card>

        <Card variant="default" style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Mascot expression="reminder" size={36} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 16, color: colors.forest }}>
                Netflix subscription renewing soon
              </Text>
              <Text style={{ fontFamily: fonts.ui, fontSize: 13, color: colors.gray, marginTop: 4 }}>
                ₹649 will be charged to SBI SimplyClick on 12 Oct.
              </Text>
            </View>
          </View>
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
