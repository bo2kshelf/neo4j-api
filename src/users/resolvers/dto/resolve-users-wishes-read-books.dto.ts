import {ArgsType, Field, Int, ObjectType} from '@nestjs/graphql';
import {WishReadBookRecordEntity} from '../../entities/wish-read-book-record.entity';

@ArgsType()
export class ResolveUsersWishesReadBooksArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;
}

@ObjectType('UsersWishReadBooksReturn')
export class ResolveUsersWishesReadBooksReturnEntity {
  @Field(() => [WishReadBookRecordEntity])
  records!: WishReadBookRecordEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
