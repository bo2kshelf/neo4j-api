import {Module} from '@nestjs/common';
import {BooksModule} from '../books/books.module';
import {UsersModule} from '../users/users.module';
import {RecordResolver} from './resolvers/records.resolver';
import {UsersResolver} from './resolvers/users.resolver';
import {RecordsService} from './services/records.service';

@Module({
  imports: [BooksModule, UsersModule],
  providers: [RecordsService, RecordResolver, UsersResolver],
})
export class RecordsModule {}
