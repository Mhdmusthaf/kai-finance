import React from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors, fonts, space } from '../theme/theme';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { useApp } from '../context/AppContext';

export const NotificationsScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { notifications, markNotificationRead, showToast } = useApp();

  const unread = notifications.filter((n) => !n.readAt);
  const read = notifications.filter((n) => n.readAt);

  const iconForKind = (kind: string): 'bell' | 'bills' | 'insights' | 'goals' | 'security' => {
    if (kind.includes('bill') || kind.includes('recurring')) return 'bills';
    if (kind.includes('insight')) return 'insights';
    if (kind.includes('goal')) return 'goals';
    if (kind.includes('security')) return 'security';
    return 'bell';
  };

  const renderRow = (id: string, kind: string, title: string, body: string, time: string, isUnread: boolean, showDivider: boolean) => (
    <TouchableOpacity
      key={id}
      activeOpacity={0.8}
      onPress={() => {
        if (isUnread) markNotificationRead(id);
      }}
    >
      <View style={[styles.row, showDivider && styles.divider]}>
        <View style={[styles.iconChip, { backgroundColor: isUnread ? colors.softGreen : colors.lightGray }]}>
          <Icon name={iconForKind(kind)} size={20} color={colors.forest} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.rowTitle}>{title}</Text>
          <Text style={styles.rowBody} numberOfLines={2}>{body}</Text>
          <Text style={styles.rowTime}>{time}</Text>
        </View>
        {isUnread && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return iso;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Icon name="close" size={20} color={colors.forest} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notifications.length === 0 ? (
          <EmptyState
            title="All caught up"
            description="Bills, insights and reminders will show up here."
            mascotExpression="sleeping"
          />
        ) : (
          <>
            {unread.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Unread ({unread.length})</Text>
                <Card variant="default" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
                  {unread.map((n, idx) =>
                    renderRow(n.id, n.kind, n.title, n.body, formatTime(n.createdAt), true, idx < unread.length - 1)
                  )}
                </Card>
              </>
            )}

            {read.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Earlier</Text>
                <Card variant="default" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
                  {read.map((n, idx) =>
                    renderRow(n.id, n.kind, n.title, n.body, formatTime(n.createdAt), false, idx < read.length - 1)
                  )}
                </Card>
              </>
            )}

            {unread.length > 0 && (
              <Button
                title="Mark All as Read"
                variant="secondary"
                onPress={() => {
                  unread.forEach((n) => markNotificationRead(n.id));
                  showToast('All notifications marked as read');
                }}
                style={{ marginBottom: 8 }}
              />
            )}
          </>
        )}
        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.offWhite },
  header: {
    height: 56,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.forest },
  scrollContent: { paddingHorizontal: space.screenX },
  sectionLabel: {
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: colors.gray,
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.charcoal },
  rowBody: { fontFamily: fonts.ui, fontSize: 13, color: colors.gray, marginTop: 2, lineHeight: 18 },
  rowTime: { fontFamily: fonts.ui, fontSize: 11, color: colors.muted, marginTop: 4 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.leaf,
    marginLeft: 8,
  },
});
