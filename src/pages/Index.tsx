
import { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { RecommendationResults } from '@/components/RecommendationResults';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { ComparisonView } from '@/components/ComparisonView';

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
  const [currentView, setCurrentView] = useState<'welcome' | 'chat' | 'results' | 'comparison'>('welcome');
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [recommendations, setRecommendations] = useState<CreditCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<CreditCard[]>([]);

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
        <ChatInterface 
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
