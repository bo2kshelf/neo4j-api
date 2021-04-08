import {Module} from '@nestjs/common';
import {BooksModule} from '../books/books.module';
import {IDModule} from '../common/id/id.module';
import {UsersModule} from '../users/users.module';
import {RecordResolver} from './resolvers/records.resolver';
import {UsersResolver} from './resolvers/users.resolver';
import {RecordsService} from './services/records.service';

@Module({
  imports: [IDModule, BooksModule, UsersModule],
  providers: [RecordsService, RecordResolver, UsersResolver],
})
export class RecordsModule {}
