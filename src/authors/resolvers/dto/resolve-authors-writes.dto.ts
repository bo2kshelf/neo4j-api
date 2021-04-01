import {ArgsType, Field, ID, InputType, Int} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';

@InputType()
export class AuthorWritesArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  title!: OrderBy;
}

@ArgsType()
export class AuthorWritesArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip = 0;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit = 0;

  @Field(() => [ID!], {nullable: true})
  except: string[] = [];

  @Field(() => AuthorWritesArgsOrderBy, {
    nullable: true,
    defaultValue: new AuthorWritesArgsOrderBy(),
  })
  orderBy!: AuthorWritesArgsOrderBy;
}
