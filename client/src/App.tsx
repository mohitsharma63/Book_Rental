import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Router, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Context Providers
import { AuthProvider } from "@/lib/auth-context";
import { StoreProvider } from "@/lib/store-context";

// Layout Components
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RouteGuard } from "@/components/route-guard";

// Pages
import Home from "@/pages/home";
import About from "@/pages/about";
import Catalog from "@/pages/catalog";
import Contact from "@/pages/contact";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import OtpVerification from "@/pages/otp-verification";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import PaymentSuccess from "@/pages/payment-success";
import Profile from "@/pages/profile";
import Wishlist from "@/pages/wishlist";
import BookDetail from "@/pages/book-detail";
import Admin from "@/pages/admin";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import NotFound from "@/pages/not-found";
import TrackOrder from "@/pages/track-order";
import ReturnRequest from "@/pages/return-request";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <StoreProvider>
            <Router>
              <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
                <Header />
                <main className="flex-1">
                  <Switch>
                    <Route path="/" component={Home} />
                    <Route path="/about" component={About} />
                    <Route path="/catalog" component={Catalog} />
                    <Route path="/contact" component={Contact} />
                    <Route path="/login" component={Login} />
                    <Route path="/signup" component={Signup} />
                    <Route path="/otp-verification" component={OtpVerification} />
                    <Route path="/terms" component={Terms} />
                    <Route path="/privacy" component={Privacy} />

                    {/* Protected Routes */}
                    <Route path="/cart">
                      <RouteGuard requireAuth={true} redirectTo="/login">
                        <Cart />
                      </RouteGuard>
                    </Route>
                    <Route path="/checkout">
                      <RouteGuard requireAuth={true} redirectTo="/login">
                        <Checkout />
                      </RouteGuard>
                    </Route>
                    <Route path="/payment-success" component={PaymentSuccess} />
                    <Route path="/track-order" component={TrackOrder} />
                    <Route path="/return-request/:rentalId" component={ReturnRequest} />
                    <Route path="/contact" component={Contact} />
                    <Route path="/profile">
                      <RouteGuard requireAuth={true} redirectTo="/login">
                        <Profile />
                      </RouteGuard>
                    </Route>
                    <Route path="/wishlist">
                      <RouteGuard requireAuth={true} redirectTo="/login">
                        <Wishlist />
                      </RouteGuard>
                    </Route>
                    <Route path="/book/:id">
                      {(params) => <BookDetail bookId={params.id} />}
                    </Route>
                    <Route path="/admin">
                      <RouteGuard requireAuth={true} redirectTo="/login">
                        <Admin />
                      </RouteGuard>
                    </Route>
                    <Route path="/track-order" component={TrackOrder} />

                    {/* 404 Route */}
                    <Route component={NotFound} />
                  </Switch>
                </main>
                <Footer />
              </div>
            </Router>
            <Toaster />
          </StoreProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;