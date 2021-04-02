import {Module} from '@nestjs/common';
import {AuthorsModule} from '../authors/authors.module';
import {SeriesModule} from '../series/series.module';
import {
  AuthorsResolver,
  RelationResolver,
  SeriesRelatedAuthorsResolver,
} from './resolvers/author-series.resolvers';
import {AuthorSeriesRelationsService} from './services/author-series.service';

@Module({
  imports: [AuthorsModule, SeriesModule],
  providers: [
    AuthorSeriesRelationsService,
    RelationResolver,
    AuthorsResolver,
    SeriesRelatedAuthorsResolver,
  ],
  exports: [AuthorSeriesRelationsService],
})
export class AuthorSeriesRelationsModule {}
