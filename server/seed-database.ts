import { db } from "./db";
import { users, books, rentals, wishlist } from "@shared/schema";

async function seedDatabase() {
  console.log("Starting database seed...");
  
  try {
    // Clear existing data (be careful in production)
    await db.delete(wishlist);
    await db.delete(rentals);
    await db.delete(books);
    await db.delete(users);
    
    // Seed users
    const sampleUsers = [
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
      },
    ];

    console.log("Inserting users...");
    await db.insert(users).values(sampleUsers);

    // Seed books
    const sampleBooks = [
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
      },
    ];

    console.log("Inserting books...");
    await db.insert(books).values(sampleBooks);

    // Seed rentals
    const sampleRentals = [
      {
        id: "rental1",
        userId: "user1",
        bookId: "book1",
        rentalDate: new Date("2024-11-15"),
        dueDate: new Date("2024-11-22"),
        returnDate: null,
        status: "active",
        totalAmount: "3.99",
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
      },
    ];

    console.log("Inserting rentals...");
    await db.insert(rentals).values(sampleRentals);

    // Seed wishlist
    const sampleWishlist = [
      {
        id: "wish1",
        userId: "user1",
        bookId: "book5",
      },
      {
        id: "wish2",
        userId: "user1",
        bookId: "book6",
      },
    ];

    console.log("Inserting wishlist items...");
    await db.insert(wishlist).values(sampleWishlist);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run the seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}