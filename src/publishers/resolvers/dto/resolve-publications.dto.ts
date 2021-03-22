import {ArgsType, Field, ID, Int} from '@nestjs/graphql';

@ArgsType()
export class ResolvePublicationsArgs {
  @Field(() => Int, {nullable: true})
  skip?: number;

  @Field(() => Int, {nullable: true})
  limit?: number;

  @Field(() => [ID]!, {nullable: true})
  except?: string[];
}
