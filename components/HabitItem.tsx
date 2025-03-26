import React, { useContext } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '@/lib/colors';
import { ThemeContext } from '@/contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { Habit } from '@/types/database';

interface HabitItemProps {
  habit: Habit;
  isCompleted?: boolean;
  onToggleComplete?: (habitId: string, completed: boolean) => void;
  onPress?: () => void;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit, isCompleted = false, onToggleComplete, onPress }) => {
  const { theme } = useContext(ThemeContext);
  
  const handleToggleComplete = () => {
    if (onToggleComplete) {
      onToggleComplete(habit.id, !isCompleted);
    }
  };
  
  return (
    <Pressable
      style={[
        styles.container,
        theme === 'light' ? styles.containerLight : styles.containerDark,
      ]}
      onPress={onPress}
    >
      <Pressable 
        style={[
          styles.checkbox,
          isCompleted 
            ? styles.checkboxCompleted 
            : theme === 'light' ? styles.checkboxLight : styles.checkboxDark
        ]}
        onPress={handleToggleComplete}
      >
        {isCompleted && (
          <Feather 
            name="check" 
            size={12} 
            color={theme === 'light' ? colors.light_theme.background : colors.dark_theme.background} 
          />
        )}
      </Pressable>
      
      <View style={styles.content}>
        <Text 
          style={[
            styles.title,
            isCompleted ? styles.titleCompleted : theme === 'light' ? styles.titleLight : styles.titleDark
          ]}
          numberOfLines={2}
        >
          {habit.title}
        </Text>
        
        {!isCompleted && habit.reminder_time && (
          <View style={styles.timeContainer}>
            <Feather 
              name="clock" 
              size={12} 
              color={theme === 'light' ? colors.light_theme.text_secondary : colors.dark_theme.text_secondary} 
            />
            <Text 
              style={[
                styles.time,
                theme === 'light' ? styles.timeLight : styles.timeDark
              ]}
            >
              {habit.reminder_time}
            </Text>
          </View>
        )}
      </View>
      
      {/* Colored bar at the left edge */}
      <View 
        style={[
          styles.colorBar,
          { backgroundColor: colors.light_theme.text_accent } // Purple accent color for habits
        ]} 
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    padding: 12,
    paddingLeft: 20,
    paddingRight: 16,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
  },
  containerLight: {
    backgroundColor: colors.light_theme.background,
    borderColor: colors.light_theme.background,
  },
  containerDark: {
    backgroundColor: colors.dark_theme.background,
    borderColor: colors.dark_theme.background,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1.5,
  },
  checkboxLight: {
    borderColor: colors.light_theme.tertiary_background,
  },
  checkboxDark: {
    borderColor: colors.dark_theme.tertiary_background,
  },
  checkboxCompleted: {
    backgroundColor: colors.light_theme.status_success,
    borderColor: colors.light_theme.status_success,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  title: {
    fontFamily: 'Urbanist',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 28,
  },
  titleLight: {
    color: colors.light_theme.text_primary,
  },
  titleDark: {
    color: colors.dark_theme.text_primary,
  },
  titleCompleted: {
    color: colors.light_theme.text_secondary,
    textDecorationLine: 'line-through',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  time: {
    fontFamily: 'Urbanist',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 19,
  },
  timeLight: {
    color: colors.light_theme.text_secondary,
  },
  timeDark: {
    color: colors.dark_theme.text_secondary,
  },
  colorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
});

export default HabitItem; 