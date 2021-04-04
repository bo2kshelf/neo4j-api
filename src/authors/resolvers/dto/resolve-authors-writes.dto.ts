import {ArgsType, Field, ID, InputType, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {WritingEntity} from '../../entities/writing.entity';

@InputType('AuthorWritesArgsOrderBy')
export class ResolveAuthorWritesArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  title!: OrderBy;
}

@ArgsType()
export class ResolveAuthorWritesArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => [ID!], {nullable: true, defaultValue: []})
  except!: string[];

  @Field(() => ResolveAuthorWritesArgsOrderBy, {
    nullable: true,
    defaultValue: new ResolveAuthorWritesArgsOrderBy(),
  })
  orderBy!: ResolveAuthorWritesArgsOrderBy;
}

@ObjectType('AuthorWritesReturn')
export class ResolveAuthorWritesReturnEntity {
  @Field(() => [WritingEntity])
  nodes!: WritingEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
