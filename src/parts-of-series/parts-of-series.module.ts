import {Module} from '@nestjs/common';
import {BooksModule} from '../books/books.module';
import {SeriesModule} from '../series/series.module';
import {
  BookSeriesOfResolver,
  PartsOfSeriesResolver,
  SeriesPartsResolver,
} from './parts-of-series.resolver';
import {PartsOfSeriesService} from './parts-of-series.service';

@Module({
  imports: [BooksModule, SeriesModule],
  providers: [
    PartsOfSeriesService,
    PartsOfSeriesResolver,
    BookSeriesOfResolver,
    SeriesPartsResolver,
  ],
  exports: [PartsOfSeriesService],
})
export class PartsOfSeriesModule {}
