import {ArgsType, Field, InputType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';

@InputType('BooksWrittenByArgsOrderBy')
export class ResolveBooksWrittenByArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  name!: OrderBy;
}

@ArgsType()
export class ResolveBooksWrittenByArgs {
  @Field(() => ResolveBooksWrittenByArgsOrderBy, {
    nullable: true,
    defaultValue: new ResolveBooksWrittenByArgsOrderBy(),
  })
  orderBy!: ResolveBooksWrittenByArgsOrderBy;
}
