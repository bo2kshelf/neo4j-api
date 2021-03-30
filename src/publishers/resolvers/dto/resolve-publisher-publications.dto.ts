import {ArgsType, Field, ID, Int} from '@nestjs/graphql';

@ArgsType()
export class ResolvePublicationsArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip = 0;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit = 0;

  @Field(() => [ID!], {nullable: true})
  except: string[] = [];
}
