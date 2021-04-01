import {ArgsType, Field, InputType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';

@InputType()
export class BookWritedByArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  name!: OrderBy;
}

@ArgsType()
export class BookWritedByArgs {
  @Field(() => BookWritedByArgsOrderBy, {
    nullable: true,
    defaultValue: new BookWritedByArgsOrderBy(),
  })
  orderBy!: BookWritedByArgsOrderBy;
}
