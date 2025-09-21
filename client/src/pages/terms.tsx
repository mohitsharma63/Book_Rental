import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Scale, FileText, Shield, AlertTriangle, Users, CreditCard } from "lucide-react";
import { Link } from "wouter";

export default function Terms() {
  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: FileText,
      content: [
        "By accessing and using BookWise services, you accept and agree to be bound by these Terms of Service",
        "If you do not agree to these terms, please do not use our services",
        "We may update these terms from time to time, and your continued use constitutes acceptance",
        "You must be at least 18 years old or have parental consent to use our services"
      ]
    },
    {
      id: "services",
      title: "Our Services",
      icon: Users,
      content: [
        "BookLoop provides book rental services through our online platform",
        "We offer access to thousands of books for rental periods ranging from 1 week to 4 weeks",
        "Services include book delivery, pickup, and customer support",
        "We reserve the right to modify, suspend, or discontinue services at any time",
        "Availability of books may vary based on inventory and demand"
      ]
    },
    {
      id: "user-accounts",
      title: "User Accounts",
      icon: Users,
      content: [
        "You must create an account to use our rental services",
        "You are responsible for maintaining the confidentiality of your account credentials",
        "You must provide accurate and complete information when creating your account",
        "You are responsible for all activities that occur under your account",
        "You must notify us immediately of any unauthorized use of your account",
        "We reserve the right to suspend or terminate accounts that violate these terms"
      ]
    },
    {
      id: "rentals",
      title: "Book Rentals",
      icon: FileText,
      content: [
        "Rental periods begin from the date of delivery and must be returned by the due date",
        "Late fees apply for books returned after the due date at $2 per day per book",
        "You are responsible for the care and condition of rented books",
        "Damaged or lost books will incur replacement fees based on the book's retail value",
        "You may extend rental periods subject to availability and additional fees",
        "All rentals are subject to our inventory availability"
      ]
    },
    {
      id: "payments",
      title: "Payment Terms",
      icon: CreditCard,
      content: [
        "All rental fees must be paid in advance through our secure payment system",
        "We accept major credit cards, debit cards, and digital payment methods",
        "Prices are subject to change with notice, but existing rentals honor original pricing",
        "Refunds are provided only in cases of service failure on our part",
        "You authorize us to charge your payment method for rentals, late fees, and damages",
        "All payments are processed securely through encrypted payment gateways"
      ]
    },
    {
      id: "prohibited",
      title: "Prohibited Uses",
      icon: AlertTriangle,
      content: [
        "You may not share, copy, or distribute rented books in any format",
        "Commercial use of rented books is strictly prohibited",
        "You may not damage, deface, or alter books in any way",
        "Subletting or transferring rentals to third parties is not allowed",
        "You may not use our services for any illegal or unauthorized purposes",
        "Attempting to circumvent our security measures is prohibited"
      ]
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      icon: Shield,
      content: [
        "BookWise provides services 'as is' without warranties of any kind",
        "We are not liable for indirect, incidental, or consequential damages",
        "Our total liability is limited to the amount paid for the specific rental",
        "We are not responsible for delays caused by shipping carriers or weather",
        "You agree to indemnify BookLoop against claims arising from your use of services",
        "Some jurisdictions may not allow limitation of liability, so these may not apply to you"
      ]
    }
  ];

  const contactMethods = [
    {
      title: "Legal Department",
      email: "bookloop.ind@gmail.com",
      description: "For legal inquiries and terms-related questions"
    },
    {
      title: "Customer Support",
      email: "bookloop.ind@gmail.com",
      description: "For general questions about our services"
    }
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge className="mb-4 bg-purple-100 text-purple-700">
          <Scale className="h-3 w-3 mr-1" />
          Terms of Service
        </Badge>
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          These terms govern your use of BookLoop services. Please read them carefully 
          as they contain important information about your rights and obligations.
        </p>
        <div className="mt-6 text-sm text-muted-foreground">
          <p>Last updated: January 15, 2024</p>
          <p>Effective date: January 15, 2024</p>
        </div>
      </div>

      {/* Introduction */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="prose prose-gray max-w-none">
            <p className="text-base leading-relaxed">
              Welcome to BookLoop! These Terms of Service ("Terms") govern your use of our 
              book rental platform and services. By creating an account or using our services, 
              you agree to be bound by these Terms and our Privacy Policy. Please read them 
              carefully before using our services.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Sections */}
      <div className="space-y-8 mb-12">
        {sections.map((section) => {
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

      {/* Termination */}
      <Card className="mb-8 bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Termination
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-red-900">
              We reserve the right to terminate or suspend your account and access to our services immediately, 
              without prior notice, for any breach of these Terms or for any other reason we deem necessary.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 text-red-900">Grounds for Termination</h4>
                <ul className="space-y-1 text-sm text-red-800">
                  <li>• Violation of these Terms</li>
                  <li>• Fraudulent or illegal activity</li>
                  <li>• Repeated late returns or damages</li>
                  <li>• Abuse of our services or staff</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-red-900">Upon Termination</h4>
                <ul className="space-y-1 text-sm text-red-800">
                  <li>• All outstanding books must be returned</li>
                  <li>• All fees and charges become due</li>
                  <li>• Your account will be deactivated</li>
                  <li>• Data may be retained per our Privacy Policy</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Governing Law */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Scale className="h-5 w-5 text-blue-600" />
            Governing Law & Disputes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-blue-900">Governing Law</h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  These Terms are governed by and construed in accordance with the laws of 
                  the State of California, without regard to its conflict of law principles.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-blue-900">Dispute Resolution</h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Any disputes arising from these Terms or our services will be resolved through 
                  binding arbitration in accordance with the rules of the American Arbitration Association.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Changes to Terms */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Changes to These Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms at any time. When we do, we will:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Notification Process</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Update the "Last updated" date</li>
                  <li>• Send email notification to active users</li>
                  <li>• Post notice on our website</li>
                  <li>• Provide 30-day notice for material changes</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Your Options</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Review changes when notified</li>
                  <li>• Continue using services (acceptance)</li>
                  <li>• Contact us with questions</li>
                  <li>• Terminate account if you disagree</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Questions About These Terms?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            If you have questions about these Terms of Service, please contact us using the 
            information below:
          </p>
          <div className="space-y-4">
            {contactMethods.map((contact, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{contact.title}</h4>
                  <p className="text-primary font-medium">{contact.email}</p>
                  <p className="text-sm text-muted-foreground">{contact.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Mailing Address:</strong><br />
              BookLoop Legal Department<br />
              Mylapore<br />
              Chennai, 600004<br />
              India
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Footer */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          By using BookWise, you acknowledge that you have read, understood, and agree to be 
          bound by these Terms of Service and our Privacy Policy.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/privacy">
            <Button variant="outline">
              Privacy Policy
            </Button>
          </Link>
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