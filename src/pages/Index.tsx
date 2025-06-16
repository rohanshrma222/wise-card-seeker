
import { useState, useEffect } from 'react';
import { AIChat } from '@/components/ai/AIChat';
import { RecommendationResults } from '@/components/RecommendationResults';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { ComparisonView } from '@/components/ComparisonView';
import { AuthPage } from '@/components/auth/AuthPage';
import { useAuth } from '@/hooks/useAuth';

export type UserProfile = {
  monthlyIncome?: number;
  spendingHabits?: {
    fuel?: number;
    travel?: number;
    groceries?: number;
    dining?: number;
    shopping?: number;
  };
  preferredBenefits?: string[];
  existingCards?: string[];
  creditScore?: string;
};

export type CreditCard = {
  id: string;
  name: string;
  issuer: string;
  image: string;
  joiningFee: number;
  annualFee: number;
  rewardType: string;
  rewardRate: string;
  eligibility: string[];
  specialPerks: string[];
  applyLink: string;
  category: string;
  minIncome: number;
};

const Index = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'welcome' | 'chat' | 'results' | 'comparison'>('welcome');
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [recommendations, setRecommendations] = useState<CreditCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<CreditCard[]>([]);

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if user is not logged in
  if (!user) {
    return <AuthPage />;
  }

  const handleStartJourney = () => {
    setCurrentView('chat');
  };

  const handleChatComplete = (profile: UserProfile, recommendedCards: CreditCard[]) => {
    setUserProfile(profile);
    setRecommendations(recommendedCards);
    setCurrentView('results');
  };

  const handleCompareCards = (cards: CreditCard[]) => {
    setSelectedCards(cards);
    setCurrentView('comparison');
  };

  const handleRestart = () => {
    setUserProfile({});
    setRecommendations([]);
    setSelectedCards([]);
    setCurrentView('welcome');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {currentView === 'welcome' && (
        <WelcomeScreen onStart={handleStartJourney} />
      )}
      
      {currentView === 'chat' && (
        <AIChat 
          onComplete={handleChatComplete}
          userProfile={userProfile}
        />
      )}
      
      {currentView === 'results' && (
        <RecommendationResults 
          recommendations={recommendations}
          userProfile={userProfile}
          onCompare={handleCompareCards}
          onRestart={handleRestart}
        />
      )}
      
      {currentView === 'comparison' && (
        <ComparisonView 
          cards={selectedCards}
          onBack={() => setCurrentView('results')}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};

export default Index;
