import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class FrontendController {
  @Get('board/:id')
  @Redirect()
  redirectToGantt() {
    // Redirect old /board/:id to /gantt/:id
    return { url: '/gantt/:id', statusCode: 301 };
  }
}
