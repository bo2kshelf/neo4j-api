import {ArgsType, Field, Int, ObjectType} from '@nestjs/graphql';
import {SeriesPartEntity} from '../../entities/series-part.entity';

@ArgsType()
export class ResolveBooksIsPartOfSeriesArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;
}

@ObjectType('BooksPartOfSeriesReturn')
export class BooksPartOfSeriesReturn {
  @Field(() => [SeriesPartEntity])
  parts!: SeriesPartEntity[];

  @Field(() => Int)
  count!: number;
}
