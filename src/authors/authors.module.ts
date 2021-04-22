import {Module} from '@nestjs/common';
import {AuthorsResolver} from './resolvers/authors.resolver';
import {BooksResolver} from './resolvers/books.resolver';
import {AuthorsService} from './services/authors.service';

@Module({
  providers: [AuthorsService, AuthorsResolver, BooksResolver],
  exports: [AuthorsService],
})
export class AuthorsModule {}
