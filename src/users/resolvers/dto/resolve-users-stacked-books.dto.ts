import {ArgsType, Field, Int, ObjectType} from '@nestjs/graphql';
import {StackedBookRecordEntity} from '../../entities/stacked-book-record.entity';

@ArgsType()
export class ResolveUsersStackedBooksArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;
}

@ObjectType('UsersStackedBooksReturn')
export class ResolveUsersStackedBooksReturnEntity {
  @Field(() => [StackedBookRecordEntity])
  records!: StackedBookRecordEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
