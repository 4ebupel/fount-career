import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

export const useAppLifecycleEffect = (
    onStart: () => void,
    onResume: () => void
) => {
    const AppStateRef = useRef<AppStateStatus>(AppState.currentState);

    useEffect(() => {
        onStart();

        const subscription = AppState.addEventListener(
            'change',
            (nextAppState: AppStateStatus) => {
                if (AppStateRef.current.match(/inactive|background/)
                    && nextAppState === 'active'
                ) {
                    onResume();
                }

                AppStateRef.current = nextAppState;
            }
        );

        return () => {
            subscription.remove();
        }
    }, []);
}