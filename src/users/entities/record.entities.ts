import {Field, ObjectType} from '@nestjs/graphql';
import {LocalDateResolver} from 'graphql-scalars';
import {BookEntity} from '../../books/entities/book.entity';
import {UserEntity} from './users.entity';

@ObjectType('ReadBookRecord')
export class ReadBookRecordEntity {
  @Field(() => UserEntity)
  user!: UserEntity;

  @Field(() => BookEntity)
  book!: BookEntity;

  @Field(() => LocalDateResolver)
  date!: string;
}

@ObjectType('HaveBookRecord')
export class HaveBookRecordEntity {
  @Field(() => UserEntity)
  user!: UserEntity;

  @Field(() => BookEntity)
  book!: BookEntity;

  @Field(() => Boolean)
  have!: boolean;
}

@ObjectType('ReadingBookRecord')
export class ReadingBookRecordEntity {
  @Field(() => UserEntity)
  user!: UserEntity;

  @Field(() => BookEntity)
  book!: BookEntity;

  @Field(() => Boolean)
  reading!: boolean;
}

@ObjectType('WishReadBookRecord')
export class WishReadBookRecordEntity {
  @Field(() => UserEntity)
  user!: UserEntity;

  @Field(() => BookEntity)
  book!: BookEntity;

  @Field(() => Boolean)
  wish!: boolean;
}

@ObjectType('StackedBookRecord')
export class StackedBookRecordEntity {
  @Field(() => UserEntity)
  user!: UserEntity;

  @Field(() => BookEntity)
  book!: BookEntity;
}
