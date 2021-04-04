import {ArgsType, Field, InputType, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {StackedBookRecordEntity} from '../../entities/stacked-book-record.entity';

@InputType('UsersStackedBooksArgsOrderBy')
export class ResolveUsersStackedBooksArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.DESC})
  updatedAt!: OrderBy;
}

@ArgsType()
export class ResolveUsersStackedBooksArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => ResolveUsersStackedBooksArgsOrderBy, {
    nullable: true,
    defaultValue: new ResolveUsersStackedBooksArgsOrderBy(),
  })
  orderBy!: ResolveUsersStackedBooksArgsOrderBy;
}

@ObjectType('UsersStackedBooksReturn')
export class ResolveUsersStackedBooksReturnEntity {
  @Field(() => [StackedBookRecordEntity])
  nodes!: StackedBookRecordEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
