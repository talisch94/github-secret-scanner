import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GithubService } from './github/github.service';
import { AppController } from './app.controller';
import { ScannerService } from './scanner/scanner.service';
import { StateService } from './state/state.service';

@Module({
	imports: [ConfigModule.forRoot()],
    providers: [GithubService, ScannerService, StateService],
	controllers: [AppController],
})
export class AppModule { }
