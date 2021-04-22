import {Module} from '@nestjs/common';
import {BooksResolver} from './resolvers/books.resolver';
import {BooksService} from './services/books.service';

@Module({
  providers: [BooksService, BooksResolver],
  exports: [BooksService],
})
export class BooksModule {}
