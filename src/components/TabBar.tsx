import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts, radius, size } from '../theme/theme';
import { Icon, IconName } from './Icon';

export type TabKey = 'home' | 'activity' | 'upcoming' | 'insights' | 'myMoney';

interface TabItem {
  key: TabKey;
  label: string;
  icon: IconName;
}

const TABS: TabItem[] = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'activity', label: 'Activity', icon: 'activity' },
  { key: 'upcoming', label: 'Upcoming', icon: 'upcoming' },
  { key: 'insights', label: 'Insights', icon: 'insights' },
  { key: 'myMoney', label: 'My Money', icon: 'myMoney' },
];

interface TabBarProps {
  activeTab: TabKey;
  onTabChange: (key: TabKey) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.8}
            onPress={() => onTabChange(tab.key)}
            style={styles.tabItem}
          >
            {/* Active Pill Background Behind Icon */}
            <View style={[styles.iconContainer, isActive && styles.activePill]}>
              <Icon
                name={tab.icon}
                size={22}
                color={isActive ? colors.forest : colors.gray}
                strokeWidth={isActive ? 2.2 : 1.75}
              />
            </View>

            <Text style={[styles.label, isActive ? styles.activeLabel : styles.inactiveLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: size.tabBar,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingBottom: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 90,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  iconContainer: {
    width: 44,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activePill: {
    backgroundColor: colors.softGreen,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
  },
  activeLabel: {
    fontFamily: fonts.uiBold,
    color: colors.forest,
  },
  inactiveLabel: {
    fontFamily: fonts.ui,
    color: colors.gray,
  },
});
