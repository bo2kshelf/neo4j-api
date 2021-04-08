import {Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {BooksService} from '../../books/services/books.service';
import {LabelEntity} from '../entities/label.entity';
import {LabelingEntity} from '../entities/labeling.entity';
import {LabelsService} from '../services/labels.service';

@Resolver(() => LabelingEntity)
export class LabelingsResolver {
  constructor(
    private readonly labelsService: LabelsService,
    private readonly booksService: BooksService,
  ) {}

  @ResolveField(() => BookEntity)
  async book(@Parent() {bookId}: LabelingEntity): Promise<BookEntity> {
    return this.booksService.findById(bookId);
  }

  @ResolveField(() => LabelEntity)
  async label(@Parent() {labelId}: LabelingEntity): Promise<LabelEntity> {
    return this.labelsService.findById(labelId);
  }
}
