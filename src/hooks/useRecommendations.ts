
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, CreditCard } from '@/pages/Index';

export const useRecommendations = () => {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCreditCards();
  }, []);

  const loadCreditCards = async () => {
    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('is_active', true);
    
    if (data && !error) {
      const formattedCards = data.map(card => ({
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
      }));
      setCreditCards(formattedCards);
    }
    setLoading(false);
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

  const generateRecommendations = (profile: UserProfile) => {
    const scoredCards = creditCards.map(card => ({
      ...card,
      score: calculateAdvancedScore(card, profile)
    }));

    return scoredCards
      .filter(card => card.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  };

  return {
    creditCards,
    loading,
    generateRecommendations
  };
};
