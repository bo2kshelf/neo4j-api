import {Field, Int, ObjectType} from '@nestjs/graphql';
import {LocalDateResolver} from 'graphql-scalars';
import {BookEntity} from '../../books/book.entity';
import {UserEntity} from '../../users/users.entity';

@ObjectType('ReadBookRecord')
export class ReadBookRecordEntity {
  @Field(() => UserEntity)
  account!: UserEntity;

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
