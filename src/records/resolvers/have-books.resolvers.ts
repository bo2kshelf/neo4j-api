import {Args, Mutation, Resolver} from '@nestjs/graphql';
import {HaveBookRecordEntity} from '../entities/have-book.entities';
import {HaveBooksService} from '../services/have-books.service';
import {SwitchHaveBookRecordArgs} from './dto/switch-have-book-record.dto';

@Resolver(() => HaveBookRecordEntity)
export class HaveBookRecordResolver {
  constructor(private readonly haveService: HaveBooksService) {}

  @Mutation(() => HaveBookRecordEntity)
  switchHaveRecord(
    @Args({type: () => SwitchHaveBookRecordArgs})
    {bookId, accountId, have}: SwitchHaveBookRecordArgs,
  ) {
    return have
      ? this.haveService.createHaveBookRecordEntity({bookId, accountId})
      : this.haveService.deleteHaveBookRecordEntity({bookId, accountId});
  }
}
