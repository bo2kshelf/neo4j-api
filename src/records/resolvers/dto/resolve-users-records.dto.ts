import {ArgsType, Field, InputType, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {RecordEntity} from '../../entities/record.entity';

@InputType('UsersRecordsArgsOrderBy')
export class ResolveUsersRecordsArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.DESC})
  readAt!: OrderBy;
}

@ArgsType()
export class ResolveUsersRecordsArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => ResolveUsersRecordsArgsOrderBy, {
    nullable: true,
    defaultValue: new ResolveUsersRecordsArgsOrderBy(),
  })
  orderBy!: ResolveUsersRecordsArgsOrderBy;
}

@ObjectType('UsersRecordsReturn')
export class ResolveUsersRecordsReturnEntity {
  @Field(() => [RecordEntity])
  nodes!: RecordEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
