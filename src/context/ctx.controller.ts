import { Controller } from '@nestjs/common';
import { CtxService } from './ctx.service';


@Controller('ctx')
export class CtxController {
  constructor(private readonly messageCartService: CtxService) {}


}
