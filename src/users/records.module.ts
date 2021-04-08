import {Module} from '@nestjs/common';
import {BooksModule} from '../books/books.module';
import {ReadBookRecordResolver} from './resolvers/read-book-records.resolver';
import {RecordsService} from './services/records.service';
import {UsersModule} from './users.module';

@Module({
  imports: [BooksModule, UsersModule],
  providers: [RecordsService, ReadBookRecordResolver],
})
export class RecordsModule {}
