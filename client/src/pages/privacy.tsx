import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Eye, Database, Mail, Phone } from "lucide-react";
import { Link } from "wouter";

export default function Privacy() {
  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: Database,
      content: [
        "Personal information you provide when creating an account (name, email, phone number, address)",
        "Payment information for processing transactions",
        "Rental history and preferences",
        "Usage data and analytics to improve our service",
        "Device information and IP addresses for security purposes"
      ]
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      icon: Eye,
      content: [
        "Process book rentals and manage your account",
        "Send important updates about your rentals and account",
        "Provide customer support and respond to inquiries",
        "Improve our services and develop new features",
        "Prevent fraud and ensure platform security",
        "Send promotional content (with your consent)"
      ]
    },
    {
      id: "information-sharing",
      title: "Information Sharing",
      icon: Shield,
      content: [
        "We do not sell your personal information to third parties",
        "Payment information is shared securely with payment processors",
        "Delivery information is shared with shipping partners",
        "We may share aggregated, non-personal data for analytics",
        "Legal compliance may require information disclosure"
      ]
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: Lock,
      content: [
        "Industry-standard encryption for all data transmission",
        "Secure storage with regular security audits",
        "Limited access to personal information by authorized personnel",
        "Regular security training for our team",
        "Incident response procedures for data breaches"
      ]
    }
  ];

  const contactInfo = [
    {
      method: "Email",
      value: "privacy@bookloop.com",
      icon: Mail,
      description: "For privacy-related inquiries"
    },
    {
      method: "Phone",
      value: "+91 9652883765",
      icon: Phone,
      description: "Business hours: Mon-Fri 9AM-6PM IST"
    }
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge className="mb-4 bg-blue-100 text-blue-700">
          <Shield className="h-3 w-3 mr-1" />
          Privacy Policy
        </Badge>
        <h1 className="text-4xl font-bold mb-6">Your Privacy Matters</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          At BookLoop, we're committed to protecting your privacy and being transparent
          about how we collect, use, and safeguard your personal information.
        </p>
        <div className="mt-6 text-sm text-muted-foreground">
          <p>Last updated: January 15, 2024</p>
        </div>
      </div>

      {/* Introduction */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="prose prose-gray max-w-none">
            <p className="text-base leading-relaxed">
              This Privacy Policy describes how BookLoop ("we," "our," or "us") collects,
              uses, and protects your information when you use our book rental service.
              By using BookLoop, you agree to the collection and use of information in
              accordance with this policy.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Sections */}
      <div className="space-y-8 mb-12">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={section.id} className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Your Rights */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-600" />
            Your Rights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-blue-900">Access & Control</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Access your personal information
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Update or correct your data
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Delete your account
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Export your data
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-blue-900">Communication</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Opt out of marketing emails
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Control notification preferences
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Object to data processing
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  File a complaint
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cookies & Tracking */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Cookies & Tracking Technologies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              We use cookies and similar technologies to enhance your experience on our platform:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Essential Cookies</h4>
                <p className="text-sm text-green-700">
                  Required for basic functionality like login and cart management.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Analytics Cookies</h4>
                <p className="text-sm text-blue-700">
                  Help us understand how you use our service to improve it.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">Marketing Cookies</h4>
                <p className="text-sm text-purple-700">
                  Used to show you relevant recommendations and offers.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              We retain your information for as long as necessary to provide our services:
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Account Information</span>
                <span className="text-sm text-muted-foreground">Until account deletion</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Rental History</span>
                <span className="text-sm text-muted-foreground">7 years (legal requirement)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Payment Information</span>
                <span className="text-sm text-muted-foreground">As required by payment processor</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Marketing Preferences</span>
                <span className="text-sm text-muted-foreground">Until you opt out</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Privacy Questions?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            If you have any questions about this Privacy Policy or how we handle your data,
            please don't hesitate to contact us:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {contactInfo.map((contact, index) => {
              const Icon = contact.icon;
              return (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{contact.method}</h4>
                    <p className="text-primary font-medium">{contact.value}</p>
                    <p className="text-sm text-muted-foreground">{contact.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Footer */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          By using BookLoop, you acknowledge that you have read, understood, and agree to be
          bound by these Terms of Service and our Privacy Policy.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact">
            <Button variant="outline">
              Contact Us
            </Button>
          </Link>
          <Link href="/">
            <Button>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}