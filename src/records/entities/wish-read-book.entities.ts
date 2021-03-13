import {Field, Int, ObjectType} from '@nestjs/graphql';
import {BookEntity} from '../../books/book.entity';
import {UserEntity} from '../../users/users.entity';

@ObjectType('WishReadBookRecord')
export class WishReadBookRecordEntity {
  @Field(() => UserEntity)
  user!: UserEntity;

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
