import {ArgsType, Field, Int, ObjectType} from '@nestjs/graphql';
import {BookEntity} from '../../../books/entities/book.entity';

@ArgsType()
export class ResolveBooksPreviousArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 1})
  limit!: number;
}

@ObjectType('BooksPreviousReturn')
export class ResolveBooksPreviousReturn {
  @Field(() => [BookEntity])
  nodes!: BookEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
