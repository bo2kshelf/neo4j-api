import {Args, Mutation, Resolver} from '@nestjs/graphql';
import {WishReadBookRecordEntity} from '../entities/wish-read-book.entities';
import {WishReadBooksService} from '../services/wish-read-books.service';
import {SwitchWishReadBookRecordArgs} from './dto/switch-wish-book-read-record.dto';

@Resolver(() => WishReadBookRecordEntity)
export class WishReadBookRecordsResolver {
  constructor(private readonly wishService: WishReadBooksService) {}

  @Mutation(() => WishReadBookRecordEntity)
  switchWishReadRecord(
    @Args({type: () => SwitchWishReadBookRecordArgs})
    {bookId, userId, wish}: SwitchWishReadBookRecordArgs,
  ) {
    return wish
      ? this.wishService.createWishReadBookRecord({bookId, userId})
      : this.wishService.deleteWishReadBookRecord({bookId, userId});
  }
}
