import { Tabs } from "expo-router";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { colors } from "@/lib/colors";
import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "@/contexts/ThemeContext";
import { TouchableOpacity, Image, View, Text, ActivityIndicator } from "react-native";
import React from "react";
import { useDatabase } from "@/contexts/DatabaseContext";

export default function TabsLayout() {
    const { theme } = useContext(ThemeContext);
    const [menuVisible, setMenuVisible] = useState(false);
    const { initializeDatabase, isInitialized, isLoading } = useDatabase();

    // Initialize database on component mount if not already initialized
    useEffect(() => {
        if (!isInitialized) {
            console.log('Initializing database from home layout...');
            initializeDatabase().catch(error => {
                console.error('Failed to initialize database:', error);
            });
        }
    }, [isInitialized]);

    // If database is still loading, show a loading spinner
    if (isLoading) {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme === "dark"
                    ? colors.dark_theme.background
                    : colors.light_theme.background,
            }}>
                <ActivityIndicator 
                    size="large" 
                    color={theme === "dark"
                        ? colors.dark_theme.button_primary_bg
                        : colors.light_theme.button_primary_bg
                    } 
                />
                <Text style={{
                    marginTop: 16,
                    color: theme === "dark"
                        ? colors.dark_theme.text_primary
                        : colors.light_theme.text_primary,
                }}>
                    Loading data...
                </Text>
            </View>
        );
    }

    // Define header options with custom components
    const headerOptions = {
        tabBarActiveTintColor: theme === "dark"
            ? colors.dark_theme.text_accent
            : colors.light_theme.text_accent,
        headerStyle: {
            backgroundColor: theme === "dark"
                ? colors.dark_theme.background
                : colors.light_theme.background,
        },
        // headerShown: false, // Hide the header
        headerShadowVisible: false,
        headerTintColor: theme === "dark"
            ? colors.dark_theme.text_primary
            : colors.light_theme.text_primary,
        tabBarStyle: {
            backgroundColor: theme === "dark"
                ? colors.dark_theme.tertiary_background
                : colors.light_theme.background,
            borderTopWidth: 1,
            borderTopColor: theme === "dark"
                ? colors.dark_theme.tertiary_background
                : colors.light_theme.secondary_background,
        },
        // Custom logo on the left side of the header
        headerLeft: () => (
            <Image 
                source={require('@/assets/logo.png')} 
                style={{ width: 28, height: 28, marginLeft: 24 }}
                resizeMode="contain"
            />
        ),
        // Custom burger menu icon on the right side
        headerRight: () => (
            <TouchableOpacity
                onPress={() => setMenuVisible(!menuVisible)}
                style={{ marginRight: 24 }}
            >
                <Entypo 
                    name="dots-three-vertical" 
                    size={24} 
                    color={
                        theme === "dark"
                            ? colors.dark_theme.text_primary
                            : colors.light_theme.text_primary
                    } 
                />
            </TouchableOpacity>
        )
    };

    return (
        <>
            <Tabs screenOptions={headerOptions}>
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "My Goals",
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? 'grid' : 'grid-outline'} color={color} size={24} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="get-done"
                    options={{
                        title: "Get Done",
                        tabBarIcon: ({ color, focused }) => (
                            <Entypo name={focused ? 'list' : 'list'} color={color} size={24} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="explore"
                    options={{
                        title: "Explore",
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? 'compass' : 'compass-outline'} color={color} size={24} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="account"
                    options={{
                        title: "Account",
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? 'person' : 'person-outline'} color={color} size={24} />
                        ),
                    }}
                />
            </Tabs>
            {menuVisible && (
                // Replace this view with your actual dropdown component or menu
                <View
                    style={{
                        position: 'absolute',
                        top: 90,
                        right: 10,
                        backgroundColor: theme === "dark"
                            ? colors.dark_theme.background
                            : colors.light_theme.background,
                        padding: 10,
                        borderRadius: 5,
                        shadowColor: '#000',
                        shadowOpacity: 0.3,
                        shadowRadius: 5,
                    }}
                >
                    <Text
                        style={{
                            color: theme === "dark"
                                ? colors.dark_theme.text_primary
                                : colors.light_theme.text_primary,
                        }}
                    >
                        Dropdown Menu Item 1
                    </Text>
                    <Text
                        style={{
                            color: theme === "dark"
                                ? colors.dark_theme.text_primary
                                : colors.light_theme.text_primary,
                            marginTop: 5,
                        }}
                    >
                        Dropdown Menu Item 2
                    </Text>
                </View>
            )}
        </>
    );
}
