import {Module} from '@nestjs/common';
import {IDModule} from '../id/id.module';
import {BooksResolver} from './resolvers/books.resolver';
import {SeriesResolver} from './resolvers/series.resolver';
import {SeriesService} from './services/series.service';

@Module({
  imports: [IDModule],
  providers: [SeriesService, BooksResolver, SeriesResolver],
  exports: [SeriesService],
})
export class SeriesModule {}
