import { eq, like, or, desc, and } from "drizzle-orm";
import { db } from "./db";
import { 
  books, 
  users, 
  rentals, 
  wishlist, 
  categories,
  contacts,
  type Book, 
  type User, 
  type Rental, 
  type Wishlist,
  type Category,
  type Contact,
  type InsertBook, 
  type InsertUser, 
  type InsertRental, 
  type InsertWishlist,
  type InsertCategory,
  type InsertContact
} from "@shared/schema";
import type { IStorage } from "./storage";

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
        .set({
          ...updateData,
          updatedAt: new Date()
        })
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
    return (result.rowCount || 0) > 0;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(categoryData)
      .returning();
    return category;
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<Category | null> {
    try {
      const [category] = await db
        .update(categories)
        .set(data)
        .where(eq(categories.id, id))
        .returning();
      return category || null;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(categories)
        .where(eq(categories.id, id));
      return result.rowCount > 0;
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
}