import {ArgsType, Field, InputType, Int, ObjectType} from '@nestjs/graphql';
import {BookEntity} from '../../../books/entities/book.entity';
import {OrderBy} from '../../../common/order-by.enum';

@InputType('UsersReadBooksArgsOrderBy')
export class ResolveUsersReadBooksArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  title!: OrderBy;
}

@ArgsType()
export class ResolveUsersReadBooksArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => ResolveUsersReadBooksArgsOrderBy, {
    nullable: true,
    defaultValue: new ResolveUsersReadBooksArgsOrderBy(),
  })
  orderBy!: ResolveUsersReadBooksArgsOrderBy;
}

@ObjectType('UsersReadBooksReturn')
export class ResolveUsersReadBooksReturnEntity {
  @Field(() => [BookEntity])
  nodes!: BookEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
