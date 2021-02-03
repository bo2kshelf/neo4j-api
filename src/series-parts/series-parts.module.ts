import {Module} from '@nestjs/common';
import {BooksModule} from '../books/books.module';
import {SeriesModule} from '../series/series.module';
import {SeriesPartResolver} from './series-parts.resolver';
import {SeriesPartService} from './series-parts.service';

@Module({
  imports: [BooksModule, SeriesModule],
  providers: [SeriesPartResolver, SeriesPartService],
  exports: [SeriesPartService],
})
export class SeriesPartModule {}
