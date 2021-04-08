import {Field, ID, ObjectType} from '@nestjs/graphql';
import {LocalDateResolver} from 'graphql-scalars';

@ObjectType('Record')
export class RecordEntity {
  @Field(() => ID)
  id!: string;

  @Field(() => LocalDateResolver, {nullable: true})
  readAt?: string;
}
