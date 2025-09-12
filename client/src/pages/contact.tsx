
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Clock, MessageCircle, HelpCircle, User } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const contactInfo = [
    {
      title: "Email Us",
      description: "Get in touch via email",
      value: "support@bookwise.com",
      icon: Mail,
      color: "text-blue-600"
    },
    {
      title: "Call Us",
      description: "Speak with our team",
      value: "+1 (555) 123-4567",
      icon: Phone,
      color: "text-green-600"
    },
    {
      title: "Visit Us",
      description: "Our main office",
      value: "123 Book Street, Reading City, RC 12345",
      icon: MapPin,
      color: "text-red-600"
    },
    {
      title: "Business Hours",
      description: "We're here to help",
      value: "Mon-Fri: 9AM-6PM EST",
      icon: Clock,
      color: "text-purple-600"
    }
  ];

  const faq = [
    {
      question: "How long can I rent a book?",
      answer: "Books can be rented for up to 2 weeks, with the option to extend for another week if available."
    },
    {
      question: "What happens if I damage a book?",
      answer: "Minor wear is expected, but significant damage may result in replacement fees. We'll contact you to discuss any issues."
    },
    {
      question: "Can I cancel my rental?",
      answer: "Yes, you can cancel within 24 hours of renting for a full refund. After that, standard rental terms apply."
    },
    {
      question: "Do you offer digital books?",
      answer: "Currently, we focus on physical book rentals, but digital options are coming soon!"
    }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge className="mb-4">Contact Us</Badge>
        <h1 className="text-4xl font-bold mb-6" data-testid="contact-title">
          Get in Touch
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Have questions about our service? Need help with your rental? 
          We're here to help and would love to hear from you.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Contact Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Send us a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="John Doe"
                      required
                      data-testid="input-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="john@example.com"
                      required
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Subject *
                    </label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="How can we help?"
                      required
                      data-testid="input-subject"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category
                    </label>
                    <Select onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="support">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing Question</SelectItem>
                        <SelectItem value="book-request">Book Request</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message *
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    required
                    data-testid="textarea-message"
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" data-testid="button-send-message">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="space-y-8">
          <div className="grid gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <info.icon className={`h-6 w-6 mt-1 ${info.color}`} />
                    <div>
                      <h3 className="font-semibold mb-1">{info.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{info.description}</p>
                      <p className="font-medium">{info.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Map Placeholder */}
          <Card>
            <CardContent className="p-0">
              <div className="bg-muted h-64 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Interactive Map</p>
                  <p className="text-sm text-muted-foreground">123 Book Street, Reading City</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <HelpCircle className="h-8 w-8" />
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find quick answers to common questions about BookWise.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {faq.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">{item.question}</h3>
                <p className="text-muted-foreground">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 bg-primary/5 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
        <p className="text-muted-foreground mb-6">
          Our support team is always ready to help you with any questions or concerns.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg">
            <Phone className="h-4 w-4 mr-2" />
            Call Us Now
          </Button>
          <Button variant="outline" size="lg">
            <Mail className="h-4 w-4 mr-2" />
            Email Support
          </Button>
        </div>
      </div>
    </main>
  );
}
