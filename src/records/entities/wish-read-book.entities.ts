import {Field, Int, ObjectType} from '@nestjs/graphql';
import {AccountEntity} from '../../accounts/account.entity';
import {BookEntity} from '../../books/book.entity';

@ObjectType('WishReadBookRecord')
export class WishReadBookRecordEntity {
  @Field(() => AccountEntity)
  account!: AccountEntity;

  @Field(() => BookEntity)
  book!: BookEntity;

  @Field(() => Boolean)
  wish!: boolean;
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
