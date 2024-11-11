import { GSContext, GSDataSource, GSStatus } from '@godspeedsystems/core';

export default async function (ctx: GSContext, args: any) {
  try {
    const {
      inputs: {
        data: { body },
      },
    } = ctx;

    ctx.childLogger.info('Received event data for tracking:', body);

    // Access the 'track' datasource from the context
    const ds: GSDataSource = ctx.datasources.track;

    const response = await ds.execute(ctx, body);

    ctx.childLogger.info('Event tracked successfully:', response);
    return new GSStatus(true, 200, 'Event tracked successfully');
  } catch (error: unknown) {
    // Log and handle known errors
    if (error instanceof Error) {
      ctx.childLogger.error(`Failed to track event: ${error.message}`);
      return new GSStatus(false, 500, 'Failed to track event', error.message);
    }

    // Log and handle unexpected error types
    ctx.childLogger.error(`Internal server error: ${error}`);
    return new GSStatus(false, 500, 'Internal server error', `${error}`);
  }
}
