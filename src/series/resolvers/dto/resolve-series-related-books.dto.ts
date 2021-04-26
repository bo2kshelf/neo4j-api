import {ArgsType, Field, Int, ObjectType} from '@nestjs/graphql';
import {SeriesPartEntity} from '../../entities/series-part.entity';

@ArgsType()
export class SeriesRelatedBooksArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;
}

@ObjectType()
export class SeriesRelatedBooksReturnType {
  @Field(() => [SeriesPartEntity])
  nodes!: SeriesPartEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
