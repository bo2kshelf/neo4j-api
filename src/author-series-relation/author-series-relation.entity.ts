import {Field, ObjectType} from '@nestjs/graphql';
import {AuthorEntity} from '../authors/entities/author.entity';
import {SeriesEntity} from '../series/entities/series.entity';

@ObjectType('AuthorSeriesRelation')
export class AuthorSeriesRelationEntity {
  @Field(() => AuthorEntity)
  author!: AuthorEntity;

  @Field(() => SeriesEntity)
  series!: SeriesEntity;
}
