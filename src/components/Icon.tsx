import React from 'react';
import Svg, { Path, Rect, Circle, G, Line } from 'react-native-svg';
import { colors } from '../theme/theme';

export type IconName =
  | 'bank' | 'cash' | 'card' | 'money' | 'income' | 'expense' | 'transfer' | 'savings' | 'netWorth'
  | 'bills' | 'emi' | 'loan' | 'insurance' | 'investment' | 'sip' | 'goals'
  | 'calendar' | 'documents' | 'insights' | 'notifications' | 'profile' | 'reports' | 'security' | 'settings' | 'voice'
  | 'home' | 'activity' | 'upcoming' | 'myMoney' | 'search' | 'bell' | 'close' | 'check' | 'undo' | 'mic';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = colors.forest,
  strokeWidth = 1.75,
}) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'home':
      return (
        <Svg {...common}>
          <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <Path d="M9 22V12h6v10" />
        </Svg>
      );
    case 'activity':
      return (
        <Svg {...common}>
          <Line x1="8" y1="6" x2="21" y2="6" />
          <Line x1="8" y1="12" x2="21" y2="12" />
          <Line x1="8" y1="18" x2="21" y2="18" />
          <Line x1="3" y1="6" x2="3.01" y2="6" strokeWidth={strokeWidth + 1} />
          <Line x1="3" y1="12" x2="3.01" y2="12" strokeWidth={strokeWidth + 1} />
          <Line x1="3" y1="18" x2="3.01" y2="18" strokeWidth={strokeWidth + 1} />
        </Svg>
      );
    case 'upcoming':
    case 'calendar':
      return (
        <Svg {...common}>
          <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <Line x1="16" y1="2" x2="16" y2="6" />
          <Line x1="8" y1="2" x2="8" y2="6" />
          <Line x1="3" y1="10" x2="21" y2="10" />
        </Svg>
      );
    case 'insights':
      return (
        <Svg {...common}>
          <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </Svg>
      );
    case 'myMoney':
    case 'card':
      return (
        <Svg {...common}>
          <Rect x="2" y="5" width="20" height="14" rx="2" />
          <Line x1="2" y1="10" x2="22" y2="10" />
        </Svg>
      );
    case 'bank':
      return (
        <Svg {...common}>
          <Path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 3L2 8h20L12 3z" />
        </Svg>
      );
    case 'cash':
    case 'money':
      return (
        <Svg {...common}>
          <Rect x="2" y="6" width="20" height="12" rx="2" />
          <Circle cx="12" cy="12" r="3" />
          <Path d="M6 12h.01M18 12h.01" />
        </Svg>
      );
    case 'income':
      return (
        <Svg {...common}>
          <Path d="M12 19V5M5 12l7-7 7 7" />
        </Svg>
      );
    case 'expense':
      return (
        <Svg {...common}>
          <Path d="M12 5v14M5 12l7 7 7-7" />
        </Svg>
      );
    case 'transfer':
      return (
        <Svg {...common}>
          <Path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
        </Svg>
      );
    case 'savings':
    case 'goals':
      return (
        <Svg {...common}>
          <Path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H7v2h10v-2h-4v-3.1c2.16-.42 3.8-2.18 4.39-4.94C19.7 10.63 21 8.55 21 6V5c0-1.1-.9-2-2-2z" />
        </Svg>
      );
    case 'netWorth':
      return (
        <Svg {...common}>
          <Path d="M3 3v18h18" />
          <Path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
        </Svg>
      );
    case 'bills':
      return (
        <Svg {...common}>
          <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        </Svg>
      );
    case 'emi':
    case 'loan':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="9" />
          <Path d="M12 8v4l3 3" />
        </Svg>
      );
    case 'insurance':
    case 'security':
      return (
        <Svg {...common}>
          <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </Svg>
      );
    case 'investment':
    case 'sip':
      return (
        <Svg {...common}>
          <Path d="M23 6l-9.5 9.5-5-5L1 18" />
          <Path d="M17 6h6v6" />
        </Svg>
      );
    case 'documents':
      return (
        <Svg {...common}>
          <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <Path d="M14 2v6h6" />
        </Svg>
      );
    case 'notifications':
    case 'bell':
      return (
        <Svg {...common}>
          <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </Svg>
      );
    case 'profile':
      return (
        <Svg {...common}>
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <Circle cx="12" cy="7" r="4" />
        </Svg>
      );
    case 'reports':
      return (
        <Svg {...common}>
          <Line x1="18" y1="20" x2="18" y2="10" />
          <Line x1="12" y1="20" x2="12" y2="4" />
          <Line x1="6" y1="20" x2="6" y2="14" />
        </Svg>
      );
    case 'settings':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="3" />
          <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </Svg>
      );
    case 'voice':
    case 'mic':
      return (
        <Svg {...common}>
          <Path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <Path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <Line x1="12" y1="19" x2="12" y2="23" />
          <Line x1="8" y1="23" x2="16" y2="23" />
        </Svg>
      );
    case 'search':
      return (
        <Svg {...common}>
          <Circle cx="11" cy="11" r="8" />
          <Line x1="21" y1="21" x2="16.65" y2="16.65" />
        </Svg>
      );
    case 'close':
      return (
        <Svg {...common}>
          <Line x1="18" y1="6" x2="6" y2="18" />
          <Line x1="6" y1="6" x2="18" y2="18" />
        </Svg>
      );
    case 'check':
      return (
        <Svg {...common}>
          <Path d="M20 6L9 17l-5-5" />
        </Svg>
      );
    case 'undo':
      return (
        <Svg {...common}>
          <Path d="M3 7v6h6" />
          <Path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
        </Svg>
      );
    default:
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="10" />
        </Svg>
      );
  }
};
