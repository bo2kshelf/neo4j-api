import {ArgsType, Field, InputType, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {HaveBookRecordEntity} from '../../entities/have-book-record.entity';

@InputType('UsersHasBooksArgsOrderBy')
export class ResolveUsersHasBooksArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.DESC})
  updatedAt!: OrderBy;
}

@ArgsType()
export class ResolveUsersHasBooksArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => ResolveUsersHasBooksArgsOrderBy, {
    nullable: true,
    defaultValue: new ResolveUsersHasBooksArgsOrderBy(),
  })
  orderBy!: ResolveUsersHasBooksArgsOrderBy;
}

@ObjectType('UsersHasBooksReturn')
export class ResolveUsersHasBooksReturnEntity {
  @Field(() => [HaveBookRecordEntity])
  nodes!: HaveBookRecordEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
