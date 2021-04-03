import {Directive, Field, ID, ObjectType} from '@nestjs/graphql';

@ObjectType('Series')
@Directive('@key(fields: "id")')
export class SeriesEntity {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  title!: string;
}
