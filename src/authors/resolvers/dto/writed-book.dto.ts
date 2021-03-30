import {ArgsType, Field, ID} from '@nestjs/graphql';

@ArgsType()
export class WritedBookArgs {
  @Field(() => ID)
  bookId!: string;

  @Field(() => ID)
  authorId!: string;

  @Field(() => [String!], {nullable: true})
  roles?: string[];
}
