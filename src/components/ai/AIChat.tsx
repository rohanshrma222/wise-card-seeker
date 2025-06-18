import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Bot } from 'lucide-react';
import { UserProfile, CreditCard } from '@/pages/Index';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRecommendations } from '@/hooks/useRecommendations';

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
  const { generateRecommendations } = useRecommendations();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your AI-powered credit card advisor. I'll help you find the perfect credit cards based on your financial profile. Let's start with your monthly income. What's your approximate monthly income in rupees?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState('income');
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    // focusing on input element
    inputRef.current?.focus();
  },[])
  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

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

  const callAIAssistant = async (userMessage: string) => {
    setLoading(true);
    try {
      console.log('Calling AI assistant with message:', userMessage);
      
      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          message: userMessage,
          conversationHistory: conversationHistory
        }
      });

      console.log('AI Response:', response);

      if (response.error) {
        console.error('Supabase function error:', response.error);
        throw response.error;
      }

      const aiResponse = response.data;
      
      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: aiResponse.message }
      ]);

      // Add AI message
      addMessage('bot', aiResponse.message, aiResponse.options);
      
      // Update current step
      if (aiResponse.nextStep) {
        setCurrentStep(aiResponse.nextStep);
      }

      // Handle profile completion
      if (aiResponse.nextStep === 'complete' || aiResponse.nextStep === 'analysis') {
        setTimeout(() => {
          const recommendations = generateRecommendations(profile);
          
          // Save session to database if user is authenticated
          if (user) {
            supabase
              .from('user_sessions')
              .insert({
                user_id: user.id,
                session_data: profile,
                recommendations: recommendations
              });
          }
          
          onComplete(profile, recommendations);
        }, 2000);
      }

    } catch (error) {
      console.error('AI Chat Error:', error);
      addMessage('bot', "I'm sorry, I'm having trouble connecting to my AI brain right now. Could you please try again? Let's continue with your financial profile.");
    }
    setLoading(false);
    
  };

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputValue.trim() || loading) return;

    addMessage('user', inputValue);
    processUserInput(inputValue);
    setInputValue('');
    inputRef.current?.focus();

  };

  const processUserInput = async (input: string) => {
    // Update profile based on current step and input
    const numericValue = parseFloat(input.replace(/[^\d.]/g, ''));

    switch (currentStep) {
      case 'income':
        if (numericValue > 0) {
          setProfile(prev => ({ ...prev, monthlyIncome: numericValue }));
        }
        break;
      case 'spending':
        // For spending, we could parse multiple categories
        // For now, let's handle it in the AI response
        break;
      case 'benefits':
        const benefits = input.includes(',') ? input.split(',').map(b => b.trim()) : [input];
        setProfile(prev => ({ ...prev, preferredBenefits: benefits }));
        break;
      case 'creditScore':
        setProfile(prev => ({ ...prev, creditScore: input }));
        break;
    }

    // Call AI assistant
    await callAIAssistant(input);
  };

  const handleOptionClick = (option: string) => {
    addMessage('user', option);
    processUserInput(option);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/30 to-transparent"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/3 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-gray-600/5 to-transparent rounded-full blur-3xl"></div>
      
      <div className="flex flex-col max-w-4xl mx-auto relative z-10 h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800/90 to-gray-900/70 backdrop-blur-sm rounded-t-xl shadow-2xl p-6 border border-gray-600/60 border-b-gray-600/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-600 via-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-lg border border-gray-500/30">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-white/10 to-gray-300/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
            </div>
            <div>
              <h2 className="font-bold text-xl text-white">AI Credit Card Advisor</h2>
              <p className="text-sm text-gray-300">Powered by Advanced AI • Secure & Personalized</p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 bg-gradient-to-br from-gray-800/80 to-gray-900/60 backdrop-blur-sm shadow-2xl overflow-hidden border-x border-gray-600/60">
          <div className="h-full overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-5 py-4 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white border border-gray-600/40 backdrop-blur-sm' 
                    : 'bg-gradient-to-r from-gray-700/90 to-gray-800/80 text-gray-100 border border-gray-600/50 backdrop-blur-sm'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  {message.options && (
                    <div className="mt-4 space-y-2">
                      {message.options.map((option, index) => (
                        <Badge 
                          key={index}
                          variant="outline" 
                          className="cursor-pointer bg-gray-700/60 text-gray-200 border-gray-600/60 hover:bg-gray-600/80 hover:text-white hover:border-gray-500/80 mr-2 mb-2 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
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
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-gray-700/90 to-gray-800/80 backdrop-blur-sm px-5 py-4 rounded-2xl border border-gray-600/50 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-xs text-gray-300 ml-2">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-gradient-to-r from-gray-800/90 to-gray-900/70 backdrop-blur-sm rounded-b-xl shadow-2xl p-6 border border-gray-600/60 border-t-gray-600/30">
          <form className="flex gap-3" onSubmit={handleSendMessage}>
            <Input
              value={inputValue}
              ref={inputRef}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your answer here..."
              className="flex-1 bg-gray-700/60 border-gray-600/60 text-white placeholder-gray-400 focus:border-gray-500/80 focus:ring-gray-500/30 backdrop-blur-sm transition-all duration-300"
              disabled={loading}
            />
            <Button 
              size="sm" 
              disabled={loading}
              className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 hover:from-gray-600 hover:via-gray-700 hover:to-gray-800 text-white border border-gray-600/30 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <div className="flex items-center justify-center mt-3 space-x-4 text-xs text-gray-400">
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full mr-2"></div>
              AI-powered analysis
            </div>
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full mr-2"></div>
              Secure conversation
            </div>
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full mr-2"></div>
              Personalized recommendations
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};