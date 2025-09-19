import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RouteGuard } from "@/components/route-guard";
import Home from "./pages/home";
import Catalog from "./pages/catalog";
import Admin from "./pages/admin";
import BookDetail from "./pages/book-detail";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Profile from "./pages/profile";
import About from "./pages/about";
import Contact from "./pages/contact";
import Privacy from "./pages/privacy";
import Terms from "./pages/terms";
import Wishlist from "./pages/wishlist";
import Cart from "./pages/cart";
import Checkout from "@/pages/checkout";
// import PaymentSuccess from "./pages/payment-success";
import NotFound from "./pages/not-found";
import { StoreProvider } from "./lib/store-context";
import { AuthProvider } from "@/lib/auth-context";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/book/:id" component={BookDetail} />
      <Route path="/admin">
        <RouteGuard requireAuth={true}>
          <Admin />
        </RouteGuard>
      </Route>
      <Route path="/profile">
        <RouteGuard requireAuth={true}>
          <Profile />
        </RouteGuard>
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/wishlist">
        <RouteGuard requireAuth={true}>
          <Wishlist />
        </RouteGuard>
      </Route>
      <Route path="/cart">
        <RouteGuard requireAuth={true}>
          <Cart />
        </RouteGuard>
      </Route>
      <Route path="/checkout">
        <RouteGuard requireAuth={true}>
          <Checkout />
        </RouteGuard>
      </Route>
      {/* <Route path="/payment-success" component={PaymentSuccess} /> */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StoreProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <Router />
              </main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </StoreProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;