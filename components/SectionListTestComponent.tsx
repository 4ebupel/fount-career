import { View, Text, TouchableOpacity, StyleSheet, SectionList } from "react-native";
import React, { useEffect } from "react";
import { colors } from "@/lib/colors";
import ItemCard from "./ItemCard";
import { HabitWithReminderOccurrence, Task } from "@/types/database";

interface props {
    theme: 'dark' | 'light';
    scrollEnabled: boolean;
    sectionListInnards: { title: string, data: (HabitWithReminderOccurrence | Task)[] }[];
    filterType: 'all' | 'habits' | 'tasks';
    filterStatus: 'all' | 'completed' | 'pending';
    setFilterType: (filterType: 'all' | 'habits' | 'tasks') => void;
    setFilterStatus: (filterStatus: 'all' | 'completed' | 'pending') => void;
    setScrollEnabled: (scrollEnabled: boolean) => void;
}

export default function SectionListTestComponent({ theme, scrollEnabled, sectionListInnards, filterType, filterStatus, setFilterType, setFilterStatus, setScrollEnabled }: props) {
    useEffect(() => {
        console.log("SectionListTestComponent mounted");
    }, []);
    
    return (
        <SectionList
            scrollEnabled={scrollEnabled}
            sections={sectionListInnards}
            ListHeaderComponent={
                <View style={styles.filterContainer}>
                    <View style={styles.filterRow}>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                filterType === 'all' && styles.filterButtonActive
                            ]}
                            onPress={() => setFilterType('all')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                filterType === 'all' ? styles.filterButtonTextActive : styles.filterButtonTextInactive
                            ]}>All</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                filterType === 'habits' && styles.filterButtonActive
                            ]}
                            onPress={() => setFilterType('habits')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                filterType === 'habits' ? styles.filterButtonTextActive : styles.filterButtonTextInactive
                            ]}>Habits</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                filterType === 'tasks' && styles.filterButtonActive
                            ]}
                            onPress={() => setFilterType('tasks')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                filterType === 'tasks' ? styles.filterButtonTextActive : styles.filterButtonTextInactive
                            ]}>Tasks</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.filterRow}>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                filterStatus === 'all' && styles.filterButtonActive
                            ]}
                            onPress={() => setFilterStatus('all')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                filterStatus === 'all' ? styles.filterButtonTextActive : styles.filterButtonTextInactive
                            ]}>All</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                filterStatus === 'completed' && styles.filterButtonActive
                            ]}
                            onPress={() => setFilterStatus('completed')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                filterStatus === 'completed' ? styles.filterButtonTextActive : styles.filterButtonTextInactive
                            ]}>Completed</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                filterStatus === 'pending' && styles.filterButtonActive
                            ]}
                            onPress={() => setFilterStatus('pending')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                filterStatus === 'pending' ? styles.filterButtonTextActive : styles.filterButtonTextInactive
                            ]}>Pending</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            }
            renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                    <Text style={[
                        styles.sectionTitle,
                        theme === 'dark' ? styles.sectionTitleDark : styles.sectionTitleLight
                    ]}>
                        {title}
                    </Text>
                    <View style={styles.divider} />
                </View>
            )}
            renderItem={({ item }) => (
                <ItemCard
                    key={`item-${item.id}`}
                    item={item}
                    theme={theme}
                    displayCheckbox={true}
                    displayBorders={false}
                    scrollEnabler={setScrollEnabled}
                />
            )}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerLight: {
        backgroundColor: colors.light_theme.secondary_background,
    },
    containerDark: {
        backgroundColor: colors.dark_theme.background,
    },
    backgroundImageContainer: {
        flex: 1,
        gap: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImage: {
        width: 160,
        height: 160,
    },
    backgroundTitle: {
        fontSize: 24,
        fontWeight: '600',
    },
    backgroundTitleLight: {
        color: colors.light_theme.text_primary,
    },
    backgroundTitleDark: {
        color: colors.dark_theme.text_primary,
    },
    backgroundDescription: {
        fontSize: 18,
        fontWeight: '400',
    },
    backgroundDescriptionLight: {
        color: colors.light_theme.text_primary,
    },
    backgroundDescriptionDark: {
        color: colors.dark_theme.text_primary,
    },
    backgroundTitleContainer: {
        gap: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    todayProgressContainer: {
        marginBottom: 24,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressText: {
        fontSize: 14,
        lineHeight: 22,
    },
    progressCounter: {
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'right',
    },
    progressBarContainer: {
        height: 8,
        borderRadius: 100,
        backgroundColor: '#E0E0E0',
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#2C0166',
        borderRadius: 100,
    },
    filterContainer: {
        marginBottom: 20,
    },
    filterRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    filterButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: colors.light_theme.button_primary_bg,
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    filterButtonTextActive: {
        color: '#FFFFFF',
    },
    filterButtonTextInactive: {
        color: '#616161',
    },
    goalSection: {
        marginBottom: 24,
    },
    sectionHeader: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 22,
        letterSpacing: 0.2,
        marginBottom: 8,
    },
    sectionTitleLight: {
        color: '#9E9E9E',
    },
    sectionTitleDark: {
        color: '#9E9E9E',
    },
    divider: {
        height: 1,
        backgroundColor: '#EEEEEE',
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 6,
        padding: 12,
        paddingLeft: 20,
        marginBottom: 16,
        overflow: 'hidden',
    },
    itemCardLight: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    itemCardDark: {
        backgroundColor: colors.dark_theme.tertiary_background,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    checkboxUncompleted: {
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
    },
    checkboxCompleted: {
        backgroundColor: '#12D18E',
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
    },
    itemTitleCompleted: {
        color: '#9E9E9E',
        textDecorationLine: 'line-through',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 12,
        color: '#616161',
        marginLeft: 6,
    },
    colorStripe: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
    },
    textLight: {
        color: colors.light_theme.text_primary,
    },
    textDark: {
        color: colors.dark_theme.text_primary,
    },
    textSecondaryLight: {
        color: colors.light_theme.text_secondary,
    },
    textSecondaryDark: {
        color: colors.dark_theme.text_secondary,
    },
    button: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        padding: 14,
        borderRadius: 100,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonLight: {
        backgroundColor: colors.light_theme.button_primary_bg,
    },
    buttonDark: {
        backgroundColor: colors.dark_theme.button_primary_bg,
    },
});
