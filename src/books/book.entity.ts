import {Field, ID, ObjectType} from '@nestjs/graphql';

@ObjectType('Book')
export class BookEntity {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  title!: string;

  isbn?: string;
}
