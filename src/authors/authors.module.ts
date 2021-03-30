import {Module} from '@nestjs/common';
import {IDModule} from '../common/id/id.module';
import {AuthorsResolver} from './resolvers/authors.resolver';
import {BooksResolver} from './resolvers/books.resolver';
import {AuthorsService} from './services/authors.service';

@Module({
  imports: [IDModule],
  providers: [AuthorsService, AuthorsResolver, BooksResolver],
  exports: [AuthorsService],
})
export class AuthorsModule {}
