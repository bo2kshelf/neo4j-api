import {Args, Mutation, Resolver} from '@nestjs/graphql';
import {ReadBookRecordEntity} from '../entities/read-book.entities';
import {ReadBooksService} from '../services/read-books.service';
import {CreateReadBookRecord} from './dto/create-read-book-record.dto';

@Resolver(() => ReadBookRecordEntity)
export class ReadBookRecordsResolver {
  constructor(private readonly readService: ReadBooksService) {}

  @Mutation(() => ReadBookRecordEntity)
  createReadRecord(
    @Args({type: () => CreateReadBookRecord})
    {bookId, accountId, date}: CreateReadBookRecord,
  ) {
    return this.readService.createReadBookRecord({bookId, accountId}, {date});
  }
}
