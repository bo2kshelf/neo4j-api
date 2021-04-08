import {Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {LabelEntity} from '../entities/label.entity';
import {LabelsService} from '../services/labels.service';

@Resolver(() => BookEntity)
export class BooksResolver {
  constructor(private readonly labelsService: LabelsService) {}

  @ResolveField(() => LabelEntity, {nullable: true})
  async label(@Parent() {id: bookId}: BookEntity): Promise<LabelEntity | null> {
    const id = await this.labelsService.getLabelIdFromBook(bookId);
    return id ? this.labelsService.findById(id) : null;
  }
}
