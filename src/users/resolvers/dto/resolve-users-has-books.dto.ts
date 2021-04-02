import {ArgsType, Field, Int, ObjectType} from '@nestjs/graphql';
import {HaveBookRecordEntity} from '../../entities/have-book-record.entity';

@ArgsType()
export class ResolveUsersHasBooksArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;
}

@ObjectType('UsersHasBooksReturn')
export class ResolveUsersHasBooksReturnEntity {
  @Field(() => [HaveBookRecordEntity])
  records!: HaveBookRecordEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
