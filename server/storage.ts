import type { 
  User, InsertUser, 
  Book, InsertBook, 
  Rental, InsertRental, 
  Wishlist, InsertWishlist,
  Category, InsertCategory,
  Contact, InsertContact,
  Review, InsertReview,
  Slider, InsertSlider
} from "@shared/schema";
import { randomUUID } from "crypto";
import { DatabaseStorage } from "./database-storage";
import type { IStorage } from "./interfaces";

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private books: Map<string, Book>;
  private rentals: Map<string, Rental>;
  private wishlist: Map<string, Wishlist>;
  private contacts: Map<string, Contact>;
  private reviews: Map<string, Review>;
  private sliders: Map<string, Slider>; // Added for slider storage

  constructor() {
    this.users = new Map();
    this.books = new Map();
    this.rentals = new Map();
    this.wishlist = new Map();
    this.contacts = new Map();
    this.reviews = new Map();
    this.sliders = new Map(); // Initialize slider storage
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserById(id: string): Promise<User | undefined> {
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
      id,
      createdAt: new Date(),
      address: insertUser.address || null,
      phone: insertUser.phone || null,
      isAdmin: insertUser.isAdmin || false,
      ...insertUser,
      suspended: insertUser.suspended ?? null
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

  async getBookById(id: string): Promise<Book | undefined> {
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

  // Review methods
  async getReviewsByBook(bookId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.bookId === bookId);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      id,
      userId: insertReview.userId,
      bookId: insertReview.bookId,
      rating: insertReview.rating,
      comment: insertReview.comment,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);
    return review;
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.userId === userId);
  }

  // Category methods
  private categories: Array<{
    id: number;
    name: string;
    description: string | null;
    imageUrl?: string | null;
    isActive: boolean;
    createdAt: string;
  }> = [
    {
      id: 1,
      name: "Fiction",
      description: "Fictional stories and novels",
      isActive: true,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      name: "Science Fiction",
      description: "Science fiction and futuristic stories",
      isActive: true,
      createdAt: "2024-01-15"
    },
    {
      id: 3,
      name: "Mystery",
      description: "Mystery and thriller novels",
      isActive: true,
      createdAt: "2024-01-16"
    },
    {
      id: 4,
      name: "Romance",
      description: "Romance and love stories",
      isActive: true,
      createdAt: "2024-01-16"
    },
    {
      id: 5,
      name: "Self-Help",
      description: "Personal development and self-improvement",
      isActive: true,
      createdAt: "2024-01-17"
    },
    {
      id: 6,
      name: "Biography",
      description: "Biographies and memoirs",
      isActive: false,
      createdAt: "2024-01-17"
    },
    {
      id: 7,
      name: "Non-Fiction",
      description: "Non-fictional works and documentaries",
      isActive: true,
      createdAt: "2024-01-18"
    },
    {
      id: 8,
      name: "Thriller",
      description: "Suspenseful and thrilling stories",
      isActive: true,
      createdAt: "2024-01-18"
    },
    {
      id: 9,
      name: "History",
      description: "Historical books and accounts",
      isActive: true,
      createdAt: "2024-01-19"
    },
    {
      id: 10,
      name: "Science",
      description: "Scientific research and discoveries",
      isActive: true,
      createdAt: "2024-01-19"
    },
    {
      id: 11,
      name: "Technology",
      description: "Technology and computer science books",
      isActive: true,
      createdAt: "2024-01-20"
    },
    {
      id: 12,
      name: "Finance",
      description: "Finance and business books",
      isActive: true,
      createdAt: "2024-01-20"
    }
  ];

  async getCategories(): Promise<Category[]> {
    return this.categories.map(cat => ({
      ...cat,
      description: cat.description || null,
      imageUrl: null,
      isActive: cat.isActive,
      createdAt: new Date(cat.createdAt)
    }));
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const category = {
      id: this.categories.length + 1,
      name: categoryData.name,
      description: categoryData.description || '',
      imageUrl: categoryData.imageUrl || undefined,
      isActive: categoryData.isActive ?? true,
      createdAt: new Date().toISOString()
    };
    this.categories.push(category);
    return {
      ...category,
      description: category.description || null,
      imageUrl: null,
      isActive: category.isActive,
      createdAt: new Date(category.createdAt)
    };
  }

  async updateCategory(id: number, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<Category | null> {
    const categoryIndex = this.categories.findIndex(c => c.id === id);
    if (categoryIndex !== -1) {
      this.categories[categoryIndex] = { ...this.categories[categoryIndex], ...updates };
      const updated = this.categories[categoryIndex];
      return {
        ...updated,
        description: updated.description,
        imageUrl: null,
        isActive: updated.isActive,
        createdAt: new Date(updated.createdAt)
      };
    }
    return null;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const categoryIndex = this.categories.findIndex(c => c.id === id);
    if (categoryIndex === -1) return false;

    this.categories.splice(categoryIndex, 1);
    return true;
  }

  // Contact methods
  async createContact(contactData: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = {
      id,
      createdAt: new Date(),
      status: 'new',
      name: contactData.name,
      email: contactData.email,
      message: contactData.message,
      subject: contactData.subject || null,
      category: contactData.category || null
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async updateContactStatus(id: string, status: string): Promise<Contact | null> {
    const contact = this.contacts.get(id);
    if (!contact) {
      return null;
    }
    const updatedContact = { ...contact, status };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }

  // Slider methods implementation
  async getSliders(): Promise<Slider[]> {
    return Array.from(this.sliders.values());
  }

  async getActiveSliders(): Promise<Slider[]> {
    return Array.from(this.sliders.values()).filter(slider => slider.isActive);
  }

  async createSlider(insertSlider: InsertSlider): Promise<Slider> {
    const id = randomUUID();
    const slider: Slider = {
      id: parseInt(id.split('-')[0]) || 1,
      title: insertSlider.title || null,
      description: insertSlider.description || null,
      imageUrl: insertSlider.imageUrl,
      linkUrl: insertSlider.linkUrl || null,
      buttonText: insertSlider.buttonText || null,
      order: insertSlider.order || null,
      isActive: insertSlider.isActive ?? null,
      createdAt: new Date(),
    };
    this.sliders.set(id, slider);
    return slider;
  }

  async updateSlider(id: number, updateData: Partial<Slider>): Promise<Slider | null> {
    const slider = this.sliders.get(id.toString());
    if (!slider) {
      return null;
    }
    const updatedSlider = { ...slider, ...updateData };
    this.sliders.set(id.toString(), updatedSlider);
    return updatedSlider;
  }

  async deleteSlider(id: number): Promise<boolean> {
    return this.sliders.delete(id.toString());
  }
}

// Export a single DatabaseStorage instance
export const storage = new DatabaseStorage();