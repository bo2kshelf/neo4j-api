import {ArgsType, Field, Int} from '@nestjs/graphql';

@ArgsType()
export class ResolveAuthorSeriesRelationRelatedBooksArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;
}

@ArgsType()
export class ResolveSeriesRelatedAuthorsArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;
}

@ArgsType()
export class ResolveAuthorsRelatedSeriesArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;
}
