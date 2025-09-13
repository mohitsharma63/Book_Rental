
import { storage } from "./storage";

async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Create sample books
    const books = [
      {
        title: "The Psychology of Money",
        author: "Morgan Housel",
        isbn: "9780857199096",
        category: "Finance",
        description: "Timeless lessons on wealth, greed, and happiness from one of the most important financial writers of our time.",
        imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        pricePerWeek: "12.99",
        totalCopies: 10,
        availableCopies: 8,
        publishedYear: 2020,
        pages: 256,
        rating: "4.8"
      },
      {
        title: "Atomic Habits",
        author: "James Clear",
        isbn: "9780735211292",
        category: "Self-Help",
        description: "An easy & proven way to build good habits & break bad ones. Transform your life with tiny changes.",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        pricePerWeek: "14.99",
        totalCopies: 8,
        availableCopies: 5,
        publishedYear: 2018,
        pages: 320,
        rating: "4.9"
      },
      {
        title: "The Silent Patient",
        author: "Alex Michaelides",
        isbn: "9781250301697",
        category: "Thriller",
        description: "A gripping psychological thriller about a woman's act of violence against her husband and the therapist obsessed with treating her.",
        imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
        pricePerWeek: "11.99",
        totalCopies: 6,
        availableCopies: 3,
        publishedYear: 2019,
        pages: 336,
        rating: "4.5"
      }
    ];

    for (const book of books) {
      await storage.createBook(book);
    }

    // Create demo users
    const users = [
      {
        username: "admin@bookwise.com",
        email: "admin@bookwise.com",
        password: "admin123",
        firstName: "Admin",
        lastName: "User",
        phone: "+1234567890",
        address: "123 Admin Street",
        isAdmin: true
      },
      {
        username: "user@bookwise.com",
        email: "user@bookwise.com",
        password: "user123",
        firstName: "Demo",
        lastName: "User",
        phone: "+0987654321",
        address: "456 User Avenue",
        isAdmin: false
      }
    ];

    for (const user of users) {
      try {
        await storage.createUser(user);
      } catch (error) {
        console.log(`User ${user.email} already exists, skipping...`);
      }
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
