import { View, Text, TouchableOpacity, StyleSheet, SectionList } from "react-native";
import React, { useEffect } from "react";
import { colors } from "@/lib/colors";
import ItemCard from "./ItemCard";
import { HabitWithReminderOccurrence, Task } from "@/types/database";
import SkeletonLoader from "./SkeletonLoader";

interface props {
    theme?: 'dark' | 'light';
    loading?: boolean,
    scrollEnabled?: boolean;
    sectionListInnards?: { title: string, data: (HabitWithReminderOccurrence | Task)[] }[];
    setScrollEnabled?: (scrollEnabled: boolean) => void;
};

const loadingInnards = [
    {
        title: "",
        data: ["", ""] as unknown as Task[]
    },
    {
        title: "",
        data: ["", ""] as unknown as Task[]
    },
    {
        title: "",
        data: ["", ""] as unknown as Task[]
    },
];

export default function SectionListTestComponent({
    theme = 'dark',
    loading = true,
    scrollEnabled = true,
    sectionListInnards = [{
        title: "",
        data: ["", ""] as unknown as Task[]
    }],
    setScrollEnabled
}: props) {
    useEffect(() => {
        console.log("SectionListTestComponent mounted");
    }, []);

    return (
        <SectionList
            style={{width: '100%', padding: 8}}
            scrollEnabled={scrollEnabled}
            sections={loading ? loadingInnards : sectionListInnards}
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
                (loading ? (
                    <View style={{ paddingBottom: 12 }}>
                        <SkeletonLoader height={80} width={"100%"} theme={theme} />
                    </View>
                ) : (
                    <ItemCard
                        key={`item-${item.id}`}
                        item={item}
                        theme={theme}
                        displayCheckbox={true}
                        displayBorders={false}
                        scrollEnabler={setScrollEnabled}
                    />
                ))
            )}
        />
    );
};

const styles = StyleSheet.create({
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
});
