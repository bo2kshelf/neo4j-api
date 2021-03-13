import {Field, Int, ObjectType} from '@nestjs/graphql';
import {BookEntity} from '../../books/book.entity';
import {UserEntity} from '../../users/users.entity';

@ObjectType('ReadingBookRecord')
export class ReadingBookRecordEntity {
  @Field(() => UserEntity)
  account!: UserEntity;

  @Field(() => BookEntity)
  book!: BookEntity;

  @Field(() => Boolean)
  reading!: boolean;
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
