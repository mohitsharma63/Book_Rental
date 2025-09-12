export type Book = {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  category: string;
  description?: string;
  imageUrl?: string;
  pricePerWeek: string;
  totalCopies: number;
  availableCopies: number;
  publishedYear?: number;
  pages?: number;
  rating?: string;
  createdAt: Date;
};

export type User = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  isAdmin: boolean;
  createdAt: Date;
};

export type Rental = {
  id: string;
  userId: string;
  bookId: string;
  rentalDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: string;
  totalAmount: string;
  createdAt: Date;
};

export type Wishlist = {
  id: string;
  userId: string;
  bookId: string;
  createdAt: Date;
};
