import {ArgsType, Field} from '@nestjs/graphql';

@ArgsType()
export class BookISBNArgs {
  @Field(() => Boolean, {defaultValue: true, nullable: false})
  dehyphenize!: boolean;
}
