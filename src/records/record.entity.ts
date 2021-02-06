import {Field, ObjectType} from '@nestjs/graphql';
import {LocalDateResolver} from 'graphql-scalars';
import {AccountEntity} from '../accounts/account.entity';
import {BookEntity} from '../books/book.entity';

@ObjectType('ReadBookRecord')
export class ReadBookRecordEntity {
  @Field(() => AccountEntity)
  account!: AccountEntity;

  @Field(() => BookEntity)
  book!: BookEntity;

  @Field(() => LocalDateResolver)
  date!: string;
}

@ObjectType('ReadingBookRecord')
export class ReadingBookRecordEntity {
  @Field(() => AccountEntity)
  account!: AccountEntity;

  @Field(() => BookEntity)
  book!: BookEntity;

  @Field(() => Boolean)
  reading!: boolean;
}

@ObjectType('WishReadBookRecord')
export class WishReadBookRecordEntity {
  @Field(() => AccountEntity)
  account!: AccountEntity;

  @Field(() => BookEntity)
  book!: BookEntity;

  @Field(() => Boolean)
  wish!: boolean;
}

@ObjectType('HaveBookRecord')
export class HaveBookRecordEntity {
  @Field(() => AccountEntity)
  account!: AccountEntity;

  @Field(() => BookEntity)
  book!: BookEntity;

  @Field(() => Boolean)
  have!: boolean;
}

@ObjectType('StackedRecord')
export class StackedRecordEntity {
  @Field(() => AccountEntity)
  account!: AccountEntity;

  @Field(() => BookEntity)
  book!: BookEntity;
}
