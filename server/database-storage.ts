import { eq, like, and } from "drizzle-orm";
import { db } from "./db";
import { users, books, rentals, wishlist } from "@shared/schema";
import type { 
  User, InsertUser, 
  Book, InsertBook, 
  Rental, InsertRental, 
  Wishlist, InsertWishlist 
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
    return await db.select().from(books).where(
      like(books.title, `%${query}%`)
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
    const [book] = await db
      .update(books)
      .set(updateData)
      .where(eq(books.id, id))
      .returning();
    
    if (!book) throw new Error("Book not found");
    return book;
  }

  async deleteBook(id: string): Promise<boolean> {
    const result = await db
      .delete(books)
      .where(eq(books.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Rental methods
  async getAllRentals(): Promise<Rental[]> {
    return await db.select().from(rentals);
  }

  async getRental(id: string): Promise<Rental | undefined> {
    const [rental] = await db.select().from(rentals).where(eq(rentals.id, id));
    return rental || undefined;
  }

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
    return await db.select().from(books).where(
      like(books.title, `%${query}%`)
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
    const [book] = await db
      .update(books)
      .set(updateData)
      .where(eq(books.id, id))
      .returning();
    
    if (!book) throw new Error("Book not found");
    return book;
  }

  async deleteBook(id: string): Promise<boolean> {
    const result = await db.delete(books).where(eq(books.id, id));
    return result.rowCount > 0;
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
      .where(and(eq(wishlist.userId, userId), eq(wishlist.bookId, bookId)));
    return result.rowCount > 0;
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
      and(
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
    const [book] = await db
      .update(books)
      .set(updateData)
      .where(eq(books.id, id))
      .returning();
    
    if (!book) throw new Error("Book not found");
    return book;
  }

  async deleteBook(id: string): Promise<boolean> {
    const result = await db.delete(books).where(eq(books.id, id));
    return (result.rowCount || 0) > 0;
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
}