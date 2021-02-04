import {Field, Float, ObjectType} from '@nestjs/graphql';
import {BookEntity} from '../books/book.entity';
import {SeriesEntity} from '../series/series.entity';

@ObjectType('SeriesPart')
export class PartOfSeriesEntity {
  @Field(() => SeriesEntity)
  series!: SeriesEntity;

  @Field(() => BookEntity)
  book!: BookEntity;

  @Field(() => Float, {nullable: true})
  volume?: number;
}
