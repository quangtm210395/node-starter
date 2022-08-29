import { Service } from 'typedi';
import winston from 'winston';
import { Telegraf } from 'telegraf';
import { AxiosError } from 'axios';

import { Logger } from '@Decorators/Logger';

import { TelegramBot } from '@Libs/bot/TelegramBot';
import { internal } from '@Libs/axios';
import { env } from '@Libs/env';

@Service()
export class NFTTelegramBot extends TelegramBot {
  private bot: Telegraf;
  constructor(
    @Logger(module) private logger: winston.Logger,
  ) {
    super();
  }
  public register() {
    this.bot = new Telegraf(process.env.NFT_BOT_TOKEN || '', {
    });
  }

  public start() {
    this.bot.command('sync_hero', async (ctx) => {
      this.logger.info('bot sync receive request: ', ctx.update.message.text);
      const args = ctx.update.message.text.split(' ');
      const tokenId = isNaN(Number(args[1] || undefined)) ? null : Number(args[1]);
      if (tokenId) {
        let url = `${env.app.schema}://${env.app.host}:${env.app.externalPort}${env.app.beRoutePrefix}/heroes/${tokenId}/sync`;
        await internal.post(url, '{}')
          .then((res) => {
            this.logger.info(`bot sync:: call api ${url} handle event: `, res.status, res.data);
            if (!res.data) {
              return ctx.reply(`Hero #${tokenId} is up to date!`);
            }
            ctx.reply(`Successfully updated for hero #${tokenId}`);
          })
          .catch((err: AxiosError) => {
            this.logger.error(`bot sync:: call api ${url} handle error status: ${err?.response?.status} `, err);
            ctx.reply(`Could not update for hero #${tokenId}`);
            throw err;
          });
      }
    });

    this.bot.command('sync_equipment', async (ctx) => {
      this.logger.info('bot sync receive request: ', ctx.update.message.text);
      const args = ctx.update.message.text.split(' ');
      const tokenId = isNaN(Number(args[1] || undefined)) ? null : Number(args[1]);
      if (tokenId) {
        let url = `${env.app.schema}://${env.app.host}:${env.app.externalPort}${env.app.beRoutePrefix}/equipments/${tokenId}/sync`;
        await internal.post(url, '{}')
          .then((res) => {
            this.logger.info(`bot sync:: call api ${url} handle event: `, res.status, res.data);
            if (!res.data) {
              return ctx.reply(`Equipment #${tokenId} is up to date!`);
            }
            ctx.reply(`Successfully updated for equipment #${tokenId}`);
          })
          .catch((err: AxiosError) => {
            this.logger.error(`bot sync:: call api ${url} handle error status: ${err?.response?.status} `, err);
            ctx.reply(`Could not update for equipment #${tokenId}`);
            throw err;
          });
      }
    });

    this.bot.command('update_order', async (ctx) => {
      this.logger.info('bot updateOrderTx receive request: ', ctx.update.message.text);
      const args = ctx.update.message.text.split(' ');
      const txId = args[1];
      if (txId) {
        let url = `${env.app.schema}://${env.app.host}:${env.app.externalPort}${env.app.beRoutePrefix}/blocks/sync-order-tx/${txId}`;
        await internal.post(url, '{}')
          .then((res) => {
            this.logger.info(`bot updateOrderTx:: call api ${url} handle event: `, res.status, res.data);
            ctx.reply(`Syncing order for this tx: #${txId}`);
          })
          .catch((err: AxiosError) => {
            this.logger.error(`bot updateOrderTx:: call api ${
              url} handle error status: ${err?.response?.status} `, err);
            ctx.reply(`Could not update for tx #${txId}`);
            throw err;
          });
      }
    });

    this.bot.launch().catch(console.error);
    this.logger.info('NFTTelegramBot launched successfully');
  }

  public close() {
    this.logger.info('Stopping NFTTelegramBot bot');
    this.bot.stop();
  }

  public botName() {
    return 'NFTTelegramBot';
  }
}
