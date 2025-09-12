import { type User, type InsertUser, type Book, type InsertBook, type Rental, type InsertRental, type Wishlist, type InsertWishlist } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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
    this.seedData();
  }

  private seedData() {
    // Seed users
    const sampleUsers: User[] = [
      {
        id: "user1",
        username: "john_doe",
        email: "john.doe@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        phone: "+1 (555) 123-4567",
        address: "123 Main Street, Anytown, NY 12345",
        isAdmin: false,
        createdAt: new Date("2024-01-15"),
      },
      {
        id: "admin1",
        username: "admin",
        email: "admin@bookwise.com",
        password: "admin123",
        firstName: "Admin",
        lastName: "User",
        phone: "+1 (555) 999-0000",
        address: "456 Admin St, Admin City, AC 00000",
        isAdmin: true,
        createdAt: new Date("2024-01-01"),
      },
    ];

    // Seed books
    const sampleBooks: Book[] = [
      {
        id: "book1",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "9780743273565",
        category: "Fiction",
        description: "A classic American novel set in the Jazz Age, exploring themes of decadence, idealism, resistance to change, social upheaval, and excess.",
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        pricePerWeek: "3.99",
        totalCopies: 3,
        availableCopies: 2,
        publishedYear: 1925,
        pages: 180,
        rating: "4.2",
        createdAt: new Date("2024-01-10"),
      },
      {
        id: "book2",
        title: "Gone Girl",
        author: "Gillian Flynn",
        isbn: "9780307588371",
        category: "Mystery",
        description: "A psychological thriller about a marriage gone terribly wrong, with twists that will keep you guessing until the end.",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        pricePerWeek: "4.99",
        totalCopies: 2,
        availableCopies: 1,
        publishedYear: 2012,
        pages: 419,
        rating: "4.0",
        createdAt: new Date("2024-01-10"),
      },
      {
        id: "book3",
        title: "Dune",
        author: "Frank Herbert",
        isbn: "9780441013593",
        category: "Sci-Fi",
        description: "A science fiction masterpiece set on the desert planet Arrakis, following the story of Paul Atreides and his journey to fulfill his destiny.",
        imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        pricePerWeek: "5.99",
        totalCopies: 2,
        availableCopies: 2,
        publishedYear: 1965,
        pages: 688,
        rating: "4.5",
        createdAt: new Date("2024-01-10"),
      },
      {
        id: "book4",
        title: "Pride and Prejudice",
        author: "Jane Austen",
        isbn: "9780141439518",
        category: "Romance",
        description: "A timeless romance following Elizabeth Bennet and Mr. Darcy as they navigate love, class, and social expectations in Regency England.",
        imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        pricePerWeek: "3.99",
        totalCopies: 2,
        availableCopies: 1,
        publishedYear: 1813,
        pages: 279,
        rating: "4.3",
        createdAt: new Date("2024-01-10"),
      },
      {
        id: "book5",
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        isbn: "9780060935467",
        category: "Fiction",
        description: "A gripping tale of racial injustice and lost innocence in the American South, told through the eyes of a young girl.",
        imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        pricePerWeek: "4.50",
        totalCopies: 3,
        availableCopies: 3,
        publishedYear: 1960,
        pages: 376,
        rating: "4.4",
        createdAt: new Date("2024-01-10"),
      },
      {
        id: "book6",
        title: "Atomic Habits",
        author: "James Clear",
        isbn: "9780735211292",
        category: "Self-Help",
        description: "A comprehensive guide to building good habits and breaking bad ones, with practical strategies for personal development.",
        imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        pricePerWeek: "6.99",
        totalCopies: 2,
        availableCopies: 1,
        publishedYear: 2018,
        pages: 320,
        rating: "4.6",
        createdAt: new Date("2024-01-10"),
      },
    ];

    // Seed rentals
    const sampleRentals: Rental[] = [
      {
        id: "rental1",
        userId: "user1",
        bookId: "book1",
        rentalDate: new Date("2024-11-15"),
        dueDate: new Date("2024-11-22"),
        returnDate: null,
        status: "active",
        totalAmount: "3.99",
        createdAt: new Date("2024-11-15"),
      },
      {
        id: "rental2",
        userId: "user1",
        bookId: "book3",
        rentalDate: new Date("2024-11-10"),
        dueDate: new Date("2024-11-17"),
        returnDate: null,
        status: "overdue",
        totalAmount: "5.99",
        createdAt: new Date("2024-11-10"),
      },
    ];

    // Seed wishlist
    const sampleWishlist: Wishlist[] = [
      {
        id: "wish1",
        userId: "user1",
        bookId: "book5",
        createdAt: new Date("2024-11-01"),
      },
      {
        id: "wish2",
        userId: "user1",
        bookId: "book6",
        createdAt: new Date("2024-11-05"),
      },
    ];

    // Populate maps
    sampleUsers.forEach(user => this.users.set(user.id, user));
    sampleBooks.forEach(book => this.books.set(book.id, book));
    sampleRentals.forEach(rental => this.rentals.set(rental.id, rental));
    sampleWishlist.forEach(wish => this.wishlist.set(wish.id, wish));
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

import { DatabaseStorage } from "./database-storage";

export const storage = new DatabaseStorage();
