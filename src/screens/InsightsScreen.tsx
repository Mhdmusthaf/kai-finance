import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import { colors, fonts, space } from '../theme/theme';
import { Card } from '../components/Card';
import { Mascot } from '../components/Mascot';
import { Button } from '../components/Button';
import { SectionHeader } from '../components/SectionHeader';
import { BottomSheet } from '../components/BottomSheet';
import { useApp } from '../context/AppContext';

export const InsightsScreen: React.FC = () => {
  const { accounts } = useApp();
  const [showAskModal, setShowAskModal] = useState(false);
  const [question, setQuestion] = useState('Can I afford a ₹15,000 trip next week?');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const handleAskKai = (qText?: string) => {
    const q = qText || question;
    setIsThinking(true);
    setAiAnswer(null);

    setTimeout(() => {
      setIsThinking(false);
      const totalInRupees = Math.round(totalBalance / 100);

      if (q.toLowerCase().includes('afford') || q.toLowerCase().includes('trip')) {
        setAiAnswer(
          `Yes! You have ₹${totalInRupees.toLocaleString('en-IN')} in total liquid savings across HDFC and SBI accounts. After allocating ₹40,000 for upcoming EMIs and bills, you have a safe spending margin of ₹90,000.`
        );
      } else if (q.toLowerCase().includes('net worth') || q.toLowerCase().includes('savings')) {
        setAiAnswer(
          `Your current net worth is ₹1,42,50,000 including mutual fund investments (₹3.2L) and liquid bank balances (₹1.3L).`
        );
      } else {
        setAiAnswer(
          `KAI analyzed your financial objects: Your average monthly income is ₹1,40,000 and total recurring commitments are ₹25,670/month.`
        );
      }
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Ask My Money Banner */}
        <Card variant="hero" style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Mascot expression="thinking" size={60} />
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
            onPress={() => setShowAskModal(true)}
          />
        </Card>

        <SectionHeader title="Your Monthly Insights" />

        <Card variant="insight" style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Mascot expression="insight" size={42} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 16, color: colors.forest }}>
                Dining out is 18% higher
              </Text>
              <Text style={{ fontFamily: fonts.ui, fontSize: 13, color: colors.gray, marginTop: 4 }}>
                You spent ₹4,800 on dining this month across 6 visits.
              </Text>
              <Text style={{ fontFamily: fonts.caption, color: colors.deepMint, marginTop: 8 }}>
                Basis: From your live data
              </Text>
            </View>
          </View>
        </Card>

        <Card variant="default" style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Mascot expression="reminder" size={42} />
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

      {/* Ask KAI Modal */}
      <BottomSheet
        visible={showAskModal}
        onClose={() => setShowAskModal(false)}
        title="Ask KAI AI Assistant"
      >
        <View style={{ paddingVertical: 8, alignItems: 'center' }}>
          <Mascot expression={isThinking ? 'thinking' : aiAnswer ? 'insight' : 'waving'} size={100} />

          <Text style={{ fontFamily: fonts.uiBold, fontSize: 14, color: colors.forest, marginTop: 12, width: '100%' }}>
            Ask a question about your money:
          </Text>

          <TextInput
            style={styles.questionInput}
            value={question}
            onChangeText={setQuestion}
            placeholder="Type your question..."
            placeholderTextColor={colors.muted}
            multiline
          />

          <View style={{ width: '100%', marginVertical: 8 }}>
            {[
              'Can I afford a ₹15,000 trip next week?',
              'What is my total net worth?',
              'How much can I invest this month?',
            ].map((q) => (
              <TouchableOpacity
                key={q}
                onPress={() => {
                  setQuestion(q);
                  handleAskKai(q);
                }}
                style={styles.sampleChip}
              >
                <Text style={styles.sampleChipText}>"{q}"</Text>
              </TouchableOpacity>
            ))}
          </View>

          {isThinking && (
            <Text style={{ fontFamily: fonts.uiBold, color: colors.deepMint, marginVertical: 12 }}>
              KAI is calculating from your bank & bill objects...
            </Text>
          )}

          {aiAnswer && (
            <View style={styles.answerBox}>
              <Text style={styles.answerTitle}>KAI Financial Advice:</Text>
              <Text style={styles.answerBody}>{aiAnswer}</Text>
            </View>
          )}

          <Button
            title="Ask KAI AI"
            onPress={() => handleAskKai()}
            style={{ width: '100%', marginTop: 12 }}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.offWhite },
  header: { height: 56, paddingHorizontal: 20, justifyContent: 'center' },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.forest },
  scrollContent: { paddingHorizontal: space.screenX },
  questionInput: {
    width: '100%',
    minHeight: 50,
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    padding: 12,
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: colors.forest,
    marginTop: 6,
  },
  sampleChip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
  },
  sampleChipText: { fontFamily: fonts.ui, fontSize: 12, color: colors.deepMint },
  answerBox: {
    width: '100%',
    backgroundColor: colors.softGreen,
    borderRadius: 14,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: colors.leaf + '44',
  },
  answerTitle: { fontFamily: fonts.display, fontSize: 15, color: colors.forest },
  answerBody: { fontFamily: fonts.ui, fontSize: 13, color: colors.charcoal, marginTop: 4, lineHeight: 19 },
});
