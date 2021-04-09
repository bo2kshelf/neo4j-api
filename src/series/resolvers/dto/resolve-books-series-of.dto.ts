import {Field, ObjectType} from '@nestjs/graphql';
import {SeriesPartEntity} from '../../entities/series-part.entity';

@ObjectType('BooksSeriesOfReturn')
export class BooksPartOfSeriesReturn {
  @Field(() => [SeriesPartEntity])
  nodes!: SeriesPartEntity[];
}
