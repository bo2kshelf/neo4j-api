import {Module} from '@nestjs/common';
import {IDModule} from '../id/id.module';
import {BooksResolver} from './books.resolver';
import {BooksService} from './books.service';

@Module({
  imports: [IDModule],
  providers: [BooksService, BooksResolver],
  exports: [BooksService],
})
export class BooksModule {}
