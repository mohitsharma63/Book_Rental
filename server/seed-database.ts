
import { db } from "./db";
import { books, users, categories, rentals } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Check if data already exists
    const existingUsers = await db.select().from(users);
    const existingBooks = await db.select().from(books);
    const existingCategories = await db.select().from(categories);

    // Seed categories first
    if (existingCategories.length === 0) {
      console.log("Seeding categories...");
      const categoriesToInsert = [
        { name: "Fiction", description: "Fictional stories and novels", isActive: true },
        { name: "Non-Fiction", description: "Educational and factual books", isActive: true },
        { name: "Science Fiction", description: "Futuristic and space-related stories", isActive: true },
        { name: "Mystery", description: "Crime and mystery novels", isActive: true },
        { name: "Romance", description: "Love stories and romantic novels", isActive: true },
        { name: "Fantasy", description: "Magical and fantasy worlds", isActive: true },
        { name: "Biography", description: "Life stories of notable people", isActive: true },
        { name: "History", description: "Historical events and periods", isActive: true },
        { name: "Self-Help", description: "Personal development and improvement", isActive: true },
        { name: "Children's Books", description: "Books for young readers", isActive: true }
      ];

      for (const category of categoriesToInsert) {
        await db.insert(categories).values(category);
      }
      console.log(`Inserted ${categoriesToInsert.length} categories`);
    }

    // Seed users
    if (existingUsers.length === 0) {
      console.log("Seeding users...");
      const usersToInsert = [
        {
          username: "admin@bookwise.com",
          email: "admin@bookwise.com",
          password: "admin123",
          firstName: "Admin",
          lastName: "User",
          phone: "+1-234-567-8900",
          address: "123 Admin Street, Admin City, AC 12345",
          isAdmin: true
        },
        {
          username: "john.doe@example.com",
          email: "john.doe@example.com",
          password: "password123",
          firstName: "John",
          lastName: "Doe",
          phone: "+1-555-123-4567",
          address: "456 Main Street, Anytown, AT 67890",
          isAdmin: false
        },
        {
          username: "jane.smith@example.com",
          email: "jane.smith@example.com",
          password: "password123",
          firstName: "Jane",
          lastName: "Smith",
          phone: "+1-555-987-6543",
          address: "789 Oak Avenue, Somewhere, SW 54321",
          isAdmin: false
        },
        {
          username: "mike.johnson@example.com",
          email: "mike.johnson@example.com",
          password: "password123",
          firstName: "Mike",
          lastName: "Johnson",
          phone: "+1-555-456-7890",
          address: "321 Pine Street, Elsewhere, EW 98765",
          isAdmin: false
        },
        {
          username: "sarah.wilson@example.com",
          email: "sarah.wilson@example.com",
          password: "password123",
          firstName: "Sarah",
          lastName: "Wilson",
          phone: "+1-555-234-5678",
          address: "654 Elm Street, Nowhere, NW 13579",
          isAdmin: false
        }
      ];

      for (const user of usersToInsert) {
        await db.insert(users).values(user);
      }
      console.log(`Inserted ${usersToInsert.length} users`);
    }

    // Seed books
    if (existingBooks.length === 0) {
      console.log("Seeding books...");
      const booksToInsert = [
        {
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          isbn: "9780743273565",
          category: "Fiction",
          description: "A classic American novel about the Jazz Age",
          imageUrl: "https://images-na.ssl-images-amazon.com/images/I/81QuEGw8VPL.jpg",
          pricePerWeek: "5.99",
          totalCopies: 3,
          availableCopies: 2,
          publishedYear: 1925,
          pages: 180,
          rating: "4.5"
        },
        {
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          isbn: "9780446310789",
          category: "Fiction",
          description: "A story of racial injustice and childhood innocence",
          imageUrl: "https://images-na.ssl-images-amazon.com/images/I/71FxgtFKcKL.jpg",
          pricePerWeek: "4.99",
          totalCopies: 4,
          availableCopies: 3,
          publishedYear: 1960,
          pages: 376,
          rating: "4.8"
        },
        {
          title: "1984",
          author: "George Orwell",
          isbn: "9780451524935",
          category: "Science Fiction",
          description: "A dystopian social science fiction novel",
          imageUrl: "https://images-na.ssl-images-amazon.com/images/I/71kxa1-0mfL.jpg",
          pricePerWeek: "6.99",
          totalCopies: 2,
          availableCopies: 1,
          publishedYear: 1949,
          pages: 328,
          rating: "4.7"
        },
        {
          title: "Pride and Prejudice",
          author: "Jane Austen",
          isbn: "9780141439518",
          category: "Romance",
          description: "A romantic novel about manners and marriage",
          imageUrl: "https://images-na.ssl-images-amazon.com/images/I/71Q1tPupKjL.jpg",
          pricePerWeek: "4.49",
          totalCopies: 3,
          availableCopies: 3,
          publishedYear: 1813,
          pages: 432,
          rating: "4.6"
        },
        {
          title: "The Catcher in the Rye",
          author: "J.D. Salinger",
          isbn: "9780316769174",
          category: "Fiction",
          description: "A coming-of-age story in New York City",
          imageUrl: "https://images-na.ssl-images-amazon.com/images/I/81OthjkJBuL.jpg",
          pricePerWeek: "5.49",
          totalCopies: 2,
          availableCopies: 2,
          publishedYear: 1951,
          pages: 277,
          rating: "4.2"
        },
        {
          title: "Harry Potter and the Philosopher's Stone",
          author: "J.K. Rowling",
          isbn: "9780747532699",
          category: "Fantasy",
          description: "The first book in the Harry Potter series",
          imageUrl: "https://images-na.ssl-images-amazon.com/images/I/81YOuOGFCJL.jpg",
          pricePerWeek: "7.99",
          totalCopies: 5,
          availableCopies: 4,
          publishedYear: 1997,
          pages: 223,
          rating: "4.9"
        },
        {
          title: "The Da Vinci Code",
          author: "Dan Brown",
          isbn: "9780307474278",
          category: "Mystery",
          description: "A mystery thriller involving secret societies",
          imageUrl: "https://images-na.ssl-images-amazon.com/images/I/815WORuYMML.jpg",
          pricePerWeek: "6.49",
          totalCopies: 3,
          availableCopies: 2,
          publishedYear: 2003,
          pages: 454,
          rating: "4.3"
        },
        {
          title: "Sapiens: A Brief History of Humankind",
          author: "Yuval Noah Harari",
          isbn: "9780062316097",
          category: "Non-Fiction",
          description: "An exploration of human history and development",
          imageUrl: "https://images-na.ssl-images-amazon.com/images/I/713jIoMO3UL.jpg",
          pricePerWeek: "8.99",
          totalCopies: 2,
          availableCopies: 1,
          publishedYear: 2011,
          pages: 443,
          rating: "4.7"
        },
        {
          title: "The Alchemist",
          author: "Paulo Coelho",
          isbn: "9780062315007",
          category: "Fiction",
          description: "A philosophical novel about following your dreams",
          imageUrl: "https://images-na.ssl-images-amazon.com/images/I/71aFt4-OTOL.jpg",
          pricePerWeek: "5.99",
          totalCopies: 4,
          availableCopies: 3,
          publishedYear: 1988,
          pages: 163,
          rating: "4.4"
        },
        {
          title: "The Hobbit",
          author: "J.R.R. Tolkien",
          isbn: "9780547928227",
          category: "Fantasy",
          description: "A fantasy adventure in Middle-earth",
          imageUrl: "https://images-na.ssl-images-amazon.com/images/I/712cDO7d73L.jpg",
          pricePerWeek: "6.99",
          totalCopies: 3,
          availableCopies: 2,
          publishedYear: 1937,
          pages: 310,
          rating: "4.8"
        }
      ];

      for (const book of booksToInsert) {
        await db.insert(books).values(book);
      }
      console.log(`Inserted ${booksToInsert.length} books`);
    }

    console.log("Database seeding completed successfully!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Seeding finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

export { seedDatabase };
