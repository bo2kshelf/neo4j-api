import {Module} from '@nestjs/common';
import {BooksResolver} from './books.resolver';
import {BooksService} from './books.service';

@Module({
  imports: [],
  providers: [BooksService, BooksResolver],
  exports: [BooksService],
})
export class BooksModule {}
