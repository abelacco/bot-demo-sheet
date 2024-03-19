import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LangchainService } from './langchain.service';


@Controller('langchain')
export class LangchainController {
  constructor(private readonly langchainService: LangchainService) {}

  @Post('runchat')
  async runChat(@Body() body) {
    return await this.langchainService.runChat(body.history, body.question);
  }
}
