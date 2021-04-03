import {Module} from '@nestjs/common';
import {BooksModule} from '../books/books.module';
import {PublishersModule} from './publishers.module';
import {PublicationsResolver} from './resolvers/publications.resolver';

@Module({
  imports: [PublishersModule, BooksModule],
  providers: [PublicationsResolver],
})
export class PublicationsModule {}
