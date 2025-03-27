import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextStyle } from 'react-native';
import { Modal } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '@/lib/colors';
import { DefaultModalProps } from '@/types/defaultModalProps';

// Hours and minutes for the time picker
const HOURS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

// Calculate item height based on font size + padding
const ITEM_HEIGHT = 60;

interface TimePickerModalProps extends DefaultModalProps {
  isVisible: boolean;
  initialHour?: string;
  initialMinute?: string;
  onTimeSelected?: (hour: string, minute: string) => void;
}

const TimePickerModal: React.FC<TimePickerModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  onCancel,
  theme = 'light',
  initialHour = '10',
  initialMinute = '00',
  onTimeSelected,
}) => {
  const [selectedHour, setSelectedHour] = useState(initialHour);
  const [selectedMinute, setSelectedMinute] = useState(initialMinute);
  
  // Reset to initial values when modal opens
  useEffect(() => {
    if (isVisible) {
      setSelectedHour(initialHour);
      setSelectedMinute(initialMinute);
    }
  }, [isVisible, initialHour, initialMinute]);

  const handleCancel = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
  };

  const handleConfirm = () => {
    if (onTimeSelected) onTimeSelected(selectedHour, selectedMinute);
    if (onConfirm) onConfirm();
    if (onClose) onClose();
  };

  // Refs for scrolling to selected items
  const hourScrollViewRef = React.useRef<ScrollView>(null);
  const minuteScrollViewRef = React.useRef<ScrollView>(null);

  // Make hour and minute items visible in the middle of the scroll view
  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        const hourIndex = HOURS.indexOf(selectedHour);
        const minuteIndex = MINUTES.indexOf(selectedMinute);
        
        if (hourIndex !== -1 && hourScrollViewRef.current) {
          hourScrollViewRef.current.scrollTo({ y: hourIndex * ITEM_HEIGHT, animated: true });
        }
        
        if (minuteIndex !== -1 && minuteScrollViewRef.current) {
          minuteScrollViewRef.current.scrollTo({ y: minuteIndex * ITEM_HEIGHT, animated: true });
        }
      }, 100);
    }
  }, [isVisible, selectedHour, selectedMinute]);

  // Helper function to determine text style based on distance from selected item
  const getTimeItemTextStyle = (value: string, selectedValue: string): TextStyle => {
    if (value === selectedValue) {
      return {
        fontSize: 48,
        fontWeight: '700',
      };
    }
    
    const values = (value.length <= 2 && selectedValue.length <= 2) ? 
      (value.length === 2 ? HOURS : MINUTES) : [];
    
    if (values.length === 0) {
      return {
        fontSize: 24,
        fontWeight: '600',
      };
    }
    
    const currentIndex = values.indexOf(value);
    const selectedIndex = values.indexOf(selectedValue);
    
    if (currentIndex === -1 || selectedIndex === -1) {
      return {
        fontSize: 24,
        fontWeight: '600',
      };
    }
    
    const distance = Math.abs(currentIndex - selectedIndex);
    
    if (distance === 1) {
      return {
        fontSize: 40,
        fontWeight: '600',
      };
    } else if (distance === 2) {
      return {
        fontSize: 32,
        fontWeight: '600',
      };
    } else {
      return {
        fontSize: 24,
        fontWeight: '600',
      };
    }
  };

  // Helper function to determine text color based on distance from selected item
  const getTimeItemColor = (value: string, selectedValue: string, theme: 'light' | 'dark'): string => {
    const values = value === selectedValue ? [] : 
      (value.length <= 2 && selectedValue.length <= 2) ? 
        (value.length === 2 ? HOURS : MINUTES) : [];
    
    if (values.length === 0) return theme === 'dark' ? colors.dark_theme.text_primary : colors.light_theme.text_primary;
    
    const currentIndex = values.indexOf(value);
    const selectedIndex = values.indexOf(selectedValue);
    
    if (currentIndex === -1 || selectedIndex === -1) {
      return theme === 'dark' ? colors.dark_theme.text_primary : colors.light_theme.text_primary;
    }
    
    const distance = Math.abs(currentIndex - selectedIndex);
    
    if (distance === 1) {
      return theme === 'dark' ? '#424242' : '#424242'; // Dark gray for items 1 away
    } else if (distance === 2) {
      return theme === 'dark' ? '#616161' : '#616161'; // Medium gray for items 2 away
    } else {
      return theme === 'dark' ? '#757575' : '#757575'; // Light gray for items more than 2 away
    }
  };

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="slide"
      onRequestClose={() => { onClose?.() }}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.container,
            theme === 'dark'
              ? { backgroundColor: colors.dark_theme.secondary_background }
              : { backgroundColor: colors.light_theme.secondary_background }
          ]}
        >
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => { onClose?.() }}
          >
            <AntDesign 
              name="arrowleft" 
              size={24} 
              color={theme === 'dark' ? colors.dark_theme.text_primary : colors.light_theme.text_primary} 
            />
          </TouchableOpacity>
          
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
          
          <Text
            style={[
              styles.title,
              theme === 'dark'
                ? { color: colors.dark_theme.text_primary }
                : { color: colors.light_theme.text_primary }
            ]}
          >
            Reminder
          </Text>
          
          <View style={[styles.divider, { backgroundColor: '#EEEEEE' }]} />
          
          <View style={styles.timePickerContainer}>
            {/* Hour picker */}
            <View style={styles.timePickerColumn}>
              <ScrollView
                ref={hourScrollViewRef}
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
              >
                <View style={styles.scrollPadding} />
                {HOURS.map((hour) => (
                  <TouchableOpacity
                    key={`hour-${hour}`}
                    style={[
                      styles.timeItem,
                      selectedHour === hour && (
                        theme === 'dark'
                          ? { backgroundColor: colors.dark_theme.tertiary_background }
                          : { backgroundColor: colors.light_theme.tertiary_background }
                      )
                    ]}
                    onPress={() => setSelectedHour(hour)}
                  >
                    <Text
                      style={[
                        getTimeItemTextStyle(hour, selectedHour),
                        selectedHour === hour
                          ? theme === 'dark'
                            ? { color: colors.dark_theme.text_accent }
                            : { color: colors.light_theme.text_accent }
                          : theme === 'dark'
                            ? { color: getTimeItemColor(hour, selectedHour, 'dark') }
                            : { color: getTimeItemColor(hour, selectedHour, 'light') }
                      ]}
                    >
                      {hour}
                    </Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.scrollPadding} />
              </ScrollView>
            </View>
            
            {/* Colon separator */}
            <Text
              style={[
                styles.colonSeparator,
                theme === 'dark'
                  ? { color: colors.dark_theme.text_accent }
                  : { color: colors.light_theme.text_accent }
              ]}
            >
              :
            </Text>
            
            {/* Minute picker */}
            <View style={styles.timePickerColumn}>
              <ScrollView
                ref={minuteScrollViewRef}
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
              >
                <View style={styles.scrollPadding} />
                {MINUTES.map((minute) => (
                  <TouchableOpacity
                    key={`minute-${minute}`}
                    style={[
                      styles.timeItem,
                      selectedMinute === minute && (
                        theme === 'dark'
                          ? { backgroundColor: colors.dark_theme.tertiary_background }
                          : { backgroundColor: colors.light_theme.tertiary_background }
                      )
                    ]}
                    onPress={() => setSelectedMinute(minute)}
                  >
                    <Text
                      style={[
                        getTimeItemTextStyle(minute, selectedMinute),
                        selectedMinute === minute
                          ? theme === 'dark'
                            ? { color: colors.dark_theme.text_accent }
                            : { color: colors.light_theme.text_accent }
                          : theme === 'dark'
                            ? { color: getTimeItemColor(minute, selectedMinute, 'dark') }
                            : { color: getTimeItemColor(minute, selectedMinute, 'light') }
                      ]}
                    >
                      {minute}
                    </Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.scrollPadding} />
              </ScrollView>
            </View>
          </View>
          
          <View style={[styles.divider, { backgroundColor: '#EEEEEE' }]} />
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                theme === 'dark'
                  ? { backgroundColor: colors.dark_theme.button_secondary_bg }
                  : { backgroundColor: colors.light_theme.button_secondary_bg }
              ]}
              onPress={handleCancel}
            >
              <Text
                style={[
                  styles.buttonText,
                  theme === 'dark'
                    ? { color: colors.dark_theme.button_secondary_text }
                    : { color: colors.light_theme.button_secondary_text }
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                theme === 'dark'
                  ? { backgroundColor: colors.dark_theme.button_primary_bg }
                  : { backgroundColor: colors.light_theme.button_primary_bg }
              ]}
              onPress={handleConfirm}
            >
              <Text
                style={[
                  styles.buttonText,
                  theme === 'dark'
                    ? { color: colors.dark_theme.button_primary_text }
                    : { color: colors.light_theme.button_primary_text }
                ]}
              >
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 36,
  },
  handleContainer: {
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 8,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 100,
    backgroundColor: '#EEEEEE',
  },
  closeButton: {
    position: 'absolute',
    top: 36,
    left: 24,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 10,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 240,
    marginVertical: 20,
  },
  timePickerColumn: {
    flex: 1,
    height: '100%',
  },
  colonSeparator: {
    fontSize: 48,
    fontWeight: '700',
    marginHorizontal: 10,
  },
  scrollView: {
    height: '100%',
  },
  scrollPadding: {
    height: 90, // Adds padding to the top and bottom of the scroll view
  },
  timeItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginVertical: 2,
    borderRadius: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 16,
  },
  button: {
    flex: 1,
    borderRadius: 1000,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFF4EF',
  },
  confirmButton: {
    backgroundColor: '#2C0166',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default TimePickerModal; 