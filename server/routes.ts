import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookSchema, insertRentalSchema, insertWishlistSchema, insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {

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
      res.status(500).json({ message: "Failed to fetch books", details: error.message });
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
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  app.post("/api/books", async (req, res) => {
    try {
      console.log("Received book data:", req.body);

      // Transform the data to match schema expectations
      const transformedData = {
        ...req.body,
        pricePerWeek: parseFloat(req.body.pricePerWeek),
        publishedYear: req.body.publishedYear ? parseInt(req.body.publishedYear) : null,
        pages: req.body.pages ? parseInt(req.body.pages) : null,
      };

      const bookData = insertBookSchema.parse(req.body);
      console.log("Validated book data:", bookData);

      // Create book with properly parsed numeric values
      const bookToCreate = {
        ...bookData,
        pricePerWeek: parseFloat(bookData.pricePerWeek),
      };

      const book = await storage.createBook(bookToCreate);
      res.status(201).json(book);
    } catch (error) {
      console.error("Book creation error:", error);
      res.status(400).json({ message: "Invalid book data", error: error.message });
    }
  });

  app.put("/api/books/:id", async (req, res) => {
    try {
      console.log("Updating book with ID:", req.params.id);
      console.log("Update data:", req.body);

      // Transform the data to match schema expectations
      const transformedData = {
        ...req.body,
        pricePerWeek: parseFloat(req.body.pricePerWeek),
        totalCopies: parseInt(req.body.totalCopies),
        publishedYear: req.body.publishedYear ? parseInt(req.body.publishedYear) : null,
        pages: req.body.pages ? parseInt(req.body.pages) : null,
      };

      const book = await storage.updateBook(req.params.id, transformedData);
      console.log("Book updated successfully:", book.id);
      res.json(book);
    } catch (error) {
      console.error("Update book error:", error);
      res.status(500).json({ message: "Failed to update book", error: error.message });
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
      res.status(500).json({ message: "Failed to delete book", error: error.message });
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
      res.status(500).json({ message: "Failed to fetch rentals" });
    }
  });

  app.post("/api/rentals", async (req, res) => {
    try {
      const rentalData = insertRentalSchema.parse(req.body);
      const rental = await storage.createRental(rentalData);
      res.status(201).json(rental);
    } catch (error) {
      res.status(400).json({ message: "Invalid rental data" });
    }
  });

  app.put("/api/rentals/:id", async (req, res) => {
    try {
      const rental = await storage.updateRental(req.params.id, req.body);
      res.json(rental);
    } catch (error) {
      res.status(500).json({ message: "Failed to update rental" });
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
      res.status(500).json({ message: "Failed to fetch users", details: error.message });
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
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:id/suspend", async (req, res) => {
    try {
      const { id } = req.params;
      const { suspended } = req.body;

      console.log('Suspending user:', id, 'suspended status:', suspended);

      const user = await storage.updateUser(id, { 
        suspended: suspended,
        updatedAt: new Date()
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
      res.status(500).json({ message: "Failed to suspend user", error: error.message });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist/:userId", async (req, res) => {
    try {
      const wishlist = await storage.getWishlistByUser(req.params.userId);
      res.json(wishlist);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post("/api/wishlist", async (req, res) => {
    try {
      const wishlistData = insertWishlistSchema.parse(req.body);
      const wishlistItem = await storage.addToWishlist(wishlistData);
      res.status(201).json(wishlistItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid wishlist data" });
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
      res.status(500).json({ message: "Failed to remove from wishlist" });
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
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Get all contacts (for admin)
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Get contacts error:", error);
      res.status(500).json({ error: "Failed to fetch contacts" });
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
      res.status(500).json({ error: "Failed to fetch contact stats" });
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
      res.status(500).json({ error: "Failed to update contact status" });
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
      res.status(500).json({ error: "Failed to fetch categories", details: error.message });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const { name, description, imageUrl, isActive = true } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Category name is required" });
      }

      const category = await storage.createCategory({
        name,
        description: description || "",
        image_url: imageUrl || null,
        isActive,
        createdAt: new Date()
      });

      res.json(category);
    } catch (error) {
      console.error("Create category error:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, imageUrl, isActive } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Category name is required" });
      }

      const category = await storage.updateCategory(parseInt(id), {
        name,
        description: description || "",
        image_url: imageUrl || null,
        isActive
      });

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      console.error("Update category error:", error);
      res.status(500).json({ error: "Failed to update category" });
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
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}