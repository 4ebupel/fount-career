import { DatabaseContext } from "@/contexts/DatabaseContext";
import { useContext } from "react";

// Custom hook to use the database context
export const useDatabase = () => {
    const context = useContext(DatabaseContext);
  
    if (context === undefined) {
      throw new Error('useDatabase must be used within a DatabaseProvider');
    }
  
    return context;
  };