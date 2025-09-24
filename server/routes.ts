import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookSchema, insertRentalSchema, insertWishlistSchema, insertUserSchema, insertReviewSchema, insertPaymentOrderSchema } from "@shared/schema";
import { otpService } from "./otp-sevice";

export async function registerRoutes(app: Express): Promise<Server> {

  // OTP routes
  app.post("/api/otp/send", async (req, res) => {
    try {
      const { phone, isResend = false } = req.body;

      if (!phone) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      // Basic phone number validation
      const phoneRegex = /^\+?[\d\s-()]{10,}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: "Please enter a valid phone number" });
      }

      const result = await otpService.sendOTP(phone, isResend);

      if (result.success) {
        res.json({ message: result.message });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({ message: "Failed to send OTP. Please try again." });
    }
  });

  app.post("/api/otp/verify", async (req, res) => {
    try {
      const { phone, otp } = req.body;

      if (!phone || !otp) {
        return res.status(400).json({ message: "Phone number and OTP are required" });
      }

      const result = await otpService.verifyOTP(phone, otp);

      if (result.success) {
        res.json({ message: result.message, verified: true });
      } else {
        res.status(400).json({ message: result.message, verified: false });
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ message: "Failed to verify OTP. Please try again." });
    }
  });

  app.get("/api/otp/status/:phone", async (req, res) => {
    try {
      const { phone } = req.params;
      const status = otpService.getOTPStatus(phone);
      res.json(status);
    } catch (error) {
      console.error("Get OTP status error:", error);
      res.status(500).json({ message: "Failed to get OTP status" });
    }
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Get user from database by email
      const user = await storage.getUserByEmail(email);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Remove password from response and add role
      const { password: _, ...userWithoutPassword } = user;
      const userResponse = {
        ...userWithoutPassword,
        role: user.isAdmin ? "admin" : "user"
      };

      res.json({
        user: userResponse,
        message: "Login successful"
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed. Please try again." });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      // Create proper user data structure
      const userData = {
        username: req.body.email, // Use email as username for now
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone || null,
        address: req.body.address || null,
        isAdmin: req.body.role === "admin" || req.body.email === "admin@bookwise.com"
      };

      // Validate with schema
      const validatedData = insertUserSchema.parse(userData);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);

      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      const user = await storage.createUser(validatedData);

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({
        user: userWithoutPassword,
        message: "Account created successfully"
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  // Books routes
  app.get("/api/books", async (req, res) => {
    try {
      const { search, category } = req.query;

      let books;
      if (search) {
        books = await storage.searchBooks(search as string);
      } else if (category) {
        books = await storage.getBooksByCategory(category as string);
      } else {
        books = await storage.getAllBooks();
      }

      console.log("Books fetched:", books.length);
      res.json(books);
    } catch (error) {
      console.error("Get books error:", error);
      res.status(500).json({ message: "Failed to fetch books", details: (error as Error).message });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const book = await storage.getBook(req.params.id);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      console.error("Get book error:", error);
      res.status(500).json({ message: "Failed to fetch book", details: (error as Error).message });
    }
  });

  app.post("/api/books", async (req, res) => {
    try {
      console.log("Received book data:", req.body);

      // Keep pricePerWeek as string for schema validation, transform others as needed
      const transformedData = {
        ...req.body,
        pricePerWeek: req.body.pricePerWeek.toString(),
        publishedYear: req.body.publishedYear ? parseInt(req.body.publishedYear) : null,
        pages: req.body.pages ? parseInt(req.body.pages) : null,
      };

      // Validate with schema (expects string for pricePerWeek)
      const validatedData = insertBookSchema.parse(transformedData);
      console.log("Validated book data:", validatedData);

      const book = await storage.createBook(validatedData);
      res.status(201).json(book);
    } catch (error) {
      console.error("Book creation error:", error);
      res.status(400).json({ message: "Invalid book data", error: (error as Error).message });
    }
  });

  app.put("/api/books/:id", async (req, res) => {
    try {
      console.log("Updating book with ID:", req.params.id);
      console.log("Update data:", req.body);

      // Keep pricePerWeek as string for schema validation, convert others as needed
      const transformedData = {
        ...req.body,
        pricePerWeek: req.body.pricePerWeek.toString(),
        totalCopies: parseInt(req.body.totalCopies),
        publishedYear: req.body.publishedYear ? parseInt(req.body.publishedYear) : null,
        pages: req.body.pages ? parseInt(req.body.pages) : null,
      };

      const book = await storage.updateBook(req.params.id, transformedData);
      console.log("Book updated successfully:", book.id);
      res.json(book);
    } catch (error) {
      console.error("Update book error:", error);
      res.status(500).json({ message: "Failed to update book", error: (error as Error).message });
    }
  });

  app.delete("/api/books/:id", async (req, res) => {
    try {
      console.log("Deleting book with ID:", req.params.id);
      const success = await storage.deleteBook(req.params.id);
      if (!success) {
        console.log("Book not found for deletion:", req.params.id);
        return res.status(404).json({ message: "Book not found" });
      }
      console.log("Book deleted successfully:", req.params.id);
      res.json({ message: "Book deleted successfully" });
    } catch (error) {
      console.error("Delete book error:", error);
      res.status(500).json({ message: "Failed to delete book", error: (error as Error).message });
    }
  });

  // Rentals routes
  app.get("/api/rentals", async (req, res) => {
    try {
      const { userId } = req.query;

      let rentals;
      if (userId) {
        rentals = await storage.getRentalsByUser(userId as string);
      } else {
        rentals = await storage.getAllRentals();
      }

      res.json(rentals);
    } catch (error) {
      console.error("Get rentals error:", error);
      res.status(500).json({ message: "Failed to fetch rentals", details: (error as Error).message });
    }
  });

  app.post("/api/rentals", async (req, res) => {
    try {
      const rentalData = insertRentalSchema.parse(req.body);
      const rental = await storage.createRental(rentalData);
      res.status(201).json(rental);
    } catch (error) {
      console.error("Create rental error:", error);
      res.status(400).json({ message: "Invalid rental data", details: (error as Error).message });
    }
  });

  app.put("/api/rentals/:id", async (req, res) => {
    try {
      const rental = await storage.updateRental(req.params.id, req.body);
      res.json(rental);
    } catch (error) {
      console.error("Update rental error:", error);
      res.status(500).json({ message: "Failed to update rental", details: (error as Error).message });
    }
  });



  // Users routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response for security
      const safeUsers = users.map(({ password, ...user }) => user);
      console.log("Users fetched:", safeUsers.length);
      res.json(safeUsers);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Failed to fetch users", details: (error as Error).message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to fetch user", details: (error as Error).message });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      console.log('Updating user:', id, 'with data:', updateData);

      const user = await storage.updateUser(id, updateData);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json({
        ...userWithoutPassword,
        message: "User updated successfully"
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user", error: (error as Error).message });
    }
  });

  app.put("/api/users/:id/suspend", async (req, res) => {
    try {
      const { id } = req.params;
      const { suspended } = req.body;

      console.log('Suspending user:', id, 'suspended status:', suspended);

      const user = await storage.updateUser(id, { 
        suspended: suspended,

      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json({
        ...userWithoutPassword,
        message: suspended ? "User suspended successfully" : "User unsuspended successfully"
      });
    } catch (error) {
      console.error("Suspend user error:", error);
      res.status(500).json({ message: "Failed to suspend user", error: (error as Error).message });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist/:userId", async (req, res) => {
    try {
      const wishlist = await storage.getWishlistByUser(req.params.userId);
      res.json(wishlist);
    } catch (error) {
      console.error("Get wishlist error:", error);
      res.status(500).json({ message: "Failed to fetch wishlist", details: (error as Error).message });
    }
  });

  app.post("/api/wishlist", async (req, res) => {
    try {
      const wishlistData = insertWishlistSchema.parse(req.body);
      const wishlistItem = await storage.addToWishlist(wishlistData);
      res.status(201).json(wishlistItem);
    } catch (error) {
      console.error("Add to wishlist error:", error);
      res.status(400).json({ message: "Invalid wishlist data", details: (error as Error).message });
    }
  });

  app.delete("/api/wishlist/:userId/:bookId", async (req, res) => {
    try {
      const success = await storage.removeFromWishlist(req.params.userId, req.params.bookId);
      if (!success) {
        return res.status(404).json({ message: "Wishlist item not found" });
      }
      res.json({ message: "Removed from wishlist" });
    } catch (error) {
      console.error("Remove from wishlist error:", error);
      res.status(500).json({ message: "Failed to remove from wishlist", details: (error as Error).message });
    }
  });

  // Contact routes
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, message, subject, category } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required" });
      }

      // Save to database
      const contact = await storage.createContact({
        name,
        email,
        subject: subject || null,
        category: category || null,
        message,
        status: "new"
      });

      console.log("Contact form submission saved:", {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        timestamp: contact.createdAt
      });

      res.json({ 
        message: "Message sent successfully",
        data: { 
          id: contact.id,
          name: contact.name, 
          email: contact.email, 
          subject: contact.subject, 
          category: contact.category, 
          message: contact.message 
        }
      });
    } catch (error) {
      console.error("Contact error:", error);
      res.status(500).json({ error: "Failed to send message", details: (error as Error).message });
    }
  });

  // Get all contacts (for admin)
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Get contacts error:", error);
      res.status(500).json({ error: "Failed to fetch contacts", details: (error as Error).message });
    }
  });

  // Get contact statistics
  app.get("/api/contacts/stats", async (req, res) => {
    try {
      const contacts = await storage.getAllContacts();

      const stats = {
        total: contacts.length,
        unread: contacts.filter(c => c.status === 'unread' || c.status === 'new').length,
        read: contacts.filter(c => c.status === 'read').length,
        responded: contacts.filter(c => c.status === 'responded').length,
        avgResponseTime: '2.4h' // Static for now, can be calculated based on actual response times
      };

      res.json(stats);
    } catch (error) {
      console.error("Get contact stats error:", error);
      res.status(500).json({ error: "Failed to fetch contact stats", details: (error as Error).message });
    }
  });

  // Slider routes
  app.get("/api/sliders", async (req, res) => {
    try {
      const sliders = await storage.getSliders();
      res.json(sliders);
    } catch (error) {
      console.error("Get sliders error:", error);
      res.status(500).json({ error: "Failed to fetch sliders", details: (error as Error).message });
    }
  });

  app.get("/api/sliders/active", async (req, res) => {
    try {
      const sliders = await storage.getActiveSliders();
      res.json(sliders);
    } catch (error) {
      console.error("Get active sliders error:", error);
      res.status(500).json({ error: "Failed to fetch active sliders", details: (error as Error).message });
    }
  });

  app.post("/api/sliders", async (req, res) => {
    try {
      const sliderData = req.body;
      const slider = await storage.createSlider(sliderData);
      res.status(201).json(slider);
    } catch (error) {
      console.error("Create slider error:", error);
      res.status(500).json({ error: "Failed to create slider", details: (error as Error).message });
    }
  });

  app.put("/api/sliders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const slider = await storage.updateSlider(id, updateData);

      if (!slider) {
        return res.status(404).json({ error: "Slider not found" });
      }

      res.json(slider);
    } catch (error) {
      console.error("Update slider error:", error);
      res.status(500).json({ error: "Failed to update slider", details: (error as Error).message });
    }
  });

  app.delete("/api/sliders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSlider(id);

      if (!deleted) {
        return res.status(404).json({ error: "Slider not found" });
      }

      res.json({ success: true, message: "Slider deleted successfully" });
    } catch (error) {
      console.error("Delete slider error:", error);
      res.status(500).json({ error: "Failed to delete slider", details: (error as Error).message });
    }
  });

  // Update contact status
  app.put("/api/contacts/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const contact = await storage.updateContactStatus(id, status);

      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }

      res.json(contact);
    } catch (error) {
      console.error("Update contact status error:", error);
      res.status(500).json({ error: "Failed to update contact status", details: (error as Error).message });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      console.log("Categories fetched:", categories.length);
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ error: "Failed to fetch categories", details: (error as Error).message });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const { name, description, imageUrl, isActive = true } = req.body;

      console.log("Creating category with data:", { name, description, imageUrl, isActive });

      if (!name) {
        return res.status(400).json({ error: "Category name is required" });
      }

      const category = await storage.createCategory({
        name,
        description: description || "",
        imageUrl: imageUrl || null,
        isActive
      });

      console.log("Category created successfully:", category);
      res.json(category);
    } catch (error) {
      console.error("Create category error:", error);
      res.status(500).json({ error: "Failed to create category", details: (error as Error).message });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, imageUrl, isActive } = req.body;

      console.log("Updating category with ID:", id, "and data:", { name, description, imageUrl, isActive });

      if (!name) {
        return res.status(400).json({ error: "Category name is required" });
      }

      const category = await storage.updateCategory(parseInt(id), {
        name,
        description: description || "",
        imageUrl: imageUrl || null,
        isActive
      });

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      console.log("Category updated successfully:", category);
      res.json(category);
    } catch (error) {
      console.error("Update category error:", error);
      res.status(500).json({ error: "Failed to update category", details: (error as Error).message });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCategory(parseInt(id));

      if (!success) {
        return res.status(404).json({ error: "Category not found" });
      }

      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Delete category error:", error);
      res.status(500).json({ error: "Failed to delete category", details: (error as Error).message });
    }
  });

  // Review routes
  app.get("/api/reviews/book/:bookId", async (req, res) => {
    try {
      const { bookId } = req.params;
      const reviews = await storage.getReviewsByBook(bookId);
      res.json(reviews);
    } catch (error) {
      console.error("Get reviews error:", error);
      res.status(500).json({ error: "Failed to fetch reviews", details: (error as Error).message });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);

      // Check if user exists
      const user = await storage.getUser(reviewData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if book exists
      const book = await storage.getBook(reviewData.bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Create review error:", error);
      res.status(400).json({ error: "Invalid review data", details: (error as Error).message });
    }
  });

  app.get("/api/reviews/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const reviews = await storage.getReviewsByUser(userId);
      res.json(reviews);
    } catch (error) {
      console.error("Get user reviews error:", error);
      res.status(500).json({ error: "Failed to fetch user reviews", details: (error as Error).message });
    }
  });

  // Payment Session route (only creates payment, no order save)
  app.post("/api/create-payment-session", async (req, res) => {
    try {
      const { order_id, order_amount, order_currency, customer_details, order_meta } = req.body;

      console.log("Creating payment session");

      // Validate required fields
      if (!customer_details?.customer_name || !customer_details?.customer_email || !customer_details?.customer_phone) {
        console.error("Missing customer details:", customer_details);
        return res.status(400).json({
          success: false,
          message: "Missing required customer details",
          details: "customer_name, customer_email, and customer_phone are required"
        });
      }

      if (!order_amount || isNaN(parseFloat(order_amount.toString())) || parseFloat(order_amount.toString()) <= 0) {
        console.error("Invalid amount:", order_amount);
        return res.status(400).json({
          success: false,
          message: "Invalid amount",
          details: "amount must be a valid positive number"
        });
      }

      // Create Cashfree order (no database save yet)
      const { cashfreeService } = await import('./cashfree-service');

      const cashfreeOrderData = {
        order_id,
        order_amount: parseFloat(order_amount.toString()),
        order_currency: order_currency || "INR",
        customer_details,
        order_meta
      };

      console.log("Creating Cashfree payment session");

      const cashfreeOrder = await cashfreeService.createOrder(cashfreeOrderData);

      console.log("Payment session created successfully:", {
        orderId: order_id,
        sessionId: cashfreeOrder.payment_session_id
      });

      res.json({
        success: true,
        order_id,
        payment_session_id: cashfreeOrder.payment_session_id,
        payment_url: cashfreeOrder.payment_url,
        cf_order_id: cashfreeOrder.cf_order_id,
        message: "Payment session created successfully"
      });
    } catch (error) {
      console.error("Create payment session error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to create payment session", 
        details: (error as Error).message 
      });
    }
  });

  // Payment Order routes (saves order after payment success)
  app.post("/api/create-order", async (req, res) => {
    try {
      const { amount, currency, customer_details, shipping_details, orderMeta, cartItems } = req.body;

      console.log("Creating order request received");

      // Validate required fields
      if (!customer_details?.customer_name || !customer_details?.customer_email || !customer_details?.customer_phone) {
        console.error("Missing customer details:", customer_details);
        return res.status(400).json({
          success: false,
          message: "Missing required customer details",
          details: "customer_name, customer_email, and customer_phone are required"
        });
      }

      if (!shipping_details?.address || !shipping_details?.city || !shipping_details?.state || !shipping_details?.pincode) {
        console.error("Missing shipping details:", shipping_details);
        return res.status(400).json({
          success: false,
          message: "Missing required shipping details",
          details: "address, city, state, and pincode are required"
        });
      }

      if (!amount || isNaN(parseFloat(amount.toString())) || parseFloat(amount.toString()) <= 0) {
        console.error("Invalid amount:", amount);
        return res.status(400).json({
          success: false,
          message: "Invalid amount",
          details: "amount must be a valid positive number"
        });
      }

      // Generate unique order ID
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create payment order in database first
      const paymentOrderData = {
        orderId,
        amount: amount.toString(),
        currency: currency || "INR",
        status: "created",
        customerName: customer_details.customer_name,
        customerEmail: customer_details.customer_email,
        customerPhone: customer_details.customer_phone,
        shippingAddress: shipping_details.address,
        shippingCity: shipping_details.city,
        shippingState: shipping_details.state,
        shippingPincode: shipping_details.pincode,
        shippingLandmark: shipping_details.landmark || '',
        cartItems: JSON.stringify(cartItems || []),
      };

      console.log("Payment order data being validated:", paymentOrderData);

      const validatedData = insertPaymentOrderSchema.parse(paymentOrderData);
      const paymentOrder = await storage.createPaymentOrder(validatedData);

      // Create Cashfree order
      const { cashfreeService } = await import('./cashfree-service');

      // Get the proper domain for URLs
      const protocol = req.get('x-forwarded-proto') || req.protocol;
      const host = req.get('x-forwarded-host') || req.get('host');
      const baseUrl = `${protocol}://${host}`;

      // Simplified return URL with only order_id - other data is already stored in database
      const returnUrl = `${baseUrl}/payment-success?order_id=${orderId}`;
      const notifyUrl = `${baseUrl}/api/payment/webhook`;

      console.log('Return URL length:', returnUrl.length);
      console.log('Return URL:', returnUrl);

      const cashfreeOrderData = {
        order_id: orderId,
        order_amount: parseFloat(amount.toString()),
        order_currency: currency || "INR",
        customer_details: {
          customer_id: customer_details.customer_id || `customer_${Date.now()}`,
          customer_name: customer_details.customer_name,
          customer_email: customer_details.customer_email,
          customer_phone: customer_details.customer_phone,
        },
        order_meta: {
          return_url: orderMeta?.return_url || returnUrl,
          notify_url: orderMeta?.notify_url || notifyUrl,
        }
      };

      console.log("Creating Cashfree order with base URL:", baseUrl);

      const cashfreeOrder = await cashfreeService.createOrder(cashfreeOrderData);

      // Update payment order with Cashfree session ID
      await storage.updatePaymentOrder(orderId, { 
        paymentSessionId: cashfreeOrder.payment_session_id 
      });

      console.log("Payment order created successfully:", {
        orderId: paymentOrder.orderId,
        sessionId: cashfreeOrder.payment_session_id
      });

      res.json({
        success: true,
        order_id: orderId,
        payment_session_id: cashfreeOrder.payment_session_id,
        payment_url: cashfreeOrder.payment_url,
        cf_order_id: cashfreeOrder.cf_order_id,
        message: "Order created successfully"
      });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to create order", 
        details: (error as Error).message 
      });
    }
  });

  // Payment webhook to handle Cashfree responses
  app.post("/api/payment-webhook", async (req, res) => {
    try {
      console.log("Payment webhook received:", JSON.stringify(req.body, null, 2));

      // Handle different webhook event types
      const eventType = req.body.type;
      const data = req.body.data;

      if (eventType === "PAYMENT_SUCCESS_WEBHOOK") {
        const order = data.order;
        const payment = data.payment;

        const orderId = order.order_id;
        const paymentStatus = payment.payment_status;
        const transactionId = payment.cf_payment_id;
        const paymentMethod = payment.payment_method?.type || payment.payment_method;

        if (orderId) {
          let internalStatus = "failed";
          if (paymentStatus === "SUCCESS") {
            internalStatus = "paid";
          } else if (paymentStatus === "PENDING") {
            internalStatus = "pending";
          }

          await storage.updatePaymentOrder(orderId, {
            status: internalStatus,
            transactionId: transactionId,
            paymentMethod: paymentMethod,
            gatewayResponse: JSON.stringify(req.body)
          });

          console.log("Payment order updated via webhook:", orderId, paymentStatus, "->", internalStatus);
        }
      } else {
        // Handle legacy webhook format
        const orderId = req.body.order?.order_id || req.body.order_id;
        const paymentStatus = req.body.payment?.payment_status || req.body.payment_status;
        const transactionId = req.body.payment?.cf_payment_id || req.body.transaction_id;
        const paymentMethod = req.body.payment?.payment_method || req.body.payment_method;

        if (orderId) {
          let internalStatus = "failed";
          if (paymentStatus === "SUCCESS" || paymentStatus === "PAID") {
            internalStatus = "paid";
          } else if (paymentStatus === "PENDING") {
            internalStatus = "pending";
          }

          await storage.updatePaymentOrder(orderId, {
            status: internalStatus,
            transactionId: transactionId,
            paymentMethod: paymentMethod,
            gatewayResponse: JSON.stringify(req.body)
          });

          console.log("Payment order updated via webhook:", orderId, paymentStatus, "->", internalStatus);
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Payment webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Get all payment orders (for admin)
  app.get("/api/payment-orders", async (req, res) => {
    try {
      const paymentOrders = await storage.getAllPaymentOrders();
      res.json(paymentOrders);
    } catch (error) {
      console.error("Get payment orders error:", error);
      res.status(500).json({ error: "Failed to fetch payment orders", details: (error as Error).message });
    }
  });

  // Check payment status from Cashfree
  app.get("/api/payment-status/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;

      // Get payment status from Cashfree
      const { cashfreeService } = await import('./cashfree-service');
      const paymentStatus = await cashfreeService.getPaymentStatus(orderId);

      res.json(paymentStatus);
    } catch (error) {
      console.error("Get payment status error:", error);
      res.status(500).json({ error: "Failed to fetch payment status", details: (error as Error).message });
    }
  });

  // Get specific payment order
  app.get("/api/payment-orders/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const paymentOrder = await storage.getPaymentOrder(orderId);

      if (!paymentOrder) {
        return res.status(404).json({ error: "Payment order not found" });
      }

      res.json(paymentOrder);
    } catch (error) {
      console.error("Get payment order error:", error);
      res.status(500).json({ error: "Failed to fetch payment order", details: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}