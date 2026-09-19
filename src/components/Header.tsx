import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/global';

type Props = {
  title?: string;
  subtitle?: string;
};

const Header: React.FC<Props> = ({ title = 'Bem-vindo', subtitle }) => (
  <View style={styles.header}>
    <Text style={styles.headerText}>{title}</Text>
    {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
  </View>
);

export default Header;
