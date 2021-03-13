import {Args, Mutation, Resolver} from '@nestjs/graphql';
import {ReadingBookRecordEntity} from '../entities/reading-book.entities';
import {ReadingBooksService} from '../services/reading-books.service';
import {SwitchReadingBookRecordArgs} from './dto/switch-reading-book-record.dto';

@Resolver(() => ReadingBookRecordEntity)
export class ReadingBookRecordsResolver {
  constructor(private readonly readingService: ReadingBooksService) {}

  @Mutation(() => ReadingBookRecordEntity)
  switchReadingRecord(
    @Args({type: () => SwitchReadingBookRecordArgs})
    {bookId, userId, reading}: SwitchReadingBookRecordArgs,
  ) {
    return reading
      ? this.readingService.createReadingBookRecord({bookId, userId})
      : this.readingService.deleteReadingBookRecord({
          bookId,
          userId,
        });
  }
}
