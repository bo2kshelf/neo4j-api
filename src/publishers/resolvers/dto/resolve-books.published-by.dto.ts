import {ArgsType, Field, InputType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';

@InputType('BooksPublishedByArgsOrderBy')
export class ResolveBooksPublishedByArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  name!: OrderBy;
}

@ArgsType()
export class ResolveBooksPublishedByArgs {
  @Field(() => ResolveBooksPublishedByArgsOrderBy, {
    nullable: true,
    defaultValue: new ResolveBooksPublishedByArgsOrderBy(),
  })
  orderBy!: ResolveBooksPublishedByArgsOrderBy;
}
