import {Field, Int, ObjectType} from '@nestjs/graphql';
import {BookEntity} from '../../books/book.entity';
import {UserEntity} from '../../users/users.entity';

@ObjectType('HaveBookRecord')
export class HaveBookRecordEntity {
  @Field(() => UserEntity)
  account!: UserEntity;

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

  @Field(() => Int)
  skip!: number;

  @Field(() => Int)
  limit!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
