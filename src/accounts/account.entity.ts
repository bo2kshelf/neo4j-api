import {Directive, Field, ID, ObjectType} from '@nestjs/graphql';

@ObjectType('Account')
@Directive('@extends')
@Directive('@key(fields: "id")')
export class AccountEntity {
  @Field(() => ID)
  @Directive('@external')
  id!: string;
}
