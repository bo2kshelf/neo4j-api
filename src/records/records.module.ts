import {Module} from '@nestjs/common';
import {AccountRecordsResolver} from './resolvers/account-records.resolver';
import {HaveBookRecordResolver} from './resolvers/have-books.resolvers';
import {ReadBookRecordsResolver} from './resolvers/read-books.resolvers';
import {ReadingBookRecordsResolver} from './resolvers/reading-books.resolvers';
import {WishReadBookRecordsResolver} from './resolvers/wish-books.resolvers';
import {HaveBooksService} from './services/have-books.service';
import {ReadBooksService} from './services/read-books.service';
import {ReadingBooksService} from './services/reading-books.service';
import {StackedBooksService} from './services/stacked-books.service';
import {WishReadBooksService} from './services/wish-read-books.service';

@Module({
  imports: [],
  providers: [
    HaveBooksService,
    ReadBooksService,
    ReadingBooksService,
    StackedBooksService,
    WishReadBooksService,
    HaveBookRecordResolver,
    ReadBookRecordsResolver,
    ReadingBookRecordsResolver,
    WishReadBookRecordsResolver,
    AccountRecordsResolver,
  ],
  exports: [
    HaveBooksService,
    ReadBooksService,
    ReadingBooksService,
    StackedBooksService,
    WishReadBooksService,
  ],
})
export class RecordsModule {}
