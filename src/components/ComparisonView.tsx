
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Check, X } from 'lucide-react';
import { CreditCard as CreditCardType } from '@/pages/Index';

interface ComparisonViewProps {
  cards: CreditCardType[];
  onBack: () => void;
  onRestart: () => void;
}

export const ComparisonView = ({ cards, onBack, onRestart }: ComparisonViewProps) => {
  const comparisonFeatures = [
    { key: 'annualFee' as keyof CreditCardType, label: 'Annual Fee', format: (value: number) => value === 0 ? 'Free' : `₹${value.toLocaleString()}` },
    { key: 'joiningFee' as keyof CreditCardType, label: 'Joining Fee', format: (value: number) => value === 0 ? 'Free' : `₹${value.toLocaleString()}` },
    { key: 'rewardType' as keyof CreditCardType, label: 'Reward Type', format: (value: string) => value },
    { key: 'rewardRate' as keyof CreditCardType, label: 'Reward Rate', format: (value: string) => value },
    { key: 'minIncome' as keyof CreditCardType, label: 'Min Income', format: (value: number) => `₹${value.toLocaleString()}/month` },
  ];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Results
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Card Comparison
          </h1>
          <Button onClick={onRestart} variant="outline">
            Start Over
          </Button>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${cards.length}, 1fr)` }}>
              {/* Header Row */}
              <div className="font-medium text-gray-700 p-4"></div>
              {cards.map((card) => (
                <Card key={card.id} className="overflow-hidden">
                  <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded mx-auto mb-2 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-lg">{card.name}</CardTitle>
                    <p className="text-sm text-gray-600">{card.issuer}</p>
                  </CardHeader>
                </Card>
              ))}

              {/* Comparison Rows */}
              {comparisonFeatures.map((feature) => (
                <>
                  <div key={feature.key} className="p-4 font-medium text-gray-700 bg-gray-50 rounded-l-lg">
                    {feature.label}
                  </div>
                  {cards.map((card) => (
                    <div key={`${card.id}-${feature.key}`} className="p-4 bg-white border border-gray-200">
                      {feature.format(card[feature.key] as any)}
                    </div>
                  ))}
                </>
              ))}

              {/* Special Perks Row */}
              <div className="p-4 font-medium text-gray-700 bg-gray-50 rounded-l-lg">
                Special Perks
              </div>
              {cards.map((card) => (
                <div key={`${card.id}-perks`} className="p-4 bg-white border border-gray-200">
                  <div className="space-y-1">
                    {card.specialPerks.slice(0, 3).map((perk, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-3 h-3 text-green-500" />
                        <span>{perk}</span>
                      </div>
                    ))}
                    {card.specialPerks.length > 3 && (
                      <p className="text-xs text-gray-500">+{card.specialPerks.length - 3} more perks</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Eligibility Row */}
              <div className="p-4 font-medium text-gray-700 bg-gray-50 rounded-l-lg">
                Eligibility
              </div>
              {cards.map((card) => (
                <div key={`${card.id}-eligibility`} className="p-4 bg-white border border-gray-200">
                  <div className="space-y-1">
                    {card.eligibility.slice(0, 2).map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Apply Button Row */}
              <div className="p-4"></div>
              {cards.map((card) => (
                <div key={`${card.id}-apply`} className="p-4">
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                    onClick={() => window.open(card.applyLink, '_blank')}
                  >
                    Apply Now
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            All information is subject to change. Please verify details on the bank's official website before applying.
          </p>
        </div>
      </div>
    </div>
  );
};
