import {Field, ObjectType} from '@nestjs/graphql';
import {SeriesPartEntity} from '../../entities/series-part.entity';

@ObjectType()
export class BookSeriesOfReturnType {
  @Field(() => [SeriesPartEntity])
  nodes!: SeriesPartEntity[];
}
