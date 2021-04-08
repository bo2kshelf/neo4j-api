import {ArgsType, Field, Int, ObjectType} from '@nestjs/graphql';
import {BookEntity} from '../../../books/entities/book.entity';

@ArgsType()
export class ResolveBooksNextArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 1})
  limit!: number;
}

@ObjectType('BooksNextReturn')
export class ResolveBooksNextReturn {
  @Field(() => [BookEntity])
  nodes!: BookEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
