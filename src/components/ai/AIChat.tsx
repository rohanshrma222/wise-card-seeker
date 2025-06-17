
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

  const handleSendMessage = () => {
    if (!inputValue.trim() || loading) return;

    addMessage('user', inputValue);
    processUserInput(inputValue);
    setInputValue('');
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
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-t-xl shadow-lg p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">AI Credit Card Advisor</h2>
            <p className="text-sm text-gray-500">Powered by OpenAI GPT-4o-mini</p>
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
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
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
            disabled={loading}
          />
          <Button onClick={handleSendMessage} size="sm" disabled={loading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
