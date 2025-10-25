import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface CategoryContextType {
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  clearCategory: () => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const clearCategory = () => {
    setSelectedCategory(null);
  };

  return (
    <CategoryContext.Provider value={{
      selectedCategory,
      setSelectedCategory,
      clearCategory
    }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};