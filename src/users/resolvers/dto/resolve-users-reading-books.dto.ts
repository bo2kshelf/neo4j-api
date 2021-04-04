import {ArgsType, Field, InputType, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {ReadingBookRecordEntity} from '../../entities/reading-book-record.entity';

@InputType('UsersReadingBooksArgsOrderBy')
export class ResolveUsersReadingBooksArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.DESC})
  updatedAt!: OrderBy;
}

@ArgsType()
export class ResolveUsersReadingBooksArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => ResolveUsersReadingBooksArgsOrderBy, {
    nullable: true,
    defaultValue: new ResolveUsersReadingBooksArgsOrderBy(),
  })
  orderBy!: ResolveUsersReadingBooksArgsOrderBy;
}

@ObjectType('UsersReadingBooksReturn')
export class ResolveUsersReadingBooksReturnEntity {
  @Field(() => [ReadingBookRecordEntity])
  nodes!: ReadingBookRecordEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
