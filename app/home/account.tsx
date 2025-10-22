import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { ThemeContext } from "@/contexts/ThemeContext";
import { colors } from "@/lib/colors";
import { useDatabase } from "@/hooks/useDatabase";
import { resetDatabase, getWeeksDayData } from "@/lib/database";

export default function Account() {
    const { theme } = useContext(ThemeContext);
    const { isLoading } = useDatabase();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                let cinematicInnards = await getWeeksDayData(new Date().toISOString());
                console.log(JSON.stringify(cinematicInnards.weeksDayData, null, 4))
                setData(cinematicInnards.weeksDayData);
            } catch (error) {
                console.error("Error with the new func:", "\n", error);
                setLoading(false)
            }
            setLoading(false);
        }

        loadData();
    }, []);

    const handleResetDatabase = () => {
        Alert.alert(
            "Reset Database",
            "Are you sure you want to reset the database? All your data will be lost and seed data will be reloaded.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: () => resetDatabase()
                }
            ]
        );
    };

    return (
        <View style={[styles.container, theme === 'dark' ? styles.containerDark : styles.containerLight]}>
            <Text style={[styles.title, theme === 'dark' ? styles.titleDark : styles.titleLight]}>Account</Text>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, theme === 'dark' ? styles.textDark : styles.textLight]}>Developer Settings</Text>

                <TouchableOpacity
                    style={[styles.button, styles.resetButton]}
                    onPress={handleResetDatabase}
                    disabled={isLoading}
                >
                    <Text style={styles.resetButtonText}>Reset Database</Text>
                </TouchableOpacity>

                {isLoading && (
                    <Text style={[styles.loadingText, theme === 'dark' ? styles.textDark : styles.textLight]}>
                        Loading...
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    containerLight: {
        backgroundColor: colors.light_theme.background,
    },
    containerDark: {
        backgroundColor: colors.dark_theme.background,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    titleLight: {
        color: colors.light_theme.text_primary,
    },
    titleDark: {
        color: colors.dark_theme.text_primary,
    },
    section: {
        marginBottom: 30,
        padding: 16,
        borderRadius: 8,
        backgroundColor: colors.light_theme.secondary_background,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    textLight: {
        color: colors.light_theme.text_primary,
    },
    textDark: {
        color: colors.dark_theme.text_primary,
    },
    button: {
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
        marginBottom: 10,
    },
    resetButton: {
        backgroundColor: '#ff3b30',
    },
    resetButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 8,
    }
});
