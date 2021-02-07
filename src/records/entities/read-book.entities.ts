import {Field, Int, ObjectType} from '@nestjs/graphql';
import {LocalDateResolver} from 'graphql-scalars';
import {AccountEntity} from '../../accounts/account.entity';
import {BookEntity} from '../../books/book.entity';

@ObjectType('ReadBookRecord')
export class ReadBookRecordEntity {
  @Field(() => AccountEntity)
  account!: AccountEntity;

  @Field(() => BookEntity)
  book!: BookEntity;

  @Field(() => LocalDateResolver)
  date!: string;
}

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
