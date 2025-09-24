import { eq, like, or, desc, and } from "drizzle-orm";
import { db } from "./db";
import {
  books,
  users,
  rentals,
  wishlist,
  categories,
  contacts,
  reviews,
  sliders,
  paymentOrders,
  type Book,
  type User,
  type Rental,
  type Wishlist,
  type Category,
  type Contact,
  type Review,
  type Slider,
  type PaymentOrder,
  type InsertBook,
  type InsertUser,
  type InsertRental,
  type InsertWishlist,
  type InsertCategory,
  type InsertContact,
  type InsertReview,
  type InsertSlider,
  type InsertPaymentOrder
} from "@shared/schema";
import type { IStorage } from "./interfaces";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    if (!user) throw new Error("User not found");
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Book methods
  async getAllBooks(): Promise<Book[]> {
    return await db.select().from(books);
  }

  async getBook(id: string): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book || undefined;
  }

  async getBookById(id: string): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book || undefined;
  }

  async getBooksByCategory(category: string): Promise<Book[]> {
    return await db.select().from(books).where(eq(books.category, category));
  }

  async searchBooks(query: string): Promise<Book[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return await db.select().from(books).where(
      or(
        like(books.title, searchTerm),
        like(books.author, searchTerm),
        like(books.category, searchTerm)
      )
    );
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const [book] = await db
      .insert(books)
      .values(insertBook)
      .returning();
    return book;
  }

  async updateBook(id: string, updateData: Partial<Book>): Promise<Book> {
    try {
      console.log("DatabaseStorage: Updating book", id, "with data:", updateData);

      const [book] = await db
        .update(books)
        .set(updateData)
        .where(eq(books.id, id))
        .returning();

      if (!book) {
        console.log("DatabaseStorage: Book not found for update:", id);
        throw new Error("Book not found");
      }

      console.log("DatabaseStorage: Book updated successfully:", book.id);
      return book;
    } catch (error) {
      console.error("DatabaseStorage: Error updating book:", error);
      throw error;
    }
  }

  async deleteBook(id: string): Promise<boolean> {
    try {
      console.log("DatabaseStorage: Deleting book with ID:", id);

      const result = await db.delete(books).where(eq(books.id, id));
      const success = (result.rowCount || 0) > 0;

      console.log("DatabaseStorage: Delete result:", success, "rows affected:", result.rowCount);
      return success;
    } catch (error) {
      console.error("DatabaseStorage: Error deleting book:", error);
      throw error;
    }
  }

  // Rental methods
  async getAllRentals(): Promise<Rental[]> {
    return await db.select().from(rentals);
  }

  async getRental(id: string): Promise<Rental | undefined> {
    const [rental] = await db.select().from(rentals).where(eq(rentals.id, id));
    return rental || undefined;
  }

  async getRentalsByUser(userId: string): Promise<Rental[]> {
    return await db.select().from(rentals).where(eq(rentals.userId, userId));
  }

  async getRentalsByBook(bookId: string): Promise<Rental[]> {
    return await db.select().from(rentals).where(eq(rentals.bookId, bookId));
  }

  async createRental(insertRental: InsertRental): Promise<Rental> {
    const [rental] = await db
      .insert(rentals)
      .values(insertRental)
      .returning();
    return rental;
  }

  async updateRental(id: string, updateData: Partial<Rental>): Promise<Rental> {
    const [rental] = await db
      .update(rentals)
      .set(updateData)
      .where(eq(rentals.id, id))
      .returning();

    if (!rental) throw new Error("Rental not found");
    return rental;
  }

  // Wishlist methods
  async getWishlistByUser(userId: string): Promise<Wishlist[]> {
    return await db.select().from(wishlist).where(eq(wishlist.userId, userId));
  }

  async addToWishlist(insertWishlist: InsertWishlist): Promise<Wishlist> {
    const [wishlistItem] = await db
      .insert(wishlist)
      .values(insertWishlist)
      .returning();
    return wishlistItem;
  }

  async removeFromWishlist(userId: string, bookId: string): Promise<boolean> {
    const result = await db
      .delete(wishlist)
      .where(and(
        eq(wishlist.userId, userId),
        eq(wishlist.bookId, bookId)
      ));
    return (result as any).rowCount > 0;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    console.log("DatabaseStorage: Creating category with data:", categoryData);
    const [category] = await db
      .insert(categories)
      .values({
        name: categoryData.name,
        description: categoryData.description || "",
        imageUrl: categoryData.imageUrl,
        isActive: categoryData.isActive !== false
      })
      .returning();
    console.log("DatabaseStorage: Category created:", category);
    return category;
  }

  async updateCategory(id: number, updateData: Partial<Category>): Promise<Category | null> {
    console.log("DatabaseStorage: Updating category", id, "with data:", updateData);
    const [category] = await db
      .update(categories)
      .set({
        name: updateData.name,
        description: updateData.description,
        imageUrl: updateData.imageUrl,
        isActive: updateData.isActive
      })
      .where(eq(categories.id, id))
      .returning();
    console.log("DatabaseStorage: Category updated:", category);
    return category;
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(categories)
        .where(eq(categories.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }

  // Contact methods
  async createContact(contactData: InsertContact): Promise<Contact> {
    try {
      const [contact] = await db
        .insert(contacts)
        .values(contactData)
        .returning();
      return contact;
    } catch (error) {
      console.error("Error creating contact:", error);
      throw error;
    }
  }

  async getAllContacts(): Promise<Contact[]> {
    try {
      return await db
        .select()
        .from(contacts)
        .orderBy(desc(contacts.createdAt));
    } catch (error) {
      console.error("Error getting all contacts:", error);
      throw error;
    }
  }

  async updateContactStatus(id: string, status: string): Promise<Contact | null> {
    try {
      const [contact] = await db
        .update(contacts)
        .set({ status })
        .where(eq(contacts.id, id))
        .returning();
      return contact || null;
    } catch (error) {
      console.error("Error updating contact status:", error);
      throw error;
    }
  }

  // Review methods
  async getReviewsByBook(bookId: string): Promise<Review[]> {
    try {
      return await db
        .select({
          id: reviews.id,
          userId: reviews.userId,
          bookId: reviews.bookId,
          rating: reviews.rating,
          comment: reviews.comment,
          createdAt: reviews.createdAt,
          user: {
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email
          }
        })
        .from(reviews)
        .innerJoin(users, eq(reviews.userId, users.id))
        .where(eq(reviews.bookId, bookId))
        .orderBy(desc(reviews.createdAt));
    } catch (error) {
      console.error("Error getting reviews by book:", error);
      throw error;
    }
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    try {
      const [review] = await db
        .insert(reviews)
        .values(insertReview)
        .returning();
      return review;
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    try {
      return await db
        .select()
        .from(reviews)
        .where(eq(reviews.userId, userId))
        .orderBy(desc(reviews.createdAt));
    } catch (error) {
      console.error("Error getting reviews by user:", error);
      throw error;
    }
  }

  // Slider methods
  async getSliders(): Promise<Slider[]> {
    try {
      console.log("DatabaseStorage: Getting sliders");
      const result = await db
        .select()
        .from(sliders)
        .orderBy(sliders.order, sliders.createdAt);
      console.log("DatabaseStorage: Sliders retrieved:", result.length);
      return result;
    } catch (error) {
      console.error("Error getting sliders:", error);
      throw error;
    }
  }

  async getActiveSliders(): Promise<Slider[]> {
    try {
      console.log("DatabaseStorage: Getting active sliders");
      const result = await db
        .select()
        .from(sliders)
        .where(eq(sliders.isActive, true))
        .orderBy(sliders.order, sliders.createdAt);
      console.log("DatabaseStorage: Active sliders retrieved:", result.length);
      return result;
    } catch (error) {
      console.error("Error getting active sliders:", error);
      throw error;
    }
  }

  async createSlider(sliderData: InsertSlider): Promise<Slider> {
    try {
      console.log("DatabaseStorage: Creating slider with data:", sliderData);
      const [slider] = await db
        .insert(sliders)
        .values({
          title: sliderData.title,
          description: sliderData.description || "",
          imageUrl: sliderData.imageUrl,
          linkUrl: sliderData.linkUrl,
          buttonText: sliderData.buttonText,
          order: sliderData.order || 0,
          isActive: sliderData.isActive !== false
        })
        .returning();
      console.log("DatabaseStorage: Slider created:", slider);
      return slider;
    } catch (error) {
      console.error("Error creating slider:", error);
      throw error;
    }
  }

  async updateSlider(id: number, updateData: Partial<Slider>): Promise<Slider | null> {
    try {
      console.log("DatabaseStorage: Updating slider", id, "with data:", updateData);
      const [slider] = await db
        .update(sliders)
        .set({
          title: updateData.title,
          description: updateData.description,
          imageUrl: updateData.imageUrl,
          linkUrl: updateData.linkUrl,
          buttonText: updateData.buttonText,
          order: updateData.order,
          isActive: updateData.isActive
        })
        .where(eq(sliders.id, id))
        .returning();
      console.log("DatabaseStorage: Slider updated:", slider);
      return slider;
    } catch (error) {
      console.error("Error updating slider:", error);
      throw error;
    }
  }

  async deleteSlider(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(sliders)
        .where(eq(sliders.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting slider:", error);
      throw error;
    }
  }

  // Payment Order methods
  async createPaymentOrder(insertPaymentOrder: InsertPaymentOrder): Promise<PaymentOrder> {
    try {
      console.log("DatabaseStorage: Creating payment order with data:", insertPaymentOrder);
      const [paymentOrder] = await db
        .insert(paymentOrders)
        .values(insertPaymentOrder)
        .returning();
      console.log("DatabaseStorage: Payment order created:", paymentOrder);
      return paymentOrder;
    } catch (error) {
      console.error("Error creating payment order:", error);
      throw error;
    }
  }

  async getPaymentOrder(orderId: string): Promise<PaymentOrder | undefined> {
    try {
      const [paymentOrder] = await db
        .select()
        .from(paymentOrders)
        .where(eq(paymentOrders.orderId, orderId));
      return paymentOrder || undefined;
    } catch (error) {
      console.error("Error getting payment order:", error);
      throw error;
    }
  }

  async updatePaymentOrder(orderId: string, updateData: Partial<PaymentOrder>): Promise<PaymentOrder> {
    try {
      console.log("DatabaseStorage: Updating payment order", orderId, "with data:", updateData);
      const [paymentOrder] = await db
        .update(paymentOrders)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(paymentOrders.orderId, orderId))
        .returning();
      
      if (!paymentOrder) {
        throw new Error("Payment order not found");
      }
      
      console.log("DatabaseStorage: Payment order updated:", paymentOrder);
      return paymentOrder;
    } catch (error) {
      console.error("Error updating payment order:", error);
      throw error;
    }
  }

  async getAllPaymentOrders(): Promise<PaymentOrder[]> {
    try {
      return await db
        .select()
        .from(paymentOrders)
        .orderBy(desc(paymentOrders.createdAt));
    } catch (error) {
      console.error("Error getting all payment orders:", error);
      throw error;
    }
  }
}