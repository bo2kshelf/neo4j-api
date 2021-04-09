import {Field, ObjectType} from '@nestjs/graphql';
import {SeriesMainPartEntity} from '../../entities/series-main-part.entity';

@ObjectType('BooksSeriesOfReturn')
export class BooksPartOfSeriesReturn {
  @Field(() => [SeriesMainPartEntity])
  nodes!: SeriesMainPartEntity[];
}
