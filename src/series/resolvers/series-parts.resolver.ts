import {Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {BooksService} from '../../books/services/books.service';
import {SeriesPartEntity} from '../entities/series-part.entity';
import {SeriesEntity} from '../entities/series.entity';
import {SeriesService} from '../services/series.service';

@Resolver(() => SeriesPartEntity)
export class SeriesPartsResolver {
  constructor(
    private readonly booksService: BooksService,
    private readonly seriesService: SeriesService,
  ) {}

  @ResolveField(() => BookEntity)
  async book(@Parent() {bookId}: SeriesPartEntity): Promise<BookEntity> {
    return this.booksService.findById(bookId);
  }

  @ResolveField(() => SeriesEntity)
  async series(@Parent() {seriesId}: SeriesPartEntity): Promise<SeriesEntity> {
    return this.seriesService.findById(seriesId);
  }
}
