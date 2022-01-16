import {
  AuthorAdded,
  ShelfUpdated,
  BookUpdated,
} from "../generated/templates/Book/Book";
import { Book, BookAuthor, Copy } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

// enum BOOK_STATUS {
//   OWNED,
//   ON_SALE,
//   AVAILABLE_FOR_RENT,
//   RENTED,
//   READING_ON_RENT,
//   LOCKED,
// }

export function handleAuthorAdded(event: AuthorAdded): void {
  let bookID = event.params.bookID;
  let authorAddress = event.params.authorAddress.toHex();
  let book = Book.load(bookID.toString());
  if (book != null) {
    let bookAuthor = new BookAuthor(authorAddress);
    bookAuthor.authorAddress = authorAddress;
    bookAuthor.share = event.params.shares;
    bookAuthor.authorRights = event.params.authorRights;
    book.authors.push(bookAuthor.id);
    bookAuthor.save();
    book.save();
  }
}

export function handleShelfUpdated(event: ShelfUpdated): void {
  let bookID = event.params.bookID;
  let UID = event.params.UID;
  let book = Book.load(bookID.toString());
  if (book != null) {
    let copy = Copy.load(UID.toString());
    if (copy != null) {
      copy.readerAddress = event.params.reader.toHex();
      copy.status = event.params.bookStatus;
      copy.save();
    } else {
      let copy = new Copy(UID.toString());
      copy.id = UID.toString();
      copy.UID = UID;
      copy.book = book.id;
      copy.readerAddress = event.params.reader.toHex();
      copy.status = event.params.bookStatus;
      if (UID === BigInt.fromString("0")) {
        book.freeBooksPrinted = book.freeBooksPrinted.plus(
          BigInt.fromString("1")
        );
      } else {
        book.pricedBooksPrinted = book.pricedBooksPrinted.plus(
          BigInt.fromString("1")
        );
      }
      book.save();
      copy.save();
    }
  }
}

export function handleBookUpdate(event: BookUpdated): void {
  let bookID = event.params.bookID;
  let book = Book.load(bookID.toString());
  if (book != null) {
    book.minter = event.params.minter.toHex();
    book.price = event.params.price;
    book.maxPrice = event.params.maxPrice;
    book.supplyLimited = event.params.supplyLimited;
    book.pricedBookSupplyLimit = event.params.pricedBookSupplyLimit;
    book.freeBooksPrinted = event.params.freeBooksPrinted;
    book.pricedBooksPrinted = event.params.pricedBooksPrinted;
    book.totalRevenue = event.params.totalRevenue;
    book.withdrawableRevenue = event.params.withdrawableRevenue;
    book.metadataURI = event.params.metadataURI;
  }
}
