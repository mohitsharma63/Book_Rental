
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

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: string, updateData: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Book methods
  getAllBooks(): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  getBookById(id: string): Promise<Book | undefined>;
  getBooksByCategory(category: string): Promise<Book[]>;
  searchBooks(query: string): Promise<Book[]>;
  createBook(insertBook: InsertBook): Promise<Book>;
  updateBook(id: string, updateData: Partial<Book>): Promise<Book>;
  deleteBook(id: string): Promise<boolean>;

  // Rental methods
  getAllRentals(): Promise<Rental[]>;
  getRental(id: string): Promise<Rental | undefined>;
  getRentalsByUser(userId: string): Promise<Rental[]>;
  getRentalsByBook(bookId: string): Promise<Rental[]>;
  createRental(insertRental: InsertRental): Promise<Rental>;
  updateRental(id: string, updateData: Partial<Rental>): Promise<Rental>;

  // Review methods
  getReviewsByBook(bookId: string): Promise<Review[]>;
  createReview(insertReview: InsertReview): Promise<Review>;
  getReviewsByUser(userId: string): Promise<Review[]>;

  // Wishlist methods
  getWishlistByUser(userId: string): Promise<Wishlist[]>;
  addToWishlist(insertWishlist: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: string, bookId: string): Promise<boolean>;

  // Category methods
  getCategories(): Promise<Category[]>;
  createCategory(categoryData: InsertCategory): Promise<Category>;
  updateCategory(id: number, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<Category | null>;
  deleteCategory(id: number): Promise<boolean>;

  // Contact methods
  createContact(contactData: InsertContact): Promise<Contact>;
  getAllContacts(): Promise<Contact[]>;
  updateContactStatus(id: string, status: string): Promise<Contact | null>;

  // Slider methods
  getSliders(): Promise<Slider[]>;
  getActiveSliders(): Promise<Slider[]>;
  createSlider(insertSlider: InsertSlider): Promise<Slider>;
  updateSlider(id: number, updateData: Partial<Slider>): Promise<Slider | null>;
  deleteSlider(id: number): Promise<boolean>;
}
