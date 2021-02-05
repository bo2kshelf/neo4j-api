import {Field, ObjectType} from '@nestjs/graphql';
import {AuthorEntity} from '../authors/author.entity';
import {SeriesEntity} from '../series/series.entity';

@ObjectType('AuthorSeriesRelation')
export class AuthorSeriesRelationEntity {
  @Field(() => AuthorEntity)
  author!: AuthorEntity;

  @Field(() => SeriesEntity)
  series!: SeriesEntity;
}
