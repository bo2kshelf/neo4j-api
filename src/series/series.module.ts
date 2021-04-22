import {Module} from '@nestjs/common';
import {BooksModule} from '../books/books.module';
import {BooksResolver} from './resolvers/books.resolver';
import {NextBookConnectionsResolver} from './resolvers/next-book-connections.resolver';
import {SeriesResolver} from './resolvers/series.resolver';
import {SeriesService} from './services/series.service';

@Module({
  imports: [BooksModule],
  providers: [
    SeriesService,
    BooksResolver,
    NextBookConnectionsResolver,
    SeriesResolver,
  ],
  exports: [SeriesService],
})
export class SeriesModule {}
