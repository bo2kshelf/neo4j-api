import {Directive, Field, ID, ObjectType} from '@nestjs/graphql';

@ObjectType('Label')
@Directive('@key(fields: "id")')
export class LabelEntity {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;
}
