import { BookPublished } from "../generated/Publisher/Publisher";
import { Book } from "../generated/schema";

export function handleBookPublished(event: BookPublished): void {
  let bookID = event.params.bookID;
  let book = Book.load(bookID.toString());
  if (book == null) {
    book = new Book(bookID.toString());
    book.bookID = event.params.bookID;
    book.price = event.params.price;
    book.supplyLimited = event.params.supplyLimited;
    book.pricedBookSupplyLimit = event.params.pricedBookSupplyLimit;
    book.metadataURI = event.params.metadataURI;
    book.save();
  }
}
