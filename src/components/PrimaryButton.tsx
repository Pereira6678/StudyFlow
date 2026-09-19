import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, StyleProp, ViewStyle } from 'react-native';
import { styles } from '../styles/global';

type Props = TouchableOpacityProps & {
  label: string;
  variant?: 'primary' | 'outline';
  style?: StyleProp<ViewStyle>;
};

// aceita ...rest para funcionar tanto com onPress direto quanto com <Link asChild>
const PrimaryButton: React.FC<Props> = ({ label, variant = 'primary', style, ...rest }) => (
  <TouchableOpacity
    style={[variant === 'outline' ? styles.buttonOutline : styles.button, style]}
    activeOpacity={0.8}
    {...rest}
  >
    <Text style={variant === 'outline' ? styles.buttonTextOutline : styles.buttonText}>{label}</Text>
  </TouchableOpacity>
);

export default PrimaryButton;
