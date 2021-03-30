import {Field, Float, Int, ObjectType} from '@nestjs/graphql';
import {BookEntity} from '../books/entities/book.entity';
import {SeriesEntity} from '../series/entities/series.entity';

@ObjectType('SeriesPart')
export class SeriesPartEntity {
  @Field(() => SeriesEntity)
  series!: SeriesEntity;

  @Field(() => BookEntity)
  book!: BookEntity;

  @Field(() => Float, {nullable: true})
  volume?: number;
}

@ObjectType('SeriesPartsPayload')
export class SeriesPartsPayloadEntity {
  @Field(() => [SeriesPartEntity])
  parts!: SeriesPartEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Int)
  skip!: number;

  @Field(() => Int)
  limit!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
