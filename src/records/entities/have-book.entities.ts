import {Field, Int, ObjectType} from '@nestjs/graphql';
import {AccountEntity} from '../../accounts/account.entity';
import {BookEntity} from '../../books/book.entity';

@ObjectType('HaveBookRecord')
export class HaveBookRecordEntity {
  @Field(() => AccountEntity)
  account!: AccountEntity;

  @Field(() => BookEntity)
  book!: BookEntity;

  @Field(() => Boolean)
  have!: boolean;
}

@ObjectType('HaveBooksPayload')
export class HaveBooksPayloadEntity {
  @Field(() => [HaveBookRecordEntity])
  records!: HaveBookRecordEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
