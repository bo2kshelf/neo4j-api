import {Module} from '@nestjs/common';
import {BooksModule} from '../books/books.module';
import {SeriesPartsResolver} from './resolvers/series-parts.resolver';
import {SeriesSubPartsResolver} from './resolvers/series-sub-parts.resolver';
import {SeriesModule} from './series.module';

@Module({
  imports: [SeriesModule, BooksModule],
  providers: [SeriesPartsResolver, SeriesSubPartsResolver],
})
export class SeriesPartModule {}
