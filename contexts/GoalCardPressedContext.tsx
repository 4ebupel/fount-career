import { createContext, useState } from "react";

export const GoalCardPressContext = createContext({
    activeCardId: null as number | null,
    setActiveCardId: (id: number | null) => {}
  });
  
  // Provider component to be used in the parent component
  export const GoalCardPressProvider = ({ children }: { children: React.ReactNode }) => {
    const [activeCardId, setActiveCardId] = useState<number | null>(null);
    return (
      <GoalCardPressContext.Provider value={{ activeCardId, setActiveCardId }}>
        {children}
      </GoalCardPressContext.Provider>
    );
  };