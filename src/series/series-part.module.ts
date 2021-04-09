import {Module} from '@nestjs/common';
import {BooksModule} from '../books/books.module';
import {SeriesMainPartResolver} from './resolvers/series-main-part.resolver';
import {SeriesPartResolver} from './resolvers/series-part.resolver';
import {SeriesSubPartResolver} from './resolvers/series-sub-part.resolver';
import {SeriesModule} from './series.module';

@Module({
  imports: [SeriesModule, BooksModule],
  providers: [
    SeriesPartResolver,
    SeriesMainPartResolver,
    SeriesSubPartResolver,
  ],
})
export class SeriesPartModule {}
