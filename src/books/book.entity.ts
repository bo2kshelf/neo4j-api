import {Directive, Field, ID, ObjectType} from '@nestjs/graphql';

@ObjectType('Book')
@Directive('@key(fields: "id")')
export class BookEntity {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  title!: string;

  @Field(() => String, {nullable: true})
  subtitle?: string;

  isbn?: string;
}
