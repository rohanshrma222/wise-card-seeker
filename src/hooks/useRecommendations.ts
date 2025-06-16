
import { useState } from 'react';
import { CreditCard, UserProfile } from '@/pages/Index';
import { supabase } from '@/integrations/supabase/client';

interface RecommendationEngine {
  scoreCard: (card: CreditCard, profile: UserProfile) => number;
  getRecommendations: (cards: CreditCard[], profile: UserProfile) => CreditCard[];
}

export const useRecommendations = (): RecommendationEngine => {
  const scoreCard = (card: CreditCard, profile: UserProfile): number => {
    let score = 0;
    
    // Income eligibility (critical factor)
    if (profile.monthlyIncome && card.min_income > profile.monthlyIncome) {
      return 0; // Ineligible
    }
    
    // Base score for eligibility
    score += 20;
    
    // Annual fee preference (lower is better for most users)
    if (card.annual_fee === 0) {
      score += 15;
    } else if (card.annual_fee <= 1000) {
      score += 10;
    } else if (card.annual_fee <= 5000) {
      score += 5;
    }
    
    // Spending pattern matching
    const totalSpending = Object.values(profile.spendingHabits || {}).reduce((a, b) => a + (b || 0), 0);
    
    if (profile.spendingHabits) {
      // Fuel spending
      if (profile.spendingHabits.fuel && profile.spendingHabits.fuel > 3000) {
        if (card.reward_type?.toLowerCase().includes('fuel') || 
            card.special_perks?.some(perk => perk.toLowerCase().includes('fuel'))) {
          score += 15;
        }
      }
      
      // Travel spending
      if (profile.spendingHabits.travel && profile.spendingHabits.travel > 5000) {
        if (card.reward_type?.toLowerCase().includes('travel') || 
            card.special_perks?.some(perk => perk.toLowerCase().includes('travel') || perk.toLowerCase().includes('lounge'))) {
          score += 15;
        }
      }
      
      // Dining spending
      if (profile.spendingHabits.dining && profile.spendingHabits.dining > 2000) {
        if (card.special_perks?.some(perk => perk.toLowerCase().includes('dining'))) {
          score += 10;
        }
      }
      
      // Shopping spending
      if (profile.spendingHabits.groceries && profile.spendingHabits.groceries > 3000) {
        if (card.reward_type?.toLowerCase().includes('cashback') || 
            card.special_perks?.some(perk => perk.toLowerCase().includes('shopping'))) {
          score += 10;
        }
      }
    }
    
    // Preferred benefits matching
    if (profile.preferredBenefits) {
      profile.preferredBenefits.forEach(benefit => {
        const benefitLower = benefit.toLowerCase();
        
        if (benefitLower.includes('cashback') && card.reward_type?.toLowerCase().includes('cashback')) {
          score += 12;
        }
        if (benefitLower.includes('travel') && 
            (card.reward_type?.toLowerCase().includes('travel') || 
             card.special_perks?.some(perk => perk.toLowerCase().includes('travel')))) {
          score += 12;
        }
        if (benefitLower.includes('lounge') && 
            card.special_perks?.some(perk => perk.toLowerCase().includes('lounge'))) {
          score += 10;
        }
        if (benefitLower.includes('fuel') && 
            card.special_perks?.some(perk => perk.toLowerCase().includes('fuel'))) {
          score += 10;
        }
      });
    }
    
    // Credit score consideration
    if (profile.creditScore) {
      if (profile.creditScore.includes('Excellent') && card.category === 'Premium') {
        score += 8;
      } else if (profile.creditScore.includes('Good') && ['Premium', 'Lifestyle'].includes(card.category || '')) {
        score += 5;
      } else if (profile.creditScore.includes('Fair') && ['Entry Level', 'Lifestyle'].includes(card.category || '')) {
        score += 5;
      }
    }
    
    return Math.min(score, 100); // Cap at 100
  };

  const getRecommendations = (cards: CreditCard[], profile: UserProfile): CreditCard[] => {
    // Score all cards
    const scoredCards = cards.map(card => ({
      ...card,
      score: scoreCard(card, profile)
    }));
    
    // Filter out ineligible cards and sort by score
    return scoredCards
      .filter(card => card.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Return top 5 recommendations
  };

  return { scoreCard, getRecommendations };
};
