import {Module} from '@nestjs/common';
import {
  AuthorsResolver,
  RelationResolver,
  SeriesRelatedAuthorsResolver,
} from './resolvers/author-series.resolvers';
import {AuthorSeriesRelationsService} from './services/author-series.service';

@Module({
  imports: [],
  providers: [
    AuthorSeriesRelationsService,
    RelationResolver,
    AuthorsResolver,
    SeriesRelatedAuthorsResolver,
  ],
  exports: [AuthorSeriesRelationsService],
})
export class AuthorSeriesRelationsModule {}
