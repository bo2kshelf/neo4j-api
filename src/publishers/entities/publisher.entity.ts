import {Directive, Field, ID, ObjectType} from '@nestjs/graphql';

@ObjectType('Publisher')
@Directive('@key(fields: "id")')
export class PublisherEntity {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;
}
