import winston from 'winston';
import axios, { AxiosError } from 'axios';

export abstract class TelegramBot {
  public abstract register(): any;
  public abstract start(): any;
  public abstract close(): any;
  public abstract botName(): string;
}

export const sendMessage = async (msg: string, botToken: string, chatId: string) => {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  await axios
    .get(url, {
      params: {
        chat_id: chatId,
        text: msg,
        parse_mode: 'HTML',
        disable_notification: true,
      },
      timeout: parseInt(process.env.AXIOS_TIMEOUT_DEFAULT || '5000'), //5 seconds
    });
};