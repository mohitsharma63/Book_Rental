
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  BookOpen,
  Heart
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">BookWise</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Your trusted partner for affordable book rentals. Discover thousands of titles 
              and join our community of passionate readers worldwide.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <div className="space-y-3 text-sm">
              <Link href="/">
                <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-primary justify-start footer-link">
                  Home
                </Button>
              </Link>
              <Link href="/catalog">
                <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-primary justify-start footer-link">
                  Browse Books
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-primary justify-start footer-link">
                  My Account
                </Button>
              </Link>
              <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-primary justify-start footer-link">
                How it Works
              </Button>
              <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-primary justify-start footer-link">
                Pricing
              </Button>
              <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-primary justify-start footer-link">
                FAQs
              </Button>
            </div>
          </div>

          {/* About Us */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">About BookWise</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Founded in 2019, BookWise revolutionizes the way people access books. 
                We believe reading should be affordable and accessible to everyone.
              </p>
              <p>
                With over 15,000 titles and growing, we're committed to building 
                the largest community of book lovers globally.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Over 42,000 satisfied customers</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Available in 127 cities</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>24/7 customer support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Us</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@bookwise.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+1 (555) 123-BOOK</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>123 Library Street, Reading City, RC 12345</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium">Stay Updated</h5>
              <p className="text-xs text-muted-foreground">
                Get the latest book recommendations and exclusive offers
              </p>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter email" 
                  className="text-xs h-8" 
                  type="email"
                />
                <Button size="sm" className="h-8 px-3">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />
        
        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-muted-foreground">
            <p>© 2024 BookWise. All rights reserved.</p>
            <div className="flex space-x-4">
              <Button variant="ghost" className="h-auto p-0 text-xs footer-link">
                Privacy Policy
              </Button>
              <Button variant="ghost" className="h-auto p-0 text-xs footer-link">
                Terms of Service
              </Button>
              <Button variant="ghost" className="h-auto p-0 text-xs footer-link">
                Cookie Policy
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>for book lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
