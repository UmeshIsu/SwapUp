// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = string;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'calendar.fill': 'calendar-month',
  'chat.fill': 'chat-bubble',
  'person.badge.fill': 'badge',
  'chart.bar.fill': 'bar-chart',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.down': 'expand-more',
  'chevron.up': 'expand-less',
  'bell.fill': 'notifications',
  'bell': 'notifications',
  'bubble.left.fill': 'chat-bubble',
  'megaphone.fill': 'campaign',
  'shield.fill': 'shield',
  'exclamationmark.triangle.fill': 'warning',
  'lock.shield': 'security',
  'questionmark.circle': 'help',
  'person.text.rectangle': 'badge',
  'envelope': 'email',
  'envelope.fill': 'email',
  'phone': 'phone',
  'lock': 'lock',
  'eye': 'visibility',
  'eye.slash': 'visibility-off',
  'checkmark': 'check',
  'clock.fill': 'access-time',
  'clock': 'access-time',
  'moon.fill': 'dark-mode',
  'globe': 'language',
  'mappin.circle.fill': 'location-on',
  'person.fill': 'person',
  'arrow.left.arrow.right': 'swap-horiz',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
