import {Field, Int, ObjectType} from '@nestjs/graphql';
import {AccountEntity} from '../../accounts/account.entity';
import {BookEntity} from '../../books/book.entity';

@ObjectType('StackedBookRecord')
export class StackedRecordEntity {
  @Field(() => AccountEntity)
  account!: AccountEntity;

  @Field(() => BookEntity)
  book!: BookEntity;
}

@ObjectType('StackedBooksPayload')
export class StackedBooksPayloadEntity {
  @Field(() => [StackedRecordEntity])
  records!: StackedRecordEntity[];

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
