import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import {LabelEntity} from '../entities/label.entity';
import {LabelingEntity} from '../entities/labeling.entity';
import {LabelsService} from '../services/labels.service';
import {CreateLabelArgs} from './dto/create-label.dto';
import {GetLabelArgs} from './dto/get-label.dto';
import {LabeledBookArgs} from './dto/labeled-book.dto';
import {
  ResolveLabelsBooksArgs,
  ResolveLabelsBooksReturnEntity,
} from './dto/resolve-label-books.dto';

@Resolver(() => LabelEntity)
export class LabelsResolver {
  constructor(private readonly labelsService: LabelsService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.labelsService.findById(reference.id);
  }

  @ResolveField(() => ResolveLabelsBooksReturnEntity)
  async books(
    @Parent() {id}: LabelEntity,
    @Args({type: () => ResolveLabelsBooksArgs})
    args: ResolveLabelsBooksArgs,
  ): Promise<ResolveLabelsBooksReturnEntity> {
    return this.labelsService.getLabeledBooks(id, args);
  }

  @Query(() => LabelEntity)
  async label(
    @Args({type: () => GetLabelArgs})
    {id}: GetLabelArgs,
  ): Promise<LabelEntity> {
    return this.labelsService.findById(id);
  }

  @Query(() => [LabelEntity])
  async allLabels(): Promise<LabelEntity[]> {
    return this.labelsService.findAll();
  }

  @Mutation(() => LabelEntity)
  async createLabel(
    @Args({type: () => CreateLabelArgs})
    args: CreateLabelArgs,
  ): Promise<LabelEntity> {
    return this.labelsService.create(args);
  }

  @Mutation(() => LabelingEntity)
  async labeledBook(
    @Args({type: () => LabeledBookArgs})
    args: LabeledBookArgs,
  ): Promise<LabelingEntity> {
    return this.labelsService.labeledBook(args);
  }
}
