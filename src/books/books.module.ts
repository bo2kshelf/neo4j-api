import {Module} from '@nestjs/common';
import {IDModule} from '../common/id/id.module';
import {BooksResolver} from './resolvers/books.resolver';
import {BooksService} from './services/books.service';

@Module({
  imports: [IDModule],
  providers: [BooksService, BooksResolver],
  exports: [BooksService],
})
export class BooksModule {}
