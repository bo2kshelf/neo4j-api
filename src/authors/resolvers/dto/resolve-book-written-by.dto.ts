import {ArgsType, Field, InputType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';

@InputType()
export class BookWrittenByArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  name!: OrderBy;
}

@ArgsType()
export class BookWrittenByArgs {
  @Field(() => BookWrittenByArgsOrderBy, {
    nullable: true,
    defaultValue: new BookWrittenByArgsOrderBy(),
  })
  orderBy!: BookWrittenByArgsOrderBy;
}
