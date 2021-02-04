import {Module} from '@nestjs/common';
import {BooksModule} from '../books/books.module';
import {SeriesModule} from '../series/series.module';
import {PartsOfSeriesResolver} from './parts-of-series.resolver';
import {PartsOfSeriesService} from './parts-of-series.service';

@Module({
  imports: [BooksModule, SeriesModule],
  providers: [PartsOfSeriesResolver, PartsOfSeriesService],
  exports: [PartsOfSeriesService],
})
export class PartsOfSeriesModule {}
