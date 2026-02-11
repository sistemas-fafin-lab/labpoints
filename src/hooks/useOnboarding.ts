import { useState, useEffect, useCallback } from 'react';

interface OnboardingState {
  tutorialCompleted: boolean;
  photoPromptShown: boolean;
}

const ONBOARDING_STORAGE_KEY = 'labpoints_onboarding';

function getStoredOnboarding(userId: string): OnboardingState {
  try {
    const stored = localStorage.getItem(`${ONBOARDING_STORAGE_KEY}_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading onboarding state:', e);
  }
  return {
    tutorialCompleted: false,
    photoPromptShown: false,
  };
}

function setStoredOnboarding(userId: string, state: OnboardingState) {
  try {
    localStorage.setItem(`${ONBOARDING_STORAGE_KEY}_${userId}`, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving onboarding state:', e);
  }
}

export function useOnboarding(userId: string | undefined, hasPhoto: boolean) {
  const [state, setState] = useState<OnboardingState>({
    tutorialCompleted: true, // Default to true until we load
    photoPromptShown: true,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Current step in the onboarding flow
  const [currentStep, setCurrentStep] = useState<'tutorial' | 'photo-prompt' | 'complete'>('complete');

  // Load state from localStorage
  useEffect(() => {
    if (userId) {
      const stored = getStoredOnboarding(userId);
      setState(stored);
      setIsLoaded(true);
    }
  }, [userId]);

  // Determine current step based on state
  useEffect(() => {
    if (!isLoaded || !userId) return;

    if (!state.tutorialCompleted) {
      setCurrentStep('tutorial');
    } else if (!state.photoPromptShown && !hasPhoto) {
      setCurrentStep('photo-prompt');
    } else {
      setCurrentStep('complete');
    }
  }, [state, isLoaded, userId, hasPhoto]);

  // Complete tutorial
  const completeTutorial = useCallback(() => {
    if (!userId) return;
    
    const newState = { ...state, tutorialCompleted: true };
    setState(newState);
    setStoredOnboarding(userId, newState);
  }, [userId, state]);

  // Skip tutorial
  const skipTutorial = useCallback(() => {
    completeTutorial();
  }, [completeTutorial]);

  // Mark photo prompt as shown
  const markPhotoPromptShown = useCallback(() => {
    if (!userId) return;
    
    const newState = { ...state, photoPromptShown: true };
    setState(newState);
    setStoredOnboarding(userId, newState);
  }, [userId, state]);

  // Reset onboarding (for settings - allow user to re-trigger tutorial)
  const resetTutorial = useCallback(() => {
    if (!userId) return;
    
    const newState = { ...state, tutorialCompleted: false };
    setState(newState);
    setStoredOnboarding(userId, newState);
  }, [userId, state]);

  // Check if this is first access
  const isFirstAccess = isLoaded && !state.tutorialCompleted;

  return {
    currentStep,
    isFirstAccess,
    tutorialCompleted: state.tutorialCompleted,
    photoPromptShown: state.photoPromptShown,
    completeTutorial,
    skipTutorial,
    markPhotoPromptShown,
    resetTutorial,
    isLoaded,
  };
}
