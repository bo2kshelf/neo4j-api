import {Field, GraphQLISODateTime, ObjectType} from '@nestjs/graphql';

@ObjectType('WishReadBookRecord')
export class WishReadBookRecordEntity {
  userId!: string;
  bookId!: string;

  @Field(() => Boolean)
  wish!: boolean;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}
