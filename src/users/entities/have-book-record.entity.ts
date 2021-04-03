import {Field, GraphQLISODateTime, ObjectType} from '@nestjs/graphql';

@ObjectType('HaveBookRecord')
export class HaveBookRecordEntity {
  userId!: string;
  bookId!: string;

  @Field(() => Boolean)
  have!: boolean;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}
