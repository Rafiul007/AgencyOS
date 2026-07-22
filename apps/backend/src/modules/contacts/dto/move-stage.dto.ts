import { IsEnum } from 'class-validator';
import { ContactStage } from '@agencyos/shared';

export class MoveStageDto {
  @IsEnum(ContactStage)
  stage!: ContactStage;
}
