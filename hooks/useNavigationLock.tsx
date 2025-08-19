import { useContext } from "react";
import { NavigationLockContext } from "@/contexts/NavigationLockContext";

export function useNavigationLock() {
    const context = useContext(NavigationLockContext);
    if (!context) {
        throw new Error("useNavigationLock must be used within a NavigationLockProvider");
    }
    return context;
}