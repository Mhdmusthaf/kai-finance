import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { colors, fonts, space, formatINR } from '../theme/theme';
import { Card } from '../components/Card';
import { AmountText } from '../components/AmountText';
import { SectionHeader } from '../components/SectionHeader';
import { Button } from '../components/Button';
import { BottomSheet } from '../components/BottomSheet';
import { EmptyState } from '../components/EmptyState';
import { Mascot } from '../components/Mascot';
import { Icon } from '../components/Icon';
import { useApp, GoalItem } from '../context/AppContext';

export const GoalsScreen: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal, showToast } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalItem | null>(null);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addAmount, setAddAmount] = useState('');

  // Create form
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  const handleCreateGoal = () => {
    const targetPaise = Math.round((parseFloat(goalTarget) || 50000) * 100);
    addGoal({
      name: goalName || 'New Goal',
      icon: 'goals',
      target: targetPaise,
      deadline: goalDeadline || undefined,
    });
    setGoalName('');
    setGoalTarget('');
    setGoalDeadline('');
    setShowCreateModal(false);
  };

  const handleAddMoney = () => {
    if (!selectedGoal) return;
    const addPaise = Math.round((parseFloat(addAmount) || 1000) * 100);
    const newSaved = selectedGoal.saved + addPaise;
    if (newSaved >= selectedGoal.target) {
      updateGoal(selectedGoal.id, { saved: newSaved, status: 'completed' });
      showToast(`Goal "${selectedGoal.name}" completed!`);
    } else {
      updateGoal(selectedGoal.id, { saved: newSaved });
      showToast(`Added ${formatINR(addPaise / 100)} to ${selectedGoal.name}`);
    }
    setAddAmount('');
    setShowAddMoneyModal(false);
    setSelectedGoal(null);
  };

  const renderGoalCard = (goal: GoalItem) => {
    const pct = goal.target > 0 ? Math.min(100, (goal.saved / goal.target) * 100) : 0;
    const remaining = Math.max(0, goal.target - goal.saved);
    const isComplete = goal.status === 'completed';

    return (
      <Card
        key={goal.id}
        variant="default"
        style={styles.goalCard}
        onPress={() => {
          setSelectedGoal(goal);
          setShowAddMoneyModal(true);
        }}
      >
        <View style={styles.goalHeader}>
          <View style={styles.goalIconChip}>
            <Icon name="goals" size={22} color={isComplete ? colors.deepMint : colors.forest} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.goalName}>{goal.name}</Text>
            {goal.deadline ? (
              <Text style={styles.goalDeadline}>By {goal.deadline}</Text>
            ) : null}
          </View>
          {isComplete && (
            <View style={styles.completeBadge}>
              <Icon name="check" size={14} color={colors.successText} />
              <Text style={styles.completeBadgeText}>Done</Text>
            </View>
          )}
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${pct}%`, backgroundColor: isComplete ? colors.leaf : colors.mint }]} />
        </View>

        <View style={styles.goalAmountRow}>
          <View>
            <Text style={styles.goalAmountLabel}>Saved</Text>
            <AmountText amount={goal.saved} size="md" color={isComplete ? 'deepMint' : 'forest'} />
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.goalAmountLabel}>{isComplete ? 'Target' : 'Remaining'}</Text>
            <AmountText amount={isComplete ? goal.target : remaining} size="md" color="gray" />
          </View>
        </View>

        <Text style={styles.goalPct}>{Math.round(pct)}% complete</Text>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Goals</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.addBtn}>
          <Icon name="goals" size={16} color={colors.cream} />
          <Text style={styles.addBtnText}>New Goal</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeGoals.length === 0 && completedGoals.length === 0 ? (
          <EmptyState
            title="No goals yet"
            description="Set a savings goal and KAI will track your progress automatically."
            mascotExpression="sleeping"
            ctaLabel="Create Your First Goal"
            onCtaPress={() => setShowCreateModal(true)}
          />
        ) : (
          <>
            {activeGoals.length > 0 && (
              <>
                <SectionHeader title="Active Goals" />
                {activeGoals.map(renderGoalCard)}
              </>
            )}

            {completedGoals.length > 0 && (
              <>
                <SectionHeader title="Completed" style={{ marginTop: 8 }} />
                {completedGoals.map(renderGoalCard)}
              </>
            )}

            {activeGoals.length > 0 && (
              <Card variant="insight" style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Mascot expression="happy" size={40} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.encourageTitle}>Keep going!</Text>
                    <Text style={styles.encourageText}>
                      You're saving towards {activeGoals.length} goal{activeGoals.length > 1 ? 's' : ''}.
                      Add money anytime by tapping a goal.
                    </Text>
                  </View>
                </View>
              </Card>
            )}
          </>
        )}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Create Goal Modal */}
      <BottomSheet
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Goal"
      >
        <View style={{ paddingTop: 8 }}>
          <Text style={styles.inputLabel}>Goal Name</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. Goa Trip"
            placeholderTextColor={colors.muted}
            value={goalName}
            onChangeText={setGoalName}
          />

          <Text style={styles.inputLabel}>Target Amount (₹)</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. 50000"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={goalTarget}
            onChangeText={setGoalTarget}
          />

          <Text style={styles.inputLabel}>Deadline (optional)</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. Dec 2026"
            placeholderTextColor={colors.muted}
            value={goalDeadline}
            onChangeText={setGoalDeadline}
          />

          <Button title="Create Goal" onPress={handleCreateGoal} style={{ marginTop: 20 }} />
        </View>
      </BottomSheet>

      {/* Add Money / Goal Detail Modal */}
      <BottomSheet
        visible={showAddMoneyModal && !!selectedGoal}
        onClose={() => {
          setShowAddMoneyModal(false);
          setSelectedGoal(null);
        }}
        title={selectedGoal?.name || 'Goal'}
      >
        {selectedGoal && (
          <View style={{ paddingTop: 8 }}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Target</Text>
              <AmountText amount={selectedGoal.target} size="lg" color="forest" />
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Saved so far</Text>
              <AmountText amount={selectedGoal.saved} size="lg" color="deepMint" />
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Remaining</Text>
              <AmountText amount={Math.max(0, selectedGoal.target - selectedGoal.saved)} size="lg" color="error" />
            </View>

            {selectedGoal.status === 'active' && (
              <>
                <Text style={styles.inputLabel}>Add Money (₹)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 5000"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  value={addAmount}
                  onChangeText={setAddAmount}
                />
                <Button title="Add to Goal" onPress={handleAddMoney} style={{ marginTop: 16 }} />
              </>
            )}

            {selectedGoal.status === 'active' && (
              <TouchableOpacity
                onPress={() => {
                  deleteGoal(selectedGoal.id);
                  setShowAddMoneyModal(false);
                  setSelectedGoal(null);
                }}
                style={styles.deleteRow}
              >
                <Text style={styles.deleteText}>Delete this goal</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
  goalCard: { marginBottom: 14 },
  goalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  goalIconChip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalName: { fontFamily: fonts.display, fontSize: 17, color: colors.forest },
  goalDeadline: { fontFamily: fonts.ui, fontSize: 12, color: colors.gray, marginTop: 2 },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completeBadgeText: { fontFamily: fonts.uiBold, fontSize: 11, color: colors.successText, marginLeft: 4 },
  progressTrack: {
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: { height: '100%', borderRadius: 4 },
  goalAmountRow: { flexDirection: 'row', justifyContent: 'space-between' },
  goalAmountLabel: { fontFamily: fonts.ui, fontSize: 12, color: colors.gray, marginBottom: 2 },
  goalPct: { fontFamily: fonts.uiSemi, fontSize: 12, color: colors.deepMint, marginTop: 8 },
  encourageTitle: { fontFamily: fonts.display, fontSize: 15, color: colors.forest },
  encourageText: { fontFamily: fonts.ui, fontSize: 13, color: colors.gray, marginTop: 2, lineHeight: 18 },
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  detailLabel: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.gray },
  deleteRow: { marginTop: 20, alignItems: 'center' },
  deleteText: { fontFamily: fonts.uiSemi, fontSize: 14, color: colors.errorText },
});
