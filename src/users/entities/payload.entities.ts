import {Field, Int, ObjectType} from '@nestjs/graphql';
import {
  HaveBookRecordEntity,
  ReadBookRecordEntity,
  ReadingBookRecordEntity,
  StackedBookRecordEntity,
  WishReadBookRecordEntity,
} from './record.entities';

@ObjectType('ReadBooksPayload')
export class ReadBooksPayloadEntity {
  @Field(() => [ReadBookRecordEntity])
  records!: ReadBookRecordEntity[];

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

@ObjectType('HaveBooksPayload')
export class HaveBooksPayloadEntity {
  @Field(() => [HaveBookRecordEntity])
  records!: HaveBookRecordEntity[];

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

@ObjectType('ReadingBooksPayload')
export class ReadingBooksPayloadEntity {
  @Field(() => [ReadingBookRecordEntity])
  records!: ReadingBookRecordEntity[];

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

@ObjectType('WishReadBooksPayload')
export class WishReadBooksPayloadEntity {
  @Field(() => [WishReadBookRecordEntity])
  records!: WishReadBookRecordEntity[];

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

@ObjectType('StackedBooksPayload')
export class StackedBooksPayloadEntity {
  @Field(() => [StackedBookRecordEntity])
  records!: StackedBookRecordEntity[];

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
