import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(res => res.data),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  return (
    <CategoryContext.Provider value={{ categories, isLoading, error }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

export default CategoryContext; 