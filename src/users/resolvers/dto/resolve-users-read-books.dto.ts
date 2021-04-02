import {ArgsType, Field, InputType, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {ReadBookRecordEntity} from '../../entities/read-book-record.entity';

@InputType('UsersReadBooksArgsOrderBy')
export class ResolveUsersReadBooksArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.DESC})
  date: OrderBy = OrderBy.DESC;
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
  @Field(() => [ReadBookRecordEntity])
  records!: ReadBookRecordEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
