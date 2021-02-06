import {Resolver} from '@nestjs/graphql';
import {AccountEntity} from './account.entity';
import {AccountsService} from './accounts.service';

@Resolver(() => AccountEntity)
export class AccontResolver {
  constructor(private readonly accountsService: AccountsService) {}
}
