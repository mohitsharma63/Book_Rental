import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Award, Heart, Target, Sparkles } from "lucide-react";

export default function About() {
  const stats = [
    { label: "Books Available", value: "10,000+", icon: BookOpen, color: "text-blue-600" },
    { label: "Happy Readers", value: "25,000+", icon: Users, color: "text-green-600" },
    { label: "Cities Served", value: "50+", icon: Target, color: "text-purple-600" },
    { label: "Years of Service", value: "5+", icon: Award, color: "text-orange-600" }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      bio: "Former librarian with a passion for making books accessible to everyone.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"
    },
    {
      name: "Michael Chen",
      role: "Head of Technology",
      bio: "Tech enthusiast building the future of digital book rentals.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"
    },
    {
      name: "Emily Rodriguez",
      role: "Community Manager",
      bio: "Book lover connecting readers with their next favorite story.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"
    }
  ];

  const values = [
    {
      title: "Accessibility",
      description: "Making reading affordable and accessible to everyone, everywhere.",
      icon: Heart,
      color: "text-red-500"
    },
    {
      title: "Quality",
      description: "Curating the finest collection of books across all genres.",
      icon: Sparkles,
      color: "text-yellow-500"
    },
    {
      title: "Community",
      description: "Building a vibrant community of passionate readers.",
      icon: Users,
      color: "text-blue-500"
    }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-8 sm:mb-12 px-4 sm:px-0">
        <Badge className="mb-4 text-xs sm:text-sm">About BookLoop</Badge>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6" data-testid="about-title">
          Revolutionizing How You Read
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Founded in 2024, BookLoop is more than just a book rental service. We're a community 
          of book lovers dedicated to making reading accessible, affordable, and enjoyable for everyone.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-12 sm:mb-16">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center p-3 sm:p-6">
            <CardContent className="p-0">
              <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 ${stat.color}`} />
              <div className="text-lg sm:text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mission Section */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 sm:mb-16">
        <div className="order-2 md:order-1">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Our Mission</h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6">
            We believe that everyone deserves access to great books, regardless of their budget or location. 
            Our mission is to break down barriers to reading by providing an affordable, convenient, and 
            sustainable way to access thousands of titles.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6">
            Through our platform, we're not just renting books – we're fostering a love of reading, 
            supporting authors, and building a more literate world one reader at a time.
          </p>
          <Button size="lg" className="w-full sm:w-auto">Join Our Community</Button>
        </div>
        <div className="relative order-1 md:order-2">
          <img 
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
            alt="Stack of books" 
            className="rounded-lg shadow-lg w-full h-48 sm:h-64 md:h-auto object-cover"
          />
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-12 sm:mb-16">
        <div className="text-center mb-8 sm:mb-12 px-4 sm:px-0">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Our Values</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            These core values guide everything we do at BookLoop.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {values.map((value, index) => (
            <Card key={index} className="p-4 sm:p-6 text-center">
              <CardContent className="p-0">
                <value.icon className={`h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 ${value.color}`} />
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{value.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-12 sm:mb-16">
        <div className="text-center mb-8 sm:mb-12 px-4 sm:px-0">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Meet Our Team</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Passionate individuals working together to make reading accessible for everyone.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {team.map((member, index) => (
            <Card key={index} className="p-4 sm:p-6 text-center">
              <CardContent className="p-0">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-3 sm:mb-4 object-cover"
                />
                <h3 className="text-lg sm:text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-primary font-medium mb-2 sm:mb-3 text-sm sm:text-base">{member.role}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 rounded-lg p-4 sm:p-6 lg:p-8 text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Ready to Start Reading?</h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto px-4 sm:px-0">
          Join thousands of readers who have already discovered their next favorite book with BookLoop.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button size="lg" className="w-full sm:w-auto">Browse Catalog</Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">Contact Us</Button>
        </div>
      </div>
    </main>
  );
}