import { PartialType } from '@nestjs/swagger';
import { CreateLangchainDto } from './create-langchain.dto';

export class UpdateLangchainDto extends PartialType(CreateLangchainDto) {}
