import {Module} from '@nestjs/common';
import {
  AuthorRelatedSeriesResolver,
  AuthorSeriesRelationResolver,
  SeriesRelatedAuthorsResolver,
} from './author-series-relations.resolver';
import {AuthorSeriesRelationsService} from './author-series-relations.service';

@Module({
  imports: [],
  providers: [
    AuthorSeriesRelationsService,
    AuthorSeriesRelationResolver,
    AuthorRelatedSeriesResolver,
    SeriesRelatedAuthorsResolver,
  ],
  exports: [AuthorSeriesRelationsService],
})
export class AuthorSeriesRelationsModule {}
