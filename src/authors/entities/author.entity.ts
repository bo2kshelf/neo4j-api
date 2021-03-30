import {Directive, Field, ID, ObjectType} from '@nestjs/graphql';

@ObjectType('Author')
@Directive('@key(fields: "id")')
export class AuthorEntity {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;
}
