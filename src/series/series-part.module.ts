import {Module} from '@nestjs/common';
import {BooksModule} from '../books/books.module';
import {SeriesPartResolver} from './resolvers/series-part.resolver';
import {SeriesModule} from './series.module';

@Module({
  imports: [SeriesModule, BooksModule],
  providers: [SeriesPartResolver],
})
export class SeriesPartModule {}
