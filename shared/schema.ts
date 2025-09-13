
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  bookId: varchar("book_id").references(() => books.id).notNull(),
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

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Book = typeof books.$inferSelect;
export type InsertBook = typeof books.$inferInsert;
export type Rental = typeof rentals.$inferSelect;
export type InsertRental = typeof rentals.$inferInsert;
export type Wishlist = typeof wishlist.$inferSelect;
export type InsertWishlist = typeof wishlist.$inferInsert;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertBookSchema = createInsertSchema(books);
export const insertRentalSchema = createInsertSchema(rentals);
export const insertWishlistSchema = createInsertSchema(wishlist);
