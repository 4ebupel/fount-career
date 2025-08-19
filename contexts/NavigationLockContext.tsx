import React, { createContext, useState } from "react";

export const NavigationLockContext = createContext<{
    locked: boolean;
    lock: () => void;
    unlock: () => void;
}>({ locked: false, lock: () => { }, unlock: () => { } });

export function NavigationLockProvider({ children }: { children: React.ReactNode }) {
    const [locked, setLocked] = useState(false);

    return (
        <NavigationLockContext.Provider
            value={{ 
                locked, lock: () => setLocked(true), 
                unlock: () => setLocked(false)
            }}
        >
            {children}
        </NavigationLockContext.Provider>
    );
}
