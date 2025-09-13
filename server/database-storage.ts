import { eq, like, and, or } from "drizzle-orm";
import { db } from "./db";
import { users, books, rentals, wishlist, categories } from "@shared/schema";
import type { 
  User, InsertUser, 
  Book, InsertBook, 
  Rental, InsertRental, 
  Wishlist, InsertWishlist,
  Category, InsertCategory
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

  async updateCategory(id: number, updates: Partial<Category>): Promise<Category | null> {
    const [category] = await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();

    return category || null;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Override getAllBooks to provide sample data that matches categories
  async getAllBooks(): Promise<Book[]> {
    const sampleBooks = await super.getAllBooks();
    
    // If no books in database, return sample books that match our categories
    if (sampleBooks.length === 0) {
      return [
        {
          id: "sample-1",
          title: "The Psychology of Money",
          author: "Morgan Housel",
          isbn: "9780857199096",
          category: "Finance",
          description: "Timeless lessons on wealth, greed, and happiness",
          imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
          publishedYear: 2020,
          pages: 256,
          publisher: "Harriman House",
          language: "English",
          format: "Paperback",
          condition: "New",
          pricePerWeek: 12.99,
          availableCopies: 8,
          totalCopies: 10,
          rating: "4.8",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "sample-2",
          title: "Atomic Habits",
          author: "James Clear",
          isbn: "9780735211292",
          category: "Self-Help",
          description: "An easy & proven way to build good habits & break bad ones",
          imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
          publishedYear: 2018,
          pages: 320,
          publisher: "Avery",
          language: "English",
          format: "Paperback",
          condition: "New",
          pricePerWeek: 14.99,
          availableCopies: 5,
          totalCopies: 8,
          rating: "4.9",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "sample-3",
          title: "The Silent Patient",
          author: "Alex Michaelides",
          isbn: "9781250301697",
          category: "Thriller",
          description: "A psychological thriller about a woman's refusal to speak",
          imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
          publishedYear: 2019,
          pages: 336,
          publisher: "Celadon Books",
          language: "English",
          format: "Paperback",
          condition: "New",
          pricePerWeek: 11.99,
          availableCopies: 3,
          totalCopies: 6,
          rating: "4.5",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "sample-4",
          title: "Where the Crawdads Sing",
          author: "Delia Owens",
          isbn: "9780735219090",
          category: "Fiction",
          description: "A coming-of-age story and murder mystery",
          imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
          publishedYear: 2018,
          pages: 368,
          publisher: "G.P. Putnam's Sons",
          language: "English",
          format: "Paperback",
          condition: "New",
          pricePerWeek: 13.99,
          availableCopies: 4,
          totalCopies: 7,
          rating: "4.6",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "sample-5",
          title: "Dune",
          author: "Frank Herbert",
          isbn: "9780441013593",
          category: "Sci-Fi",
          description: "Epic science fiction novel set on the desert planet Arrakis",
          imageUrl: "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
          publishedYear: 1965,
          pages: 688,
          publisher: "Ace Books",
          language: "English",
          format: "Paperback",
          condition: "Good",
          pricePerWeek: 10.99,
          availableCopies: 2,
          totalCopies: 5,
          rating: "4.7",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ] as Book[];
    }
    
    return sampleBooks;
  }
}