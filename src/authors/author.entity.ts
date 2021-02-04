import {Field, ID, ObjectType} from '@nestjs/graphql';

@ObjectType('Author')
export class AuthorEntity {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;
}
