import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Star, ArrowRight, RotateCcw, GitCompare, LogOut } from 'lucide-react';
import { UserProfile, CreditCard as CreditCardType } from '@/pages/Index';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface RecommendationResultsProps {
  recommendations: CreditCardType[];
  userProfile: UserProfile;
  onCompare: (cards: CreditCardType[]) => void;
  onRestart: () => void;
}

export const RecommendationResults = ({ 
  recommendations, 
  userProfile, 
  onCompare, 
  onRestart 
}: RecommendationResultsProps) => {
  const { signOut } = useAuth();
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());

  const toggleCardSelection = (cardId: string) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
    } else {
      newSelected.add(cardId);
    }
    setSelectedCards(newSelected);
  };

  const handleCompare = () => {
    const cardsToCompare = recommendations.filter(card => selectedCards.has(card.id));
    onCompare(cardsToCompare);
  };

  const calculateRewardEstimate = (card: CreditCardType) => {
    const totalSpending = Object.values(userProfile.spendingHabits || {}).reduce((a, b) => a + (b || 0), 0);
    const monthlyReward = totalSpending * 0.02;
    return Math.round(monthlyReward * 12);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/30 to-transparent"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/3 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-gray-600/5 to-transparent rounded-full blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent">
            Your AI-Powered Recommendations
          </h1>
          <Button 
            onClick={signOut} 
            variant="outline" 
            className="flex items-center gap-2 bg-gray-800/50 border-gray-600 text-gray-200 hover:bg-gray-700/70 hover:text-white backdrop-blur-sm transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="flex gap-2">
              <Button 
                onClick={onRestart}
                variant="outline"
                className="flex items-center gap-2 bg-gray-800/50 border-gray-600 text-gray-200 hover:bg-gray-700/70 hover:text-white backdrop-blur-sm transition-all duration-300"
              >
                <RotateCcw className="w-4 h-4" />
                Start Over
              </Button>
              {selectedCards.size > 1 && (
                <Button 
                  onClick={handleCompare}
                  className="flex items-center gap-2 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 hover:from-gray-600 hover:via-gray-700 hover:to-gray-800 text-white border border-gray-600/30 backdrop-blur-sm transition-all duration-300"
                >
                  <GitCompare className="w-4 h-4" />
                  Compare Selected ({selectedCards.size})
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {recommendations.map((card, index) => (
            <Card 
              key={card.id} 
              className={`overflow-hidden bg-gradient-to-br from-gray-800/90 to-gray-900/70 border-gray-600/60 hover:border-gray-500/80 backdrop-blur-sm transition-all duration-300 cursor-pointer hover:transform hover:scale-[1.02] hover:shadow-2xl group ${
                selectedCards.has(card.id) ? 'ring-2 ring-gray-400/60 shadow-2xl border-gray-400/80' : ''
              }`}
              onClick={() => toggleCardSelection(card.id)}
            >
              <CardHeader className="bg-gradient-to-r from-gray-700/40 to-gray-800/60 backdrop-blur-sm border-b border-gray-600/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-10 bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 rounded-lg flex items-center justify-center shadow-lg border border-gray-500/30">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2 text-white group-hover:text-gray-100 transition-colors duration-300">
                        {card.name}
                        {index === 0 && (
                          <Badge className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white border-yellow-500/30 shadow-lg">
                            <Star className="w-3 h-3 mr-1" />
                            AI Top Pick
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">{card.issuer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Annual Fee</p>
                    <p className="font-semibold text-lg text-white group-hover:text-gray-100 transition-colors duration-300">
                      {card.annualFee === 0 ? 'Free' : `₹${card.annualFee.toLocaleString()}`}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-200 group-hover:text-white transition-colors duration-300">AI Analysis - Why This Card:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 group-hover:bg-gray-300 transition-colors duration-300"></div>
                        <span className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                          Perfectly matches your ₹{userProfile.monthlyIncome?.toLocaleString()} monthly income
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 group-hover:bg-gray-300 transition-colors duration-300"></div>
                        <span className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                          Optimized rewards for your spending categories
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 group-hover:bg-gray-300 transition-colors duration-300"></div>
                        <span className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                          Aligns with your selected benefit preferences
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 group-hover:bg-gray-300 transition-colors duration-300"></div>
                        <span className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                          Suitable for your credit profile
                        </span>
                      </li>
                    </ul>

                    <div className="mt-4 p-4 bg-gradient-to-r from-gray-700/50 to-gray-800/60 rounded-lg border border-gray-600/40 backdrop-blur-sm">
                      <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors duration-300">
                        AI Estimated Annual Rewards: ₹{calculateRewardEstimate(card).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 group-hover:text-gray-300 mt-1 transition-colors duration-300">
                        Based on AI analysis of your spending pattern
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-4">
                      <h5 className="font-medium mb-2 text-gray-200 group-hover:text-white transition-colors duration-300">Reward Structure</h5>
                      <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300">{card.rewardRate}</p>
                    </div>

                    <div className="mb-4">
                      <h5 className="font-medium mb-2 text-gray-200 group-hover:text-white transition-colors duration-300">Special Perks</h5>
                      <div className="flex flex-wrap gap-1">
                        {card.specialPerks.slice(0, 4).map((perk, i) => (
                          <Badge 
                            key={i} 
                            variant="secondary" 
                            className="text-xs bg-gray-700/60 text-gray-200 border-gray-600/40 hover:bg-gray-600/70 hover:text-white transition-all duration-300"
                          >
                            {perk}
                          </Badge>
                        ))}
                        {card.specialPerks.length > 4 && (
                          <Badge 
                            variant="outline" 
                            className="text-xs border-gray-600/60 text-gray-300 hover:border-gray-500/80 hover:text-gray-200 transition-all duration-300"
                          >
                            +{card.specialPerks.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 hover:from-gray-600 hover:via-gray-700 hover:to-gray-800 text-white border border-gray-600/30 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(card.applyLink, '_blank');
                      }}
                    >
                      Apply Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-300">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full mr-2"></div>
              Click on cards to select them for comparison
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full mr-2"></div>
              All recommendations are AI-powered and personalized
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};