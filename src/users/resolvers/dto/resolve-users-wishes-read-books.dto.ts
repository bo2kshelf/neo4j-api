import {ArgsType, Field, InputType, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {WishReadBookRecordEntity} from '../../entities/wish-read-book-record.entity';

@InputType('UsersWishesReadBooksArgsOrderBy')
export class ResolveUsersWishesReadBooksArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.DESC})
  updatedAt!: OrderBy;
}

@ArgsType()
export class ResolveUsersWishesReadBooksArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => ResolveUsersWishesReadBooksArgsOrderBy, {
    nullable: true,
    defaultValue: new ResolveUsersWishesReadBooksArgsOrderBy(),
  })
  orderBy!: ResolveUsersWishesReadBooksArgsOrderBy;
}

@ObjectType('UsersWishReadBooksReturn')
export class ResolveUsersWishesReadBooksReturnEntity {
  @Field(() => [WishReadBookRecordEntity])
  nodes!: WishReadBookRecordEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
