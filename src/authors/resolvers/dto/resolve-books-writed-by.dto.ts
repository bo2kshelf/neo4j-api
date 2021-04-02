import {ArgsType, Field, InputType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';

@InputType('BookWritedByArgsOrderBy')
export class ResolveBookWritedByArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  name!: OrderBy;
}

@ArgsType()
export class ResolveBookWritedByArgs {
  @Field(() => ResolveBookWritedByArgsOrderBy, {
    nullable: true,
    defaultValue: new ResolveBookWritedByArgsOrderBy(),
  })
  orderBy!: ResolveBookWritedByArgsOrderBy;
}
