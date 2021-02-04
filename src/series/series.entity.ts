import {Field, ID, ObjectType} from '@nestjs/graphql';

@ObjectType('Series')
export class SeriesEntity {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  title!: string;
}
