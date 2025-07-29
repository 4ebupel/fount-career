import React, { useContext } from 'react';
import { View, Text as RNText, StyleSheet, ScrollView, useWindowDimensions, Pressable } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { format, startOfWeek, addDays } from 'date-fns';
import { colors } from '@/lib/colors';
import { ThemeContext } from '@/contexts/ThemeContext';

const radius = 20;
const strokeWidth = 5;
const circumference = 2 * Math.PI * radius;

const WeeklyCalendarHeader = ({ progressData = [0, 0, 0, 0, 0, 0, 0], selectedDay, setSelectedDay }: { progressData: number[], selectedDay: string, setSelectedDay: (day: string) => void }) => {
  const { theme } = useContext(ThemeContext);
  const { width } = useWindowDimensions();
  // Calculate the start of the week (Monday)
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });

  return (
    <ScrollView 
      style={[theme === 'dark' ? styles.containerDark : styles.containerLight]}
      contentContainerStyle={{ flexDirection: 'row', justifyContent: 'space-around', padding: 10, height: 100 }}
      scrollEnabled={width < 390}
      horizontal={true}
    >
      {Array.from({ length: 7 }).map((_, index) => {
        const currentDate = addDays(start, index);
        const dayNumber = format(currentDate, 'd');
        const dayName = format(currentDate, 'EEEE'); // e.g., Monday, Tuesday
        const percentage = progressData[index]; // Expects a number 0-100
        const strokeDashoffset = circumference * (1 - percentage / 100);

        return (
          <Pressable key={index} style={styles.dayContainer} onPress={() => setSelectedDay(dayName)}>
            {/* Day title above the circle */}
            <View style={[styles.dayContainer, dayName === selectedDay ? theme === 'dark' ? styles.dayContainerTodayDark : styles.dayContainerTodayLight : null]}>
              <RNText style={[styles.weekDayText, theme === 'dark' ? styles.weekDayTextDark : styles.weekDayTextLight]}>{dayName.slice(0, 3)}</RNText>
              <View style={styles.svgContainer}>
                <Svg width={radius * 2 + strokeWidth * 2} height={radius * 2 + strokeWidth * 2}>
                  {/* Background Circle */}
                  <Circle
                    cx={radius + strokeWidth}
                    cy={radius + strokeWidth}
                    r={radius}
                    stroke={theme === 'dark' ? colors.dark_theme.tertiary_background : colors.light_theme.tertiary_background}
                    strokeWidth={strokeWidth}
                    fill="none"
                  />
                  {/* Progress Circle */}
                  <Circle
                    cx={radius + strokeWidth}
                    cy={radius + strokeWidth}
                    r={radius}
                    stroke={theme === 'dark' ? colors.dark_theme.text_accent : colors.light_theme.text_accent}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    rotation="-90"
                    originX={radius + strokeWidth}
                    originY={radius + strokeWidth}
                  />
                  {/* Number inside the circle */}
                  <SvgText
                    x="50%"
                    y="50%"
                    fill={theme === 'dark' ? colors.dark_theme.text_primary : colors.light_theme.text_primary}
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    dy="4"  // adjustment for vertical centering
                  >
                    {dayNumber}
                  </SvgText>
                </Svg>
              </View>
            </View>
              <View style={[styles.dayContainerTodayDot, dayName === selectedDay ? theme === 'dark' ? styles.dayContainerTodayDotDark : styles.dayContainerTodayDotLight : null]} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  containerLight: {
    backgroundColor: colors.light_theme.background,
    borderBottomColor: colors.light_theme.tertiary_background,
    borderBottomWidth: 1,
  },
  containerDark: {
    backgroundColor: colors.dark_theme.background,
    borderBottomColor: colors.dark_theme.tertiary_background,
    borderBottomWidth: 1,
  },
  dayContainer: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    borderColor: 'transparent',
  },
  dayContainerTodayDark: {
    borderColor: colors.dark_theme.text_accent,
    backgroundColor: 'rgba(44, 1, 102, 0.08)',
  },
  dayContainerTodayLight: {
    borderColor: colors.light_theme.text_accent,
    backgroundColor: 'rgba(44, 1, 102, 0.08)',
  },
  weekDayText: {
    fontSize: 14,
    marginBottom: 4,
  },
  weekDayTextLight: {
    color: colors.light_theme.text_primary,
  },
  weekDayTextDark: {
    color: colors.dark_theme.text_primary,
  },
  svgContainer: {
    // Additional styling if needed
  },
  dayContainerTodayDot: {
    width: 6,
    height: 6,
    marginTop: 3,
  },
  dayContainerTodayDotLight: {
    backgroundColor: colors.light_theme.text_accent,
    borderRadius: 6,
  },
  dayContainerTodayDotDark: {
    backgroundColor: colors.dark_theme.text_accent,
    borderRadius: 6,
  },
});

export default WeeklyCalendarHeader;
