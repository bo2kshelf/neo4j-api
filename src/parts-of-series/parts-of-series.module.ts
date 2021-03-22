import {Module} from '@nestjs/common';
import {BooksModule} from '../books/books.module';
import {SeriesModule} from '../series/series.module';
import {PartsOfSeriesService} from './parts-of-series.service';
import {BookSeriesOfResolver} from './resolvers/book-series-of.resolver';
import {PartsOfSeriesResolver} from './resolvers/parts-of-series.resolver';
import {SeriesBooksOfResolver} from './resolvers/series-books-of.resolver';

@Module({
  imports: [BooksModule, SeriesModule],
  providers: [
    PartsOfSeriesService,
    PartsOfSeriesResolver,
    BookSeriesOfResolver,
    SeriesBooksOfResolver,
  ],
  exports: [PartsOfSeriesService],
})
export class PartsOfSeriesModule {}
