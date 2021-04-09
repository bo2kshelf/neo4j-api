import {Module} from '@nestjs/common';
import {BooksModule} from '../books/books.module';
import {IDModule} from '../common/id/id.module';
import {
  BooksResolver,
  ConnectNextBookResolver,
} from './resolvers/books.resolver';
import {SeriesResolver} from './resolvers/series.resolver';
import {SeriesService} from './services/series.service';

@Module({
  imports: [IDModule, BooksModule],
  providers: [
    SeriesService,
    BooksResolver,
    ConnectNextBookResolver,
    SeriesResolver,
  ],
  exports: [SeriesService],
})
export class SeriesModule {}
