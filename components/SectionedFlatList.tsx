import { View, Text, TouchableOpacity, StyleSheet, SectionList } from "react-native";
import { FlatList } from "react-native-gesture-handler";
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
/**
 * @description Uses FlatList from rngh to imitate SectionList
 * 
 * @param theme dark | light 
 * @param loading boolean 
 * @param scrollEnabled boolean
 * @param sectionListInnards a weirdly compiled array of objects like - { title, data - (HabitWithReminderOccurance | Task)[] }
 * @returns React.JSX.Element
 */
export default function SectionedFlatList({
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
        <FlatList
            style={{ width: '100%', padding: 8, marginBottom: 24 }}
            scrollEnabled={scrollEnabled}
            data={loading ? loadingInnards : sectionListInnards}
            renderItem={({ item }) => (
                (loading ? (
                    <View style={{ paddingBottom: 12 }}>
                        <SkeletonLoader height={80} width={"100%"} theme={theme} />
                    </View>
                ) : (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={[
                                styles.sectionTitle,
                                theme === 'dark' ? styles.sectionTitleDark : styles.sectionTitleLight
                            ]}>
                                {item.title}
                            </Text>
                            <View style={styles.divider} />
                        </View>
                        {item.data.map((item) => (
                            <ItemCard
                                key={`item-${item.id}`}
                                item={item}
                                theme={theme}
                                displayCheckbox={true}
                                displayBorders={false}
                                scrollEnabler={setScrollEnabled}
                            />
                        ))}
                    </>
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
