import {Module} from '@nestjs/common';
import {BooksModule} from '../books/books.module';
import {AuthorsModule} from './authors.module';
import {WritingResolver} from './resolvers/writings.resolver';

@Module({
  imports: [AuthorsModule, BooksModule],
  providers: [WritingResolver],
})
export class WritingsModule {}
