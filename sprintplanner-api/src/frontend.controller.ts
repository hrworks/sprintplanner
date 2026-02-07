import { Controller, Get, Param, Redirect } from '@nestjs/common';

@Controller()
export class FrontendController {
  @Get('board/:id')
  @Redirect()
  redirectToGantt(@Param('id') id: string) {
    return { url: `/gantt/${id}`, statusCode: 301 };
  }
}
