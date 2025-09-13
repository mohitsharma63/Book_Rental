import { type User, type InsertUser, type Book, type InsertBook, type Rental, type InsertRental, type Wishlist, type InsertWishlist } from "@shared/schema";
import { randomUUID } from "crypto";
import { DatabaseStorage } from "./database-storage";


export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User>;

  // Book methods
  getAllBooks(): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  getBooksByCategory(category: string): Promise<Book[]>;
  searchBooks(query: string): Promise<Book[]>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: string, book: Partial<Book>): Promise<Book>;
  deleteBook(id: string): Promise<boolean>;

  // Rental methods
  getAllRentals(): Promise<Rental[]>;
  getRental(id: string): Promise<Rental | undefined>;
  getRentalsByUser(userId: string): Promise<Rental[]>;
  getRentalsByBook(bookId: string): Promise<Rental[]>;
  createRental(rental: InsertRental): Promise<Rental>;
  updateRental(id: string, rental: Partial<Rental>): Promise<Rental>;

  // Wishlist methods
  getWishlistByUser(userId: string): Promise<Wishlist[]>;
  addToWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: string, bookId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private books: Map<string, Book>;
  private rentals: Map<string, Rental>;
  private wishlist: Map<string, Wishlist>;

  constructor() {
    this.users = new Map();
    this.books = new Map();
    this.rentals = new Map();
    this.wishlist = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      address: insertUser.address || null,
      phone: insertUser.phone || null,
      isAdmin: insertUser.isAdmin || false,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");

    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Book methods
  async getAllBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  async getBook(id: string): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async getBooksByCategory(category: string): Promise<Book[]> {
    return Array.from(this.books.values()).filter(book => 
      book.category.toLowerCase() === category.toLowerCase()
    );
  }

  async searchBooks(query: string): Promise<Book[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.books.values()).filter(book => 
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      book.category.toLowerCase().includes(searchTerm)
    );
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = randomUUID();
    const book: Book = { 
      ...insertBook, 
      id,
      createdAt: new Date(),
      description: insertBook.description || null,
      isbn: insertBook.isbn || null,
      imageUrl: insertBook.imageUrl || null,
      publishedYear: insertBook.publishedYear || null,
      pages: insertBook.pages || null,
      rating: insertBook.rating || null,
      totalCopies: insertBook.totalCopies || 1,
      availableCopies: insertBook.availableCopies || 1,
    };
    this.books.set(id, book);
    return book;
  }

  async updateBook(id: string, updateData: Partial<Book>): Promise<Book> {
    const book = this.books.get(id);
    if (!book) throw new Error("Book not found");

    const updatedBook = { ...book, ...updateData };
    this.books.set(id, updatedBook);
    return updatedBook;
  }

  async deleteBook(id: string): Promise<boolean> {
    return this.books.delete(id);
  }

  // Rental methods
  async getAllRentals(): Promise<Rental[]> {
    return Array.from(this.rentals.values());
  }

  async getRental(id: string): Promise<Rental | undefined> {
    return this.rentals.get(id);
  }

  async getRentalsByUser(userId: string): Promise<Rental[]> {
    return Array.from(this.rentals.values()).filter(rental => rental.userId === userId);
  }

  async getRentalsByBook(bookId: string): Promise<Rental[]> {
    return Array.from(this.rentals.values()).filter(rental => rental.bookId === bookId);
  }

  async createRental(insertRental: InsertRental): Promise<Rental> {
    const id = randomUUID();
    const rental: Rental = { 
      ...insertRental, 
      id,
      createdAt: new Date(),
      status: insertRental.status || "active",
      rentalDate: insertRental.rentalDate || new Date(),
      returnDate: insertRental.returnDate || null,
    };
    this.rentals.set(id, rental);
    return rental;
  }

  async updateRental(id: string, updateData: Partial<Rental>): Promise<Rental> {
    const rental = this.rentals.get(id);
    if (!rental) throw new Error("Rental not found");

    const updatedRental = { ...rental, ...updateData };
    this.rentals.set(id, updatedRental);
    return updatedRental;
  }

  // Wishlist methods
  async getWishlistByUser(userId: string): Promise<Wishlist[]> {
    return Array.from(this.wishlist.values()).filter(wish => wish.userId === userId);
  }

  async addToWishlist(insertWishlist: InsertWishlist): Promise<Wishlist> {
    const id = randomUUID();
    const wishlistItem: Wishlist = { 
      ...insertWishlist, 
      id,
      createdAt: new Date(),
    };
    this.wishlist.set(id, wishlistItem);
    return wishlistItem;
  }

  async removeFromWishlist(userId: string, bookId: string): Promise<boolean> {
    const wishlistItem = Array.from(this.wishlist.values()).find(
      wish => wish.userId === userId && wish.bookId === bookId
    );

    if (wishlistItem) {
      return this.wishlist.delete(wishlistItem.id);
    }
    return false;
  }
}

export const storage = new DatabaseStorage();