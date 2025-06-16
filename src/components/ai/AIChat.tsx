
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, User, Bot } from 'lucide-react';
import { UserProfile, CreditCard } from '@/pages/Index';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  options?: string[];
}

interface AIChatProps {
  onComplete: (profile: UserProfile, recommendations: CreditCard[]) => void;
  userProfile: UserProfile;
}

export const AIChat = ({ onComplete, userProfile }: AIChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your AI credit card advisor. I'll help you find the perfect credit cards based on your financial profile. Let's start with your monthly income. What's your approximate monthly income in rupees?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [currentStep, setCurrentStep] = useState('income');
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    // Load credit cards from database
    const loadCreditCards = async () => {
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('is_active', true);
      
      if (data) {
        setCreditCards(data.map(card => ({
          id: card.id,
          name: card.name,
          issuer: card.issuer,
          image: card.image || '/placeholder.svg',
          joiningFee: card.joining_fee || 0,
          annualFee: card.annual_fee || 0,
          rewardType: card.reward_type || '',
          rewardRate: card.reward_rate || '',
          eligibility: card.eligibility || [],
          specialPerks: card.special_perks || [],
          applyLink: card.apply_link || '',
          category: card.category || '',
          minIncome: card.min_income || 0,
        })));
      }
    };

    loadCreditCards();
  }, []);

  const addMessage = (type: 'bot' | 'user', content: string, options?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      options
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    addMessage('user', inputValue);
    processUserInput(inputValue);
    setInputValue('');
  };

  const processUserInput = (input: string) => {
    const numericValue = parseFloat(input.replace(/[^\d.]/g, ''));

    switch (currentStep) {
      case 'income':
        setProfile(prev => ({ ...prev, monthlyIncome: numericValue }));
        setTimeout(() => {
          addMessage('bot', "Great! Now let's understand your spending habits. How much do you typically spend on fuel per month?");
          setCurrentStep('fuel');
        }, 1000);
        break;

      case 'fuel':
        setProfile(prev => ({ 
          ...prev, 
          spendingHabits: { ...prev.spendingHabits, fuel: numericValue }
        }));
        setTimeout(() => {
          addMessage('bot', "How much do you spend on travel (flights, hotels) per month on average?");
          setCurrentStep('travel');
        }, 1000);
        break;

      case 'travel':
        setProfile(prev => ({ 
          ...prev, 
          spendingHabits: { ...prev.spendingHabits, travel: numericValue }
        }));
        setTimeout(() => {
          addMessage('bot', "What about groceries and daily essentials? Monthly spending amount?");
          setCurrentStep('groceries');
        }, 1000);
        break;

      case 'groceries':
        setProfile(prev => ({ 
          ...prev, 
          spendingHabits: { ...prev.spendingHabits, groceries: numericValue }
        }));
        setTimeout(() => {
          addMessage('bot', "How much do you spend on dining out and food delivery per month?");
          setCurrentStep('dining');
        }, 1000);
        break;

      case 'dining':
        setProfile(prev => ({ 
          ...prev, 
          spendingHabits: { ...prev.spendingHabits, dining: numericValue }
        }));
        setTimeout(() => {
          addMessage('bot', 'Perfect! Now, what benefits are you most interested in?', [
            'Cashback on all purchases',
            'Travel rewards & airline miles',
            'Fuel rewards',
            'Shopping rewards',
            'Airport lounge access',
            'Dining rewards'
          ]);
          setCurrentStep('benefits');
        }, 1000);
        break;

      case 'benefits':
        const benefits = input.split(',').map(b => b.trim());
        setProfile(prev => ({ ...prev, preferredBenefits: benefits }));
        setTimeout(() => {
          addMessage('bot', 'What\'s your approximate credit score range?', [
            'Excellent (750+)',
            'Good (700-749)',
            'Fair (650-699)',
            'Building credit (<650)',
            'Not sure'
          ]);
          setCurrentStep('creditScore');
        }, 1000);
        break;

      case 'creditScore':
        const finalProfile = { ...profile, creditScore: input };
        setProfile(finalProfile);
        setTimeout(() => {
          addMessage('bot', "Excellent! I'm analyzing your profile using advanced AI algorithms to find the best credit cards for you. This will take just a moment...");
          generateRecommendations(finalProfile);
        }, 1000);
        break;
    }
  };

  const handleOptionClick = (option: string) => {
    addMessage('user', option);
    processUserInput(option);
  };

  const generateRecommendations = async (finalProfile: UserProfile) => {
    // Advanced recommendation logic using AI scoring
    const scoredCards = creditCards.map(card => ({
      ...card,
      score: calculateAdvancedScore(card, finalProfile)
    }));

    const recommendations = scoredCards
      .filter(card => card.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Save session to database if user is authenticated
    if (user) {
      await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_data: finalProfile,
          recommendations: recommendations
        });
    }

    setTimeout(() => {
      addMessage('bot', `Perfect! I've analyzed ${creditCards.length} credit cards and found ${recommendations.length} excellent matches for your profile. These recommendations are personalized based on your income, spending patterns, and preferences.`);
      
      setTimeout(() => {
        onComplete(finalProfile, recommendations);
      }, 2000);
    }, 2000);
  };

  const calculateAdvancedScore = (card: CreditCard, profile: UserProfile): number => {
    let score = 0;
    
    // Income eligibility check
    if (profile.monthlyIncome && card.minIncome > profile.monthlyIncome) {
      return 0;
    }
    
    score += 20; // Base eligibility score
    
    // Annual fee scoring
    if (card.annualFee === 0) score += 15;
    else if (card.annualFee <= 1000) score += 10;
    else if (card.annualFee <= 5000) score += 5;
    
    // Spending pattern analysis
    if (profile.spendingHabits) {
      const { fuel = 0, travel = 0, dining = 0, groceries = 0 } = profile.spendingHabits;
      
      // Fuel rewards
      if (fuel > 3000 && card.specialPerks?.some(perk => perk.toLowerCase().includes('fuel'))) {
        score += 15;
      }
      
      // Travel rewards
      if (travel > 5000 && (
        card.rewardType?.toLowerCase().includes('travel') || 
        card.specialPerks?.some(perk => perk.toLowerCase().includes('travel'))
      )) {
        score += 15;
      }
      
      // Shopping/Grocery rewards
      if (groceries > 3000 && card.rewardType?.toLowerCase().includes('cashback')) {
        score += 12;
      }
      
      // Dining rewards
      if (dining > 2000 && card.specialPerks?.some(perk => perk.toLowerCase().includes('dining'))) {
        score += 10;
      }
    }
    
    // Benefit preferences
    if (profile.preferredBenefits) {
      profile.preferredBenefits.forEach(benefit => {
        const benefitLower = benefit.toLowerCase();
        if (benefitLower.includes('cashback') && card.rewardType?.toLowerCase().includes('cashback')) {
          score += 12;
        }
        if (benefitLower.includes('travel') && card.specialPerks?.some(perk => perk.toLowerCase().includes('travel'))) {
          score += 12;
        }
        if (benefitLower.includes('lounge') && card.specialPerks?.some(perk => perk.toLowerCase().includes('lounge'))) {
          score += 10;
        }
      });
    }
    
    return Math.min(score, 100);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-t-xl shadow-lg p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">AI Credit Card Advisor</h2>
            <p className="text-sm text-gray-500">Advanced AI-powered recommendations</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white shadow-lg overflow-hidden">
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm">{message.content}</p>
                {message.options && (
                  <div className="mt-3 space-y-2">
                    {message.options.map((option, index) => (
                      <Badge 
                        key={index}
                        variant="outline" 
                        className="cursor-pointer hover:bg-blue-50 mr-2 mb-2"
                        onClick={() => handleOptionClick(option)}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white rounded-b-xl shadow-lg p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your answer..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
