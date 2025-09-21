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
import Logo from "@assets/logo-removebg-preview_1757943248494.png";
export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
             <Link href="/">
                <img
                  src={Logo}
                  alt="BookLoop"
                  className="h-20 w-auto cursor-pointer"
                  data-testid="logo"
                />
              </Link>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Your trusted partner for affordable book rentals. Discover thousands of titles
              and join our community of passionate readers inida.
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
            <h4 className="text-lg font-semibold">About BookLoop</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Founded in 2025, BookLoop revolutionizes the way people access books.
                We believe reading should be affordable and accessible to everyone.
              </p>
              
             
            </div>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Us</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>bookloop.ind@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+91 9652883765</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Mylapore, Chennai, 600004</span>
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
            <p>© 2024 BookLoop. All rights reserved.</p>
            <div className="flex space-x-4">
              <Link href="/privacy">
                <Button variant="ghost" className="h-auto p-0 text-xs footer-link">
                  Privacy Policy
                </Button>
              </Link>
              <Link href="/terms">
                <Button variant="ghost" className="h-auto p-0 text-xs footer-link">
                  Terms of Service
                </Button>
              </Link>
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