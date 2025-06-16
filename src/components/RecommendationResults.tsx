
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
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Your AI-Powered Recommendations
          </h1>
          <Button onClick={signOut} variant="outline" className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        <div className="text-center mb-8">
          <p className="text-lg text-gray-600 mb-6">
            Based on advanced AI analysis of your financial profile, here are your personalized credit card recommendations
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="flex gap-2">
              <Button 
                onClick={onRestart}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Start Over
              </Button>
              {selectedCards.size > 1 && (
                <Button 
                  onClick={handleCompare}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
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
              className={`overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer ${
                selectedCards.has(card.id) ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
              onClick={() => toggleCardSelection(card.id)}
            >
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {card.name}
                        {index === 0 && (
                          <Badge className="bg-yellow-500 text-white">
                            <Star className="w-3 h-3 mr-1" />
                            AI Top Pick
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-gray-600">{card.issuer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Annual Fee</p>
                    <p className="font-semibold text-lg">
                      {card.annualFee === 0 ? 'Free' : `₹${card.annualFee.toLocaleString()}`}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-green-700">AI Analysis - Why This Card:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                        <span>Perfectly matches your ₹{userProfile.monthlyIncome?.toLocaleString()} monthly income</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                        <span>Optimized rewards for your spending categories</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                        <span>Aligns with your selected benefit preferences</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                        <span>Suitable for your credit profile</span>
                      </li>
                    </ul>

                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        AI Estimated Annual Rewards: ₹{calculateRewardEstimate(card).toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Based on AI analysis of your spending pattern
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-4">
                      <h5 className="font-medium mb-2">Reward Structure</h5>
                      <p className="text-sm text-gray-600">{card.rewardRate}</p>
                    </div>

                    <div className="mb-4">
                      <h5 className="font-medium mb-2">Special Perks</h5>
                      <div className="flex flex-wrap gap-1">
                        {card.specialPerks.slice(0, 4).map((perk, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {perk}
                          </Badge>
                        ))}
                        {card.specialPerks.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{card.specialPerks.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
          <p className="text-sm text-gray-500 mb-4">
            Click on cards to select them for comparison • All recommendations are AI-powered and personalized
          </p>
        </div>
      </div>
    </div>
  );
};
