import {Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {BooksService} from '../../books/services/books.service';
import {SeriesSubPartEntity} from '../entities/series-sub-part.entity';
import {SeriesEntity} from '../entities/series.entity';
import {SeriesService} from '../services/series.service';

@Resolver(() => SeriesSubPartEntity)
export class SeriesSubPartsResolver {
  constructor(
    private readonly booksService: BooksService,
    private readonly seriesService: SeriesService,
  ) {}

  @ResolveField(() => BookEntity)
  async book(@Parent() {bookId}: SeriesSubPartEntity): Promise<BookEntity> {
    return this.booksService.findById(bookId);
  }

  @ResolveField(() => SeriesEntity)
  async series(
    @Parent() {seriesId}: SeriesSubPartEntity,
  ): Promise<SeriesEntity> {
    return this.seriesService.findById(seriesId);
  }
}
