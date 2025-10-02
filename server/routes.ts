import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookSchema, insertRentalSchema, insertWishlistSchema, insertUserSchema, insertReviewSchema, insertPaymentOrderSchema, cashfreePayments } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { otpService } from "./otp-sevice";
import dotenv from 'dotenv';
dotenv.config();
// Cashfree configuration
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

// Log environment variables for debugging
console.log('Environment variables loaded:', {
  CASHFREE_APP_ID: CASHFREE_APP_ID ? `${CASHFREE_APP_ID.substring(0, 5)}...` : 'undefined',
  CASHFREE_SECRET_KEY: CASHFREE_SECRET_KEY ? `${CASHFREE_SECRET_KEY.substring(0, 5)}...` : 'undefined',
  CASHFREE_ENVIRONMENT: process.env.CASHFREE_ENVIRONMENT || 'not set',
  DATABASE_URL: process.env.DATABASE_URL ? 'defined' : 'undefined'
});

// Determine environment based on the CASHFREE_ENVIRONMENT variable
const CASHFREE_ENVIRONMENT = process.env.CASHFREE_ENVIRONMENT || 'sandbox';
const isProduction = CASHFREE_ENVIRONMENT === 'production';

const CASHFREE_BASE_URL = isProduction
  ? 'https://api.cashfree.com'
  : 'https://sandbox.cashfree.com';

const CASHFREE_MODE = isProduction ? 'production' : 'sandbox';

