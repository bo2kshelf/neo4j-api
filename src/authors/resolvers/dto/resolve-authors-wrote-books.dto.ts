import {ArgsType, Field, ID, InputType, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {WritingEntity} from '../../entities/writing.entity';

@InputType('AuthorsWroteBooksArgsOrderBy')
export class ResolveAuthorsWroteBooksArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  title!: OrderBy;
}

@ArgsType()
export class ResolveAuthorsWroteBooksArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => [ID!], {nullable: true, defaultValue: []})
  except!: string[];

  @Field(() => ResolveAuthorsWroteBooksArgsOrderBy, {
    nullable: true,
    defaultValue: new ResolveAuthorsWroteBooksArgsOrderBy(),
  })
  orderBy!: ResolveAuthorsWroteBooksArgsOrderBy;
}

@ObjectType('AuthorsWroteBooksArgsReturn')
export class ResolveAuthorsWroteBooksReturnEntity {
  @Field(() => [WritingEntity])
  nodes!: WritingEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
