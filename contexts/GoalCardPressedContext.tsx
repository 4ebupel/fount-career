import React, { createContext, useState } from "react";

export const GoalCardPressContext = createContext({
    activeCardId: null as string | null,
    setActiveCardId: (id: string | null) => {}
  });
  
  // Provider component to be used in the parent component
  export const GoalCardPressProvider = ({ children }: { children: React.ReactNode }) => {
    const [activeCardId, setActiveCardId] = useState<string | null>(null);
    return (
      <GoalCardPressContext.Provider value={{ activeCardId, setActiveCardId }}>
        {children}
      </GoalCardPressContext.Provider>
    );
  };