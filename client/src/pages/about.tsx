
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Award, Heart, Target, Sparkles, Quote, Star } from "lucide-react";

export default function About() {


  const values = [
    {
      title: "Stories Shared with Love",
      description: "Every book is passed on with care, creating connections between readers across the globe.",
      icon: Heart,
      color: "text-red-500",
      gradient: "from-red-100 to-pink-100"
    },
    {
      title: "Books Meant to be Enjoyed",
      description: "We believe books should be read, not stored. Experience the joy of discovering new stories.",
      icon: BookOpen,
      color: "text-blue-500",
      gradient: "from-blue-100 to-sky-100"
    },
    {
      title: "Accessible Reading for All",
      description: "Making literature affordable and accessible to every reader, regardless of budget.",
      icon: Users,
      color: "text-green-500",
      gradient: "from-green-100 to-emerald-100"
    }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section with Founder's Story */}
      <div className="relative overflow-hidden mb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-50 to-blue-50 rounded-3xl"></div>
        <div className="relative px-8 py-16 text-center">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-primary mr-3 animate-pulse" />
            <Badge variant="secondary" className="text-lg px-6 py-2 bg-white/80 backdrop-blur">
              Founder's Note
            </Badge>
            <Sparkles className="h-8 w-8 text-primary ml-3 animate-pulse" />
          </div>
          
      
          {/* Founder's Quote Card */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="bg-white/90 backdrop-blur border-2 border-primary/20 shadow-xl">
              <CardContent className="p-8 sm:p-12">
                <Quote className="h-12 w-12 text-primary/30 mb-6 mx-auto" />
                
                <div className="space-y-6 text-left">
                  <p className="text-lg sm:text-xl leading-relaxed text-gray-700 italic">
                    "Hi, I am <span className="font-semibold text-primary">Dr. Sravya</span>, a doctor and an avid reader. 
                    For years, I wished to explore countless books but couldn't buy them all. I often thought 
                    <span className="font-medium text-purple-700"> 'how wonderful it would be if there were a reliable book rental service!'</span>"
                  </p>
                  
                  <p className="text-lg sm:text-xl leading-relaxed text-gray-700">
                    "That thought has now taken shape as <span className="font-bold text-primary">BookLoop</span> — a space where stories are shared, 
                    re-read, and passed on with love."
                  </p>
                  
                  <p className="text-lg sm:text-xl leading-relaxed text-gray-700 font-medium">
                    "Welcome to my dream venture, built for every reader who believes books are meant to be enjoyed, not stored. 💛📚"
                  </p>
                </div>

                <div className="flex items-center justify-center mt-8 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <p className="font-semibold text-lg text-primary">Dr. Sravya</p>
                    <p className="text-sm text-gray-600">Founder & CEO, BookLoop</p>
                    <div className="flex justify-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Founded in <span className="font-bold text-primary">2025</span>, BookLoop transforms the dream of every book lover into reality
          </p>

          <Button size="lg" className="text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
            Join Our Reading Community
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      

      {/* Vision Section */}
      <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
        <div className="space-y-6">
          <Badge variant="outline" className="w-fit">Our Vision</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
            Where Stories Find New Homes
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            At BookLoop, we envision a world where every story finds its perfect reader. Our platform connects 
            book lovers with thousands of titles, creating a sustainable ecosystem where books are loved, 
            shared, and cherished.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Located in the heart of <span className="font-semibold text-primary">Mylapore, Chennai, 600004</span>, 
            we're building bridges between readers across India and beyond, one book at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="rounded-full">
              Explore Our Collection
            </Button>
            <Button variant="outline" size="lg" className="rounded-full">
              Learn How It Works
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-200 rounded-3xl blur-3xl"></div>
          <img 
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600" 
            alt="Beautiful stack of books representing our collection" 
            className="relative rounded-3xl shadow-2xl w-full h-96 object-cover"
          />
          <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500 fill-current" />
              <div>
                <p className="font-bold text-gray-800">Made with Love</p>
                <p className="text-sm text-gray-600">For Every Reader</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Our Values</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Built on Love, Sustained by Community
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Every decision we make is guided by our core belief that books should bring joy, 
            knowledge, and connection to readers everywhere.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <Card key={index} className={`group hover:shadow-xl transition-all duration-500 bg-gradient-to-br ${value.gradient} border-0`}>
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className={`h-10 w-10 ${value.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">{value.title}</h3>
                <p className="text-gray-700 leading-relaxed">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Community Stats */}
      

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-3xl p-8 sm:p-12 text-center text-white">
        <Sparkles className="h-12 w-12 mx-auto mb-6 animate-pulse" />
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          Ready to Join Dr. Sravya's Dream?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90 leading-relaxed">
          Discover your next favorite book and become part of a community that believes 
          stories are meant to be shared, not stored.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" className="text-lg px-8 py-4 rounded-full">
            Start Your Reading Journey
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-4 rounded-full border-black text-black">
            Browse Our Collection
          </Button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/20">
          <p className="text-lg opacity-90">
            💛 Built with love for every reader who believes in the magic of books 📚
          </p>
        </div>
      </div>
    </main>
  );
}
