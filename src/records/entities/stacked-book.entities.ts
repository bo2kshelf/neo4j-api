import {Field, Int, ObjectType} from '@nestjs/graphql';
import {BookEntity} from '../../books/book.entity';
import {UserEntity} from '../../users/users.entity';

@ObjectType('StackedBookRecord')
export class StackedRecordEntity {
  @Field(() => UserEntity)
  user!: UserEntity;

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
