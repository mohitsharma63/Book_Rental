
import { db } from "./db";
import { users, books } from "@shared/schema";

async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Create admin user
    await db.insert(users).values({
      username: "admin",
      email: "admin@bookwise.com",
      password: "admin123",
      firstName: "Admin",
      lastName: "User",
      phone: "+1 (555) 999-0000",
      address: "456 Admin St, Admin City, AC 00000",
      isAdmin: true
    }).onConflictDoNothing();

    // Create test user
    await db.insert(users).values({
      username: "user@bookwise.com",
      email: "user@bookwise.com",
      password: "user123",
      firstName: "Test",
      lastName: "User",
      phone: "+1 (555) 123-4567",
      address: "123 Main Street, Anytown, NY 12345",
      isAdmin: false
    }).onConflictDoNothing();

    // Seed some books
    await db.insert(books).values([
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "9780743273565",
        category: "Classic",
        description: "A classic American novel set in the Jazz Age.",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        pricePerWeek: "5.99",
        totalCopies: 5,
        availableCopies: 3,
        publishedYear: 1925,
        pages: 180,
        rating: "4.2"
      },
      {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        isbn: "9780060935467",
        category: "Classic",
        description: "A gripping tale of racial injustice and childhood innocence.",
        imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        pricePerWeek: "4.99",
        totalCopies: 4,
        availableCopies: 2,
        publishedYear: 1960,
        pages: 281,
        rating: "4.5"
      }
    ]).onConflictDoNothing();

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
