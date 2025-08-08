/**
 * Redux Hooks
 * Simple hooks for Redux without TypeScript complexity
 */

import { useDispatch, useSelector } from 'react-redux';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Export the basic hooks as well for convenience
export { useDispatch, useSelector };
