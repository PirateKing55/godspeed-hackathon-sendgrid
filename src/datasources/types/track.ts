import {
  GSContext,
  GSDataSource,
  GSStatus,
  PlainObject,
} from '@godspeedsystems/core';
import { google } from 'googleapis';

export default class DataSource extends GSDataSource {
  private sheets?: any;
  private auth?: any;

  protected async initClient(): Promise<object> {
    try {
      this.sheets = google.sheets('v4');
      this.auth = new google.auth.GoogleAuth({
        keyFile: this.config.keyFile,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      return { sheets: this.sheets, auth: this.auth };
    } catch (error) {
      throw new Error(`Failed to initialize google client: ${error}`);
    }
  }

  async getSheetData(): Promise<any[][]> {
    try {
      const auth = await this.auth.getClient();
      const request = {
        spreadsheetId: this.config.sheetId,
        range: `${this.config.worksheetName}`,
        auth,
      };

      const response = await this.sheets.spreadsheets.values.get(request);
      return response.data.values || [];
    } catch (error) {
      throw new Error(`Failed to get data from Google Sheets: ${error}`);
    }
  }

  // Helper function to find the row number by sg_message_id
  async findRowById(sg_message_id: string): Promise<number | null> {
    try {
      const sheetData = await this.getSheetData();
      for (let i = 1; i < sheetData.length; i++) {
        if (sheetData[i][0] === sg_message_id) {
          return i + 1; // Convert index to row number
        }
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to find row by ID: ${error}`);
    }
  }

  // Method to find the next empty row in the sheet
  async getNextEmptyRow(): Promise<number> {
    const sheetData = await this.getSheetData();
    return sheetData.length + 1; // Next empty row is one after the last filled row
  }

  async writeData(data: PlainObject) {
    const { range, values } = data;

    try {
      const auth = await this.auth.getClient();
      const request = {
        spreadsheetId: this.config.sheetId,
        range: `${this.config.worksheetName}!${range}`,
        valueInputOption: 'RAW',
        resource: { values },
        auth,
      };

      const response = await this.sheets.spreadsheets.values.update(request);
      return response;
    } catch (error) {
      throw new Error(`Failed to write data to google sheets: ${error}`);
    }
  }

  async execute(ctx: GSContext, args: any): Promise<GSStatus> {
    // Ensure client is available
    if (!this.sheets || !this.auth) {
      ctx.childLogger.error('Google client is not initialized');
      return new GSStatus(false, 500, 'Google client is not initialized');
    }

    try {
      for (const data of args) {
        const { sg_message_id, email, event } = data;
        let range: string;
        let values: any[][];

        // Check if a row already exists for the `sg_message_id`
        let rowNumber = await this.findRowById(sg_message_id);

        // If no existing row, add a new entry with the sg_message_id and email
        if (!rowNumber) {
          rowNumber = await this.getNextEmptyRow();
          range = `A${rowNumber}`;
          values = [[sg_message_id, email]];
          await this.writeData({ range, values });
        }

        // Determine the column and value based on event type
        switch (event) {
          case 'processed':
            range = `C${rowNumber}`;
            values = [['processed']];
            break;
          case 'delivered':
            range = `D${rowNumber}`;
            values = [['delivered']];
            break;
          case 'open':
            range = `E${rowNumber}`;
            values = [['opened']];
            break;
          case 'click':
            range = `F${rowNumber}`;
            values = [['clicked']];
            break;
          case 'bounce':
            range = `G${rowNumber}`;
            values = [['bounced']];
            break;
          default:
            ctx.childLogger.warn(`Unhandled event type: ${event}`);
            continue; // Skip unhandled events
        }

        // Write the event-specific data to the designated cell
        await this.writeData({ range, values });
      }

      return new GSStatus(true, 200, 'Event tracked successfully');
    } catch (error: any) {
      ctx.childLogger.error(`Failed to execute data tracking: ${error}`);
      return new GSStatus(
        false,
        500,
        'Failed to execute data tracking',
        error.message,
      );
    }
  }
}

const SourceType = 'DS';
const Type = 'track'; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = 'track'; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {};

export { DataSource, SourceType, Type, CONFIG_FILE_NAME, DEFAULT_CONFIG };
