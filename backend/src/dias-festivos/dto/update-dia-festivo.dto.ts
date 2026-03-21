import { PartialType } from '@nestjs/mapped-types';
import { CreateDiaFestivoDto } from './create-dia-festivo.dto';

export class UpdateDiaFestivoDto extends PartialType(CreateDiaFestivoDto) {}
