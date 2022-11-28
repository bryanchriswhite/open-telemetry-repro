import { Injectable } from '@nestjs/common';
import * as fs from "fs";

@Injectable()
export class AppService {
  getHello(): string {
    const data = fs.readFileSync("/home/bwhite/Projects/fetch.ai/ledger-subquery/docker-compose.yml");
    return 'Hello World!';
  }
}