// Helper function to get current user from request
async function getCurrentUserFromRequest(req: any): Promise<any> {
  try {
    // Try to get user info from headers (sent from frontend)
    const userInfo = req.headers['x-user-info'];
    if (userInfo) {
      return JSON.parse(userInfo);
    }

    // Fallback: try to get user from request body if available
    const userId = req.body.userId || req.body.customer_details?.customer_id;
    if (userId) {
      const user = await storage.getUser(userId.toString());
      return user;
    }

    return null;
  } catch (error) {
    console.error("Error getting user from request:", error);
    return null;
  }
}

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

      // Build transformed data only with provided fields
      const transformedData: any = {};

      // Only include fields that are actually in the request and valid
      if (req.body.availableCopies !== undefined && req.body.availableCopies !== null && req.body.availableCopies !== '') {
        const val = parseInt(req.body.availableCopies);
        if (!isNaN(val)) {
          transformedData.availableCopies = val;
        }
      }
      if (req.body.totalCopies !== undefined && req.body.totalCopies !== null && req.body.totalCopies !== '') {
        const val = parseInt(req.body.totalCopies);
        if (!isNaN(val)) {
          transformedData.totalCopies = val;
        }
      }
      if (req.body.pricePerWeek !== undefined && req.body.pricePerWeek !== null && req.body.pricePerWeek !== '') {
        transformedData.pricePerWeek = req.body.pricePerWeek.toString();
      }
      if (req.body.publishedYear !== undefined && req.body.publishedYear !== null && req.body.publishedYear !== '') {
        const val = parseInt(req.body.publishedYear);
        if (!isNaN(val)) {
          transformedData.publishedYear = val;
        }
      }
      if (req.body.pages !== undefined && req.body.pages !== null && req.body.pages !== '') {
        const val = parseInt(req.body.pages);
        if (!isNaN(val)) {
          transformedData.pages = val;
        }
      }
      
      // String fields - only include if provided
      ['title', 'author', 'isbn', 'category', 'description', 'imageUrl', 'publisher', 'language', 'condition', 'format'].forEach(field => {
        if (req.body[field] !== undefined) {
          transformedData[field] = req.body[field];
        }
      });

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

  // Update order status endpoint
  app.put("/api/payment-orders/:orderId/status", async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      // Validate status for payment orders
      const validPaymentStatuses = ['pending', 'created', 'paid', 'success', 'failed', 'refunded', 'cancelled', 'processing', 'shipped', 'delivered', 'completed', 'active'];
      if (!validPaymentStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid payment status" });
      }

      const paymentOrder = await storage.updatePaymentOrderStatus(orderId, status, notes);

      if (!paymentOrder) {
        return res.status(404).json({ error: "Payment order not found" });
      }

      console.log(`Payment order ${orderId} status updated to ${status} by admin`);

      res.json(paymentOrder);
    } catch (error) {
      console.error("Update payment order status error:", error);
      res.status(500).json({ error: "Failed to update payment order status", details: (error as Error).message });
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


  app.get("/api/payment-orders", async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (userId) {
        // Filter payment orders by user ID
        const allPaymentOrders = await storage.getAllPaymentOrders();
        const userPaymentOrders = allPaymentOrders.filter(order => order.userId === userId);
        res.json(userPaymentOrders);
      } else {
        // Return all payment orders (for admin)
        const paymentOrders = await storage.getAllPaymentOrders();
        res.json(paymentOrders);
      }
    } catch (error) {
      console.error("Get payment orders error:", error);
      res.status(500).json({ error: "Failed to fetch payment orders", details: (error as Error).message });
    }
  });





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

  // Delivery routes
  app.post("/api/deliveries", async (req, res) => {
    try {
      const deliveryData = req.body;
      const delivery = await storage.createDelivery(deliveryData);
      res.status(201).json(delivery);
    } catch (error) {
      console.error("Create delivery error:", error);
      res.status(500).json({ error: "Failed to create delivery", details: (error as Error).message });
    }
  });

  app.get("/api/deliveries", async (req, res) => {
    try {
      const deliveries = await storage.getAllDeliveries();
      res.json(deliveries);
    } catch (error) {
      console.error("Get deliveries error:", error);
      res.status(500).json({ error: "Failed to fetch deliveries", details: (error as Error).message });
    }
  });

  app.get("/api/deliveries/order/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const delivery = await storage.getDeliveryByOrderId(orderId);

      if (!delivery) {
        return res.status(404).json({ error: "Delivery not found" });
      }

      res.json(delivery);
    } catch (error) {
      console.error("Get delivery by order error:", error);
      res.status(500).json({ error: "Failed to fetch delivery", details: (error as Error).message });
    }
  });

  app.get("/api/deliveries/:id/tracking", async (req, res) => {
    try {
      const deliveryId = parseInt(req.params.id);
      const tracking = await storage.getDeliveryTracking(deliveryId);
      res.json(tracking);
    } catch (error) {
      console.error("Get delivery tracking error:", error);
      res.status(500).json({ error: "Failed to fetch delivery tracking", details: (error as Error).message });
    }
  });

  app.put("/api/deliveries/:id/status", async (req, res) => {
    try {
      const deliveryId = parseInt(req.params.id);
      const { status, location, description } = req.body;

      const delivery = await storage.updateDeliveryStatus(deliveryId, status, location, description);
      res.json(delivery);
    } catch (error) {
      console.error("Update delivery status error:", error);
      res.status(500).json({ error: "Failed to update delivery status", details: (error as Error).message });
    }
  });

  // Return routes
  app.post("/api/returns", async (req, res) => {
    try {
      const returnData = req.body;
      const returnRecord = await storage.createReturn(returnData);
      res.status(201).json(returnRecord);
    } catch (error) {
      console.error("Create return error:", error);
      res.status(500).json({ error: "Failed to create return", details: (error as Error).message });
    }
  });

  app.get("/api/returns", async (req, res) => {
    try {
      const { userId } = req.query;

      let returns;
      if (userId) {
        returns = await storage.getReturnsByUser(userId as string);
      } else {
        returns = await storage.getAllReturns();
      }

      res.json(returns);
    } catch (error) {
      console.error("Get returns error:", error);
      res.status(500).json({ error: "Failed to fetch returns", details: (error as Error).message });
    }
  });

  app.get("/api/returns/:id", async (req, res) => {
    try {
      const returnId = parseInt(req.params.id);
      const returnRecord = await storage.getReturn(returnId);

      if (!returnRecord) {
        return res.status(404).json({ error: "Return not found" });
      }

      res.json(returnRecord);
    } catch (error) {
      console.error("Get return error:", error);
      res.status(500).json({ error: "Failed to fetch return", details: (error as Error).message });
    }
  });

  app.put("/api/returns/:id/status", async (req, res) => {
    try {
      const returnId = parseInt(req.params.id);
      const { status, adminNotes } = req.body;

      const returnRecord = await storage.updateReturnStatus(returnId, status, adminNotes);
      res.json(returnRecord);
    } catch (error) {
      console.error("Update return status error:", error);
      res.status(500).json({ error: "Failed to update return status", details: (error as Error).message });
    }
  });

  // Cashfree Payment Routes
  app.post('/api/payments/cashfree/create-order', async (req, res) => {
    try {
      const { amount, orderId, currency, customerDetails, orderNote, orderData } = req.body;

      // Validate required fields
      if (!amount || !orderId || !currency || !customerDetails) {
        return res.status(400).json({
          error: "Missing required fields: amount, orderId, currency, and customerDetails are required"
        });
      }

      // Validate customerDetails structure
      if (!customerDetails.customerId || !customerDetails.customerName || !customerDetails.customerEmail) {
        return res.status(400).json({
          error: "customerDetails must include customerId, customerName, and customerEmail"
        });
      }
console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",CASHFREE_APP_ID)
      // Check if Cashfree is configured
      console.log("Cashfree configuration check:", {
        hasAppId: !!CASHFREE_APP_ID,
        hasSecretKey: !!CASHFREE_SECRET_KEY,
        appIdValue: CASHFREE_APP_ID,
        secretKeyLength: CASHFREE_SECRET_KEY?.length,
        appIdIsDefault: CASHFREE_APP_ID === 'cashfree_app_id',
        secretKeyIsDefault: CASHFREE_SECRET_KEY === 'cashfree_secret_key'
      });

      if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY ||
          CASHFREE_APP_ID === 'cashfree_app_id' || CASHFREE_SECRET_KEY === 'cashfree_secret_key' ||
          CASHFREE_APP_ID.trim() === '' || CASHFREE_SECRET_KEY.trim() === '') {
        console.log("Cashfree not configured properly");
        return res.status(400).json({
          error: "Cashfree payment gateway is not configured",
          configError: true
        });
      }

      console.log("Creating Cashfree order:", {
        orderId,
        amount,
        currency,
        customer: customerDetails.customerName
      });

      // Create Cashfree order payload with proper HTTPS URLs
      const host = req.get('host');

      // Always use HTTPS for Cashfree as it requires secure URLs
      let protocol = 'https';

      // For Replit development, use the replit.dev domain with HTTPS
      let returnHost = host;
      if (host && (host.includes('localhost') || host.includes('127.0.0.1') || host.includes('0.0.0.0'))) {
        // For local development, we need to use a publicly accessible HTTPS URL
        // Since Cashfree requires HTTPS, we'll use the Replit preview URL
        const replitHost = process.env.REPL_SLUG ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : host;
        returnHost = replitHost;
        protocol = 'https';
      }

      const cashfreePayload = {
        order_id: orderId,
        order_amount: amount,
        order_currency: currency,
        customer_details: {
          customer_id: customerDetails.customerId,
          customer_name: customerDetails.customerName,
          customer_email: customerDetails.customerEmail,
          customer_phone: customerDetails.customerPhone || '9999999999'
        },
        order_meta: {
          return_url: `${protocol}://${returnHost}/checkout?payment=processing&orderId=${orderId}`,
          notify_url: `${protocol}://${returnHost}/api/payments/cashfree/webhook`
        },
        order_note: orderNote || 'BookWise Purchase'
      };

      console.log("Cashfree API URL:", `${CASHFREE_BASE_URL}/pg/orders`);
      console.log("Cashfree payload:", JSON.stringify(cashfreePayload, null, 2));

      // Call Cashfree API
      const cashfreeResponse = await fetch(`${CASHFREE_BASE_URL}/pg/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2023-08-01',
          'x-client-id': CASHFREE_APP_ID,
          'x-client-secret': CASHFREE_SECRET_KEY,
        },
        body: JSON.stringify(cashfreePayload)
      });

      const cashfreeResult = await cashfreeResponse.json();

      console.log("Cashfree API response status:", cashfreeResponse.status);
      console.log("Cashfree API response:", JSON.stringify(cashfreeResult, null, 2));

      if (!cashfreeResponse.ok) {
        console.error("Cashfree API error:", cashfreeResult);
        return res.status(400).json({
          error: cashfreeResult.message || "Failed to create Cashfree order",
          cashfreeError: true,
          details: cashfreeResult
        });
      }

      // Store payment record in database
      try {
        await db.insert(cashfreePayments).values({
          cashfreeOrderId: orderId,
          userId: parseInt(customerDetails.customerId),
          amount: amount,
          status: 'created',
          orderData: JSON.stringify(orderData || {}),
          customerInfo: JSON.stringify(customerDetails)
        });
      } catch (dbError) {
        console.error("Database error storing payment:", dbError);
        // Continue even if database storage fails
      }

      // Return payment session details
      res.json({
        orderId: orderId,
        paymentSessionId: cashfreeResult.payment_session_id,
        environment: CASHFREE_MODE,
        message: "Order created successfully"
      });

    } catch (error) {
      console.error("Cashfree create order error:", error);
      res.status(500).json({
        error: "Failed to create payment order",
        details: (error as Error).message
      });
    }
  });

  app.post('/api/payments/cashfree/verify', async (req, res) => {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" });
      }

      console.log("Verifying payment for order:", orderId);

      // Check Cashfree configuration
      if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY ||
          CASHFREE_APP_ID === 'cashfree_app_id' || CASHFREE_SECRET_KEY === 'cashfree_secret_key' ||
          CASHFREE_APP_ID.trim() === '' || CASHFREE_SECRET_KEY.trim() === '') {
        return res.status(400).json({
          error: "Cashfree payment gateway is not configured",
          verified: false
        });
      }

      // Get order status from Cashfree
      const statusResponse = await fetch(`${CASHFREE_BASE_URL}/pg/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2023-08-01',
          'x-client-id': CASHFREE_APP_ID,
          'x-client-secret': CASHFREE_SECRET_KEY,
        }
      });

      const statusResult = await statusResponse.json();

      console.log("Payment verification response:", JSON.stringify(statusResult, null, 2));

      if (!statusResponse.ok) {
        console.error("Cashfree verification error:", statusResult);
        return res.json({
          verified: false,
          error: "Failed to verify payment status"
        });
      }

      const isPaymentSuccessful = statusResult.order_status === 'PAID';

      // Update payment record in database
      try {
        await db.update(cashfreePayments)
          .set({
            status: isPaymentSuccessful ? 'completed' : 'failed',
            paymentId: statusResult.cf_order_id || null,
            completedAt: isPaymentSuccessful ? new Date() : null
          })
          .where(eq(cashfreePayments.cashfreeOrderId, orderId));

        // If payment is successful, create rental in the system
        if (isPaymentSuccessful) {
          // Get cashfree payment details
          const cashfreePayment = await db
            .select()
            .from(cashfreePayments)
            .where(eq(cashfreePayments.cashfreeOrderId, orderId))
            .limit(1);

          if (cashfreePayment.length > 0) {
            const payment = cashfreePayment[0];
            const orderData = typeof payment.orderData === 'string' 
              ? JSON.parse(payment.orderData) 
              : payment.orderData;

            // Create rental records for books
            if (orderData.items && Array.isArray(orderData.items)) {
              for (const item of orderData.items) {
                if (item.bookId) {
                  try {
                    const rentalData = {
                      userId: payment.userId.toString(),
                      bookId: item.bookId,
                      startDate: new Date(),
                      endDate: new Date(Date.now() + (item.rentalDays || 7) * 24 * 60 * 60 * 1000), // Default 7 days
                      status: 'active' as const,
                      totalAmount: item.price
                    };

                    await storage.createRental(rentalData);
                    console.log("Rental created for book:", item.bookId);
                  } catch (rentalError) {
                    console.error("Failed to create rental for book:", item.bookId, rentalError);
                  }
                }
              }
            }
          }
        }
      } catch (dbError) {
        console.error("Database error updating payment:", dbError);
      }

      res.json({
        verified: isPaymentSuccessful,
        status: statusResult.order_status,
        paymentId: statusResult.cf_order_id,
        message: isPaymentSuccessful ? "Payment verified successfully" : "Payment verification failed"
      });

    } catch (error) {
      console.error("Payment verification error:", error);
      res.json({
        verified: false,
        error: "Payment verification failed"
      });
    }
  });

  // COD Order creation endpoint
  app.post("/api/create-order", async (req, res) => {
    try {
      const { amount, currency, customer_details, shipping_details, cartItems, userId } = req.body;

      console.log("Creating COD order with data:", {
        amount,
        currency,
        customer: customer_details?.customer_name,
        itemsCount: cartItems?.length,
        userId: userId || customer_details?.customer_id
      });

      // Validate required fields
      if (!amount || !customer_details || !cartItems || !Array.isArray(cartItems)) {
        return res.status(400).json({
          error: "Missing required fields: amount, customer_details, and cartItems are required"
        });
      }

      // Get user ID from multiple sources
      let userIdToUse = userId || customer_details?.customer_id;

      // Try to get user from request headers or body
      const user = await getCurrentUserFromRequest(req);
      if (user) {
        userIdToUse = user.id;
      }

      if (!userIdToUse) {
        return res.status(401).json({ error: "User authentication required" });
      }

      // Get full user details
      const userDetails = await storage.getUser(userIdToUse.toString());
      if (!userDetails) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate unique order ID
      const orderId = `COD-${Date.now()}-${userIdToUse}`;

      // Create payment order record for COD
      const paymentOrderData = {
        orderId: orderId,
        userId: userIdToUse.toString(), // Make sure userId is a string to match schema
        customerName: customer_details.customer_name || `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim(),
        customerEmail: customer_details.customer_email || userDetails.email,
        customerPhone: customer_details.customer_phone || userDetails.phone || '9999999999',
        amount: amount,
        currency: currency || 'INR',
        status: 'pending' as const,
        paymentMethod: 'cod',
        shippingAddress: shipping_details?.address || userDetails.address || 'Address not provided',
        shippingCity: shipping_details?.city || 'City not provided',
        shippingState: shipping_details?.state || 'State not provided',
        shippingPincode: shipping_details?.pincode || '000000',
        shippingLandmark: shipping_details?.landmark || null,
        cartItems: JSON.stringify(cartItems.map(item => ({
          bookId: item.id,
          bookTitle: item.title,
          bookImage: item.imageUrl,
          quantity: item.quantity,
          price: item.price,
          rentalDays: (item.rentalDuration || 4) * 7 // Convert weeks to days
        })))
      };

      const paymentOrder = await storage.createPaymentOrder(paymentOrderData);

      // Create rental records for each book in the cart
      for (const item of cartItems) {
        if (item.id) {
          try {
            const rentalData = {
              userId: userIdToUse.toString(),
              bookId: item.id,
              startDate: new Date(),
              endDate: new Date(Date.now() + (item.rentalDuration || 4) * 7 * 24 * 60 * 60 * 1000), // Convert weeks to milliseconds
              status: 'pending' as const, // COD orders start as pending
              totalAmount: parseFloat(item.price?.toString() || "0") * item.quantity
            };

            await storage.createRental(rentalData);
            console.log("Rental created for COD order:", item.id);
          } catch (rentalError) {
            console.error("Failed to create rental for book:", item.id, rentalError);
          }
        }
      }

      console.log("COD order created successfully:", orderId);

      res.json({
        success: true,
        orderId: orderId,
        paymentMethod: 'cod',
        message: "COD order created successfully"
      });

    } catch (error) {
      console.error("COD order creation error:", error);
      res.status(500).json({
        error: "Failed to create COD order",
        details: (error as Error).message
      });
    }
  });

  app.post("/api/admin/sync-cashfree-orders", async (req, res) => {
    try {
      console.log("Syncing Cashfree orders to rentals...");

      // Get all completed Cashfree payments
      const completedPayments = await db
        .select()
        .from(cashfreePayments)
        .where(eq(cashfreePayments.status, 'completed'));

      let syncedCount = 0;

      for (const payment of completedPayments) {
        try {
          const orderData = typeof payment.orderData === 'string' 
            ? JSON.parse(payment.orderData) 
            : payment.orderData;

          // Create rental records for books
          if (orderData.items && Array.isArray(orderData.items)) {
            for (const item of orderData.items) {
              if (item.bookId) {
                // Check if rental already exists
                const existingRentals = await storage.getRentalsByUser(payment.userId.toString());
                const hasExistingRental = existingRentals.some(rental => 
                  rental.bookId === item.bookId && 
                  rental.status === 'active'
                );

                if (!hasExistingRental) {
                  const rentalData = {
                    userId: payment.userId.toString(),
                    bookId: item.bookId,
                    startDate: payment.createdAt || new Date(),
                    endDate: new Date((payment.createdAt || new Date()).getTime() + (item.rentalDays || 7) * 24 * 60 * 60 * 1000),
                    status: 'active' as const,
                    totalAmount: item.price
                  };

                  await storage.createRental(rentalData);
                  syncedCount++;
                  console.log(`Synced rental for order: ${payment.cashfreeOrderId}, book: ${item.bookId}`);
                }
              }
            }
          }
        } catch (error) {
          console.error(`Failed to sync order ${payment.cashfreeOrderId}:`, error);
        }
      }

      res.json({
        message: `Successfully synced ${syncedCount} Cashfree orders to rentals`,
        syncedCount,
        totalPayments: completedPayments.length
      });
    } catch (error) {
      console.error("Error syncing Cashfree orders:", error);
      res.status(500).json({ error: "Failed to sync Cashfree orders" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}