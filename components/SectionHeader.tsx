import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/lib/colors';
import { ThemeContext } from '@/contexts/ThemeContext';

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <View style={styles.container}>
      <Text 
        style={[
          styles.title,
          theme === 'light' ? styles.titleLight : styles.titleDark
        ]}
      >
        {title}
      </Text>
      <View 
        style={[
          styles.divider,
          theme === 'light' ? styles.dividerLight : styles.dividerDark
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
    gap: 8,
  },
  title: {
    fontFamily: 'Urbanist',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  titleLight: {
    color: colors.light_theme.text_secondary,
  },
  titleDark: {
    color: colors.dark_theme.text_secondary,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  dividerLight: {
    backgroundColor: colors.light_theme.tertiary_background,
  },
  dividerDark: {
    backgroundColor: colors.dark_theme.tertiary_background,
  },
});

export default SectionHeader; 