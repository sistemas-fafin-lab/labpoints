import { createContext, useContext, useCallback, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingTutorial } from './OnboardingTutorial';
import { ProfilePhotoPrompt } from './ProfilePhotoPrompt';

interface OnboardingContextType {
  resetTutorial: () => void;
  isFirstAccess: boolean;
  tutorialCompleted: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function useOnboardingContext() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboardingContext must be used within an OnboardingProvider');
  }
  return context;
}

interface OnboardingProviderProps {
  children: ReactNode;
}

const AUTH_ROUTES = ['/login', '/cadastro', '/esqueci-senha', '/redefinir-senha'];

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const { user } = useAuth();
  const location = useLocation();
  const isAuthRoute = AUTH_ROUTES.includes(location.pathname);
  
  const hasPhoto = Boolean(user?.avatar_url);
  
  const {
    currentStep,
    isFirstAccess,
    tutorialCompleted,
    completeTutorial,
    skipTutorial,
    markPhotoPromptShown,
    resetTutorial,
    isLoaded,
  } = useOnboarding(user?.id, hasPhoto);

  // Handle tutorial completion
  const handleTutorialComplete = useCallback(() => {
    completeTutorial();
  }, [completeTutorial]);

  // Handle tutorial skip
  const handleTutorialSkip = useCallback(() => {
    skipTutorial();
  }, [skipTutorial]);

  // Handle photo prompt close
  const handlePhotoPromptClose = useCallback(() => {
    markPhotoPromptShown();
  }, [markPhotoPromptShown]);

  // Handle add photo action
  const handleAddPhoto = useCallback(() => {
    markPhotoPromptShown();
  }, [markPhotoPromptShown]);

  // Don't render onboarding until loaded, user exists and we're not on an auth route
  const showTutorial = Boolean(isLoaded && user && !isAuthRoute && currentStep === 'tutorial');
  const showPhotoPrompt = Boolean(isLoaded && user && !isAuthRoute && currentStep === 'photo-prompt');

  return (
    <OnboardingContext.Provider value={{ resetTutorial, isFirstAccess, tutorialCompleted }}>
      {children}
      
      {/* Tutorial Modal */}
      <OnboardingTutorial
        isOpen={showTutorial}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
      />

      {/* Photo Prompt Modal */}
      <ProfilePhotoPrompt
        isOpen={showPhotoPrompt}
        onClose={handlePhotoPromptClose}
        onAddPhoto={handleAddPhoto}
      />
    </OnboardingContext.Provider>
  );
}
