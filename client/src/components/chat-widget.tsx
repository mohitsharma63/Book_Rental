
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, MessageCircle, User, Bot, Minimize2, Maximize2, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! 👋 How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('book') || input.includes('rent') || input.includes('kitab')) {
      return '📚 I can help you find and rent books! You can browse our catalog or search for specific titles. What kind of book are you looking for?';
    } else if (input.includes('help') || input.includes('support') || input.includes('madad')) {
      return '🤝 I\'m here to help! You can ask me about our book rental service, how to place orders, return policies, or any other questions you might have.';
    } else if (input.includes('price') || input.includes('cost') || input.includes('paisa') || input.includes('rate')) {
      return '💰 Our book rental prices vary depending on the book. You can see the rental price on each book\'s detail page. We offer competitive rates for all our titles!';
    } else if (input.includes('return') || input.includes('due date') || input.includes('wapas')) {
      return '📅 Books can be rented for up to 2 weeks, with an option to extend for another week if available. You can check your due dates in your profile section.';
    } else if (input.includes('account') || input.includes('profile') || input.includes('login')) {
      return '👤 You can manage your account by going to your profile page. There you can see your rental history, update your information, and manage your current rentals.';
    } else if (input.includes('hello') || input.includes('hi') || input.includes('namaste') || input.includes('assalam')) {
      return '👋 Hello! Welcome to BookLoop! How can I assist you today?';
    } else {
      return '🙏 Thank you for your message! For more detailed assistance, please feel free to contact our support team through the contact form or call us directly.';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-widget-container animate-in slide-in-from-bottom-5 duration-300 mb-12 mr-6 fixed bottom-0 right-0 z-50">
      <Card className={`w-80 shadow-2xl border-0 transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[550px]'
      }`} style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.8)'
      }}>
        <CardHeader className="pb-3 relative overflow-hidden rounded-t-lg" style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 30%, #065f46 100%)'
        }}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='9' cy='9' r='1'/%3E%3Cpath d='m19 19 2-2v6l-2-2zm18 18 2-2v6l-2-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '30px 30px'
            }}></div>
          </div>
          
          <div className="flex items-center justify-between relative z-10">
            <CardTitle className="text-lg flex items-center gap-3 text-white">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse flex items-center justify-center">
                  <Sparkles className="h-2 w-2 text-white" />
                </div>
              </div>
              <div>
                <div className="font-bold">BookLoop Support</div>
                <div className="text-xs text-white/80 font-normal">Always here to help</div>
              </div>
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 text-white hover:bg-white/20 transition-all duration-200"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 text-white hover:bg-white/20 transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {user && !isMinimized && (
            <div className="mt-2 relative z-10">
              <p className="text-sm text-white/90 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                Hi <span className="font-semibold">{user.name}</span>! 🌟 How can we help you today?
              </p>
            </div>
          )}
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[470px]">
            <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-gray-50/50 to-white">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 animate-in slide-in-from-bottom-2 duration-300 ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender === 'bot' && (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg" style={{
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                      }}>
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-lg transition-all duration-200 hover:shadow-xl ${
                        message.sender === 'user'
                          ? 'text-white rounded-br-md'
                          : 'bg-white border border-gray-200 rounded-bl-md'
                      }`}
                      style={message.sender === 'user' ? {
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                      } : {}}
                    >
                      <p className="leading-relaxed">{message.text}</p>
                      <p className={`text-xs mt-2 opacity-70 ${
                        message.sender === 'user' ? 'text-white' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.sender === 'user' && (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg" style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                      }}>
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3 justify-start animate-in slide-in-from-bottom-2 duration-300">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg" style={{
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                    }}>
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>
            
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border-2 border-gray-200 focus:border-primary rounded-full px-4 py-3 bg-gray-50 focus:bg-white transition-all duration-200"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="rounded-full w-11 h-11 shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: inputValue.trim() ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : undefined
                  }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center flex items-center justify-center gap-1">
                Press Enter to send • <Sparkles className="h-3 w-3" /> We're here to help!
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
