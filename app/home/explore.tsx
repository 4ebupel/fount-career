import React from "react";
import { View, Text } from "react-native";
import DefaultModal from "@/modals/DefaultModal";
export default function Explore() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <DefaultModal
                isVisible={true}
                onClose={() => {}}
                onConfirm={() => {}}
                onCancel={() => {}}
                theme="light"
                primaryCTA="Confirm"
                secondaryCTA="Cancel"
            />
        </View>
    )
}
