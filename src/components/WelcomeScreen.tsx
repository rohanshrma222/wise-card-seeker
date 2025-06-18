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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-transparent"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-gray-600/10 to-transparent rounded-full blur-3xl"></div>
      
      <div className="max-w-4xl w-full relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="text-sm text-gray-200 bg-gray-800/50 px-3 py-2 rounded-full backdrop-blur-sm border border-gray-700/50">
            Welcome, {user?.email}
          </div>
          <Button 
            onClick={signOut} 
            variant="outline" 
            size="sm"
            className="bg-gray-800/50 border-gray-600 text-gray-200 hover:bg-gray-700/70 hover:text-white backdrop-blur-sm transition-all duration-300"
          >
            Sign Out
          </Button>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-gray-600 via-gray-700 to-gray-900 mb-8 shadow-2xl border border-gray-600/20 backdrop-blur-sm">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-white/10 to-gray-300/20 flex items-center justify-center">
              <Bot className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="text-white">AI-Powered Credit Card</span>
            <br />
            <span className="bg-gradient-to-r from-gray-200 via-white to-gray-300 bg-clip-text text-transparent font-extrabold">
              Recommendations
            </span>
          </h1>
          
          <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-8 leading-relaxed">
            Our advanced AI analyzes your financial profile, spending patterns, and preferences to recommend the perfect credit cards tailored just for you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/70 border-gray-600/60 hover:border-gray-500/80 backdrop-blur-sm transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl group">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-500/40 to-gray-700/60 rounded-xl flex items-center justify-center mx-auto mb-6 border border-gray-500/30 group-hover:border-gray-400/50 transition-all duration-300">
                <Bot className="w-7 h-7 text-gray-200 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-white group-hover:text-gray-100 transition-colors duration-300">Advanced AI Algorithm</h3>
              <p className="text-gray-300 group-hover:text-gray-200 leading-relaxed transition-colors duration-300">Sophisticated machine learning models analyze thousands of data points for precise recommendations.</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/70 border-gray-600/60 hover:border-gray-500/80 backdrop-blur-sm transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl group">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-500/40 to-gray-700/60 rounded-xl flex items-center justify-center mx-auto mb-6 border border-gray-500/30 group-hover:border-gray-400/50 transition-all duration-300">
                <Shield className="w-7 h-7 text-gray-200 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-white group-hover:text-gray-100 transition-colors duration-300">Bank-Level Security</h3>
              <p className="text-gray-300 group-hover:text-gray-200 leading-relaxed transition-colors duration-300">Your financial data is encrypted and protected with enterprise-grade security measures.</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/70 border-gray-600/60 hover:border-gray-500/80 backdrop-blur-sm transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl group">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-500/40 to-gray-700/60 rounded-xl flex items-center justify-center mx-auto mb-6 border border-gray-500/30 group-hover:border-gray-400/50 transition-all duration-300">
                <Target className="w-7 h-7 text-gray-200 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-white group-hover:text-gray-100 transition-colors duration-300">Hyper-Personalized</h3>
              <p className="text-gray-300 group-hover:text-gray-200 leading-relaxed transition-colors duration-300">Get recommendations with detailed reward calculations specific to your spending habits.</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            onClick={onStart}
            size="lg"
            className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 hover:from-gray-600 hover:via-gray-700 hover:to-gray-800 text-white px-10 py-6 text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border border-gray-600/30 backdrop-blur-sm group"
          >
            <span className="flex items-center">
              Start AI Analysis
              <Sparkles className="ml-3 w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
            </span>
          </Button>
          
          <div className="flex items-center justify-center mt-6 space-x-6 text-sm text-gray-300">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full mr-2"></div>
              AI-powered analysis
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full mr-2"></div>
              Takes 2-3 minutes
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full mr-2"></div>
              Your data is secure
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};