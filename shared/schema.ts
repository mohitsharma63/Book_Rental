import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { nanoid } from "nanoid";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  isAdmin: boolean("is_admin").default(false),
  suspended: boolean("suspended").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const books = pgTable("books", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  author: text("author").notNull(),
  isbn: text("isbn").unique(),
  category: text("category").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  pricePerWeek: decimal("price_per_week", { precision: 8, scale: 2 }).notNull(),
  totalCopies: integer("total_copies").default(1),
  availableCopies: integer("available_copies").default(1),
  publishedYear: integer("published_year"),
  pages: integer("pages"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rentals = pgTable("rentals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  bookId: varchar("book_id").references(() => books.id).notNull(),
  rentalDate: timestamp("rental_date").defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  returnDate: timestamp("return_date"),
  status: text("status").default("active"), // active, completed, overdue
  totalAmount: decimal("total_amount", { precision: 8, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wishlist = pgTable("wishlist", {
  id: varchar("id").primaryKey().notNull().$defaultFn(() => nanoid()),
  userId: varchar("user_id").notNull().references(() => users.id),
  bookId: varchar("book_id").notNull().references(() => books.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().notNull().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  category: text("category"),
  message: text("message").notNull(),
  status: text("status").default("new"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  bookId: varchar("book_id").references(() => books.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  rentals: many(rentals),
  wishlist: many(wishlist),
}));

export const booksRelations = relations(books, ({ many }) => ({
  rentals: many(rentals),
  wishlist: many(wishlist),
}));

export const rentalsRelations = relations(rentals, ({ one }) => ({
  user: one(users, {
    fields: [rentals.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [rentals.bookId],
    references: [books.id],
  }),
}));

export const wishlistRelations = relations(wishlist, ({ one }) => ({
  user: one(users, {
    fields: [wishlist.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [wishlist.bookId],
    references: [books.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  books: many(books),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [reviews.bookId],
    references: [books.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Book = typeof books.$inferSelect;
export type InsertBook = typeof books.$inferInsert;
export type Rental = typeof rentals.$inferSelect;
export type InsertRental = typeof rentals.$inferInsert;
export type Wishlist = typeof wishlist.$inferSelect;
export type InsertWishlist = typeof wishlist.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertBookSchema = createInsertSchema(books, {
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  category: z.string().min(1, "Category is required"),
  pricePerWeek: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Price must be a positive number"
  }),
  publishedYear: z.number().optional().nullable(),
  pages: z.number().optional().nullable(),
  isbn: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});
export const insertRentalSchema = createInsertSchema(rentals);
export const insertWishlistSchema = createInsertSchema(wishlist);
export const insertCategorySchema = createInsertSchema(categories);
export const insertContactSchema = createInsertSchema(contacts);
export const insertReviewSchema = createInsertSchema(reviews, {
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().min(1, "Comment is required").max(1000, "Comment must be less than 1000 characters")
});