import {Module} from '@nestjs/common';
import {BooksModule} from '../books/books.module';
import {HaveBookRecordResolver} from './resolvers/have-book-records.resolver';
import {ReadingBookRecordResolver} from './resolvers/reading-book-records.resolver';
import {StackedBookRecordResolver} from './resolvers/stacked-book-records.resolver';
import {WishReadBookRecordResolver} from './resolvers/wish-read-book-records.resolver';
import {UsersModule} from './users.module';

@Module({
  imports: [BooksModule, UsersModule],
  providers: [
    HaveBookRecordResolver,
    ReadingBookRecordResolver,
    StackedBookRecordResolver,
    WishReadBookRecordResolver,
  ],
})
export class UserRecordsModule {}
