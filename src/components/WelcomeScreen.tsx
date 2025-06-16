
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Sparkles, Shield, Target, Bot } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="flex justify-between items-center mb-8">
          <div className="text-sm text-gray-600">
            Welcome, {user?.email}
          </div>
          <Button onClick={signOut} variant="outline" size="sm">
            Sign Out
          </Button>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            AI-Powered Credit Card
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Recommendations</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Our advanced AI analyzes your financial profile, spending patterns, and preferences to recommend the perfect credit cards tailored just for you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Advanced AI Algorithm</h3>
              <p className="text-gray-600">Sophisticated machine learning models analyze thousands of data points for precise recommendations.</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Bank-Level Security</h3>
              <p className="text-gray-600">Your financial data is encrypted and protected with enterprise-grade security measures.</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Hyper-Personalized</h3>
              <p className="text-gray-600">Get recommendations with detailed reward calculations specific to your spending habits.</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            onClick={onStart}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Start AI Analysis
            <Sparkles className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-sm text-gray-500 mt-4">AI-powered analysis • Takes 2-3 minutes • Your data is secure</p>
        </div>
      </div>
    </div>
  );
};
